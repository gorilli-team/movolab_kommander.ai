import { Request, Response } from 'express';
import Message from '../models/messageModel';
import { callChatGpt } from './chatGptController';
import { movolabAvailableVehicles } from './movolabController';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { addMessageToStore } from '../store/messageStore';

dotenv.config();

const handleErrorResponse = (res: Response, error: any, status: number = 500) => {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('Error:', errorMessage);
  res.status(status).json({ error: errorMessage });
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    handleErrorResponse(res, error);
  }
};

export const createMessage = async (req: Request, res: Response) => {
  const { message_text, message_type } = req.body;

  try {
    const responseId = new mongoose.Types.ObjectId(); 
    const conversationId = new mongoose.Types.ObjectId(); 
    const conversationNumber = 1;
    const status = 'incompleted';

    const message = new Message({
      message_text,
      message_type,
      conversation: {
        conversationId,
        conversationNumber,
        status,
      },
    });

    console.log('Message saved successfully:', message);

    addMessageToStore(message_text);

    const gptResponse = await callChatGpt(message_text);
    console.log('GPT Response:', gptResponse);
    
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
      return res.status(400).json({
        missingParameters: gptResponse.response.missingParameters,
        responseText: gptMessageResponse.responseText,
      });
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

    console.log("Veicoli disponibili: ", availableVehicles);

    res.status(201).json({
      responseText: gptMessageResponse.responseText,
      createdMessage: message,
      availableVehicles: availableVehicles,
    });
  } catch (error) {
    handleErrorResponse(res, error, 400);
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

    if (!authToken) {
      throw new Error('Token di autenticazione non fornito');
    }


    const vehicles = await movolabAvailableVehicles(params, authToken);
    return vehicles;

  } catch (error: any) {

    throw new Error('Errore durante la richiesta ai veicoli disponibili: ' + error.message);
  }
};
