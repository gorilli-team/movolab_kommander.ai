import mongoose, { Schema, Document } from 'mongoose';

export interface Movement extends Document {
  _id: mongoose.Types.ObjectId;
  enum: string;
  name: string;
}

const MovementSchema: Schema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true }, 
    enum: { type: String, required: true },
    name: { type: String, required: true },
  },
  { versionKey: false }
);

const MovementModel = mongoose.models.Movement || mongoose.model<Movement>("Movement", MovementSchema);

export default MovementModel;
