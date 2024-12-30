import mongoose, { Schema, Document } from 'mongoose';
import { Location } from './locationModel';
import { Movement } from './movementModel';
import { Workflow } from './workflowModel';
import { Group } from './groupModel';
import { Response } from './responseModel';

export interface Message extends Document {
  message_text: string;
  message_type: 'audio' | 'text';
  conversation: {
    conversationId: mongoose.Types.ObjectId;
    conversationNumber: number;
    status: 'completed' | 'incompleted';
  };
  parameters?: {
    pickUpDate?: Date;
    dropOffDate?: Date;
    pickUpLocation?: Location;
    dropOffLocation?: Location;
    driver_name?: string;
    customer_name?: string;
    driver_phone?: string;
    customer_phone?: string;
    group?: Group[];
    workflow?: Workflow;
    movementType?: Movement;
    response?: Response;
    initiator?: string;
    priceList?: string;
  };
}

const MessageSchema: Schema = new Schema(
  {
    message_text: { type: String, required: true },
    message_type: { type: String, enum: ['audio', 'text'], required: true },
    conversation: {
      conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
      conversationNumber: { type: Number, required: true },
      status: { type: String, enum: ['completed', 'incompleted'], required: true },
    },
    parameters: {
      type: new Schema(
        {
          pickUpDate: { type: Date, default: null },
          dropOffDate: { type: Date, default: null },
          driver_name: { type: String, default: null },
          customer_name: { type: String, default: null },
          driver_phone: { type: String, default: null },
          customer_phone: { type: String, default: null },
          group: [
            {
              _id: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
              mnemonic: { type: String, default: null },
              description: { type: String, default: null },
            },
          ],
          workflow: {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Workflow',
              default: null,
            },
            name: { type: String, default: null },
          },
          pickUpLocation: {
            _id: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
            name: { type: String, default: null},
          },
          dropOffLocation: {
            _id: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
            name: { type: String, default: null },
          },
          movementType: {
            _id: { type: Schema.Types.ObjectId, ref: 'Movement', default: null},
            enum: { type: String, default: null },
            name: { type: String, default: null },
          },
          response: {
            _id: { type: Schema.Types.ObjectId, ref: 'Response' },
            responseText: { type: String },
            missingParameters: { type: [String] },
          },
          initiator: { type: String, default: 'dashboard' },
          priceList: { type: String, default: null },
        },
        { _id: false }
      ),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const MessageModel = mongoose.models.Message || mongoose.model<Message>('Message', MessageSchema);

export default MessageModel;
