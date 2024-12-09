import mongoose, { Schema, Document } from 'mongoose';

export interface Group extends Document {
  _id: mongoose.Types.ObjectId;
  mnemonic: string;
  description: string;
}

const GroupSchema: Schema = new Schema({
  mnemonic: { type: String, required: true },
  description: { type: String, required: true },
});

const GroupModel = mongoose.models.Group || mongoose.model<Group>("Group", GroupSchema);

export default GroupModel;
