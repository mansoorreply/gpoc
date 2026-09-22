import { Component, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { EngagementService } from '../../core/engagement.service';

@Component({
  selector: 'app-run',
  imports: [
    MatButton,
    MatIconButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatCheckbox,
    MatChip,
    MatChipSet,
    MatIcon,
    MatTabGroup,
    MatTab,
    MatTooltip,
  ],
  templateUrl: './run.component.html',
  styleUrl: './run.component.scss',
})
export class Run {
  protected readonly engagement = inject(EngagementService);
  protected readonly selectedTab = signal(0);

  protected money(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  protected showAiSuggestions(): void {
    this.selectedTab.set(1);
  }

  protected onTabChange(index: number): void {
    this.selectedTab.set(index);
  }

  protected setProduct(name: string, selected: boolean): void {
    if (this.engagement.selectedProducts().includes(name) === selected) {
      return;
    }
    this.engagement.toggleProduct(name);
  }

  protected complete(): void {
    this.engagement.completeCycle();
  }
}
