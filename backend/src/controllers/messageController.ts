import { Request, Response } from 'express';
import Message from '../models/messageModel';
import { callChatGpt, selectVehicle } from './chatGptController';
import { movolabAvailableVehicles, movolabCreateReservation } from './movolabController';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { addMessageToStore, addAvailableVehiclesToStore, messages, addLastMessageToStore, lastMessageStore } from '../store/messageStore';
import ConversationModel from '../models/conversationModel';

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
  const { message_text, message_type, conversation_id } = req.body;

  try {
    let conversation;

    if (conversation_id) {
      conversation = await ConversationModel.findById(conversation_id);

      if (!conversation) {
        return res.status(404).json({
          error: 'La conversazione specificata non esiste.',
        });
      }
    } else {
      conversation = await ConversationModel.findOne().sort({ createdAt: -1 });

      if (!conversation) {
        return res.status(404).json({
          error: 'Nessuna conversazione trovata. Creane una nuova prima di inviare messaggi.',
        });
      }
    }

    const message = new Message({
      message_text,
      message_type,
      conversation: {
        conversationId: conversation._id,
        conversationNumber: conversation.conversation_number,
        status: conversation.status,
      },
    });

    console.log('Message saved successfully:', message);

    addMessageToStore(message_text);


    const gptResponse = await callChatGpt(message_text, messages);
    console.log('GPT Response:', gptResponse);



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

    if (conversation) {
      const lastMessage = await Message.findOne({ 'conversation.conversationId': conversation._id })
      .sort({ createdAt: -1 })
      .exec();
    
      console.log("Ultimo messaggio della conversazione:", lastMessage);
      addLastMessageToStore(lastMessage);
    }


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

    const availableVehicles = await fetchAvailableVehicles(
      {
        pickUpDate,
        dropOffDate,
        pickUpLocation,
        dropOffLocation,
        group,
        movementType,
        workflow,
        response: gptMessageResponse,
      },
      authToken
    );

    console.log('Veicoli disponibili: ', availableVehicles);

    addAvailableVehiclesToStore(availableVehicles);

    res.status(201).json({
      responseText: gptMessageResponse.responseText,
      createdMessage: message,
      availableVehicles: availableVehicles,
      conversationId: conversation._id,
      conversationNumber: conversation.conversation_number,
    });
  } catch (error) {
    handleErrorResponse(res, error, 400);
  }
};



export const chooseVehicleText = async (req: Request, res: Response) => {
  const { message_text, message_type, availableVehicles } = req.body;

  try {
    if (!availableVehicles || availableVehicles.length === 0) {
      return res.status(400).json({ error: "No available vehicles provided." });
    }

    addMessageToStore(message_text);

    const availableVehiclesCustom = availableVehicles.map((vehicle: any) => {
      return {
        id: vehicle._id,
        plate: vehicle.plate,
        brandName: vehicle.brand?.brandName,
        modelName: vehicle.model?.modelName,
        group: vehicle.version?.group?._id
      };
    });

    console.log(availableVehiclesCustom);

    const gptResponseSelection = await selectVehicle(message_text, availableVehiclesCustom);

    console.log("Selezione veicolo:", gptResponseSelection);

     const params = {
       pickUpDate: lastMessageStore.parameters.pickUpDate,
       dropOffDate: lastMessageStore.parameters.dropOffDate,
       pickUpLocation: lastMessageStore.parameters.pickUpLocation._id,
       dropOffLocation: lastMessageStore.parameters.dropOffLocation._id,
       group: gptResponseSelection.selectedVehicle.gruppo,
       movementType: lastMessageStore.parameters.movementType.enum,
       workflow: lastMessageStore.parameters.workflow._id,
       vehicle: gptResponseSelection.selectedVehicle._id
     };

    console.log("Params before reservation:", params);

    const authToken = process.env.MOVOLAB_AUTH_TOKEN;
    if (!authToken) {
       throw new Error('MOVOLAB_AUTH_TOKEN non definito nell\'env');
    }

    const reservation = await createReservationHandler(params, authToken);

    console.log("prenotazione", reservation);

    res.status(201).json({
      selectionVehicle: gptResponseSelection,
      reservation: reservation
    });

  } catch (error) {
    handleErrorResponse(res, error, 400);
  }
};


 const createReservationHandler = async (params: any, authToken: string) => {

  try {
    
     if (
       !params.pickUpDate ||
       !params.dropOffDate ||
       !params.pickUpLocation ||
       !params.dropOffLocation ||
       !params.movementType ||
       !params.group ||
       !params.workflow ||
       !params.movementType ||
       !params.vehicle
     ) {
    
       throw new Error('Parametri obbligatori mancanti o non validi');
     }

     if (!authToken) {
       throw new Error('Token di autenticazione non fornito');
     }


     const reservation = await movolabCreateReservation(params, authToken);
     console.log("reservation done", reservation);

     return reservation;

   } catch (error: any) {

     throw new Error('Errore durante la richiesta di prenotazione: ' + error.message);
   }


 }



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
