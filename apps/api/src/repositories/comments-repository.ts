import { memory } from '../data/memory';
import { attachmentsRepository } from './files-repository';
import type { FileObject, TaskComment } from '../types';

export interface TaskCommentNode extends TaskComment {
  attachmentsFiles: FileObject[];
  children?: TaskCommentNode[];
}

export type CreateCommentInput = {
  projectId: string;
  taskId: string;
  authorId: string;
  body: string;
  mentions?: string[];
  parentId?: string | null;
  attachments?: string[];
  createdAt?: string;
};

export type UpdateCommentInput = {
  body?: string;
  mentions?: string[];
  attachments?: string[];
};

function cloneComment(comment: TaskComment): TaskComment {
  return {
    ...comment,
    mentions: [...comment.mentions],
    attachments: [...comment.attachments]
  };
}

function syncCommentAttachments(comment: TaskComment): void {
  const existing = memory.ATTACHMENTS.filter(
    (attachment) => attachment.linkedEntity === 'comment' && attachment.entityId === comment.id
  );
  const existingIds = new Set(existing.map((attachment) => attachment.fileId));
  const desiredIds = new Set(comment.attachments);

  for (const fileId of comment.attachments) {
    if (!existingIds.has(fileId)) {
      attachmentsRepository.create({
        projectId: comment.projectId,
        fileId,
        linkedEntity: 'comment',
        entityId: comment.id,
        createdBy: comment.authorId
      });
    }
  }

  memory.ATTACHMENTS = memory.ATTACHMENTS.filter((attachment) => {
    if (attachment.linkedEntity !== 'comment') {
      return true;
    }
    if (attachment.entityId !== comment.id) {
      return true;
    }
    return desiredIds.has(attachment.fileId);
  });
}

function cloneFile(file: FileObject): FileObject {
  return { ...file };
}

function withFileAttachments(comment: TaskComment): TaskCommentNode {
  const fileLookup = new Map(memory.FILES.map((file) => [file.id, file] as const));
  const attachmentsFiles = comment.attachments
    .map((fileId) => fileLookup.get(fileId))
    .filter((file): file is FileObject => Boolean(file))
    .map(cloneFile);
  return {
    ...cloneComment(comment),
    attachmentsFiles
  };
}

function buildTree(comments: TaskComment[]): TaskCommentNode[] {
  const nodes = new Map<string, TaskCommentNode>();
  const roots: TaskCommentNode[] = [];

  for (const comment of comments) {
    nodes.set(comment.id, withFileAttachments(comment));
  }

  for (const node of nodes.values()) {
    const parentId = node.parentId;
    if (parentId && nodes.has(parentId)) {
      const parent = nodes.get(parentId);
      if (!parent) {
        continue;
      }
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots.map(compactCommentChildren);
}

function compactCommentChildren(comment: TaskCommentNode): TaskCommentNode {
  if (comment.children && comment.children.length > 0) {
    comment.children = comment.children.map(compactCommentChildren);
  } else {
    delete comment.children;
  }
  return comment;
}

export class CommentsRepository {
  listByTask(projectId: string, taskId: string): TaskCommentNode[] {
    const comments = memory.TASK_COMMENTS.filter(
      (comment) => comment.projectId === projectId && comment.taskId === taskId
    ).map(cloneComment);
    return buildTree(comments);
  }

  create(input: CreateCommentInput): TaskCommentNode {
    const now = new Date().toISOString();
    const createdAt = input.createdAt ?? now;
    const comment: TaskComment = {
      id: crypto.randomUUID(),
      projectId: input.projectId,
      taskId: input.taskId,
      parentId: input.parentId ?? null,
      body: input.body,
      mentions: Array.isArray(input.mentions) ? [...input.mentions] : [],
      attachments: Array.isArray(input.attachments) ? [...input.attachments] : [],
      authorId: input.authorId,
      createdAt,
      updatedAt: createdAt
    };
    memory.TASK_COMMENTS.push(comment);
    syncCommentAttachments(comment);
    return withFileAttachments(comment);
  }

  update(commentId: string, patch: UpdateCommentInput): TaskCommentNode | null {
    const match = memory.TASK_COMMENTS.find((comment) => comment.id === commentId);
    if (!match) {
      return null;
    }
    if (patch.body !== undefined) {
      match.body = patch.body;
    }
    if (patch.mentions !== undefined) {
      match.mentions = [...patch.mentions];
    }
    if (patch.attachments !== undefined) {
      match.attachments = [...patch.attachments];
    }
    match.updatedAt = new Date().toISOString();
    syncCommentAttachments(match);
    return withFileAttachments(match);
  }

  delete(commentId: string): void {
    const idsToRemove = new Set<string>();
    idsToRemove.add(commentId);
    const queue = [commentId];
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id) {
        continue;
      }
      for (const comment of memory.TASK_COMMENTS) {
        if (comment.parentId === id) {
          idsToRemove.add(comment.id);
          queue.push(comment.id);
        }
      }
    }
    memory.TASK_COMMENTS = memory.TASK_COMMENTS.filter((comment) => !idsToRemove.has(comment.id));
    memory.ATTACHMENTS = memory.ATTACHMENTS.filter((attachment) => {
      if (attachment.linkedEntity !== 'comment') {
        return true;
      }
      return !idsToRemove.has(attachment.entityId ?? '');
    });
  }
}

export const commentsRepository = new CommentsRepository();
