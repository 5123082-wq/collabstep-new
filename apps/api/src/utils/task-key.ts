/**
 * Formats a task identifier as "PROJ-123"
 * @param projectKey - The project key (e.g., "PROJ", "ABC")
 * @param taskNumber - The task number (e.g., 123)
 * @returns Formatted task identifier (e.g., "PROJ-123")
 */
export function formatTaskKey(projectKey: string, taskNumber: number): string {
  return `${projectKey.toUpperCase()}-${taskNumber}`;
}

/**
 * Parses a task identifier like "PROJ-123" into project key and number
 * @param taskKey - The formatted task key (e.g., "PROJ-123")
 * @returns Object with projectKey and number, or null if invalid format
 */
export function parseTaskKey(taskKey: string): { projectKey: string; number: number } | null {
  const match = taskKey.match(/^([A-Z0-9]+)-(\d+)$/i);
  if (!match) {
    return null;
  }
  return {
    projectKey: match[1].toUpperCase(),
    number: Number.parseInt(match[2], 10)
  };
}

