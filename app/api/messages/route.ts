import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/session';
import { createMessageSchema } from '@/lib/validation';
import { ConversationService } from '@/services';
import { AIService } from '@/services/ai';
import { accessControl } from '@/lib/middleware';

/**
 * POST /api/messages - Send message and get AI response
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content } = createMessageSchema.parse(body);

    // Get conversation
    const conversation = await ConversationService.getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check access
    await accessControl.requireProjectAccess(
      session.user.id,
      conversation.projectId.toString()
    );

    // Add user message
    const userMessage = await ConversationService.addMessage({
      conversationId,
      content,
      role: 'user',
    });

    // Get conversation history
    const messages = await ConversationService.getMessages(conversationId);
    const history = messages
      .filter((m) => m._id.toString() !== userMessage._id.toString())
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // Generate AI response with integration context
    const aiResponse = await AIService.generateResponse(
      content,
      conversation.projectId.toString(),
      conversation.productInstanceId.toString(),
      history
    );

    // Add AI message
    const assistantMessage = await ConversationService.addMessage({
      conversationId,
      content: aiResponse.content,
      role: 'assistant',
      steps: aiResponse.steps,
    });

    return NextResponse.json({
      userMessage: {
        _id: userMessage._id,
        role: userMessage.role,
        content: userMessage.content,
      },
      assistantMessage: {
        _id: assistantMessage._id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        steps: assistantMessage.steps,
      },
    });
  } catch (error: any) {
    console.error('Error processing message:', error);

    if (error.name === 'AccessDeniedError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.errors) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
