import { Request, Response } from 'express';
import ConversationModel from '../models/conversationModel';
import { resetStore } from '../store/messageStore';

export const createConversation = async (req: Request, res: Response) => {
  try {

    resetStore();
    
    const newConversation = new ConversationModel({});

    const savedConversation = await newConversation.save();

    return res.status(201).json({
      success: true,
      conversation_number: savedConversation.conversation_number,
      status: savedConversation.status,
      message: 'Conversazione creata con successo!',
    });
  } catch (error) {
    console.error('Errore durante la creazione della conversazione:', error);
    return res.status(500).json({
      success: false,
      message: 'Si è verificato un errore durante la creazione della conversazione.',
    });
  }
};
