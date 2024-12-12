import mongoose, { Document, Schema } from "mongoose";

interface User extends Document {
  username: string;
  token: string;
}

const UserSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true },
    token: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;

