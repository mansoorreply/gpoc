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

export interface PlanItem {
  title: string;
  purpose: string;
  attendees: string;
  duration: string;
}

export type PlanSource = 'ai' | 'manual';

export interface EngagementPlanItem extends PlanItem {
  id: string;
  source: PlanSource;
}

export interface ProductSuggestion {
  name: string;
  googleProducts: string[];
  fit: string;
  rationale: string;
}

export interface Scenario {
  id: string;
  label: string;
  keywords: string[];
  problemStatement?: string;
  followUpQuestion: string;
  followUpChips: string[];
  plan: PlanItem[];
  products: ProductSuggestion[];
  dealValue: number;
  commissionPercent: number;
}

export interface CollectDetails {
  industry: string;
  region: string;
  timeline: string;
  budgetBand: string;
  primaryContact: string;
  fileNames: string[];
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
  collect: CollectDetails | null;
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
