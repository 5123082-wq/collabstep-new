import { NextResponse } from 'next/server';
import { workspaceSnapshot } from '@/mocks/workspace';
import type { WorkspaceResponse } from '@/types/workspace';

export async function GET() {
  const response: WorkspaceResponse = {
    data: workspaceSnapshot,
    updatedAt: new Date().toISOString()
  };

  return NextResponse.json(response);
}
