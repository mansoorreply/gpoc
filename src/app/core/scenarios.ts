import { Scenario } from './engagement.models';

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'cloud-cost',
    label: 'Cloud cost overrun',
    keywords: ['cost', 'spend', 'bill', 'overrun', 'finops'],
    followUpQuestion: 'Where is the overrun showing up most?',
    followUpChips: ['Compute', 'Data warehouse', 'Unused commitments'],
    personas: [
      {
        id: 'cc-finance',
        name: 'Priya Nair',
        role: 'VP Finance',
        side: 'client',
        organization: 'Customer',
        focus: 'Budget variance and executive reporting on cloud spend',
      },
      {
        id: 'cc-finops',
        name: 'Marcus Chen',
        role: 'FinOps Lead',
        side: 'client',
        organization: 'Customer',
        focus: 'Cost centers, commitment coverage, and chargeback ownership',
      },
      {
        id: 'cc-cloudops',
        name: 'Elena Soto',
        role: 'Cloud Operations Manager',
        side: 'client',
        organization: 'Customer',
        focus: 'Workload rightsizing and idle resource cleanup',
      },
      {
        id: 'cc-partner-lead',
        name: 'Jordan Hale',
        role: 'Engagement Lead',
        side: 'partner',
        organization: 'Partner',
        focus: 'Stakeholder alignment and assessment outcomes',
      },
      {
        id: 'cc-architect',
        name: 'Samir Patel',
        role: 'Solutions Architect',
        side: 'partner',
        organization: 'Partner',
        focus: 'Billing export design and FinOps architecture',
      },
    ],
    plan: [
      {
        title: 'Spend discovery',
        purpose: 'Confirm the spend spike and who owns the decision.',
        duration: '45 min',
        detail:
          'Walk the latest invoice anomaly with finance and FinOps. Confirm which business units own the spike and what “good” looks like for the next quarter.',
        outcomes: ['Named spend owners', 'Baseline variance story', 'Decision criteria for remediation'],
        personaIds: ['cc-finance', 'cc-finops', 'cc-partner-lead'],
      },
      {
        title: 'Cost-center workshop',
        purpose: 'Review the top cost centers and name an owner for each.',
        duration: '90 min',
        detail:
          'Map the top cost centers from billing exports, assign owners, and agree which teams must show up in the technical deep-dive.',
        outcomes: ['Cost-center owner map', 'Priority list of top drivers', 'Workshop attendance list'],
        personaIds: ['cc-finance', 'cc-finops', 'cc-cloudops', 'cc-architect'],
      },
      {
        title: 'Billing export review',
        purpose: 'Inspect the billing export and commitment coverage.',
        duration: '2 hours',
        detail:
          'Inspect billing export quality, commitment coverage gaps, and idle or oversized resources that explain the overrun.',
        outcomes: ['Export readiness notes', 'Commitment gap summary', 'Quick-win rightsizing candidates'],
        personaIds: ['cc-finops', 'cc-cloudops', 'cc-architect'],
      },
      {
        title: 'FinOps control design',
        purpose: 'Define budgets, alerts, and dashboard requirements.',
        duration: '90 min',
        detail:
          'Translate findings into budget thresholds, alert paths, and Looker/BigQuery dashboard requirements for finance leadership.',
        outcomes: ['Budget and alert draft', 'Dashboard metric list', 'Remediation backlog'],
        personaIds: ['cc-finance', 'cc-finops', 'cc-partner-lead', 'cc-architect'],
      },
      {
        title: 'Executive readout',
        purpose: 'Align leadership on the remediation path and investment ask.',
        duration: '45 min',
        detail:
          'Present the overrun story, recommended Google FinOps path, and the partner-led next steps for implementation.',
        outcomes: ['Executive decision', 'Approved next-phase scope', 'Named sponsor'],
        personaIds: ['cc-finance', 'cc-partner-lead', 'cc-architect'],
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
    personas: [
      {
        id: 'ds-data-owner',
        name: 'Amelia Brooks',
        role: 'Head of Data',
        side: 'client',
        organization: 'Customer',
        focus: 'Single source of truth and governance across domains',
      },
      {
        id: 'ds-analytics',
        name: 'Chris Okonkwo',
        role: 'Analytics Lead',
        side: 'client',
        organization: 'Customer',
        focus: 'Trusted metrics for finance and sales reporting',
      },
      {
        id: 'ds-ops',
        name: 'Nina Alvarez',
        role: 'Operations Director',
        side: 'client',
        organization: 'Customer',
        focus: 'Operational decisions blocked by delayed extracts',
      },
      {
        id: 'ds-partner-lead',
        name: 'Taylor Kim',
        role: 'Engagement Lead',
        side: 'partner',
        organization: 'Partner',
        focus: 'Cross-team alignment on shared analytics outcomes',
      },
      {
        id: 'ds-architect',
        name: 'Devon Ruiz',
        role: 'Data Architect',
        side: 'partner',
        organization: 'Partner',
        focus: 'Warehouse, pipeline, and metrics-layer design',
      },
    ],
    plan: [
      {
        title: 'Decision discovery',
        purpose: 'Agree which decisions are blocked by fragmented data.',
        duration: '45 min',
        detail:
          'Capture the decisions leadership cannot make today because finance, sales, and ops disagree on numbers.',
        outcomes: ['Blocked-decision list', 'Priority domains', 'Success metrics for unification'],
        personaIds: ['ds-data-owner', 'ds-analytics', 'ds-partner-lead'],
      },
      {
        title: 'Source-system workshop',
        purpose: 'Map source systems and the teams that consume them.',
        duration: '90 min',
        detail:
          'Whiteboard source systems, owners, freshness, and which teams consume each extract today.',
        outcomes: ['Source-to-consumer map', 'Freshness gaps', 'Candidate systems for first ingest'],
        personaIds: ['ds-data-owner', 'ds-analytics', 'ds-ops', 'ds-architect'],
      },
      {
        title: 'Pipeline deep-dive',
        purpose: 'Trace pipelines and the gaps between warehouses.',
        duration: '2 hours',
        detail:
          'Trace current pipelines and warehouse gaps; identify where BigQuery and Dataflow can collapse duplicate extracts.',
        outcomes: ['Pipeline inventory', 'Gap analysis', 'First ingest candidate'],
        personaIds: ['ds-data-owner', 'ds-architect'],
      },
      {
        title: 'Trusted metrics design',
        purpose: 'Define the shared metric layer and ownership model.',
        duration: '90 min',
        detail:
          'Agree the first trusted metric set, stewards, and Looker publication path so teams stop arguing over reports.',
        outcomes: ['Metric catalog draft', 'Steward assignments', 'Publication cadence'],
        personaIds: ['ds-analytics', 'ds-ops', 'ds-architect', 'ds-partner-lead'],
      },
      {
        title: 'Unification readout',
        purpose: 'Confirm the shared warehouse path with sponsors.',
        duration: '45 min',
        detail:
          'Present the recommended shared analytics path, investment ask, and phased rollout for siloed domains.',
        outcomes: ['Sponsor approval', 'Phase-1 scope', 'Named data stewards'],
        personaIds: ['ds-data-owner', 'ds-partner-lead', 'ds-architect'],
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
    personas: [
      {
        id: 'sec-ciso',
        name: 'Rachel Okada',
        role: 'CISO',
        side: 'client',
        organization: 'Customer',
        focus: 'Audit deadline and residual risk acceptance',
      },
      {
        id: 'sec-compliance',
        name: 'Hugo Brandt',
        role: 'Compliance Manager',
        side: 'client',
        organization: 'Customer',
        focus: 'Evidence collection and control mapping',
      },
      {
        id: 'sec-eng',
        name: 'Ivy Tran',
        role: 'Security Engineering Lead',
        side: 'client',
        organization: 'Customer',
        focus: 'Detection coverage and identity hardening',
      },
      {
        id: 'sec-partner-lead',
        name: 'Alex Morgan',
        role: 'Engagement Lead',
        side: 'partner',
        organization: 'Partner',
        focus: 'Assessment sequencing against the audit clock',
      },
      {
        id: 'sec-architect',
        name: 'Noah Feldman',
        role: 'Security Architect',
        side: 'partner',
        organization: 'Partner',
        focus: 'SCC, Chronicle, and IAM control design',
      },
    ],
    plan: [
      {
        title: 'Control-gap discovery',
        purpose: 'Identify the control gap and the audit deadline.',
        duration: '45 min',
        detail:
          'Confirm the urgent control gap, audit date, and what evidence auditors already expect to see.',
        outcomes: ['Priority control gap', 'Audit deadline', 'Evidence success criteria'],
        personaIds: ['sec-ciso', 'sec-compliance', 'sec-partner-lead'],
      },
      {
        title: 'Owners workshop',
        purpose: 'Align owners for evidence, detection, and access.',
        duration: '90 min',
        detail:
          'Assign owners for evidence collection, threat detection, and access reviews so remediation work has clear accountability.',
        outcomes: ['RACI for controls', 'Evidence owners', 'Detection and access owners'],
        personaIds: ['sec-ciso', 'sec-compliance', 'sec-eng', 'sec-architect'],
      },
      {
        title: 'Logging and identity review',
        purpose: 'Review findings, logging, and identity paths.',
        duration: '2 hours',
        detail:
          'Review current findings, logging coverage, and identity paths that create excess privilege or blind spots.',
        outcomes: ['Finding summary', 'Logging gaps', 'Identity hardening candidates'],
        personaIds: ['sec-eng', 'sec-architect'],
      },
      {
        title: 'Detection and access design',
        purpose: 'Define the remediation path for detection and IAM.',
        duration: '90 min',
        detail:
          'Design the SCC/Chronicle detection path and IAM review cadence that close the audit gap without freezing delivery.',
        outcomes: ['Detection design notes', 'Access review cadence', 'Remediation backlog'],
        personaIds: ['sec-compliance', 'sec-eng', 'sec-architect', 'sec-partner-lead'],
      },
      {
        title: 'Audit readiness readout',
        purpose: 'Confirm the remediation plan with security leadership.',
        duration: '45 min',
        detail:
          'Present residual risk, recommended Google security stack, and the partner-led path to audit-ready evidence.',
        outcomes: ['Leadership decision', 'Approved remediation scope', 'Audit checkpoint dates'],
        personaIds: ['sec-ciso', 'sec-partner-lead', 'sec-architect'],
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
    personas: [
      {
        id: 'mod-app-owner',
        name: 'Grace Liu',
        role: 'Application Owner',
        side: 'client',
        organization: 'Customer',
        focus: 'Business outcome for the first migrated workload',
      },
      {
        id: 'mod-product',
        name: 'Ben Carter',
        role: 'Product Manager',
        side: 'client',
        organization: 'Customer',
        focus: 'Feature continuity during cutover',
      },
      {
        id: 'mod-platform',
        name: 'Sofia Mendes',
        role: 'Platform Lead',
        side: 'client',
        organization: 'Customer',
        focus: 'Runtime, APIs, and platform readiness',
      },
      {
        id: 'mod-partner-lead',
        name: 'Riley Quinn',
        role: 'Engagement Lead',
        side: 'partner',
        organization: 'Partner',
        focus: 'Migration sequencing and stakeholder buy-in',
      },
      {
        id: 'mod-architect',
        name: 'Omar Hassan',
        role: 'Cloud Architect',
        side: 'partner',
        organization: 'Partner',
        focus: 'GKE, Cloud Run, and Apigee target design',
      },
    ],
    plan: [
      {
        title: 'Workload selection',
        purpose: 'Pick the first workload and the business outcome.',
        duration: '45 min',
        detail:
          'Select the first workload to modernize and define the business outcome that makes the migration worth the risk.',
        outcomes: ['First workload choice', 'Business outcome statement', 'Success metrics'],
        personaIds: ['mod-app-owner', 'mod-product', 'mod-partner-lead'],
      },
      {
        title: 'Risk sequencing workshop',
        purpose: 'Sequence migration risks with the teams involved.',
        duration: '90 min',
        detail:
          'Sequence coupling, API, and runtime risks with product and platform teams so the first cutover has clear owners.',
        outcomes: ['Risk backlog', 'Team ownership map', 'Migration sequence draft'],
        personaIds: ['mod-app-owner', 'mod-product', 'mod-platform', 'mod-architect'],
      },
      {
        title: 'Runtime and API deep-dive',
        purpose: 'Assess runtime, APIs, and cutover constraints.',
        duration: '2 hours',
        detail:
          'Assess current runtime constraints, missing APIs, and cutover windows that shape GKE vs Cloud Run choices.',
        outcomes: ['Runtime assessment', 'API gap list', 'Cutover constraints'],
        personaIds: ['mod-platform', 'mod-architect'],
      },
      {
        title: 'Target architecture design',
        purpose: 'Lock the first-service target pattern and edge strategy.',
        duration: '90 min',
        detail:
          'Design the first-service target on GKE or Cloud Run with Apigee at the edge to protect consumers during cutover.',
        outcomes: ['Target architecture sketch', 'Edge strategy', 'Pilot acceptance criteria'],
        personaIds: ['mod-platform', 'mod-product', 'mod-architect', 'mod-partner-lead'],
      },
      {
        title: 'Migration readout',
        purpose: 'Align sponsors on the first migration slice.',
        duration: '45 min',
        detail:
          'Present the recommended first migration slice, investment ask, and partner-led delivery plan.',
        outcomes: ['Sponsor approval', 'Phase-1 scope', 'Named cutover owners'],
        personaIds: ['mod-app-owner', 'mod-partner-lead', 'mod-architect'],
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
    personas: [
      {
        id: 'ins-ops',
        name: 'Helen Park',
        role: 'Insurance Operations Lead',
        side: 'client',
        organization: 'Summit Mutual Insurance',
        focus: 'Submission SLAs and reducing manual packet review queues',
      },
      {
        id: 'ins-uw',
        name: 'Daniel Ortega',
        role: 'Underwriting Manager',
        side: 'client',
        organization: 'Summit Mutual Insurance',
        focus: 'Exception quality and underwriter time on mismatched packets',
      },
      {
        id: 'ins-platform',
        name: 'Maya Singh',
        role: 'Policy Platform Owner',
        side: 'client',
        organization: 'Summit Mutual Insurance',
        focus: 'Guidewire integration and systems of record for customer/policy data',
      },
      {
        id: 'ins-partner-lead',
        name: 'Chris Delgado',
        role: 'Engagement Lead',
        side: 'partner',
        organization: 'Partner',
        focus: 'Assessment workflow and stakeholder alignment',
      },
      {
        id: 'ins-architect',
        name: 'Aisha Rahman',
        role: 'Solutions Architect',
        side: 'partner',
        organization: 'Partner',
        focus: 'Document AI architecture and validation against policy systems',
      },
      {
        id: 'ins-docai',
        name: 'Leo Nakamura',
        role: 'Document AI Specialist',
        side: 'partner',
        organization: 'Partner',
        focus: 'Extraction models, field accuracy, and exception scoring',
      },
    ],
    plan: [
      {
        title: 'Map submission channels',
        purpose: 'Confirm submission channels, document types, and review SLAs.',
        duration: '45 min',
        detail:
          'Inventory how policy packets arrive (broker portal, email, batch), which document types dominate volume, and where manual review SLAs break today.',
        outcomes: [
          'Channel inventory',
          'Document-type volume snapshot',
          'SLA pain points',
        ],
        personaIds: ['ins-ops', 'ins-uw', 'ins-partner-lead'],
      },
      {
        title: 'Review sample packets',
        purpose: 'Inspect representative policy packets and field expectations.',
        duration: '90 min',
        detail:
          'Walk real new-business and endorsement packets. Capture required fields, common defects, and how underwriters currently reconcile customer and policy data.',
        outcomes: [
          'Sample packet set',
          'Required field list',
          'Defect patterns',
        ],
        personaIds: ['ins-ops', 'ins-uw', 'ins-docai', 'ins-architect'],
      },
      {
        title: 'Extraction and validation workshop',
        purpose: 'Design extraction, customer/policy checks, and owner handoffs.',
        duration: '90 min',
        detail:
          'Map the target flow: ingest → Document AI extraction → compare to customer and policy records → route clean vs exception work. Assign owners for each stage.',
        outcomes: [
          'Target intake flow',
          'Validation rules draft',
          'Stage ownership RACI',
        ],
        personaIds: ['ins-ops', 'ins-uw', 'ins-platform', 'ins-architect', 'ins-docai'],
      },
      {
        title: 'Exception handling design',
        purpose: 'Define how mismatched or incomplete packets are scored and routed.',
        duration: '60 min',
        detail:
          'Design exception queues, confidence thresholds, and underwriter escalation so only true mismatches consume human time.',
        outcomes: [
          'Exception scoring rules',
          'Queue design',
          'Escalation path',
        ],
        personaIds: ['ins-uw', 'ins-ops', 'ins-docai', 'ins-partner-lead'],
      },
      {
        title: 'Architecture deep-dive',
        purpose: 'Inspect systems of record and the Google service path.',
        duration: '2 hours',
        detail:
          'Review Guidewire/customer data access, storage, Document AI processors, orchestration (Pub/Sub, Cloud Run/Functions), and privacy controls for sensitive packets.',
        outcomes: [
          'Integration touchpoints',
          'Reference architecture sketch',
          'Security and retention notes',
        ],
        personaIds: ['ins-platform', 'ins-architect', 'ins-docai'],
      },
      {
        title: 'Stakeholder readout',
        purpose: 'Align sponsors on the automated intake path and next investment.',
        duration: '45 min',
        detail:
          'Present the recommended Document AI intake path, expected SLA impact, and partner-led pilot scope for automated extraction and validation.',
        outcomes: [
          'Sponsor decision',
          'Pilot scope',
          'Named business and IT owners',
        ],
        personaIds: ['ins-ops', 'ins-uw', 'ins-platform', 'ins-partner-lead', 'ins-architect'],
      },
    ],
    products: [
      {
        name: 'Primary agent workflow',
        title:
          'Primary agent workflow for ff (insurance) on M365, Google Cloud, and line-of-business apps — built to resolve the pain that booked this session.',
        googleProducts: ['Gemini Enterprise', 'Google Workspace', 'Document AI'],
        fit: 'Grounded agent workflow across M365, Google Cloud, and LOB apps tied to intake pain.',
        rationale:
          'Resolves the priority pain that booked this session with an agent workflow where underwriters already work.',
        description:
          'Grounded agent workflow across M365, Google Cloud, and LOB apps tied to the intake pain that booked the session.',
        overallScore: 94,
        tags: ['priority pain', 'intake anchor', 'insurance', 'Gemini Enterprise agent + Workspace'],
        accelerator: {
          name: 'Gemini Enterprise agent + Workspace',
          geminiFit: 94,
          description:
            'Grounded answers and actions where people already work — M365, Google Cloud, and line-of-business apps.',
        },
        value: 94,
        feasibility: 76,
        risk: 30,
      },
      {
        name: 'Intelligent document intake',
        title: 'Intelligent document intake for policy packet extraction',
        googleProducts: ['Document AI', 'Cloud Storage', 'Cloud Functions'],
        fit: 'Ingest policy packets, extract fields, and trigger downstream checks automatically.',
        rationale:
          'Replaces manual packet review with cloud OCR/extraction and event-driven routing as documents land.',
        description:
          'Ingest broker, email, and batch packets; extract fields; and route clean work vs exceptions automatically.',
        overallScore: 88,
        tags: ['document intake', 'extraction', 'insurance', 'Document AI'],
        accelerator: {
          name: 'Document AI + Cloud Storage',
          geminiFit: 88,
          description:
            'Cloud OCR and extraction on landing packets so underwriters stop touching every submission.',
        },
        value: 90,
        feasibility: 82,
        risk: 28,
      },
      {
        name: 'Policy data validation hub',
        title: 'Policy data validation against customer and policy systems',
        googleProducts: ['Document AI', 'BigQuery', 'Vertex AI'],
        fit: 'Compare extracted fields to customer and policy records and flag mismatches.',
        rationale:
          'Puts extracted document data next to policy/customer facts so exceptions can be scored before underwriters touch them.',
        description:
          'Compare extracted fields to Guidewire customer/policy records and score mismatches before human review.',
        overallScore: 85,
        tags: ['validation', 'policy systems', 'insurance', 'Document AI'],
        accelerator: {
          name: 'Document AI + BigQuery',
          geminiFit: 85,
          description:
            'Field-level checks against systems of record so only true mismatches reach underwriters.',
        },
        value: 87,
        feasibility: 74,
        risk: 35,
      },
      {
        name: 'Secure evidence workspace',
        title: 'Secure evidence workspace for PII-safe submission storage',
        googleProducts: ['Document AI', 'Cloud Storage', 'Sensitive Data Protection'],
        fit: 'Store submissions securely, redact PII where needed, and retain audit-ready evidence.',
        rationale:
          'Insurance packets carry sensitive data; this combination balances extraction speed with privacy and audit controls.',
        description:
          'Store submissions securely, redact PII where needed, and keep audit-ready evidence for the intake path.',
        overallScore: 81,
        tags: ['security', 'PII', 'insurance', 'Sensitive Data Protection'],
        accelerator: {
          name: 'Document AI + Sensitive Data Protection',
          geminiFit: 81,
          description:
            'Extraction speed with redaction, retention, and audit controls for sensitive insurance packets.',
        },
        value: 80,
        feasibility: 78,
        risk: 22,
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
