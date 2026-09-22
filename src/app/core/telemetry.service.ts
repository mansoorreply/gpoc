import { Injectable, computed, signal } from '@angular/core';

export type TelemetryCategory = 'system' | 'intake' | 'plan' | 'collect' | 'run';

export interface TelemetryEvent {
  id: string;
  timestamp: number;
  /** Milliseconds elapsed since the session started. */
  elapsedMs: number;
  category: TelemetryCategory;
  action: string;
  detail?: string;
}

/**
 * Session-wide activity log. Records the meaningful engagement actions the user
 * takes (intake answers, plan changes, activity progress, solution choices) in
 * chronological order so the telemetry flyover can replay what has happened
 * from the start of the session until now. Navigation/page-view clicks are
 * intentionally excluded — only relevant information is captured.
 */
@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private readonly events = signal<TelemetryEvent[]>([]);
  private counter = 0;

  readonly sessionStart = Date.now();
  readonly log = computed(() => this.events());
  readonly count = computed(() => this.events().length);

  constructor() {
    this.record('system', 'Session started');
  }

  record(category: TelemetryCategory, action: string, detail?: string): void {
    const timestamp = Date.now();
    const event: TelemetryEvent = {
      id: `evt-${++this.counter}`,
      timestamp,
      elapsedMs: timestamp - this.sessionStart,
      category,
      action,
      detail: detail?.trim() ? detail.trim() : undefined,
    };
    this.events.update((list) => [...list, event]);
  }

  clear(): void {
    this.events.set([]);
    this.counter = 0;
    this.record('system', 'Telemetry cleared');
  }
}
