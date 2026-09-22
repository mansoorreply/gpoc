import { Component, computed, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { TelemetryCategory, TelemetryService } from '../core/telemetry.service';

const CATEGORY_META: Record<TelemetryCategory, { label: string; icon: string }> = {
  system: { label: 'System', icon: 'settings' },
  intake: { label: 'Intake', icon: 'chat' },
  plan: { label: 'Plan', icon: 'checklist' },
  collect: { label: 'Collect', icon: 'fact_check' },
  run: { label: 'Run', icon: 'rocket_launch' },
};

@Component({
  selector: 'app-telemetry-panel',
  imports: [MatIcon, MatIconButton, MatButton],
  templateUrl: './telemetry-panel.component.html',
  styleUrl: './telemetry-panel.component.scss',
})
export class TelemetryPanel {
  protected readonly telemetry = inject(TelemetryService);
  protected readonly open = signal(false);

  /** Newest events first so the latest activity is at the top of the flyover. */
  protected readonly entries = computed(() => [...this.telemetry.log()].reverse());

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected clear(): void {
    this.telemetry.clear();
  }

  protected meta(category: TelemetryCategory): { label: string; icon: string } {
    return CATEGORY_META[category];
  }

  protected formatClock(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  protected formatElapsed(elapsedMs: number): string {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) {
      return `+${seconds}s`;
    }
    return `+${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
}
