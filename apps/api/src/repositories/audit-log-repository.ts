import { memory } from '../data/memory';
import type { AuditLogEntry } from '../types';

function cloneEntry(entry: AuditLogEntry): AuditLogEntry {
  return { ...entry, entity: { ...entry.entity } };
}

export class AuditLogRepository {
  record(entry: AuditLogEntry): AuditLogEntry {
    memory.AUDIT_LOG.push(entry);
    return cloneEntry(entry);
  }

  list(): AuditLogEntry[] {
    return memory.AUDIT_LOG.map(cloneEntry);
  }
}

export const auditLogRepository = new AuditLogRepository();
