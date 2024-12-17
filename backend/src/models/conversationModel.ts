import mongoose, { Schema, Document } from 'mongoose';

export interface Conversation extends Document {
  conversation_id: mongoose.Types.ObjectId;
  messages: mongoose.Types.ObjectId[];
  responses: mongoose.Types.ObjectId[];
}

const ConversationSchema: Schema = new Schema(
  {
    conversation_id: { type: Schema.Types.ObjectId, required: true, unique: true },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    responses: [{ type: Schema.Types.ObjectId, ref: 'Response' }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model<Conversation>('Conversation', ConversationSchema);

export default ConversationModel;
