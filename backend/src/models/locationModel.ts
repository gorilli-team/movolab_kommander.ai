import mongoose, { Schema, Document } from 'mongoose';

export interface Location extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
}

const LocationSchema: Schema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
  },
  { versionKey: false }
);

const LocationModel = mongoose.models.Location || mongoose.model<Location>("Location", LocationSchema);

export default LocationModel;
