import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { EngagementService } from '../../core/engagement.service';

@Component({
  selector: 'app-plan',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
  ],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.scss',
})
export class Plan {
  protected readonly engagement = inject(EngagementService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly showAddForm = signal(false);
  protected readonly attempted = signal(false);
  protected readonly matcher: ErrorStateMatcher = {
    isErrorState: (control) => !!control && control.invalid && this.attempted(),
  };

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    purpose: ['', Validators.required],
    attendees: ['', Validators.required],
    duration: ['', Validators.required],
  });

  protected openAddForm(): void {
    this.showAddForm.set(true);
  }

  protected cancelAdd(): void {
    this.showAddForm.set(false);
    this.attempted.set(false);
    this.form.reset({
      title: '',
      purpose: '',
      attendees: '',
      duration: '',
    });
  }

  protected addPlan(): void {
    if (this.form.invalid) {
      this.attempted.set(true);
      this.form.markAllAsTouched();
      return;
    }

    this.engagement.addPlan(this.form.getRawValue());
    this.cancelAdd();
  }

  protected removePlan(id: string): void {
    this.engagement.removePlan(id);
  }

  protected accept(): void {
    this.engagement.acceptPlan();
    void this.router.navigateByUrl('/collect');
  }
}
