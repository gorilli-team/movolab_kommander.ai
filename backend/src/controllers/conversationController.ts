import { Request, Response } from 'express';
import fs from 'fs';
import ConversationModel from '../models/conversationModel';
import { resetStore } from '../store/messageStore';
import tokenStore from '../store/tokenStore';
import dotenv from 'dotenv';

dotenv.config();

export const createConversation = async (req: Request, res: Response) => {
  try {

    resetStore();

    let authToken = req.headers.authorization?.split(' ')[1];

    // const envFilePath = './.env';
    // let envData = fs.readFileSync(envFilePath, 'utf-8');

    // const regex = /^MOVOLAB_AUTH_TOKEN=.*$/gm;
    // envData = envData.replace(regex, '');

    // envData += `MOVOLAB_AUTH_TOKEN=${authToken}\n`;

    // fs.writeFileSync(envFilePath, envData);

    if (!authToken) {
      authToken = tokenStore.get('MOVOLAB_AUTH_TOKEN');
      console.log("token se non c'è", authToken);
    }

    if (authToken) {
      tokenStore.set('MOVOLAB_AUTH_TOKEN', authToken);
      console.log('Token movolab salvato nello store:', tokenStore.get('MOVOLAB_AUTH_TOKEN'));
    }


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
