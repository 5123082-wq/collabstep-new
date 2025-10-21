import { NextResponse } from 'next/server';
import { flags } from '@/lib/flags';

export async function GET() {
  return NextResponse.json({
    flags,
    env: {
      NODE_ENV: process.env.NODE_ENV ?? null,
      VERCEL_ENV: process.env.VERCEL_ENV ?? null,
    },
  });
}
