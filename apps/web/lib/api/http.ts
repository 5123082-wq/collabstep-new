import { NextResponse } from 'next/server';

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(message: string, init?: ResponseInit): NextResponse<ApiResponse<never>> {
  const status = init?.status ?? 400;
  return NextResponse.json({ ok: false, error: message }, { ...init, status });
}
