import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { EngagementService } from '../core/engagement.service';
import { StepId } from '../core/engagement.models';
import { EngagementHistory } from '../shared/engagement-history.component';

interface PortalTab {
  id: StepId;
  path: string;
  label: string;
}

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatTabNav,
    MatTabNavPanel,
    MatTabLink,
    EngagementHistory,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class Shell {
  protected readonly engagement = inject(EngagementService);
  private readonly router = inject(Router);

  protected readonly tabs: readonly PortalTab[] = [
    { id: 'intake', path: '/intake', label: 'Intake' },
    { id: 'plan', path: '/plan', label: 'Plan' },
    { id: 'collect', path: '/collect', label: 'Collect' },
    { id: 'run', path: '/run', label: 'Run' },
  ];

  protected guardTab(event: Event, step: StepId): void {
    if (!this.engagement.isUnlocked(step)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  protected reset(): void {
    this.engagement.reset();
    void this.router.navigateByUrl('/intake');
  }
}
