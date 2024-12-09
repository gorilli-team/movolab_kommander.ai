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
    // Crea un nuovo messaggio senza parametri (inizialmente vuoto)
    const message = new Message({
      message_text,
      message_type,
      user_id,
    });

    await message.save(); // Salva il messaggio inizialmente

    console.log('Calling ChatGPT for analysis...');
    const gptResponse = await callChatGpt(message_text);
    console.log('GPT Raw Response:', gptResponse);

    let parameters;
    try {
      // Prova a parsare la risposta di GPT
      parameters = JSON.parse(gptResponse);
      console.log('Parsed Parameters:', parameters);
    } catch (error) {
      console.error('Failed to parse GPT response:', error);
      return res.status(400).json({ error: 'Invalid GPT response format' });
    }

    // Se mancano parametri obbligatori, loggare un avvertimento
    if (!parameters.pickup_date || !parameters.dropoff_date) {
      console.warn(
        'Warning: Missing essential fields (pickup_date or dropoff_date). Proceeding with available data.'
      );
    }

    // Aggiungi i parametri al messaggio e salva
    message.parameters = parameters || {}; // Assegna i parametri disponibili
    await message.save();

    res.status(201).json(message); // Rispondi con il messaggio salvato
  } catch (error) {
    console.error('Error during message creation:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(400).json({ error: errorMessage });
  }
};


