import { memory } from '../data/memory';
import type { AuditLogEntry } from '../types';

export type AuditLogFilters = {
  projectId?: string;
  workspaceId?: string;
  entityType?: string;
  entityId?: string;
  actions?: string[];
  from?: string;
  to?: string;
};

function cloneEntry(entry: AuditLogEntry): AuditLogEntry {
  return { ...entry, entity: { ...entry.entity } };
}

export class AuditLogRepository {
  record(entry: AuditLogEntry): AuditLogEntry {
    memory.AUDIT_LOG.push(entry);
    return cloneEntry(entry);
  }

  list(filters: AuditLogFilters = {}): AuditLogEntry[] {
    const { projectId, workspaceId, entityType, entityId, actions, from, to } = filters;
    const fromTs = from ? Date.parse(from) : null;
    const toTs = to ? Date.parse(to) : null;

    return memory.AUDIT_LOG.filter((entry) => {
      if (projectId && entry.projectId !== projectId) {
        return false;
      }
      if (workspaceId && entry.workspaceId !== workspaceId) {
        return false;
      }
      if (entityType && entry.entity.type !== entityType) {
        return false;
      }
      if (entityId && entry.entity.id !== entityId) {
        return false;
      }
      if (actions && actions.length > 0 && !actions.includes(entry.action)) {
        return false;
      }
      if (fromTs !== null) {
        const createdAtTs = Date.parse(entry.createdAt);
        if (Number.isNaN(createdAtTs) || createdAtTs < fromTs) {
          return false;
        }
      }
      if (toTs !== null) {
        const createdAtTs = Date.parse(entry.createdAt);
        if (Number.isNaN(createdAtTs) || createdAtTs > toTs) {
          return false;
        }
      }
      return true;
    }).map(cloneEntry);
  }
}

export const auditLogRepository = new AuditLogRepository();
