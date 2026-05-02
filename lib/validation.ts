import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  projectSlug: z.string().min(1, 'Project slug is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// Product Instance schemas
export const createProductInstanceSchema = z.object({
  projectId: z.string(),
  productType: z.string().min(1),
  name: z.string().min(1),
  namespace: z.string().min(1),
});

export type CreateProductInstanceInput = z.infer<typeof createProductInstanceSchema>;

// Integration schemas
export const updateIntegrationSchema = z.object({
  enabled: z.boolean(),
  config: z.record(z.any()).optional(),
});

export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>;

// Message schemas
export const createMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, 'Message cannot be empty').max(5000),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

// Conversation schemas
export const createConversationSchema = z.object({
  projectId: z.string(),
  productInstanceId: z.string(),
  title: z.string().default('New Chat'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

// Dashboard config schema
export const dashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'chart', 'table', 'metric']),
  title: z.string(),
  config: z.record(z.any()).optional(),
  order: z.number(),
});

export const dashboardSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  widgets: z.array(dashboardWidgetSchema),
  order: z.number(),
});

export const updateDashboardConfigSchema = z.object({
  sections: z.array(dashboardSectionSchema),
});

export type UpdateDashboardConfigInput = z.infer<typeof updateDashboardConfigSchema>;
