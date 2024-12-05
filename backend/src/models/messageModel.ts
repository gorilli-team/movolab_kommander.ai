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
    message_type: { type: String, enum: ['audio', 'text'], required: true},
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    parameters: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  { versionKey: false }
);


const MessageModel = mongoose.models.Widget || mongoose.model<Message>("Message", MessageSchema);

export default MessageModel;
