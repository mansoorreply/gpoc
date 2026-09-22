import { Injectable, computed, signal } from '@angular/core';
import {
  CollectDetails,
  EngagementPlanItem,
  EngagementState,
  HistoryEntry,
  PlanItem,
  Scenario,
  StepId,
} from './engagement.models';
import { SCENARIOS, matchScenario } from './scenarios';

const NAME_SUGGESTIONS = [
  'Northwind Retail',
  'Helios Health',
  'Apex Logistics',
  'Summit Mutual Insurance',
];
const SIZE_SUGGESTIONS = ['50–200', '200–1,000', '1,000+'];

function createInitialState(): EngagementState {
  return {
    customerName: '',
    companySize: '',
    scenarioId: null,
    followUpAnswer: '',
    messages: [
      {
        role: 'assistant',
        text: 'What is the customer name?',
      },
    ],
    phase: 'name',
    intakeComplete: false,
    planAccepted: false,
    customPlans: [],
    collect: null,
    selectedProducts: [],
    cycleComplete: false,
  };
}

@Injectable({ providedIn: 'root' })
export class EngagementService {
  private readonly state = signal<EngagementState>(createInitialState());

  readonly customerName = computed(() => this.state().customerName);
  readonly companySize = computed(() => this.state().companySize);
  readonly followUpAnswer = computed(() => this.state().followUpAnswer);
  readonly messages = computed(() => this.state().messages);
  readonly phase = computed(() => this.state().phase);
  readonly intakeComplete = computed(() => this.state().intakeComplete);
  readonly planAccepted = computed(() => this.state().planAccepted);
  readonly collect = computed(() => this.state().collect);
  readonly selectedProducts = computed(() => this.state().selectedProducts);
  readonly cycleComplete = computed(() => this.state().cycleComplete);

  readonly scenario = computed<Scenario | null>(() => {
    const id = this.state().scenarioId;
    return SCENARIOS.find((item) => item.id === id) ?? null;
  });

  readonly selectedProductDetails = computed(() => {
    const selected = new Set(this.state().selectedProducts);
    return (this.scenario()?.products ?? []).filter((product) => selected.has(product.name));
  });

  readonly plans = computed<EngagementPlanItem[]>(() => {
    const scenario = this.scenario();
    const aiPlans = (scenario?.plan ?? []).map((item, index) => ({
      ...item,
      id: `ai-${scenario?.id ?? 'none'}-${index}`,
      source: 'ai' as const,
    }));
    return [...aiPlans, ...this.state().customPlans];
  });

  readonly history = computed<HistoryEntry[]>(() => this.buildHistory(this.state(), this.scenario()));

  readonly commissionAmount = computed(() => {
    const scenario = this.scenario();
    if (!scenario) {
      return 0;
    }
    return Math.round((scenario.dealValue * scenario.commissionPercent) / 100);
  });

  readonly suggestions = computed(() => {
    switch (this.state().phase) {
      case 'name':
        return NAME_SUGGESTIONS;
      case 'size':
        return SIZE_SUGGESTIONS;
      case 'pain':
        return SCENARIOS.map((scenario) => scenario.label);
      case 'followup':
        return this.scenario()?.followUpChips ?? [];
      default:
        return [];
    }
  });

  reply(text: string): void {
    const trimmed = text.trim();
    const current = this.state();
    if (!trimmed || current.phase === 'done') {
      return;
    }

    const messages = [...current.messages, { role: 'partner' as const, text: trimmed }];

    switch (current.phase) {
      case 'name':
        this.state.set({
          ...current,
          customerName: trimmed,
          phase: 'size',
          messages: [
            ...messages,
            { role: 'assistant', text: 'What is the company size?' },
          ],
        });
        break;
      case 'size':
        this.state.set({
          ...current,
          companySize: trimmed,
          phase: 'pain',
          messages: [
            ...messages,
            { role: 'assistant', text: 'What is the main pain point?' },
          ],
        });
        break;
      case 'pain': {
        const scenario = matchScenario(trimmed);
        this.state.set({
          ...current,
          scenarioId: scenario.id,
          phase: 'followup',
          customPlans: [],
          planAccepted: false,
          messages: [...messages, { role: 'assistant', text: scenario.followUpQuestion }],
        });
        break;
      }
      case 'followup':
        this.state.set({
          ...current,
          followUpAnswer: trimmed,
          phase: 'done',
          intakeComplete: true,
          messages: [
            ...messages,
            {
              role: 'assistant',
              text: 'I have what I need. Continue to the assessment plan.',
            },
          ],
        });
        break;
    }
  }

  acceptPlan(): void {
    if (!this.state().intakeComplete) {
      return;
    }
    this.state.update((current) => ({ ...current, planAccepted: true }));
  }

  addPlan(item: PlanItem): void {
    if (!this.state().intakeComplete) {
      return;
    }

    const title = item.title.trim();
    const purpose = item.purpose.trim();
    const attendees = item.attendees.trim();
    const duration = item.duration.trim();
    if (!title || !purpose || !attendees || !duration) {
      return;
    }

    const plan: EngagementPlanItem = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      purpose,
      attendees,
      duration,
      source: 'manual',
    };

