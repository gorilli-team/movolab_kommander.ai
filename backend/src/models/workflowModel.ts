import mongoose, { Schema, Document } from 'mongoose';

export interface Workflow extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
}

const WorkflowSchema: Schema = new Schema({
  name: { type: String, required: true },
});

const WorkflowModel = mongoose.models.Workflow || mongoose.model<Workflow>("Workflow", WorkflowSchema);

export default WorkflowModel;
