// User roles
export type UserRole = 'admin' | 'member';

// User model
export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  projectId: string;
  createdAt: Date;
}

// Project (tenant boundary)
export interface IProject {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product instance
export interface IProductInstance {
  _id: string;
  projectId: string;
  productType: string; // e.g., 'sales-assistant', 'support-bot'
  name: string;
  namespace: string;
  config?: Record<string, any>;
  createdAt: Date;
}

// Integration
export interface IIntegration {
  _id: string;
  projectId: string;
  productInstanceId: string;
  type: string; // e.g., 'shopify', 'crm'
  enabled: boolean;
  config?: Record<string, any>;
  createdAt: Date;
}

// Message in conversation
export interface IMessage {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: string[];
  createdAt: Date;
}

// Conversation (scoped to project + product instance)
export interface IConversation {
  _id: string;
  projectId: string;
  productInstanceId: string;
  userId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Admin Dashboard Config
export interface IDashboardWidget {
  id: string;
  type: 'card' | 'chart' | 'table' | 'metric';
  title: string;
  config?: Record<string, any>;
  order: number;
}

export interface IDashboardSection {
  id: string;
  title: string;
  widgets: IDashboardWidget[];
  order: number;
}

export interface IDashboardConfig {
  _id: string;
  projectId: string;
  sections: IDashboardSection[];
  updatedAt: Date;
}

// Session
export interface ISession {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    projectId: string;
  };
}
