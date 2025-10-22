import { memory } from '../data/memory';
import type { DomainEvent } from '../types';

function cloneEvent<T>(event: DomainEvent<T>): DomainEvent<T> {
  return { ...event };
}

export class DomainEventsRepository {
  emit<T>(event: DomainEvent<T>): DomainEvent<T> {
    memory.EVENTS.push(event);
    return cloneEvent(event);
  }

  list(): DomainEvent[] {
    return memory.EVENTS.map(cloneEvent);
  }
}

export const domainEventsRepository = new DomainEventsRepository();
