import { NextResponse } from 'next/server';
import { financeOpenApi } from '@/lib/api/finance-openapi';

export async function GET() {
  return NextResponse.json(financeOpenApi);
}
