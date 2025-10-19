import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function isFeatureEnabled(flag?: string, overrides?: Record<string, boolean>) {
  if (!flag) {
    return true;
  }

  if (overrides && Object.prototype.hasOwnProperty.call(overrides, flag)) {
    return Boolean(overrides[flag]);
  }

  const env = process.env as Record<string, string | undefined>;
  const direct = env[flag];
  if (typeof direct === 'string') {
    return ['1', 'true', 'on', 'enabled'].includes(direct.toLowerCase());
  }

  const prefixed = env[`NEXT_PUBLIC_${flag}`];
  if (typeof prefixed === 'string') {
    return ['1', 'true', 'on', 'enabled'].includes(prefixed.toLowerCase());
  }

  return true;
}
