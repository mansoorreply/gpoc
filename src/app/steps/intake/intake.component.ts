import { Component, inject } from '@angular/core';
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

  protected draft = '';

  protected send(text = this.draft): void {
    this.engagement.reply(text);
    this.draft = '';
  }

  protected continueToPlan(): void {
    void this.router.navigateByUrl('/plan');
  }
}
