import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { attachmentsRepository, filesRepository, type AttachmentEntityType } from '@collabverse/api';
import { flags } from '@/lib/flags';

const UploadJsonSchema = z.object({
  filename: z.string(),
  mimeType: z.string().default('application/octet-stream'),
  sizeBytes: z.number().int().nonnegative(),
  uploaderId: z.string().default('admin.demo@collabverse.test'),
  projectId: z.string().optional(),
  entityType: z.enum(['project', 'task', 'comment', 'document']).optional(),
  entityId: z.string().optional()
});

type UploadPayload = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploaderId: string;
  projectId?: string;
  entityType?: AttachmentEntityType;
  entityId?: string | null;
  sha256?: string;
};

const ENTITY_TYPES: AttachmentEntityType[] = ['project', 'task', 'comment', 'document'];

function normalizeEntityType(value?: string | null): AttachmentEntityType | undefined {
  if (!value) {
    return undefined;
  }
  return ENTITY_TYPES.find((item) => item === value) ?? undefined;
}

async function extractUploadPayload(req: NextRequest): Promise<UploadPayload | { error: 'missing_file' | 'invalid_payload' }>
{
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return { error: 'missing_file' as const };
    }
    const projectId = typeof form.get('projectId') === 'string' ? (form.get('projectId') as string) : undefined;
    const entityType = normalizeEntityType(
      typeof form.get('entityType') === 'string' ? (form.get('entityType') as string) : undefined
    );
    const entityId = typeof form.get('entityId') === 'string' ? (form.get('entityId') as string) : undefined;
    const uploaderId = typeof form.get('uploaderId') === 'string' ? (form.get('uploaderId') as string) : 'admin.demo@collabverse.test';
    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash('sha256').update(buffer).digest('hex');
    const payload: UploadPayload = {
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: buffer.length,
      uploaderId,
      sha256,
      ...(projectId ? { projectId } : {}),
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {})
    };
    return payload;
  }

  const parsed = UploadJsonSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return { error: 'invalid_payload' as const };
  }
  const data = parsed.data;
  const entityType = normalizeEntityType(data.entityType);
  const payload: UploadPayload = {
    filename: data.filename,
    mimeType: data.mimeType,
    sizeBytes: data.sizeBytes,
    uploaderId: data.uploaderId,
    ...(data.projectId ? { projectId: data.projectId } : {}),
    ...(entityType ? { entityType } : {}),
    ...(data.entityId ? { entityId: data.entityId } : {})
  };
  return payload;
}

export async function GET() {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const items = filesRepository.list();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const payload = await extractUploadPayload(req);
  if ('error' in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  const file = filesRepository.create({
    filename: payload.filename,
    mimeType: payload.mimeType,
    sizeBytes: payload.sizeBytes,
    uploaderId: payload.uploaderId,
    ...(payload.sha256 ? { sha256: payload.sha256 } : {})
  });

  let attachment = null;
  if (payload.projectId && payload.entityType) {
    attachment = attachmentsRepository.create({
      projectId: payload.projectId,
      fileId: file.id,
      linkedEntity: payload.entityType,
      entityId: payload.entityId ?? null,
      createdBy: payload.uploaderId
    });
  }

  return NextResponse.json({ file, attachment }, { status: 201 });
}
