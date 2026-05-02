import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie, requireProjectAccess } from '@/lib/session';
import { createConversationSchema } from '@/lib/validation';
import { ConversationService } from '@/services';
import { accessControl } from '@/lib/middleware';

export interface ConversationResponse {
  _id: string;
  projectId: string;
  productInstanceId: string;
  userId: string;
  title: string;
  createdAt: Date;
}

/**
 * POST /api/conversations - Create new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createConversationSchema.parse(body);

    // Check access
    await accessControl.requireProjectAccess(session.user.id, data.projectId);

    // Create conversation
    const conversation = await ConversationService.createConversation({
      ...data,
      userId: session.user.id,
    });

    return NextResponse.json({
      _id: conversation._id,
      projectId: conversation.projectId,
      productInstanceId: conversation.productInstanceId,
      userId: conversation.userId,
      title: conversation.title,
      createdAt: conversation.createdAt,
    } as ConversationResponse);
  } catch (error: any) {
    console.error('Error creating conversation:', error);

    if (error.name === 'AccessDeniedError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.errors) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

/**
 * GET /api/conversations - List conversations for a product instance
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const productInstanceId = searchParams.get('productInstanceId');

    if (!projectId || !productInstanceId) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    // Check access
    await accessControl.requireProjectAccess(session.user.id, projectId);

    // Get conversations
    const conversations = await ConversationService.getConversationsByProductInstance(
      projectId,
      productInstanceId,
      session.user.id
    );

    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);

    if (error.name === 'AccessDeniedError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
