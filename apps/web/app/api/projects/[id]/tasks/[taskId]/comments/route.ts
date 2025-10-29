import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { commentsRepository, usersRepository } from '@collabverse/api';
import { flags } from '@/lib/flags';

const CommentCreateSchema = z.object({
  body: z.string().min(1),
  parentId: z.string().nullable().optional(),
  mentions: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  authorId: z.string().default('admin.demo@collabverse.test')
});

function hydrateAuthors(
  comments: ReturnType<typeof commentsRepository.listByTask>
): unknown[] {
  const userLookup = new Map(usersRepository.list().map((user) => [user.id, user] as const));

  const mapNode = (comment: (typeof comments)[number]): any => ({
    ...comment,
    author: userLookup.get(comment.authorId) ?? null,
    mentionsDetails: comment.mentions.map((id) => userLookup.get(id) ?? null),
    ...(comment.children ? { children: comment.children.map(mapNode) } : {})
  });

  return comments.map(mapNode);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const comments = commentsRepository.listByTask(params.id, params.taskId);
  const items = hydrateAuthors(comments);
  return NextResponse.json({ items });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const parsed = CommentCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const comment = commentsRepository.create({
    projectId: params.id,
    taskId: params.taskId,
    body: parsed.data.body,
    authorId: parsed.data.authorId,
    parentId: parsed.data.parentId ?? null,
    mentions: parsed.data.mentions ?? [],
    attachments: parsed.data.attachments ?? []
  });
  const author = usersRepository.findById(comment.authorId);
  const mentionsDetails = (parsed.data.mentions ?? []).map((id) => usersRepository.findById(id));
  return NextResponse.json({
    comment: {
      ...comment,
      author,
      mentionsDetails
    }
  }, { status: 201 });
}
