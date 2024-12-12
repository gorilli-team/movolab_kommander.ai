import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
  user_id: mongoose.Types.ObjectId;
  token: string;
}

const UserSchema: Schema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, unique: true },
    token: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel =
  mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;
