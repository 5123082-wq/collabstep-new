import { memory, DEFAULT_ACCOUNT_ID, DEFAULT_WORKSPACE_ID } from '../data/memory';
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

  create(user: Omit<WorkspaceUser, 'id'> & { id?: string }): WorkspaceUser {
    const email = user.email.trim().toLowerCase();
    const existing = memory.WORKSPACE_USERS.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      return cloneUser(existing);
    }

    const newUser: WorkspaceUser = {
      id: user.id || email,
      name: user.name.trim(),
      email: user.email.trim(),
      ...(user.title && { title: user.title }),
      ...(user.avatarUrl && { avatarUrl: user.avatarUrl }),
      ...(user.department && { department: user.department }),
      ...(user.location && { location: user.location })
    };

    memory.WORKSPACE_USERS.push(newUser);

    // Добавляем пользователя в ACCOUNT_MEMBERS как member
    const existingAccountMember = memory.ACCOUNT_MEMBERS.find(
      (member) => member.userId === newUser.id && member.accountId === DEFAULT_ACCOUNT_ID
    );
    if (!existingAccountMember) {
      memory.ACCOUNT_MEMBERS.push({
        accountId: DEFAULT_ACCOUNT_ID,
        userId: newUser.id,
        role: 'member'
      });
    }

    // Добавляем пользователя в WORKSPACE_MEMBERS как member
    const workspaceMembers = memory.WORKSPACE_MEMBERS[DEFAULT_WORKSPACE_ID] || [];
    const existingWorkspaceMember = workspaceMembers.find((member) => member.userId === newUser.id);
    if (!existingWorkspaceMember) {
      if (!memory.WORKSPACE_MEMBERS[DEFAULT_WORKSPACE_ID]) {
        memory.WORKSPACE_MEMBERS[DEFAULT_WORKSPACE_ID] = [];
      }
      memory.WORKSPACE_MEMBERS[DEFAULT_WORKSPACE_ID].push({
        workspaceId: DEFAULT_WORKSPACE_ID,
        userId: newUser.id,
        role: 'member'
      });
    }

    return cloneUser(newUser);
  }
}

export const usersRepository = new UsersRepository();
