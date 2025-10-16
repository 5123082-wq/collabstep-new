export type ProjectPersistState = {
  lastTab?: string;
};

const prefix = 'cv-project:';

function isProjectPersistState(value: unknown): value is ProjectPersistState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as ProjectPersistState;
  if (candidate.lastTab && typeof candidate.lastTab !== 'string') {
    return false;
  }

  return true;
}

export function readProjectState(projectId: string): ProjectPersistState {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(`${prefix}${projectId}`);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (isProjectPersistState(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('Не удалось прочитать состояние проекта', error);
  }

  return {};
}

export function writeProjectState(projectId: string, state: ProjectPersistState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(`${prefix}${projectId}`, JSON.stringify(state));
  } catch (error) {
    console.warn('Не удалось сохранить состояние проекта', error);
  }
}
