import { NextRequest, NextResponse } from 'next/server';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import type { TaskStatus } from '@/domain/projects/types';

const DEFAULT_WORKFLOW: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { taskId, toStatus } = (await req.json().catch(() => ({}))) as {
    taskId?: string;
    toStatus?: TaskStatus;
  };

  if (!taskId || !toStatus) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const taskIndex = memory.TASKS.findIndex(
    (task) => task.id === taskId && task.projectId === params.id
  );
  if (taskIndex === -1) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const workflow = memory.WORKFLOWS[params.id]?.statuses ?? DEFAULT_WORKFLOW;
  if (!workflow.includes(toStatus)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  memory.TASKS[taskIndex] = {
    ...memory.TASKS[taskIndex],
    status: toStatus,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(memory.TASKS[taskIndex]);
}
