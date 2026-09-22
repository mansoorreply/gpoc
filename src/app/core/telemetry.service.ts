import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

export type TelemetryCategory =
  | 'system'
  | 'navigation'
  | 'intake'
  | 'plan'
  | 'collect'
  | 'run';

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
 * Session-wide activity log. Records every meaningful action (page views and
 * engagement mutations) in chronological order so the telemetry flyover can
 * replay everything the user has done from start until now.
 */
@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private readonly router = inject(Router);
  private readonly events = signal<TelemetryEvent[]>([]);
  private lastNavUrl: string | null = null;
  private counter = 0;

  readonly sessionStart = Date.now();
  readonly log = computed(() => this.events());
  readonly count = computed(() => this.events().length);

  constructor() {
    this.record('system', 'Session started');

    // Capture the page the user landed on first, then every subsequent view.
    this.recordNavigation(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.recordNavigation(event.urlAfterRedirects));
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

  private recordNavigation(url: string): void {
    // Ignore the empty root path; it always redirects straight to a real step.
    if (!url || url === '/' || url === this.lastNavUrl) {
      return;
    }
    this.lastNavUrl = url;
    this.record('navigation', `Opened the ${this.pageLabel(url)} step`);
  }

  private pageLabel(url: string): string {
    const path = url.split('?')[0].split('#')[0].replace(/^\/+/, '').split('/')[0];
    switch (path) {
      case '':
      case 'intake':
        return 'Intake';
      case 'plan':
        return 'Plan';
      case 'collect':
        return 'Collect';
      case 'run':
        return 'Run';
      default:
        return path.charAt(0).toUpperCase() + path.slice(1);
    }
  }
}
