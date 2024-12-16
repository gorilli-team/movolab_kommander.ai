import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import Message from '../models/messageModel';
import { callChatGpt } from './chatGptController';
import { movolabAvailableVehicles } from './movolabController';
import mongoose from 'mongoose';

dotenv.config();
const userId = "64b60e4c3c3a1b0f12345678";

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

export const uploadAudio = (req: Request, res: Response, next: NextFunction) => {
  upload.single('audio')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const uploadedFilePath = path.join(uploadsDirectory, req.file.filename);

    let responseSent = false;

    const sendResponse = (status: number, message: string, data?: any) => {
      if (!responseSent) {
        responseSent = true;
        res.status(status).json({ message, ...data });
      }
    };

    try {
      if (path.extname(uploadedFilePath) === '.wav') {
        const outputFilePath = path.join(uploadsDirectory, Date.now() + '.mp3');
        await convertAudioFile(uploadedFilePath, outputFilePath);
        await transcribeAndProcessFile(outputFilePath, res, sendResponse);
      } else {
        await transcribeAndProcessFile(uploadedFilePath, res, sendResponse);
      }
    } catch (err: any) {
      sendResponse(500, 'Error during processing', { error: err.message || 'Unknown error occurred' });
    } finally {
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
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

const transcribeAndProcessFile = async (filePath: string, res: Response, sendResponse: Function) => {
  try {
    const transcription = await transcribeFileWithWhisper(filePath);
    console.log('Transcription result:', transcription);

    const message = await saveTranscriptionToDatabase(transcription);

    const gptResponse = await callChatGpt(transcription);
    console.log('ChatGPT Analysis Result:', gptResponse);

    await updateMessageWithAnalysis(message, gptResponse);

   
    const availableVehicles = await handleAvailableVehicles(gptResponse);
    console.log("Available vehicles: ", availableVehicles);


    sendResponse(201, 'Message created and processed successfully', {
      createdMessage: message,
      availableVehicles: availableVehicles,
    });
  } catch (error: any) {
    console.error('Error during transcription or DB save:', error);
    sendResponse(500, 'Error during transcription or DB save', { error: error.message || 'Unknown error occurred' });
  }
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

const conversationId = new mongoose.Types.ObjectId(); 
  
     
const conversationNumber = 1;


const status = 'incompleted';

const saveTranscriptionToDatabase = async (transcription: string) => {
  
  const message = new Message({
    message_text: transcription,
    message_type: 'audio',
    user_id: userId,
    conversation: {
      conversationId,
      conversationNumber,
      status,
    },
  });

  return await message.save();
};


const updateMessageWithAnalysis = async (message: any, gptResponse: any) => {
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
};

const handleAvailableVehicles = async (gptResponse: any) => {
  const { pickUpDate, dropOffDate, pickUpLocation, dropOffLocation, group, movementType, workflow } = gptResponse;
  const authToken = process.env.MOVOLAB_AUTH_TOKEN;

  if (!authToken) {
    throw new Error('MOVOLAB_AUTH_TOKEN is not set in the environment');
  }

  const gptMessageResponse = {
    responseText: gptResponse.response.responseText,
    missingParameters: gptResponse.response.missingParameters,
  };

  const availableVehicles = await movolabAvailableVehicles({
    pickUpDate,
    dropOffDate,
    pickUpLocation,
    dropOffLocation,
    group,
    movementType,
    workflow,
    response: gptMessageResponse,
  }, authToken);

  return availableVehicles;
};

