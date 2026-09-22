import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ActivityProgress,
  ActivityStatus,
  CollectState,
  EngagementPlanItem,
  EngagementState,
  HistoryEntry,
  IntakePhase,
  Persona,
  PlanActivity,
  Scenario,
  StepId,
} from './engagement.models';
import { SCENARIOS, matchScenario } from './scenarios';
import { TelemetryService } from './telemetry.service';

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

const TERMINAL_STATUSES: ReadonlySet<ActivityStatus> = new Set(['done', 'skipped']);

/** Turns each intake answer into a readable sentence, value included. */
const INTAKE_SENTENCE: Record<IntakePhase, (value: string) => string> = {
  customer: (v) => `Customer captured as ${v}`,
  size: (v) => `Company size captured as ${v}`,
  industry: (v) => `Industry & stack captured as ${v}`,
  pain: (v) => `Pain point captured as ${v}`,
  outcome: (v) => `CXO outcome captured as ${v}`,
  headcount: (v) => `Session headcount captured as ${v}`,
  done: () => 'Intake completed',
};

/** How each activity status reads once applied to an activity. */
const STATUS_SENTENCE: Record<ActivityStatus, (title: string) => string> = {
  not_started: (t) => `“${t}” reset to not started`,
  in_progress: (t) => `“${t}” marked as in progress`,
  done: (t) => `“${t}” marked as completed`,
  skipped: (t) => `“${t}” marked as skipped`,
};

function createEmptyProgress(activityId: string): ActivityProgress {
  return {
    activityId,
    status: 'not_started',
    comments: '',
    decisions: '',
    fileNames: [],
  };
}

function buildCollectState(plans: EngagementPlanItem[]): CollectState {
  const activities: Record<string, ActivityProgress> = {};
  for (const plan of plans) {
    activities[plan.id] = createEmptyProgress(plan.id);
  }
  return { activities, submitted: false };
}

function countTerminal(collect: CollectState | null): { done: number; total: number } {
  if (!collect) {
    return { done: 0, total: 0 };
  }
  const items = Object.values(collect.activities);
  const total = items.length;
  const done = items.filter((item) => TERMINAL_STATUSES.has(item.status)).length;
  return { done, total };
}

