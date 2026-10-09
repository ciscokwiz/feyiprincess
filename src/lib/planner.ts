import type { PlannerTask } from './content';
export const storageKey = 'feyi-planner-v1';
export function parseTasks(raw: string | null): PlannerTask[] {
 if (!raw) return [];
 const data: unknown = JSON.parse(raw);
 if (!Array.isArray(data)) throw new Error('Unsupported saved list');
 const ids = new Set<string>();
 return data.filter((item: unknown): item is PlannerTask => {
  if (typeof item !== 'object' || item === null) return false;
  const t = item as Record<string, unknown>;
  if (typeof t.id !== 'string' || !t.id || ids.has(t.id) || typeof t.title !== 'string' || !t.title.trim() || t.title.length > 200 || typeof t.completed !== 'boolean') return false;
  ids.add(t.id); return true;
 });
}
