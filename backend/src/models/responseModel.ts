import mongoose, { Schema, Document } from 'mongoose';

export interface Response extends Document {
  _id: mongoose.Types.ObjectId;
  message_id: mongoose.Types.ObjectId;
  responseText: string;
  missingParameters: string[];
}

const ResponseSchema: Schema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    message_id: { type: Schema.Types.ObjectId, ref: 'Message' },
    responseText: { type: String },
    missingParameters: { type: [String] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ResponseModel =
  mongoose.models.Response || mongoose.model<Response>('Response', ResponseSchema);

export default ResponseModel;
