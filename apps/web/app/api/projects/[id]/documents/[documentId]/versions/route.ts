import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { attachmentsRepository, documentsRepository, filesRepository } from '@collabverse/api';
import { flags } from '@/lib/flags';

const VersionCreateSchema = z.object({
  fileId: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().default('admin.demo@collabverse.test')
});

async function parseRequest(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const file = form.get('file');
    const notes = typeof form.get('notes') === 'string' ? (form.get('notes') as string) : undefined;
    const createdBy =
      typeof form.get('createdBy') === 'string' ? (form.get('createdBy') as string) : 'admin.demo@collabverse.test';
    if (typeof form.get('fileId') === 'string') {
      return {
        mode: 'existing' as const,
        fileId: form.get('fileId') as string,
        notes,
        createdBy
      };
    }
    if (!(file instanceof File)) {
      return { error: 'missing_file' as const };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash('sha256').update(buffer).digest('hex');
    return {
      mode: 'upload' as const,
      data: {
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: buffer.length,
        uploaderId: createdBy,
        sha256
      },
      notes,
      createdBy
    };
  }

  const parsed = VersionCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return { error: 'invalid_payload' as const };
  }
  if (!parsed.data.fileId) {
    return { error: 'missing_file' as const };
  }
  return {
    mode: 'existing' as const,
    fileId: parsed.data.fileId,
    notes: parsed.data.notes,
    createdBy: parsed.data.createdBy
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const parsed = await parseRequest(req);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  let fileId = parsed.mode === 'existing' ? parsed.fileId : null;
  if (parsed.mode === 'upload') {
    const { sha256, ...rest } = parsed.data;
    const created = filesRepository.create({
      filename: rest.filename,
      mimeType: rest.mimeType,
      sizeBytes: rest.sizeBytes,
      uploaderId: rest.uploaderId,
      ...(sha256 ? { sha256 } : {})
    });
    fileId = created.id;
  }
  if (!fileId) {
    return NextResponse.json({ error: 'file_not_found' }, { status: 404 });
  }
  const versionInput = {
    documentId: params.documentId,
    fileId,
    createdBy: parsed.createdBy,
    ...(parsed.notes ? { notes: parsed.notes } : {})
  };
  const document = documentsRepository.createVersion(versionInput);
  if (!document) {
    return NextResponse.json({ error: 'document_not_found' }, { status: 404 });
  }
  attachmentsRepository.create({
    projectId: params.id,
    fileId,
    linkedEntity: 'document',
    entityId: params.documentId,
    createdBy: parsed.createdBy
  });
  return NextResponse.json({ document }, { status: 201 });
}
