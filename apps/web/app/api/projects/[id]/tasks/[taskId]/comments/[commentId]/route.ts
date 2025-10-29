import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { commentsRepository, usersRepository } from '@collabverse/api';
import { flags } from '@/lib/flags';

const CommentUpdateSchema = z.object({
  body: z.string().optional(),
  mentions: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional()
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string; commentId: string } }
) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const parsed = CommentUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const patch = {
    ...(parsed.data.body !== undefined ? { body: parsed.data.body } : {}),
    ...(parsed.data.mentions !== undefined ? { mentions: parsed.data.mentions } : {}),
    ...(parsed.data.attachments !== undefined ? { attachments: parsed.data.attachments } : {})
  };
  const updated = commentsRepository.update(params.commentId, patch);
  if (!updated) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const author = usersRepository.findById(updated.authorId);
  const mentionsDetails = updated.mentions.map((id) => usersRepository.findById(id));
  return NextResponse.json({
    comment: {
      ...updated,
      author,
      mentionsDetails
    }
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; taskId: string; commentId: string } }
) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  commentsRepository.delete(params.commentId);
  return NextResponse.json({ ok: true });
}
