export type StepId = 'intake' | 'plan' | 'collect' | 'run';

export type IntakePhase =
  | 'customer'
  | 'size'
  | 'industry'
  | 'pain'
  | 'outcome'
  | 'headcount'
  | 'done';

export type MessageRole = 'assistant' | 'partner';

export interface ChatMessage {
  role: MessageRole;
  text: string;
}

export type PersonaSide = 'client' | 'partner';

export interface Persona {
  id: string;
  name: string;
  role: string;
  side: PersonaSide;
  organization: string;
  focus: string;
}

export interface PlanActivity {
  title: string;
  purpose: string;
  duration: string;
  detail: string;
  outcomes: string[];
  personaIds: string[];
}

export type PlanSource = 'ai' | 'manual';

export interface EngagementPlanItem extends PlanActivity {
  id: string;
  source: PlanSource;
}

export interface ProductAccelerator {
  name: string;
  geminiFit: number;
  description: string;
}

export interface ProductSuggestion {
  name: string;
  googleProducts: string[];
  fit: string;
  rationale: string;
  /** Display title on use-case cards; falls back to `name`. */
  title?: string;
  description?: string;
  overallScore?: number;
  tags?: string[];
  accelerator?: ProductAccelerator;
  value?: number;
  feasibility?: number;
  risk?: number;
}

export interface Scenario {
  id: string;
  label: string;
  keywords: string[];
  problemStatement?: string;
  followUpQuestion: string;
  followUpChips: string[];
  personas: Persona[];
  plan: PlanActivity[];
  products: ProductSuggestion[];
  dealValue: number;
  commissionPercent: number;
}

export type ActivityStatus = 'not_started' | 'in_progress' | 'done' | 'skipped';

export interface ActivityProgress {
  activityId: string;
  status: ActivityStatus;
  comments: string;
  decisions: string;
  fileNames: string[];
}

export interface CollectState {
  activities: Record<string, ActivityProgress>;
  submitted: boolean;
}

export interface EngagementState {
  customerName: string;
  companySize: string;
  industryStack: string;
  scenarioId: string | null;
  cxoOutcome: string;
  sessionHeadcount: string;
  messages: ChatMessage[];
  phase: IntakePhase;
  intakeComplete: boolean;
  planAccepted: boolean;
  customPlans: EngagementPlanItem[];
  collect: CollectState | null;
  selectedProducts: string[];
  cycleComplete: boolean;
}

export type HistoryStatus = 'done' | 'current' | 'pending';

export interface HistoryEntry {
  id: string;
  step: StepId;
  title: string;
  detail: string;
  status: HistoryStatus;
}
