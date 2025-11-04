import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { projectsRepository, tasksRepository, DEFAULT_WORKSPACE_USER_ID } from '@collabverse/api';
import { flags } from '@/lib/flags';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

const CreateJobPostingSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  budget: z.number().optional(),
  skills: z.array(z.string()).optional()
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check access for private projects
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;
  const project = projectsRepository.findById(params.id);

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!projectsRepository.hasAccess(project.id, currentUserId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const parsed = CreateJobPostingSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error }, { status: 400 });
  }

  const { taskId, title, description, budget, skills } = parsed.data;

  // Get task details
  const task = tasksRepository.findById(taskId);
  if (!task || task.projectId !== params.id) {
    return NextResponse.json({ error: 'task_not_found' }, { status: 404 });
  }

  // Create job posting payload from task
  const jobPostingPayload = {
    projectId: params.id,
    taskId,
    title: title || task.title,
    description: description || task.description || '',
    budget: budget || task.estimatedTime ? (task.estimatedTime * 1000).toFixed(0) : undefined, // Convert hours to rough estimate
    skills: skills || extractSkillsFromDescription(task.description || ''),
    status: 'draft' as const,
    createdAt: new Date().toISOString()
  };

  // TODO: Integrate with actual marketplace API
  // For now, return the payload that would be sent to marketplace
  return NextResponse.json(
    {
      jobPosting: jobPostingPayload,
      message: 'Job posting created from task. Integration with marketplace will be implemented in next iteration.'
    },
    { status: 201 }
  );
}

function extractSkillsFromDescription(description: string): string[] {
  // Simple keyword extraction - in production, use NLP/AI
  const commonSkills = [
    'React',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Python',
    'Design',
    'Marketing',
    'SEO',
    'Copywriting',
    'Development',
    'Frontend',
    'Backend',
    'Fullstack'
  ];

  const lowerDescription = description.toLowerCase();
  return commonSkills.filter((skill) => lowerDescription.includes(skill.toLowerCase()));
}

