import { memory } from '../data/memory';
import type { Document, DocumentVersion, FileObject } from '../types';

export interface DocumentWithVersions extends Document {
  versions: (DocumentVersion & { file?: FileObject })[];
}

export type CreateDocumentInput = {
  projectId: string;
  title: string;
  type?: string;
  status?: string;
  createdBy: string;
  createdAt?: string;
};

export type CreateDocumentVersionInput = {
  documentId: string;
  fileId: string;
  createdBy: string;
  notes?: string;
  createdAt?: string;
};

function cloneDocument(document: Document): Document {
  return { ...document };
}

function cloneVersion(version: DocumentVersion): DocumentVersion {
  return { ...version };
}

function resolveDocumentVersions(documentId: string): (DocumentVersion & { file?: FileObject })[] {
  const versions = memory.DOCUMENT_VERSIONS.filter((version) => version.documentId === documentId)
    .sort((a, b) => a.version - b.version)
    .map(cloneVersion);
  const fileLookup = new Map(memory.FILES.map((file) => [file.id, file] as const));
  return versions.map((version) => ({
    ...version,
    ...(fileLookup.has(version.fileId) ? { file: { ...fileLookup.get(version.fileId)! } } : {})
  }));
}

export class DocumentsRepository {
  listByProject(projectId: string): DocumentWithVersions[] {
    return memory.DOCUMENTS.filter((document) => document.projectId === projectId).map((document) => ({
      ...cloneDocument(document),
      versions: resolveDocumentVersions(document.id)
    }));
  }

  createDocument(input: CreateDocumentInput): DocumentWithVersions {
    const now = new Date().toISOString();
    const createdAt = input.createdAt ?? now;
    const document: Document = {
      id: crypto.randomUUID(),
      projectId: input.projectId,
      title: input.title,
      createdAt,
      updatedAt: createdAt,
      ...(input.type ? { type: input.type } : {}),
      ...(input.status ? { status: input.status } : {})
    };
    memory.DOCUMENTS.push(document);
    return { ...document, versions: [] };
  }

  updateDocument(documentId: string, patch: Partial<Pick<Document, 'title' | 'type' | 'status'>>): DocumentWithVersions | null {
    const match = memory.DOCUMENTS.find((document) => document.id === documentId);
    if (!match) {
      return null;
    }
    if (patch.title !== undefined) {
      match.title = patch.title;
    }
    if (patch.type !== undefined) {
      match.type = patch.type;
    }
    if (patch.status !== undefined) {
      match.status = patch.status;
    }
    match.updatedAt = new Date().toISOString();
    return {
      ...cloneDocument(match),
      versions: resolveDocumentVersions(match.id)
    };
  }

  createVersion(input: CreateDocumentVersionInput): DocumentWithVersions | null {
    const document = memory.DOCUMENTS.find((item) => item.id === input.documentId);
    if (!document) {
      return null;
    }
    const existingVersions = memory.DOCUMENT_VERSIONS.filter((version) => version.documentId === input.documentId);
    const nextVersion = existingVersions.length > 0 ? Math.max(...existingVersions.map((v) => v.version)) + 1 : 1;
    const now = new Date().toISOString();
    const createdAt = input.createdAt ?? now;
    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      documentId: input.documentId,
      fileId: input.fileId,
      version: nextVersion,
      createdBy: input.createdBy,
      createdAt,
      ...(input.notes ? { notes: input.notes } : {})
    };
    memory.DOCUMENT_VERSIONS.push(version);
    document.updatedAt = createdAt;
    return {
      ...cloneDocument(document),
      versions: resolveDocumentVersions(document.id)
    };
  }

  deleteVersion(versionId: string): void {
    memory.DOCUMENT_VERSIONS = memory.DOCUMENT_VERSIONS.filter((version) => version.id !== versionId);
  }

  deleteDocument(documentId: string): void {
    memory.DOCUMENTS = memory.DOCUMENTS.filter((document) => document.id !== documentId);
    memory.DOCUMENT_VERSIONS = memory.DOCUMENT_VERSIONS.filter((version) => version.documentId !== documentId);
  }
}

export const documentsRepository = new DocumentsRepository();
