import mongoose, { Schema, Document } from 'mongoose';

export interface Location extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
}

const LocationSchema: Schema = new Schema({
  name: { type: String, required: true },
});

const LocationModel = mongoose.models.Location || mongoose.model<Location>("Location", LocationSchema);

export default LocationModel;
