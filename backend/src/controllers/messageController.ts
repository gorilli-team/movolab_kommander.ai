import { Request, Response } from 'express';
import Message from '../models/messageModel';
import { callChatGpt } from './chatGptController';

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

    console.log('Calling ChatGPT for analysis...');
    const gptResponse = await callChatGpt(message_text);
    console.log('GPT Response:', gptResponse);

    message.parameters = gptResponse;
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error during message creation:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(400).json({ error: errorMessage });
  }
};