function isCollectReady(collect: CollectState | null): boolean {
  if (!collect) {
    return false;
  }
  const items = Object.values(collect.activities);
  return items.length > 0 && items.every((item) => TERMINAL_STATUSES.has(item.status));
}

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
  private readonly telemetry = inject(TelemetryService);
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

  readonly personas = computed<Persona[]>(() => this.scenario()?.personas ?? []);

  readonly collectProgress = computed(() => countTerminal(this.state().collect));

  readonly collectReady = computed(() => isCollectReady(this.state().collect));

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

  activityProgress(activityId: string): ActivityProgress | null {
    return this.state().collect?.activities[activityId] ?? null;
  }

  reply(text: string): void {
    const trimmed = text.trim();
    const current = this.state();
    if (!trimmed || current.phase === 'done') {
      return;
    }

    const messages = [...current.messages, { role: 'partner' as const, text: trimmed }];

    this.telemetry.record('intake', INTAKE_SENTENCE[current.phase](trimmed));

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
          collect: null,
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
    const plans = this.plans();
    this.state.update((current) => ({
      ...current,
      planAccepted: true,
      collect: buildCollectState(plans),
      selectedProducts: [],
      cycleComplete: false,
    }));
    this.telemetry.record(
      'plan',
      `Plan created with ${plans.length} ${plans.length === 1 ? 'activity' : 'activities'}`,
    );
  }

  addPlan(item: Pick<PlanActivity, 'title' | 'purpose' | 'duration'> & { detail?: string }): void {
    if (!this.state().intakeComplete) {
      return;
    }

    const title = item.title.trim();
    const purpose = item.purpose.trim();
    const duration = item.duration.trim();
    const detail = (item.detail ?? purpose).trim();
    if (!title || !purpose || !duration) {
      return;
    }

    const plan: EngagementPlanItem = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      purpose,
      duration,
      detail,
      outcomes: [],
      personaIds: [],
      source: 'manual',
    };

    this.state.update((current) => ({
      ...current,
      customPlans: [...current.customPlans, plan],
      planAccepted: false,
      collect: null,
    }));
    this.telemetry.record('plan', `Activity “${title}” added to the plan`);
  }

  removePlan(id: string): void {
    const removed = this.state().customPlans.find((item) => item.id === id);
    this.state.update((current) => ({
      ...current,
      customPlans: current.customPlans.filter((item) => item.id !== id),
      planAccepted: false,
      collect: null,
    }));
    if (removed) {
      this.telemetry.record('plan', `Activity “${removed.title}” removed from the plan`);
    }
  }

  updateActivityProgress(
    activityId: string,
    patch: Partial<Pick<ActivityProgress, 'status' | 'comments' | 'decisions' | 'fileNames'>>,
  ): void {
    const current = this.state();
    if (!current.planAccepted || !current.collect || current.collect.submitted) {
      return;
    }
    const existing = current.collect.activities[activityId];
    if (!existing) {
      return;
    }

    const next: ActivityProgress = {
      ...existing,
      activityId,
      comments: patch.comments !== undefined ? patch.comments : existing.comments,
      decisions: patch.decisions !== undefined ? patch.decisions : existing.decisions,
      fileNames: patch.fileNames !== undefined ? patch.fileNames : existing.fileNames,
      status: patch.status !== undefined ? patch.status : existing.status,
    };

    this.state.update((state) => ({
      ...state,
      collect: {
        activities: {
          ...state.collect!.activities,
          [activityId]: next,
        },
        submitted: false,
      },
    }));

    const title = this.plans().find((plan) => plan.id === activityId)?.title ?? activityId;

    if (patch.status !== undefined && patch.status !== existing.status) {
      this.telemetry.record('collect', STATUS_SENTENCE[patch.status](title));
    }
    if (patch.comments !== undefined && patch.comments !== existing.comments) {
      this.telemetry.record(
        'collect',
        patch.comments
          ? `Notes ${existing.comments ? 'updated' : 'added'} for “${title}”`
          : `Notes cleared for “${title}”`,
      );
    }
    if (patch.decisions !== undefined && patch.decisions !== existing.decisions) {
      this.telemetry.record(
        'collect',
        patch.decisions
          ? `Decisions ${existing.decisions ? 'updated' : 'recorded'} for “${title}”`
          : `Decisions cleared for “${title}”`,
      );
    }
    if (patch.fileNames !== undefined) {
      const added = patch.fileNames.length - existing.fileNames.length;
      if (added > 0) {
        this.telemetry.record(
          'collect',
          `${added} file${added === 1 ? '' : 's'} attached to “${title}”`,
        );
      } else if (added < 0) {
        this.telemetry.record(
          'collect',
          `${-added} file${added === -1 ? '' : 's'} removed from “${title}”`,
        );
      }
    }
  }

  submitCollect(): boolean {
    const current = this.state();
    if (!current.planAccepted || !isCollectReady(current.collect)) {
      return false;
    }

    this.state.update((state) => ({
      ...state,
      collect: state.collect ? { ...state.collect, submitted: true } : null,
    }));
    const progress = countTerminal(this.state().collect);
    this.telemetry.record(
      'collect',
      `Activities submitted — ${progress.done}/${progress.total} completed`,
    );
    return true;
  }

  toggleProduct(name: string): void {
    if (!this.state().collect?.submitted) {
      return;
    }

    const wasSelected = this.state().selectedProducts.includes(name);
    this.state.update((current) => {
      const exists = current.selectedProducts.includes(name);
      const selectedProducts = exists
        ? current.selectedProducts.filter((item) => item !== name)
        : [...current.selectedProducts, name];
      return { ...current, selectedProducts, cycleComplete: false };
    });
    this.telemetry.record(
      'run',
      wasSelected ? `Solution “${name}” deselected` : `Solution “${name}” selected`,
    );
  }

  completeCycle(): void {
    if (!this.state().collect?.submitted || this.state().selectedProducts.length === 0) {
      return;
    }
    this.state.update((current) => ({ ...current, cycleComplete: true }));
    this.telemetry.record(
      'run',
      `Engagement cycle completed with ${this.state().selectedProducts.join(', ')}`,
    );
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
        return current.collect?.submitted === true;
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
        return current.collect?.submitted === true;
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
    if (!current.collect?.submitted) {
      return '/collect';
    }
    return '/run';
  }

  reset(): void {
    this.state.set(createInitialState());
    this.telemetry.record('system', 'Demo reset');
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
    const progress = countTerminal(collect);
    const collectSubmitted = collect?.submitted === true;
    entries.push({
      id: 'collect',
      step: 'collect',
      title: 'Activity execution',
      detail: collectSubmitted
        ? `${progress.done}/${progress.total} activities complete`
        : current.planAccepted
          ? `${progress.done}/${progress.total} activities complete — finish all to continue`
          : 'Waiting on an accepted plan',
      status: collectSubmitted ? 'done' : current.planAccepted ? 'current' : 'pending',
    });

    const selected = current.selectedProducts;
    entries.push({
      id: 'run',
      step: 'run',
      title: 'Google solutions',
      detail: selected.length
        ? selected.join(', ')
        : collectSubmitted
          ? 'Choose an AI suggested solution combination'
          : 'Waiting on activity execution',
      status: current.cycleComplete ? 'done' : collectSubmitted ? 'current' : 'pending',
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
