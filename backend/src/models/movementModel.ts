import mongoose, { Schema, Document } from 'mongoose';

export interface Movement extends Document {
  enum: string;
  name: string;
}

const MovementSchema: Schema = new Schema({
  enum: { type: String, required: true},
  name: { type: String, required: true },
});

const MovementModel = mongoose.models.Movement || mongoose.model<Movement>("Movement", MovementSchema);

export default MovementModel;
