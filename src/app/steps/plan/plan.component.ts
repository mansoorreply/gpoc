import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import {
  EngagementPlanItem,
  Persona,
  PersonaSide,
} from '../../core/engagement.models';
import { EngagementService } from '../../core/engagement.service';

type PanelSelection =
  | { kind: 'activity'; activity: EngagementPlanItem }
  | { kind: 'persona'; persona: Persona };

@Component({
  selector: 'app-plan',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
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
  protected readonly drawerOpen = signal(false);
  protected readonly selection = signal<PanelSelection | null>(null);
  protected readonly highlightedPersonaId = signal<string | null>(null);

  protected readonly matcher: ErrorStateMatcher = {
    isErrorState: (control) => !!control && control.invalid && this.attempted(),
  };

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    purpose: ['', Validators.required],
    duration: ['', Validators.required],
    detail: [''],
  });

  protected readonly clientPersonas = computed(() =>
    this.engagement.personas().filter((persona) => persona.side === 'client'),
  );

  protected readonly partnerPersonas = computed(() =>
    this.engagement.personas().filter((persona) => persona.side === 'partner'),
  );

  protected readonly selectedActivity = computed(() => {
    const current = this.selection();
    return current?.kind === 'activity' ? current.activity : null;
  });

  protected readonly selectedPersona = computed(() => {
    const current = this.selection();
    return current?.kind === 'persona' ? current.persona : null;
  });

  protected readonly activityPersonas = computed(() => {
    const activity = this.selectedActivity();
    if (!activity) {
      return [] as Persona[];
    }
    const byId = new Map(this.engagement.personas().map((persona) => [persona.id, persona]));
    return activity.personaIds
      .map((id) => byId.get(id))
      .filter((persona): persona is Persona => !!persona);
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
      duration: '',
      detail: '',
    });
  }

  protected addPlan(): void {
    if (this.form.invalid) {
      this.attempted.set(true);
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.engagement.addPlan({
      title: value.title,
      purpose: value.purpose,
      duration: value.duration,
      detail: value.detail || undefined,
    });
    this.cancelAdd();
  }

  protected removePlan(id: string): void {
    if (this.selectedActivity()?.id === id) {
      this.closeDrawer();
    }
    this.engagement.removePlan(id);
  }

  protected selectActivity(activity: EngagementPlanItem): void {
    this.highlightedPersonaId.set(null);
    this.selection.set({ kind: 'activity', activity });
    this.drawerOpen.set(true);
  }

  protected selectPersona(persona: Persona): void {
    this.highlightedPersonaId.set(persona.id);
    this.selection.set({ kind: 'persona', persona });
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selection.set(null);
    this.highlightedPersonaId.set(null);
  }

  protected isActivityHighlighted(activity: EngagementPlanItem): boolean {
    const personaId = this.highlightedPersonaId();
    if (!personaId) {
      return false;
    }
    return activity.personaIds.includes(personaId);
  }

  protected isActivitySelected(activity: EngagementPlanItem): boolean {
    return this.selectedActivity()?.id === activity.id;
  }

  protected isPersonaSelected(persona: Persona): boolean {
    return this.selectedPersona()?.id === persona.id;
  }

  protected sideLabel(side: PersonaSide): string {
    return side === 'client' ? 'Client' : 'Partner';
  }

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected accept(): void {
    this.engagement.acceptPlan();
    void this.router.navigateByUrl('/collect');
  }
}
