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

    if (path.extname(uploadedFilePath) === '.wav') {
      const outputFilePath = path.join(uploadsDirectory, Date.now() + '.mp3');

      ffmpeg(uploadedFilePath)
        .output(outputFilePath)
        .audioCodec('libmp3lame')
        .on('end', async () => {
          fs.unlinkSync(uploadedFilePath);
          try {
            await transcribeFileWithWhisper(outputFilePath, res, sendResponse);
            sendResponse(200, 'Audio file uploaded, converted, and transcribed successfully', { filename: path.basename(outputFilePath) });
          } catch (err:any) {
            sendResponse(500, 'Error during transcription', { error: err.message || 'Unknown error occurred' });
          }
        })
        .on('error', (err: any) => {
          sendResponse(500, 'Error during file conversion', { error: err.message || 'Unknown error occurred' });
        })
        .run();
    } else {
      try {
        await transcribeFileWithWhisper(uploadedFilePath, res, sendResponse);
        sendResponse(200, 'Audio file uploaded and transcribed successfully', { filename: req.file.filename });
      } catch (err:any) {
        sendResponse(500, 'Error during transcription', { error: err.message || 'Unknown error occurred' });
      }
    }
  });
};

const userId = "64b60e4c3c3a1b0f12345678";

const transcribeFileWithWhisper = async (filePath: string, res: Response, sendResponse: Function) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const transcription = response.data.text;
    console.log('Transcription result:', transcription);

    const message = new Message({
      message_text: transcription,
      message_type: 'audio',
      user_id: userId,
    });

    await message.save();

    console.log('Calling ChatGPT for analysis...');
    const gptResponse = await callChatGpt(transcription);
    console.log('ChatGPT Analysis Result:', gptResponse);

    message.parameters = gptResponse;

    await message.save();

    const { pickUpDate, dropOffDate, pickUpLocation, dropOffLocation, group, movementType, workflow } = gptResponse;

    const authToken = process.env.MOVOLAB_AUTH_TOKEN;

    if (!authToken) {
      throw new Error('MOVOLAB_AUTH_TOKEN is not set in the environment');
    }

    const availableVehicles = await movolabAvailableVehicles({
      pickUpDate,
      dropOffDate,
      pickUpLocation,
      dropOffLocation,
      group,
      movementType,
      workflow,
    }, authToken);

    console.log("Available vehicles: ", availableVehicles);

    sendResponse(201, 'Messaggio creato con successo', { createdMessage: message, availableVehicles });

    return transcription;
  } catch (error) {
    console.error('Error during transcription or DB save:', error);
    throw new Error('Error during transcription or DB save');
  }
};
