import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser, IProject, IProductInstance, IIntegration, IMessage, IConversation, IDashboardConfig } from '@/types';

// User schema
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Project schema
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Product Instance schema
const ProductInstanceSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  productType: { type: String, required: true }, // e.g., 'sales-assistant', 'support-bot'
  name: { type: String, required: true },
  namespace: { type: String, required: true },
  config: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

// Integration schema
const IntegrationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  productInstanceId: { type: Schema.Types.ObjectId, ref: 'ProductInstance', required: true },
  type: { type: String, required: true }, // e.g., 'shopify', 'crm'
  enabled: { type: Boolean, default: false },
  config: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

// Message schema
const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  steps: [String],
  createdAt: { type: Date, default: Date.now },
});

// Conversation schema
const ConversationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  productInstanceId: { type: Schema.Types.ObjectId, ref: 'ProductInstance', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Dashboard Config schema
const DashboardWidgetSchema = new Schema({
  id: String,
  type: { type: String, enum: ['card', 'chart', 'table', 'metric'] },
  title: String,
  config: Schema.Types.Mixed,
  order: Number,
}, { _id: false });

const DashboardSectionSchema = new Schema({
  id: String,
  title: String,
  widgets: [DashboardWidgetSchema],
  order: Number,
}, { _id: false });

const DashboardConfigSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  sections: [DashboardSectionSchema],
  updatedAt: { type: Date, default: Date.now },
});

// Create or get models
export const User = (mongoose.models.User as Model<IUser & Document>) || mongoose.model<IUser & Document>('User', UserSchema);
export const Project = (mongoose.models.Project as Model<IProject & Document>) || mongoose.model<IProject & Document>('Project', ProjectSchema);
export const ProductInstance = (mongoose.models.ProductInstance as Model<IProductInstance & Document>) || mongoose.model<IProductInstance & Document>('ProductInstance', ProductInstanceSchema);
export const Integration = (mongoose.models.Integration as Model<IIntegration & Document>) || mongoose.model<IIntegration & Document>('Integration', IntegrationSchema);
export const Message = (mongoose.models.Message as Model<IMessage & Document>) || mongoose.model<IMessage & Document>('Message', MessageSchema);
export const Conversation = (mongoose.models.Conversation as Model<IConversation & Document>) || mongoose.model<IConversation & Document>('Conversation', ConversationSchema);
export const DashboardConfig = (mongoose.models.DashboardConfig as Model<IDashboardConfig & Document>) || mongoose.model<IDashboardConfig & Document>('DashboardConfig', DashboardConfigSchema);