    this.state.update((current) => ({
      ...current,
      customPlans: [...current.customPlans, plan],
      planAccepted: false,
    }));
  }

  removePlan(id: string): void {
    this.state.update((current) => ({
      ...current,
      customPlans: current.customPlans.filter((item) => item.id !== id),
      planAccepted: false,
    }));
  }

  submitCollect(details: CollectDetails): void {
    if (!this.state().planAccepted) {
      return;
    }
    this.state.update((current) => ({ ...current, collect: details }));
  }

  toggleProduct(name: string): void {
    if (!this.state().collect) {
      return;
    }

    this.state.update((current) => {
      const exists = current.selectedProducts.includes(name);
      const selectedProducts = exists
        ? current.selectedProducts.filter((item) => item !== name)
        : [...current.selectedProducts, name];
      return { ...current, selectedProducts, cycleComplete: false };
    });
  }

  completeCycle(): void {
    if (!this.state().collect || this.state().selectedProducts.length === 0) {
      return;
    }
    this.state.update((current) => ({ ...current, cycleComplete: true }));
  }

  isUnlocked(step: StepId): boolean {
    const current = this.state();
    switch (step) {
      case 'intake':
        return true;
      case 'plan':
        return current.intakeComplete;
      case 'collect':
        return current.planAccepted;
      case 'run':
        return current.collect !== null;
    }
  }

  isComplete(step: StepId): boolean {
    const current = this.state();
    switch (step) {
      case 'intake':
        return current.intakeComplete;
      case 'plan':
        return current.planAccepted;
      case 'collect':
        return current.collect !== null;
      case 'run':
        return current.cycleComplete;
    }
  }

  furthestPath(): string {
    const current = this.state();
    if (!current.intakeComplete) {
      return '/intake';
    }
    if (!current.planAccepted) {
      return '/plan';
    }
    if (!current.collect) {
      return '/collect';
    }
    return '/run';
  }

  reset(): void {
    this.state.set(createInitialState());
  }

  private buildHistory(current: EngagementState, scenario: Scenario | null): HistoryEntry[] {
    const entries: HistoryEntry[] = [];

    const intakeDone = current.intakeComplete;
    const intakeDetail = intakeDone
      ? `${current.customerName} · ${current.companySize} · ${scenario?.label ?? 'Pain point captured'}`
      : this.intakeProgress(current);
    entries.push({
      id: 'intake',
      step: 'intake',
      title: 'Intake',
      detail: intakeDetail,
      status: intakeDone ? 'done' : 'current',
    });

    if (intakeDone && current.followUpAnswer) {
      entries.push({
        id: 'intake-followup',
        step: 'intake',
        title: 'Follow-up captured',
        detail: current.followUpAnswer,
        status: 'done',
      });
    }

    const planStarted = intakeDone;
    const planCount = this.plans().length;
    const manualCount = current.customPlans.length;
    entries.push({
      id: 'plan',
      step: 'plan',
      title: 'Assessment plan',
      detail: current.planAccepted
        ? `${planCount} activities accepted${manualCount ? `, including ${manualCount} added manually` : ''}`
        : planStarted
          ? `${planCount} suggested activities ready for review`
          : 'Waiting on intake',
      status: current.planAccepted ? 'done' : planStarted ? 'current' : 'pending',
    });

    const collect = current.collect;
    entries.push({
      id: 'collect',
      step: 'collect',
      title: 'Customer details',
      detail: collect
        ? `${collect.industry} · ${collect.region} · ${collect.timeline}`
        : current.planAccepted
          ? 'Collect industry, timeline, and documents'
          : 'Waiting on an accepted plan',
      status: collect ? 'done' : current.planAccepted ? 'current' : 'pending',
    });

    if (collect) {
      const files =
        collect.fileNames.length === 0
          ? 'No documents attached'
          : `${collect.fileNames.length} document${collect.fileNames.length === 1 ? '' : 's'} attached`;
      entries.push({
        id: 'collect-contact',
        step: 'collect',
        title: 'Primary contact',
        detail: `${collect.primaryContact} · ${collect.budgetBand} · ${files}`,
        status: 'done',
      });
    }

    const selected = current.selectedProducts;
    entries.push({
      id: 'run',
      step: 'run',
      title: 'Google solutions',
      detail: selected.length
        ? selected.join(', ')
        : collect
          ? 'Choose an AI suggested solution combination'
          : 'Waiting on collected details',
      status: current.cycleComplete ? 'done' : collect ? 'current' : 'pending',
    });

    if (current.cycleComplete) {
      entries.push({
        id: 'complete',
        step: 'run',
        title: 'Cycle complete',
        detail: 'Partner incentive recorded for this engagement',
        status: 'done',
      });
    }

    return entries;
  }

  private intakeProgress(current: EngagementState): string {
    switch (current.phase) {
      case 'name':
        return 'Waiting for the customer name';
      case 'size':
        return `${current.customerName} · waiting for company size`;
      case 'pain':
        return `${current.customerName} · waiting for the pain point`;
      case 'followup':
        return `${current.customerName} · waiting for the follow-up`;
      default:
        return 'Intake in progress';
    }
  }
}
