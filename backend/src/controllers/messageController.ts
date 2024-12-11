import { Request, Response } from 'express';
import Message from '../models/messageModel';
import { callChatGpt } from './chatGptController';
import { movolabAvailableVehicles } from './movolabController';
import dotenv from 'dotenv';

dotenv.config();

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(500).json({ error: errorMessage });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  const { message_text, message_type, user_id } = req.body;

  try {
    const message = new Message({
      message_text,
      message_type,
      user_id,
    });

    console.log('Message saved successfully');

    console.log('Calling ChatGPT for analysis...');
    const gptResponse = await callChatGpt(message_text);
    console.log('GPT Response:', gptResponse);

    message.parameters = gptResponse;

    await message.save();

    const { pickUpDate, dropOffDate, pickUpLocation, dropOffLocation, group, movementType, workflow } = gptResponse;

    const authToken = process.env.MOVOLAB_AUTH_TOKEN;

    if (!authToken) {
      throw new Error('MOVOLAB_AUTH_TOKEN non definito nell\'env');
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

    console.log("Veicoli disponibili: ", availableVehicles);

    res.status(201).json({
      message: "Messaggio creato con successo",
      createdMessage: message,
      availableVehicles: availableVehicles,
    });
  } catch (error) {
    console.error('Error during message creation:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(400).json({ error: errorMessage });
  }
};


