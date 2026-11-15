// In-memory pub/sub for the live activity feed (SSE).
export interface Event { at: string; type: string; msg: string }

type Sub = (e: Event) => void;
const subs = new Set<Sub>();
let log: Event[] = [];

export function emit(type: string, msg: string): void {
  const e: Event = { at: new Date().toISOString(), type, msg };
  log.push(e);
  if (log.length > 200) log.shift();
  subs.forEach((fn) => fn(e));
}

export function subscribe(fn: Sub): () => void {
  subs.add(fn);
  return () => { subs.delete(fn); };
}

export function recent(): Event[] {
  return log.slice(-50);
}
