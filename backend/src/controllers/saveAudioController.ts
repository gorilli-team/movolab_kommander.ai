import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import Message from '../models/messageModel';
import { callChatGpt, selectVehicle } from './chatGptController';
import { movolabAvailableVehicles } from './movolabController';
import mongoose from 'mongoose';
import { addMessageToStore, addAvailableVehiclesToStore } from '../store/messageStore';

dotenv.config();

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  console.error('FFmpeg binary not found. Ensure ffmpeg-static is properly installed.');
}

const uploadsDirectory = './uploads';
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req: Request, file: any, cb: any) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false);
  }
};

export const upload = multer({ storage: storage, fileFilter: fileFilter });

const handleErrorResponse = (res: Response, error: any, status: number = 500) => {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('Error:', errorMessage);
  res.status(status).json({ error: errorMessage });
};

export const uploadAudio = (req: Request, res: Response) => {
  upload.single('audio')(req, res, async (err: any) => {
    if (err) {
      return handleErrorResponse(res, err, 400);
    }

    if (!req.file) {
      return handleErrorResponse(res, new Error('No audio file uploaded'), 400);
    }

    const uploadedFilePath = path.join(uploadsDirectory, req.file.filename);

    try {
      let processedFilePath = uploadedFilePath;
      if (path.extname(uploadedFilePath) === '.wav') {
        const outputFilePath = path.join(uploadsDirectory, `${Date.now()}.mp3`);
        await convertAudioFile(uploadedFilePath, outputFilePath);
        processedFilePath = outputFilePath;
      }

      const transcription = await transcribeFileWithWhisper(processedFilePath);

      const createdMessage = await createMessageWithAnalysis(transcription, res);

      if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      if (fs.existsSync(processedFilePath)) fs.unlinkSync(processedFilePath);

      res.status(201).json(createdMessage);
    } catch (error) {
      handleErrorResponse(res, error);
    }
  });
};

const convertAudioFile = (inputFilePath: string, outputFilePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .output(outputFilePath)
      .audioCodec('libmp3lame')
      .on('end', () => {
        console.log(`Conversion complete: ${inputFilePath} to ${outputFilePath}`);
        resolve();
      })
      .on('error', (err: any) => {
        reject(new Error(`Error during audio conversion: ${err.message}`));
      })
      .run();
  });
};

const transcribeFileWithWhisper = async (filePath: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', 'whisper-1');

  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  return response.data.text;
};

const createMessageWithAnalysis = async (transcription: string, res: Response) => {
  let responseSent = false;

  try {
    const conversationId = new mongoose.Types.ObjectId();
    const conversationNumber = 1;
    const status = 'incompleted';

    const message = new Message({
      message_text: transcription,
      message_type: 'audio',
      conversation: {
        conversationId,
        conversationNumber,
        status,
      },
    });

    addMessageToStore(transcription);
    
    const gptResponse = await callChatGpt(transcription);
    const responseId = new mongoose.Types.ObjectId();

    const gptMessageResponse = {
      _id: responseId,
      responseText: gptResponse.response.responseText,
      missingParameters: gptResponse.response.missingParameters,
    };

    message.parameters = {
      ...gptResponse,
      response: gptMessageResponse,
    };

    await message.save();

    const { pickUpDate, dropOffDate, pickUpLocation, dropOffLocation, group, movementType, workflow } = gptResponse;

    if (gptResponse.response.missingParameters.length > 0) {
      res.status(400).json({
        missingParameters: gptResponse.response.missingParameters,
        responseText: gptMessageResponse.responseText,
      });
      responseSent = true;
      return;
    }

    const authToken = process.env.MOVOLAB_AUTH_TOKEN;
    if (!authToken) {
      throw new Error('MOVOLAB_AUTH_TOKEN non definito nell\'env');
    }

    const availableVehicles = await fetchAvailableVehicles({
      pickUpDate,
      dropOffDate,
      pickUpLocation,
      dropOffLocation,
      group,
      movementType,
      workflow,
      response: gptMessageResponse,
    }, authToken);

    res.status(201).json({
      responseText: gptMessageResponse.responseText,
      createdMessage: message,
      availableVehicles: availableVehicles,
    });
    responseSent = true;
  } catch (error) {
    if (!responseSent) {
      handleErrorResponse(res, error);
    }
  }
};


const fetchAvailableVehicles = async (params: any, authToken: string) => {
  try {
    if (
      !params.pickUpDate ||
      !params.dropOffDate ||
      !params.pickUpLocation ||
      !params.dropOffLocation ||
      !params.movementType ||
      !params.group ||
      params.group.length === 0
    ) {
      throw new Error('Parametri obbligatori mancanti o non validi');
    }

    const vehicles = await movolabAvailableVehicles(params, authToken);
    addAvailableVehiclesToStore(vehicles);
    return vehicles;
  } catch (error: any) {
    throw new Error(`Errore durante la richiesta ai veicoli disponibili: ${error.message}`);
  }
};

export const chooseVehicleAudio = (req: Request, res: Response) => {
  upload.single('audio')(req, res, async (err: any) => {
    if (err) {
      return handleErrorResponse(res, err, 400);
    }

    if (!req.file) {
      return handleErrorResponse(res, new Error('No audio file uploaded'), 400);
    }

    const { availableVehicles } = req.body; 

    if (!availableVehicles || availableVehicles.length === 0) {
      return res.status(400).json({ error: 'No available vehicles provided.' });
    }

    const uploadedFilePath = path.join(uploadsDirectory, req.file.filename);

    try {
      
      let processedFilePath = uploadedFilePath;
      if (path.extname(uploadedFilePath) === '.wav') {
        const outputFilePath = path.join(uploadsDirectory, `${Date.now()}.mp3`);
        await convertAudioFile(uploadedFilePath, outputFilePath);
        processedFilePath = outputFilePath;
      }

      const transcription = await transcribeFileWithWhisper(processedFilePath);

      addMessageToStore(transcription);

      const gptResponseSelection = await selectVehicle(transcription);

      console.log('Selezione veicolo:', gptResponseSelection);

      if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
      if (fs.existsSync(processedFilePath)) fs.unlinkSync(processedFilePath);

      res.status(201).json({
        transcription,
        selectionVehicle: gptResponseSelection,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  });
};
