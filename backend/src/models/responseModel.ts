import mongoose, { Schema, Document } from 'mongoose';

export interface Response extends Document {
  response_id: mongoose.Types.ObjectId;
  message_id: mongoose.Types.ObjectId;
//   conversation_id: mongoose.Types.ObjectId;
  response_text?: string;
  response_json?: Record<string, unknown>;
  missing_parameters: string[];
}

const ResponseSchema: Schema = new Schema(
  {
    response_id: { type: Schema.Types.ObjectId, required: true, unique: true },
    message_id: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    // conversation_id: { type: Schema.Types.ObjectId, required: true },
    response_text: { type: String },
    response_json: { type: Schema.Types.Mixed },
    missing_parameters: { type: [String], required: true }, 
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ResponseModel =
  mongoose.models.Response || mongoose.model<Response>('Response', ResponseSchema);

export default ResponseModel;
