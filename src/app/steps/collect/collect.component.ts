import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import {
  ActivityStatus,
  EngagementPlanItem,
} from '../../core/engagement.models';
import { EngagementService } from '../../core/engagement.service';

const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
  { value: 'skipped', label: 'Skipped' },
];

@Component({
  selector: 'app-collect',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
  ],
  templateUrl: './collect.component.html',
  styleUrl: './collect.component.scss',
})
export class Collect {
  protected readonly engagement = inject(EngagementService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly drawerOpen = signal(false);
  protected readonly selectedActivityId = signal<string | null>(null);
  protected readonly draftFileNames = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    status: ['not_started' as ActivityStatus, Validators.required],
    comments: [''],
    decisions: [''],
  });

  protected readonly selectedActivity = computed(() => {
    const id = this.selectedActivityId();
    if (!id) {
      return null;
    }
    return this.engagement.plans().find((item) => item.id === id) ?? null;
  });

  protected readonly progress = computed(() => this.engagement.collectProgress());
  protected readonly ready = computed(() => this.engagement.collectReady());
  protected readonly submitted = computed(() => this.engagement.collect()?.submitted === true);

  protected statusLabel(status: ActivityStatus | undefined): string {
    return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Not started';
  }

  protected statusFor(activityId: string): ActivityStatus {
    return this.engagement.activityProgress(activityId)?.status ?? 'not_started';
  }

  protected canQuickSkip(activityId: string): boolean {
    if (this.submitted()) {
      return false;
    }
    const status = this.statusFor(activityId);
    return status === 'not_started' || status === 'in_progress';
  }

  protected skipActivity(activity: EngagementPlanItem, event: Event): void {
    event.stopPropagation();
    if (!this.canQuickSkip(activity.id)) {
      return;
    }
    this.engagement.updateActivityProgress(activity.id, { status: 'skipped' });
  }

  protected selectActivity(activity: EngagementPlanItem): void {
    const progress = this.engagement.activityProgress(activity.id);
    this.selectedActivityId.set(activity.id);
    this.form.reset({
      status: progress?.status ?? 'not_started',
      comments: progress?.comments ?? '',
      decisions: progress?.decisions ?? '',
    });
    this.draftFileNames.set(progress?.fileNames ?? []);
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedActivityId.set(null);
  }

  protected onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.draftFileNames.set(Array.from(input.files ?? []).map((file) => file.name));
  }

  protected clearFiles(): void {
    this.draftFileNames.set([]);
  }

  protected saveActivity(): void {
    const activity = this.selectedActivity();
    if (!activity || this.submitted()) {
      return;
    }

    const value = this.form.getRawValue();
    this.engagement.updateActivityProgress(activity.id, {
      status: value.status,
      comments: value.comments.trim(),
      decisions: value.decisions.trim(),
      fileNames: this.draftFileNames(),
    });
    this.closeDrawer();
  }

  protected continueToRun(): void {
    if (this.submitted()) {
      void this.router.navigateByUrl('/run');
      return;
    }
    if (!this.engagement.submitCollect()) {
      return;
    }
    void this.router.navigateByUrl('/run');
  }
}
