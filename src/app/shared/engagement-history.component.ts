import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { EngagementService } from '../core/engagement.service';

@Component({
  selector: 'app-engagement-history',
  imports: [RouterLink, MatIconButton, MatIcon],
  templateUrl: './engagement-history.component.html',
  styleUrl: './engagement-history.component.scss',
})
export class EngagementHistory {
  protected readonly engagement = inject(EngagementService);
  protected readonly collapsed = signal(false);

  protected toggle(): void {
    this.collapsed.update((value) => !value);
  }
}
