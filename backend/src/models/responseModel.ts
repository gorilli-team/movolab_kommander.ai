import mongoose, { Schema, Document } from 'mongoose';

export interface Response extends Document {
  response_id: mongoose.Types.ObjectId;
  message_id: mongoose.Types.ObjectId;
  conversation_id: mongoose.Types.ObjectId;
  status_code: number;
  response_text?: string;
  response_json?: Record<string, unknown>;
  response_errors?: {
    reason: string;
    field?: string;
    message: string;
  }[];
}

const ResponseSchema: Schema = new Schema(
  {
    response_id: { type: Schema.Types.ObjectId, required: true, unique: true },
    message_id: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    conversation_id: { type: Schema.Types.ObjectId, required: true },
    status_code: { type: Number, required: true },
    response_text: { type: String },
    response_json: { type: Schema.Types.Mixed },
    response_errors: [
      {
        reason: { type: String, required: true },
        field: { type: String },
        message: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ResponseModel =
  mongoose.models.Response ||
  mongoose.model<Response>('Response', ResponseSchema);

export default ResponseModel;
