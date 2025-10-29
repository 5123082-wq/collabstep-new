import { memory } from '../data/memory';
import type {
  Attachment,
  AttachmentEntityType,
  FileObject
} from '../types';

export type CreateFileInput = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploaderId: string;
  description?: string;
  storageUrl?: string;
  sha256?: string;
  uploadedAt?: string;
};

export type CreateAttachmentInput = {
  projectId: string;
  fileId: string;
  linkedEntity: AttachmentEntityType;
  entityId: string | null;
  createdBy: string;
  createdAt?: string;
};

function cloneFile(file: FileObject): FileObject {
  return { ...file };
}

function cloneAttachment(attachment: Attachment): Attachment {
  return { ...attachment };
}

export class FilesRepository {
  list(): FileObject[] {
    return memory.FILES.map(cloneFile);
  }

  findById(id: string): FileObject | null {
    const match = memory.FILES.find((file) => file.id === id);
    return match ? cloneFile(match) : null;
  }

  listByProject(projectId: string): FileObject[] {
    const attachments = memory.ATTACHMENTS.filter((attachment) => attachment.projectId === projectId);
    if (attachments.length === 0) {
      return [];
    }
    const lookup = new Map(memory.FILES.map((file) => [file.id, file] as const));
    return attachments
      .map((attachment) => lookup.get(attachment.fileId))
      .filter((file): file is FileObject => Boolean(file))
      .map(cloneFile);
  }

  create(input: CreateFileInput): FileObject {
    const now = new Date().toISOString();
    const uploadedAt = input.uploadedAt ?? now;
    const id = crypto.randomUUID();
    const file: FileObject = {
      id,
      uploaderId: input.uploaderId,
      filename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageUrl: input.storageUrl ?? `/uploads/${id}`,
      uploadedAt,
      ...(input.description ? { description: input.description } : {}),
      ...(input.sha256 ? { sha256: input.sha256 } : {})
    };
    memory.FILES.push(file);
    return cloneFile(file);
  }

  delete(id: string): void {
    memory.FILES = memory.FILES.filter((file) => file.id !== id);
    memory.ATTACHMENTS = memory.ATTACHMENTS.filter((attachment) => attachment.fileId !== id);
  }
}

export class AttachmentsRepository {
  listByEntity(
    projectId: string,
    linkedEntity: AttachmentEntityType,
    entityId: string | null
  ): Attachment[] {
    return memory.ATTACHMENTS.filter(
      (attachment) =>
        attachment.projectId === projectId &&
        attachment.linkedEntity === linkedEntity &&
        attachment.entityId === entityId
    ).map(cloneAttachment);
  }

  listByProject(projectId: string): Attachment[] {
    return memory.ATTACHMENTS.filter((attachment) => attachment.projectId === projectId).map(cloneAttachment);
  }

  create(input: CreateAttachmentInput): Attachment {
    const now = new Date().toISOString();
    const createdAt = input.createdAt ?? now;
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      projectId: input.projectId,
      fileId: input.fileId,
      linkedEntity: input.linkedEntity,
      entityId: input.entityId ?? null,
      createdAt,
      createdBy: input.createdBy
    };
    memory.ATTACHMENTS.push(attachment);
    return cloneAttachment(attachment);
  }

  delete(id: string): void {
    memory.ATTACHMENTS = memory.ATTACHMENTS.filter((attachment) => attachment.id !== id);
  }
}

export const filesRepository = new FilesRepository();
export const attachmentsRepository = new AttachmentsRepository();
