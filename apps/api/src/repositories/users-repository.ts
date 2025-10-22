import { memory } from '../data/memory';
import type { WorkspaceUser } from '../types';

function cloneUser(user: WorkspaceUser): WorkspaceUser {
  return { ...user };
}

export class UsersRepository {
  list(): WorkspaceUser[] {
    return memory.WORKSPACE_USERS.map(cloneUser);
  }

  findById(id: string): WorkspaceUser | null {
    if (!id) {
      return null;
    }
    const trimmed = id.trim();
    if (!trimmed) {
      return null;
    }
    const lower = trimmed.toLowerCase();
    const match = memory.WORKSPACE_USERS.find(
      (user) => user.id === trimmed || user.email.toLowerCase() === lower
    );
    return match ? cloneUser(match) : null;
  }

  findMany(ids: string[]): WorkspaceUser[] {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }
    const lookup = new Set(ids.map((value) => value.trim()).filter(Boolean));
    if (lookup.size === 0) {
      return [];
    }
    return memory.WORKSPACE_USERS.filter((user) => lookup.has(user.id)).map(cloneUser);
  }
}

export const usersRepository = new UsersRepository();
