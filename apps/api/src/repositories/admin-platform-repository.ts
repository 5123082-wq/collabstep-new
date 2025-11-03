import { memory } from '../data/memory';
import type {
  ID,
  PlatformModule,
  PlatformModuleNode,
  PlatformModuleStatus,
  PlatformRole,
  PlatformUserControl,
  PlatformUserStatus
} from '../types';

function cloneModule(module: PlatformModule): PlatformModule {
  return {
    ...module,
    testers: [...module.testers],
    tags: [...module.tags]
  };
}

function buildTree(modules: PlatformModule[]): PlatformModuleNode[] {
  const nodes = modules.map((module) => ({ ...cloneModule(module), children: [] as PlatformModuleNode[] }));
  const map = new Map<ID, PlatformModuleNode>(nodes.map((node) => [node.id, node]));
  const roots: PlatformModuleNode[] = [];

  for (const node of nodes) {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) {
        parent.children?.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  const sortRecursive = (items: PlatformModuleNode[]): void => {
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        sortRecursive(item.children);
      }
    });
  };

  sortRecursive(roots);

  return roots;
}

function findModule(id: ID): PlatformModule | undefined {
  return memory.ADMIN_PLATFORM_MODULES.find((module) => module.id === id);
}

function cloneUserControl(control: PlatformUserControl): PlatformUserControl {
  return {
    ...control,
    roles: [...control.roles],
    testerAccess: [...control.testerAccess]
  };
}

export class AdminPlatformRepository {
  listModuleTree(): PlatformModuleNode[] {
    return buildTree(memory.ADMIN_PLATFORM_MODULES.map(cloneModule));
  }

  getFlatModules(): PlatformModule[] {
    return memory.ADMIN_PLATFORM_MODULES.map(cloneModule);
  }

  updateModuleStatus(id: ID, status: PlatformModuleStatus, actorId: ID): PlatformModule | null {
    const module = findModule(id);
    if (!module) {
      return null;
    }
    module.status = status;
    module.updatedAt = new Date().toISOString();
    module.updatedBy = actorId;
    return cloneModule(module);
  }

  updateModuleDefaults(
    id: ID,
    updates: Partial<Pick<PlatformModule, 'defaultAudience' | 'testers' | 'tags' | 'summary'>>,
    actorId: ID
  ): PlatformModule | null {
    const module = findModule(id);
    if (!module) {
      return null;
    }

    if (updates.defaultAudience) {
      module.defaultAudience = updates.defaultAudience;
    }

    if (Array.isArray(updates.testers)) {
      const uniqueTesters = Array.from(new Set(updates.testers.filter(Boolean)));
      module.testers = uniqueTesters;
    }

    if (Array.isArray(updates.tags)) {
      module.tags = Array.from(new Set(updates.tags.filter(Boolean)));
    }

    if (typeof updates.summary === 'string') {
      module.summary = updates.summary.trim();
    }

    module.updatedAt = new Date().toISOString();
    module.updatedBy = actorId;

    return cloneModule(module);
  }

  listUserControls(): PlatformUserControl[] {
    return memory.ADMIN_USER_CONTROLS.map(cloneUserControl);
  }

  getUserControl(userId: ID): PlatformUserControl | null {
    const control = memory.ADMIN_USER_CONTROLS.find((item) => item.userId === userId);
    return control ? cloneUserControl(control) : null;
  }

  upsertUserControl(
    userId: ID,
    updates: Partial<Omit<PlatformUserControl, 'userId'>>,
    actorId: ID
  ): PlatformUserControl {
    let control = memory.ADMIN_USER_CONTROLS.find((item) => item.userId === userId);

    if (!control) {
      control = {
        userId,
        status: 'active',
        roles: [],
        testerAccess: [],
        updatedAt: new Date().toISOString(),
        updatedBy: actorId
      };
      memory.ADMIN_USER_CONTROLS.push(control);
    }

    if (updates.status) {
      control.status = updates.status;
    }

    if (Array.isArray(updates.roles)) {
      control.roles = Array.from(new Set(updates.roles.filter(Boolean))) as PlatformRole[];
    }

    if (Array.isArray(updates.testerAccess)) {
      control.testerAccess = Array.from(new Set(updates.testerAccess.filter(Boolean)));
    }

    if (typeof updates.notes === 'string') {
      control.notes = updates.notes.trim() || undefined;
    }

    control.updatedAt = new Date().toISOString();
    control.updatedBy = actorId;

    return cloneUserControl(control);
  }

  removeModuleTesterAssignments(testers: ID[], moduleId: ID): void {
    const module = findModule(moduleId);
    if (!module) {
      return;
    }
    const exclude = new Set(testers);
    module.testers = module.testers.filter((tester) => !exclude.has(tester));
    module.updatedAt = new Date().toISOString();
  }

  assignModuleTesters(testers: ID[], moduleId: ID, actorId: ID): PlatformModule | null {
    const module = findModule(moduleId);
    if (!module) {
      return null;
    }
    const unique = new Set(module.testers);
    testers.forEach((tester) => {
      if (tester) {
        unique.add(tester);
      }
    });
    module.testers = Array.from(unique);
    module.updatedAt = new Date().toISOString();
    module.updatedBy = actorId;
    return cloneModule(module);
  }
}

export const adminPlatformRepository = new AdminPlatformRepository();

