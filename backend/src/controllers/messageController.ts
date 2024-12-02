import { Request, Response } from 'express';
import Message from '../models/messageModel';

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

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(400).json({ error: errorMessage });
  }
};
