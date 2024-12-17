import { Request, Response } from 'express';
import Message from '../models/messageModel';
import { callChatGpt } from './chatGptController';
import { movolabAvailableVehicles } from './movolabController';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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
      message: "Messaggio creato con successo",
      createdMessage: message,
      availableVehicles: availableVehicles,
    });
  } catch (error) {
    handleErrorResponse(res, error, 400);
  }
};



const fetchAvailableVehicles = async (params: any, authToken: string) => {
  try {
    const vehicles = await movolabAvailableVehicles(params, authToken);
    return vehicles;
  } catch (error:any) {
    throw new Error('Errore durante la richiesta ai veicoli disponibili: ' + error.message);
  }
};
