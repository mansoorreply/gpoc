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

const INTRO_MESSAGE =
  "I'm running your first Use-Case Draft — tell me about the account in your own words. I'll ask a few follow-ups, then build the board.";

const QUESTIONS = {
  customer: "Who's the customer we're running this hackathon for?",
  size: 'What is the company size?',
  industry:
    "What industry are they in, and what does their stack look like? (Apps, cloud, data — whatever you'd tell a PDM.)",
  pain: "What pain actually booked this meeting? Say it like you'd say it in the room.",
  outcome: 'What outcome is the CXO trying to buy? Numbers welcome.',
  headcount: 'How many people in the session — including at least one CXO? (4–8)',
} as const;

const CUSTOMER_SUGGESTIONS = [
  'Northwind Retail',
  'Helios Health',
  'Apex Logistics',
  'Summit Mutual Insurance',
];
const SIZE_SUGGESTIONS = ['50–200', '200–1,000', '1,000+'];
const INDUSTRY_SUGGESTIONS = [
  'Retail · GCP + POS apps',
  'Healthcare · EHR + BigQuery',
  'Logistics · SAP + GKE',
  'Insurance · Guidewire + Document AI',
];
const OUTCOME_SUGGESTIONS = [
  'Cut cloud spend 20%',
  'Unify data for one CX view',
  'Pass audit in 90 days',
  'Ship modernization MVP in 6 weeks',
];
const HEADCOUNT_SUGGESTIONS = ['4', '5', '6', '8'];

function createInitialState(): EngagementState {
  return {
    customerName: '',
    companySize: '',
    industryStack: '',
    scenarioId: null,
    cxoOutcome: '',
    sessionHeadcount: '',
    messages: [
      { role: 'assistant', text: INTRO_MESSAGE },
      { role: 'assistant', text: QUESTIONS.customer },
    ],
    phase: 'customer',
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
  readonly industryStack = computed(() => this.state().industryStack);
  readonly cxoOutcome = computed(() => this.state().cxoOutcome);
  readonly sessionHeadcount = computed(() => this.state().sessionHeadcount);
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
      case 'customer':
        return CUSTOMER_SUGGESTIONS;
      case 'size':
        return SIZE_SUGGESTIONS;
      case 'industry':
        return INDUSTRY_SUGGESTIONS;
      case 'pain':
        return SCENARIOS.map((scenario) => scenario.label);
      case 'outcome':
        return OUTCOME_SUGGESTIONS;
      case 'headcount':
        return HEADCOUNT_SUGGESTIONS;
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
      case 'customer':
        this.state.set({
          ...current,
          customerName: trimmed,
          phase: 'size',
          messages: [...messages, { role: 'assistant', text: QUESTIONS.size }],
        });
        break;
      case 'size':
        this.state.set({
          ...current,
          companySize: trimmed,
          phase: 'industry',
          messages: [...messages, { role: 'assistant', text: QUESTIONS.industry }],
        });
        break;
      case 'industry':
        this.state.set({
          ...current,
          industryStack: trimmed,
          phase: 'pain',
          messages: [...messages, { role: 'assistant', text: QUESTIONS.pain }],
        });
        break;
      case 'pain': {
        const scenario = matchScenario(trimmed);
        this.state.set({
          ...current,
          scenarioId: scenario.id,
          phase: 'outcome',
          customPlans: [],
          planAccepted: false,
          messages: [...messages, { role: 'assistant', text: QUESTIONS.outcome }],
        });
        break;
      }
      case 'outcome':
        this.state.set({
          ...current,
          cxoOutcome: trimmed,
          phase: 'headcount',
          messages: [...messages, { role: 'assistant', text: QUESTIONS.headcount }],
        });
        break;
      case 'headcount':
        this.state.set({
          ...current,
          sessionHeadcount: trimmed,
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

    if (intakeDone && current.cxoOutcome) {
      entries.push({
        id: 'intake-outcome',
        step: 'intake',
        title: 'CXO outcome',
        detail: current.cxoOutcome,
        status: 'done',
      });
    }

    if (intakeDone && current.sessionHeadcount) {
      entries.push({
        id: 'intake-headcount',
        step: 'intake',
        title: 'Session size',
        detail: `${current.sessionHeadcount} people`,
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
      case 'customer':
        return 'Waiting for the customer name';
      case 'size':
        return `${current.customerName} · waiting for company size`;
      case 'industry':
        return `${current.customerName} · waiting for industry and stack`;
      case 'pain':
        return `${current.customerName} · waiting for the pain point`;
      case 'outcome':
        return `${current.customerName} · waiting for the CXO outcome`;
      case 'headcount':
        return `${current.customerName} · waiting for session headcount`;
      default:
        return 'Intake in progress';
    }
  }
}
