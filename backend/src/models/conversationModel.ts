import mongoose, { Schema, Document } from 'mongoose';

export interface Conversation extends Document {
  conversation_number: number;
  status: 'completed' | 'incompleted';
  // messages: mongoose.Types.ObjectId[];
}

const ConversationSchema: Schema = new Schema(
  {
    conversation_number: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['completed', 'incompleted'], required: true, default: 'incompleted' },
    // messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


ConversationSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastConversation = await mongoose.models.Conversation.findOne().sort({ conversation_number: -1 }).limit(1);
    if (lastConversation) {
      this.conversation_number = lastConversation.conversation_number + 1;
    }
  }
  next();
});

const ConversationModel =
  mongoose.models.Conversation || mongoose.model<Conversation>('Conversation', ConversationSchema);

export default ConversationModel;
