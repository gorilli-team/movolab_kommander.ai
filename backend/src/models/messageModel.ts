import mongoose, { Schema, Document } from 'mongoose';

export interface Message extends Document {
  message_text: string;
  message_type: 'audio' | 'text';
  user_id: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
  parameters?: { [key: string]: any };
}

const MessageSchema: Schema = new Schema(
  {
    message_text: { type: String, required: true },
    message_type: { type: String, enum: ['audio', 'text'], required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    parameters: {
      type: new Schema(
        {
          pickUpDate: { type: Date},  
          dropOffDate: { type: Date}, 
          driver_name: { type: String}, 
          customer_name: { type: String},
          driver_phone: { type: String},
          customer_phone: { type: String},
          group: [{ type: Schema.Types.ObjectId, ref: 'Group'}],
          workflow: [{ type: Schema.Types.ObjectId, ref: 'Workflow'}],
          pickupLocation: { type: Schema.Types.ObjectId, ref: 'Location'},
          dropOffLocation: { type: Schema.Types.ObjectId, ref: 'Location'},
          movementType: [{ type: Schema.Types.ObjectId, ref: 'Movement'}],
          initiator: { type: String, default: "dashboard" },
          priceList: { type: String, default: null }
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { versionKey: false }
);

const MessageModel = mongoose.models.Message || mongoose.model<Message>("Message", MessageSchema);

export default MessageModel;
