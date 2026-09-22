import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { EngagementService } from '../../core/engagement.service';

@Component({
  selector: 'app-collect',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
  ],
  templateUrl: './collect.component.html',
  styleUrl: './collect.component.scss',
})
export class Collect {
  protected readonly engagement = inject(EngagementService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

    protected readonly industries = [
      'Retail',
      'Healthcare',
      'Logistics',
      'Financial services',
      'Insurance',
    ];
  protected readonly regions = ['North America', 'Europe', 'Asia Pacific'];
  protected readonly timelines = ['This quarter', 'Next quarter', 'This year'];
  protected readonly budgets = ['Under $100k', '$100k–$500k', '$500k+'];
  protected readonly fileNames = signal<string[]>([]);
  protected readonly attempted = signal(false);
  protected readonly matcher: ErrorStateMatcher = {
    isErrorState: (control) => !!control && control.invalid && this.attempted(),
  };

  protected readonly form = this.fb.nonNullable.group({
    industry: ['', Validators.required],
    region: ['', Validators.required],
    timeline: ['', Validators.required],
    budgetBand: ['', Validators.required],
    primaryContact: ['', Validators.required],
  });

  constructor() {
    const saved = this.engagement.collect();
    if (saved) {
      this.form.patchValue(saved);
      this.fileNames.set(saved.fileNames);
    }
  }

  protected onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileNames.set(Array.from(input.files ?? []).map((file) => file.name));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.attempted.set(true);
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.engagement.submitCollect({
      industry: value.industry,
      region: value.region,
      timeline: value.timeline,
      budgetBand: value.budgetBand,
      primaryContact: value.primaryContact,
      fileNames: this.fileNames(),
    });
    void this.router.navigateByUrl('/run');
  }
}
