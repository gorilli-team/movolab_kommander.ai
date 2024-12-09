import mongoose, { Schema, Document } from 'mongoose';

export interface Workflow extends Document {
  _id: mongoose.Types.ObjectId; 
  name: string;
}

const WorkflowSchema: Schema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true }, 
    name: { type: String, required: true },
  },
  { versionKey: false }
);

const WorkflowModel = mongoose.models.Workflow || mongoose.model<Workflow>("Workflow", WorkflowSchema);

export default WorkflowModel;
