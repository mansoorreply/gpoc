import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { EngagementService } from '../../core/engagement.service';

@Component({
  selector: 'app-intake',
  imports: [FormsModule, MatButton, MatFormField, MatLabel, MatInput],
  templateUrl: './intake.component.html',
  styleUrl: './intake.component.scss',
})
export class Intake {
  protected readonly engagement = inject(EngagementService);
  private readonly router = inject(Router);
  private readonly thread = viewChild<ElementRef<HTMLDivElement>>('thread');

  protected draft = '';

  constructor() {
    effect(() => {
      this.engagement.messages();
      requestAnimationFrame(() => this.scrollToLatest());
    });
  }

  protected send(text = this.draft): void {
    this.engagement.reply(text);
    this.draft = '';
  }

  protected continueToPlan(): void {
    void this.router.navigateByUrl('/plan');
  }

  private scrollToLatest(): void {
    const el = this.thread()?.nativeElement;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }
}
