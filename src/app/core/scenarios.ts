import { Scenario } from './engagement.models';

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'cloud-cost',
    label: 'Cloud cost overrun',
    keywords: ['cost', 'spend', 'bill', 'overrun', 'finops'],
    followUpQuestion: 'Where is the overrun showing up most?',
    followUpChips: ['Compute', 'Data warehouse', 'Unused commitments'],
    plan: [
      {
        title: '1:1 discovery meeting',
        purpose: 'Confirm the spend spike and who owns the decision.',
        attendees: 'Partner lead and customer finance lead',
        duration: '45 min',
      },
      {
        title: 'Stakeholder workshop',
        purpose: 'Review the top cost centers and name an owner for each.',
        attendees: 'Finance, engineering, and partner architect',
        duration: '90 min',
      },
      {
        title: 'Technical deep-dive',
        purpose: 'Inspect the billing export and commitment coverage.',
        attendees: 'Partner architect and cloud operations',
        duration: '2 hours',
      },
    ],
    products: [
      {
        name: 'FinOps analytics foundation',
        googleProducts: ['BigQuery', 'Cloud Billing'],
        fit: 'Land billing exports and query spend by team and commitment.',
        rationale: 'Pairs warehouse-scale analysis with native billing signals.',
      },
      {
        name: 'Executive cost visibility',
        googleProducts: ['BigQuery', 'Looker'],
        fit: 'Give finance a shared dashboard of cost by team.',
        rationale: 'Turns FinOps queries into dashboards leadership already trusts.',
      },
      {
        name: 'Budget and commitment control',
        googleProducts: ['Cloud Billing', 'Looker'],
        fit: 'Surface budgets, alerts, and commitment coverage.',
        rationale: 'Closes the loop with budgets and commitment visibility.',
      },
    ],
    dealValue: 180000,
    commissionPercent: 8,
  },
  {
    id: 'data-silos',
    label: 'Data silos',
    keywords: ['silo', 'analytics', 'warehouse', 'report'],
    followUpQuestion: 'Which teams cannot share a single source of truth?',
    followUpChips: ['Finance and sales', 'Product and ops', 'All regional teams'],
    plan: [
      {
        title: '1:1 discovery meeting',
        purpose: 'Agree which decisions are blocked by fragmented data.',
        attendees: 'Partner lead and customer data owner',
        duration: '45 min',
      },
      {
        title: 'Stakeholder workshop',
        purpose: 'Map source systems and the teams that consume them.',
        attendees: 'Analytics, operations, and partner architect',
        duration: '90 min',
      },
      {
        title: 'Technical deep-dive',
        purpose: 'Trace pipelines and the gaps between warehouses.',
        attendees: 'Partner architect and data engineering',
        duration: '2 hours',
      },
    ],
    products: [
      {
        name: 'Shared analytics warehouse',
        googleProducts: ['BigQuery', 'Dataflow'],
        fit: 'Ingest siloed sources into one governed warehouse.',
        rationale: 'Creates a continuous path from fragmented systems into shared data.',
      },
      {
        name: 'Trusted metrics layer',
        googleProducts: ['BigQuery', 'Looker'],
        fit: 'Publish one set of metrics the teams can trust.',
        rationale: 'Stops teams arguing over reports by sharing one metric layer.',
      },
      {
        name: 'Operational data movement',
        googleProducts: ['Dataflow', 'Looker'],
        fit: 'Refresh shared views as source systems change.',
        rationale: 'Keeps downstream reporting current without manual extracts.',
      },
    ],
    dealValue: 240000,
    commissionPercent: 7,
  },
  {
    id: 'security',
    label: 'Security and compliance',
    keywords: ['security', 'compliance', 'audit', 'threat', 'iam'],
    followUpQuestion: 'Which control gap is most urgent?',
    followUpChips: ['Audit evidence', 'Threat detection', 'Access reviews'],
    plan: [
      {
        title: '1:1 discovery meeting',
        purpose: 'Identify the control gap and the audit deadline.',
        attendees: 'Partner lead and customer security lead',
        duration: '45 min',
      },
      {
        title: 'Stakeholder workshop',
        purpose: 'Align owners for evidence, detection, and access.',
        attendees: 'Security, compliance, and partner architect',
        duration: '90 min',
      },
      {
        title: 'Technical deep-dive',
        purpose: 'Review findings, logging, and identity paths.',
        attendees: 'Partner architect and security engineering',
        duration: '2 hours',
      },
    ],
    products: [
      {
        name: 'Posture and threat ops',
        googleProducts: ['Security Command Center', 'Chronicle'],
        fit: 'Collect findings and investigate threats from existing logs.',
        rationale: 'Links posture visibility with investigation workflows.',
      },
      {
        name: 'Access governance',
        googleProducts: ['IAM', 'Security Command Center'],
        fit: 'Tighten production access and prove it in review.',
        rationale: 'Tightens who can reach production and supports audit evidence.',
      },
      {
        name: 'Detection and identity hardening',
        googleProducts: ['Chronicle', 'IAM'],
        fit: 'Investigate threats while reducing excess privilege.',
        rationale: 'Combines threat response with stronger identity controls.',
      },
    ],
    dealValue: 210000,
    commissionPercent: 9,
  },
  {
    id: 'modernization',
    label: 'Legacy app modernization',
    keywords: ['legacy', 'monolith', 'modern', 'container', 'migrate'],
    followUpQuestion: 'What is blocking the first migration?',
    followUpChips: ['Monolith coupling', 'Missing APIs', 'Runtime risk'],
    plan: [
      {
        title: '1:1 discovery meeting',
        purpose: 'Pick the first workload and the business outcome.',
        attendees: 'Partner lead and customer application owner',
        duration: '45 min',
      },
      {
        title: 'Stakeholder workshop',
        purpose: 'Sequence migration risks with the teams involved.',
        attendees: 'Product, platform, and partner architect',
        duration: '90 min',
      },
      {
        title: 'Technical deep-dive',
        purpose: 'Assess runtime, APIs, and cutover constraints.',
        attendees: 'Partner architect and application engineering',
        duration: '2 hours',
      },
    ],
    products: [
      {
        name: 'Containerized first workload',
        googleProducts: ['GKE', 'Apigee'],
        fit: 'Run the first migrated service behind a stable API edge.',
        rationale: 'Fits orchestrated workloads while insulating consumers from cutover risk.',
      },
      {
        name: 'Serverless service path',
        googleProducts: ['Cloud Run', 'Apigee'],
        fit: 'Host stateless services without managing servers.',
        rationale: 'Fast path for stateless services with a governed API front door.',
      },
      {
        name: 'Hybrid runtime bridge',
        googleProducts: ['GKE', 'Cloud Run'],
        fit: 'Place stateful and stateless pieces on the right runtime.',
        rationale: 'Lets teams migrate in slices without one-size-fits-all hosting.',
      },
    ],
    dealValue: 320000,
    commissionPercent: 6,
  },
  {
    id: 'insurance-docs',
    label: 'Insurance policy document intake',
    keywords: [
      'insurance',
      'policy',
      'document',
      'extraction',
      'submission',
      'ocr',
      'underwriting',
      'manual review',
    ],
    problemStatement:
      'An insurance company receives a high volume of policy documents during policy submission. Instead of manual reviews, route all incoming documents through a cloud-based document extraction engine and check the documents against customer data and policy details.',
    followUpQuestion: 'Where do manual document reviews create the most delay?',
    followUpChips: [
      'New business submissions',
      'Endorsement packets',
      'Missing or mismatched customer data',
    ],
    plan: [
      {
        title: '1:1 discovery meeting',
        purpose: 'Confirm submission channels, document types, and review SLAs.',
        attendees: 'Partner lead and insurance operations lead',
        duration: '45 min',
      },
      {
        title: 'Stakeholder workshop',
        purpose: 'Map intake, extraction, validation, and exception-handling owners.',
        attendees: 'Underwriting, operations, IT, and partner architect',
        duration: '90 min',
      },
      {
        title: 'Technical deep-dive',
        purpose: 'Inspect sample policy packets and systems of record for customer and policy data.',
        attendees: 'Partner architect, document ops, and policy platform team',
        duration: '2 hours',
      },
    ],
    products: [
      {
        name: 'Intelligent document intake',
        googleProducts: ['Document AI', 'Cloud Storage', 'Cloud Functions'],
        fit: 'Ingest policy packets, extract fields, and trigger downstream checks automatically.',
        rationale:
          'Replaces manual packet review with cloud OCR/extraction and event-driven routing as documents land.',
      },
      {
        name: 'Policy data validation hub',
        googleProducts: ['Document AI', 'BigQuery', 'Vertex AI'],
        fit: 'Compare extracted fields to customer and policy records and flag mismatches.',
        rationale:
          'Puts extracted document data next to policy/customer facts so exceptions can be scored before underwriters touch them.',
      },
      {
        name: 'Submission orchestration API',
        googleProducts: ['Apigee', 'Pub/Sub', 'Cloud Run', 'Document AI'],
        fit: 'Expose a governed intake API and fan out extraction jobs to existing policy systems.',
        rationale:
          'Lets brokers and portals submit packets once while Google services orchestrate extraction and callbacks to core systems.',
      },
      {
        name: 'Secure evidence workspace',
        googleProducts: ['Document AI', 'Cloud Storage', 'Sensitive Data Protection'],
        fit: 'Store submissions securely, redact PII where needed, and retain audit-ready evidence.',
        rationale:
          'Insurance packets carry sensitive data; this combination balances extraction speed with privacy and audit controls.',
      },
    ],
    dealValue: 275000,
    commissionPercent: 8,
  },
];

export function matchScenario(text: string): Scenario {
  const normalized = text.trim().toLowerCase();
  const byLabel = SCENARIOS.find((scenario) => scenario.label.toLowerCase() === normalized);
  if (byLabel) {
    return byLabel;
  }

  const byKeyword = SCENARIOS.find((scenario) =>
    scenario.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return byKeyword ?? SCENARIOS[0];
}
