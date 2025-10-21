export type WorkspaceMetric = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  trend?: number;
};

export type WorkspaceRoadmap = {
  id: string;
  name: string;
  owner: string;
  progress: number;
  stage: string;
};

export type WorkspaceTask = {
  id: string;
  title: string;
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  owner: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
};

export type WorkspaceEvent = {
  id: string;
  title: string;
  type: 'meeting' | 'milestone' | 'deadline';
  date: string;
  owner: string;
};

export type WorkspaceTeamMember = {
  id: string;
  name: string;
  role: string;
  focus: string;
  allocation: number;
  status: 'available' | 'busy' | 'vacation';
};

export type WorkspaceFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
  owner: string;
};

export type WorkspaceAnalytics = {
  id: string;
  metric: string;
  value: number;
  change: number;
  period: string;
};

export type WorkspaceAutomation = {
  id: string;
  name: string;
  trigger: string;
  status: 'active' | 'draft' | 'paused';
  owner: string;
};

export type WorkspaceModule = {
  id: string;
  name: string;
  owner: string;
  progress: number;
  health: 'on-track' | 'at-risk' | 'blocked';
  focus: string;
};

export type WorkspaceIntegration = {
  id: string;
  name: string;
  status: 'connected' | 'error' | 'not-configured';
  description: string;
  updatedAt: string;
};

export type WorkspaceSetting = {
  id: string;
  name: string;
  description: string;
  value: string;
  category: 'general' | 'access' | 'notifications';
};

export type WorkspaceData = {
  metrics: WorkspaceMetric[];
  roadmaps: WorkspaceRoadmap[];
  tasks: WorkspaceTask[];
  events: WorkspaceEvent[];
  team: WorkspaceTeamMember[];
  files: WorkspaceFile[];
  analytics: WorkspaceAnalytics[];
  automations: WorkspaceAutomation[];
  modules: WorkspaceModule[];
  integrations: WorkspaceIntegration[];
  settings: WorkspaceSetting[];
};

export type WorkspaceResponse = {
  data: WorkspaceData;
  updatedAt: string;
};
