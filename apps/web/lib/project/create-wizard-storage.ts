import { WizardDraftSchema, createInitialWizardDraft, type WizardDraft } from './create-wizard-schemas';

const STORAGE_KEY = 'cv:create-wizard-draft:v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function readWizardDraft(): WizardDraft {
  if (!isBrowser()) {
    return createInitialWizardDraft();
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialWizardDraft();
    }

    const parsed = JSON.parse(raw);
    const result = WizardDraftSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.warn('[wizard] Не удалось прочитать черновик', error);
  }

  return createInitialWizardDraft();
}

export function writeWizardDraft(draft: WizardDraft): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const snapshot = WizardDraftSchema.parse(draft);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('[wizard] Не удалось сохранить черновик', error);
  }
}

export function clearWizardDraft(): void {
  if (!isBrowser()) {
    return;
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[wizard] Не удалось очистить черновик', error);
  }
}
