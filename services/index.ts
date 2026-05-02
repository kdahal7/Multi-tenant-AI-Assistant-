import { connectDB } from '@/lib/db';
import {
  User,
  Project,
  ProductInstance,
  Conversation,
  Message,
  Integration,
} from '@/db/models';
import { CreateConversationInput, CreateMessageInput } from '@/lib/validation';

/**
 * Services layer - business logic and data access
 */

export class ConversationService {
  /**
   * Create a new conversation
   */
  static async createConversation(data: CreateConversationInput & { userId: string }) {
    await connectDB();

    const conversation = await Conversation.create({
      projectId: data.projectId,
      productInstanceId: data.productInstanceId,
      userId: data.userId,
      title: data.title,
      messages: [],
    });

    return conversation;
  }

  /**
   * Get conversation with messages
   */
  static async getConversation(conversationId: string) {
    await connectDB();

    const conversation = await Conversation.findById(conversationId)
      .populate('messages')
      .exec();

    return conversation;
  }

  /**
   * Get all conversations for a product instance
   */
  static async getConversationsByProductInstance(
    projectId: string,
    productInstanceId: string,
    userId: string
  ) {
    await connectDB();

    const conversations = await Conversation.find({
      projectId,
      productInstanceId,
      userId,
    })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .exec();

    return conversations;
  }

  /**
   * Add message to conversation
   */
  static async addMessage(data: CreateMessageInput & { role: 'user' | 'assistant'; steps?: string[] }) {
    await connectDB();

    const message = await Message.create({
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      steps: data.steps || [],
    });

    // Add message to conversation
    await Conversation.findByIdAndUpdate(
      data.conversationId,
      {
        $push: { messages: message._id },
        updatedAt: new Date(),
      },
      { new: true }
    );

    return message;
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(conversationId: string) {
    await connectDB();

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .exec();

    return messages;
  }
}

export class ProductInstanceService {
  /**
   * Get all product instances for a project
   */
  static async getProductInstances(projectId: string) {
    await connectDB();

    const instances = await ProductInstance.find({ projectId }).exec();
    return instances;
  }

  /**
   * Get product instance by ID
   */
  static async getProductInstance(id: string) {
    await connectDB();

    const instance = await ProductInstance.findById(id).exec();
    return instance;
  }

  /**
   * Create product instance
   */
  static async createProductInstance(data: {
    projectId: string;
    productType: string;
    name: string;
    namespace: string;
  }) {
    await connectDB();

    const instance = await ProductInstance.create(data);
    return instance;
  }
}

export class IntegrationService {
  /**
   * Get all integrations for a product instance
   */
  static async getIntegrations(projectId: string, productInstanceId: string) {
    await connectDB();

    const integrations = await Integration.find({
      projectId,
      productInstanceId,
    }).exec();

    return integrations;
  }

  /**
   * Get integration by ID
   */
  static async getIntegration(id: string) {
    await connectDB();

    return await Integration.findById(id).exec();
  }

  /**
   * Toggle integration
   */
  static async updateIntegration(
    id: string,
    data: { enabled: boolean; config?: Record<string, any> }
  ) {
    await connectDB();

    const integration = await Integration.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();

    return integration;
  }

  /**
   * Get enabled integrations
   */
  static async getEnabledIntegrations(
    projectId: string,
    productInstanceId: string
  ) {
    await connectDB();

    const integrations = await Integration.find({
      projectId,
      productInstanceId,
      enabled: true,
    }).exec();

    return integrations;
  }
}

export class ProjectService {
  /**
   * Get project by slug
   */
  static async getProjectBySlug(slug: string) {
    await connectDB();

    return await Project.findOne({ slug }).exec();
  }

  /**
   * Get project by ID
   */
  static async getProject(id: string) {
    await connectDB();

    return await Project.findById(id).exec();
  }
}

export class UserService {
  /**
   * Get user by email and project
   */
  static async getUserByEmailAndProject(email: string, projectId: string) {
    await connectDB();

    return await User.findOne({ email, projectId }).exec();
  }

  /**
   * Get or create user (for simplified auth)
   */
  static async getOrCreateUser(email: string, projectId: string, name?: string) {
    await connectDB();

    let user = await User.findOne({ email, projectId });

    if (!user) {
      user = await User.create({
        email,
        projectId,
        name: name || email.split('@')[0],
        role: 'member',
      });
    }

    return user;
  }
}
