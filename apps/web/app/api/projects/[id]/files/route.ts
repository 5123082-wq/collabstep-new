import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { attachmentsRepository, filesRepository, projectsRepository, type AttachmentEntityType } from '@collabverse/api';
import { flags } from '@/lib/flags';
import { recordAudit } from '@/lib/audit/log';

const ExistingAttachmentSchema = z.object({
  fileId: z.string(),
  linkedEntity: z.enum(['project', 'task', 'comment', 'document']).default('project'),
  entityId: z.string().nullable().optional(),
  createdBy: z.string().default('admin.demo@collabverse.test')
});

const UploadSchema = z.object({
  filename: z.string(),
  mimeType: z.string().default('application/octet-stream'),
  sizeBytes: z.number().int().nonnegative(),
  uploaderId: z.string().default('admin.demo@collabverse.test'),
  linkedEntity: z.enum(['project', 'task', 'comment', 'document']).default('project'),
  entityId: z.string().nullable().optional(),
  sha256: z.string().optional()
});

type ExistingAttachmentPayload = {
  mode: 'existing';
  fileId: string;
  linkedEntity: AttachmentEntityType;
  entityId: string | null;
  createdBy: string;
};

type UploadAttachmentPayload = {
  mode: 'upload';
  data: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    uploaderId: string;
    linkedEntity: AttachmentEntityType;
    entityId: string | null;
    sha256?: string;
  };
};

type ParseResult = ExistingAttachmentPayload | UploadAttachmentPayload | { error: 'missing_file' | 'invalid_payload' };

const ENTITY_TYPES: AttachmentEntityType[] = ['project', 'task', 'comment', 'document'];

function normalizeLinkedEntity(value?: string | null): AttachmentEntityType {
  if (!value) {
    return 'project';
  }
  return ENTITY_TYPES.find((item) => item === value) ?? 'project';
}

async function parseRequest(req: NextRequest): Promise<ParseResult> {
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const existingFileId = form.get('fileId');
    const linkedEntity = normalizeLinkedEntity(form.get('linkedEntity') as string | null | undefined);
    const entityIdValue = typeof form.get('entityId') === 'string' ? (form.get('entityId') as string) : undefined;
    const entityId = entityIdValue ?? null;
    const createdBy = typeof form.get('createdBy') === 'string' ? (form.get('createdBy') as string) : 'admin.demo@collabverse.test';

    if (typeof existingFileId === 'string' && existingFileId) {
      return {
        mode: 'existing' as const,
        fileId: existingFileId,
        linkedEntity,
        entityId,
        createdBy
      };
    }

    const file = form.get('file');
    if (!(file instanceof File)) {
      return { error: 'missing_file' as const };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash('sha256').update(buffer).digest('hex');
    const uploaderId = typeof form.get('uploaderId') === 'string' ? (form.get('uploaderId') as string) : createdBy;
    return {
      mode: 'upload' as const,
      data: {
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: buffer.length,
        uploaderId,
        sha256,
        linkedEntity,
        entityId
      }
    };
  }

  const json = await req.json().catch(() => null);
  if (!json) {
    return { error: 'invalid_payload' as const };
  }

  if ('fileId' in json) {
    const parsedExisting = ExistingAttachmentSchema.safeParse(json);
    if (!parsedExisting.success) {
      return { error: 'invalid_payload' as const };
    }
    return {
      mode: 'existing' as const,
      fileId: parsedExisting.data.fileId,
      linkedEntity: normalizeLinkedEntity(parsedExisting.data.linkedEntity),
      entityId: parsedExisting.data.entityId ?? null,
      createdBy: parsedExisting.data.createdBy
    };
  }

  const parsedUpload = UploadSchema.safeParse(json);
  if (!parsedUpload.success) {
    return { error: 'invalid_payload' as const };
  }
  return {
    mode: 'upload' as const,
    data: {
      filename: parsedUpload.data.filename,
      mimeType: parsedUpload.data.mimeType,
      sizeBytes: parsedUpload.data.sizeBytes,
      uploaderId: parsedUpload.data.uploaderId,
      linkedEntity: normalizeLinkedEntity(parsedUpload.data.linkedEntity),
      entityId: parsedUpload.data.entityId ?? null,
      ...(parsedUpload.data.sha256 ? { sha256: parsedUpload.data.sha256 } : {})
    }
  };
}

function mapAttachments(projectId: string) {
  const attachments = attachmentsRepository.listByProject(projectId);
  const fileLookup = new Map(filesRepository.list().map((file) => [file.id, file] as const));
  return attachments.map((attachment) => ({
    ...attachment,
    file: fileLookup.get(attachment.fileId) ?? null
  }));
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const items = mapAttachments(params.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECT_ATTACHMENTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = await parseRequest(req);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  let fileId = parsed.mode === 'existing' ? parsed.fileId : null;
  let file = fileId ? filesRepository.findById(fileId) : null;

  if (parsed.mode === 'upload') {
    const { sha256, ...rest } = parsed.data;
    const created = filesRepository.create({
      filename: rest.filename,
      mimeType: rest.mimeType,
      sizeBytes: rest.sizeBytes,
      uploaderId: rest.uploaderId,
      ...(sha256 ? { sha256 } : {})
    });
    file = created;
    fileId = created.id;
  }

  if (!fileId) {
    return NextResponse.json({ error: 'file_not_found' }, { status: 404 });
  }

  const attachment = attachmentsRepository.create({
    projectId: params.id,
    fileId,
    linkedEntity: parsed.mode === 'existing' ? parsed.linkedEntity : parsed.data.linkedEntity,
    entityId: parsed.mode === 'existing' ? parsed.entityId ?? null : parsed.data.entityId ?? null,
    createdBy: parsed.mode === 'existing' ? parsed.createdBy : parsed.data.uploaderId
  });

  const project = projectsRepository.findById(params.id);
  recordAudit({
    action: 'file.attached',
    entity: { type: 'file', id: attachment.id },
    projectId: params.id,
    workspaceId: project?.workspaceId,
    after: {
      attachmentId: attachment.id,
      fileId,
      linkedEntity: attachment.linkedEntity,
      entityId: attachment.entityId
    }
  });

  return NextResponse.json(
    {
      attachment: {
        ...attachment,
        file: file ?? filesRepository.findById(fileId)
      }
    },
    { status: 201 }
  );
}
