import mongoose, { Schema, Document } from 'mongoose';


export interface Group extends Document {
  _id: mongoose.Types.ObjectId;
  mnemonic: string;
  description: string;
}

const GroupSchema: Schema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    mnemonic: { type: String, required: true },
    description: { type: String, required: true },
  },
  { versionKey: false }
);

const GroupModel = mongoose.models.Group || mongoose.model<Group>("Group", GroupSchema);

export default GroupModel;

