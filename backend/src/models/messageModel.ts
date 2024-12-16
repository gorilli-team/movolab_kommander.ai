import mongoose, { Schema, Document } from 'mongoose';
import { Location } from './locationModel';
import { Movement } from './movementModel';
import { Workflow } from './workflowModel';
import { Group } from './groupModel';
import { Response } from './responseModel';

export interface Message extends Document {
  user_id: mongoose.Types.ObjectId;
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
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message_text: { type: String, required: true },
    message_type: { type: String, enum: ['audio', 'text'], required: true },
    conversation: {
      conversationId: { type: Schema.Types.ObjectId, required: true },
      conversationNumber: { type: Number, required: true },
      status: { type: String, enum: ['completed', 'incompleted'], required: true },
    },
    parameters: {
      type: new Schema(
        {
          pickUpDate: { type: Date },
          dropOffDate: { type: Date },
          driver_name: { type: String },
          customer_name: { type: String },
          driver_phone: { type: String },
          customer_phone: { type: String },
          group: [
            {
              _id: { type: Schema.Types.ObjectId, ref: 'Group' },
              mnemonic: { type: String },
              description: { type: String },
            },
          ],
          workflow: {
            _id: { type: Schema.Types.ObjectId, ref: 'Workflow' },
            name: { type: String },
          },
          pickUpLocation: {
            _id: { type: Schema.Types.ObjectId, ref: 'Location' },
            name: { type: String },
          },
          dropOffLocation: {
            _id: { type: Schema.Types.ObjectId, ref: 'Location' },
            name: { type: String },
          },
          movementType: {
            _id: { type: Schema.Types.ObjectId, ref: 'Movement' },
            enum: { type: String },
            name: { type: String },
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
