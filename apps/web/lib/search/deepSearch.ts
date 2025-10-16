'use client';

import Fuse from 'fuse.js';
import type { IFuseOptions, FuseResult } from 'fuse.js';

export type SearchItem = {
  type: 'project' | 'task' | 'invoice' | 'user';
  title: string;
  subtitle?: string;
  tags?: string[];
  ref: string;
  projectId?: string;
};

type SearchOptions = {
  projectId?: string;
};

const fuseOptions: IFuseOptions<SearchItem> = {
  includeScore: true,
  threshold: 0.38,
  keys: ['type', 'title', 'subtitle', 'tags']
};

const maskMap: Record<string, SearchItem['type'][]> = {
  '@': ['project', 'user'],
  '#': ['task'],
  $: ['invoice']
};

function applyMask(query: string, items: SearchItem[]): { normalized: string; scoped: SearchItem[] } {
  const trimmed = query.trim();
  const mask = trimmed[0];

  if (mask && maskMap[mask]) {
    const normalized = trimmed.slice(1).trim();
    return {
      normalized,
      scoped: items.filter((item) => maskMap[mask].includes(item.type))
    };
  }

  return { normalized: trimmed, scoped: items };
}

export function search(q: string, data: SearchItem[], searchOptions: SearchOptions = {}): FuseResult<SearchItem>[] {
  const scopedByProject = searchOptions.projectId
    ? data.filter((item) => !item.projectId || item.projectId === searchOptions.projectId)
    : data;

  const { normalized, scoped } = applyMask(q, scopedByProject);
  const fuse = new Fuse(scoped, fuseOptions);

  if (!normalized) {
    return scoped.slice(0, 8).map((item, index) => ({ item, refIndex: index, score: 0 }));
  }

  return fuse.search(normalized);
}
