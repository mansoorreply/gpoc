import { Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { ProductSuggestion } from '../../core/engagement.models';
import { EngagementService } from '../../core/engagement.service';

interface RunMetric {
  label: string;
  value: string;
}

interface RunSummary {
  issueSummary: string;
  keyMetrics: RunMetric[];
  identifiedIssues: string[];
  keyDecisions: string[];
  followUps: string[];
}

const DEFAULT_SUMMARY: RunSummary = {
  issueSummary:
    'The customer needs a clearer path from assessment findings to a Google Cloud solution set that can be funded and delivered with measurable outcomes.',
  keyMetrics: [
    { label: 'Activities completed', value: '6 / 6' },
    { label: 'Stakeholders engaged', value: '5' },
    { label: 'Estimated deal value', value: '$250k' },
    { label: 'Time-to-value target', value: '90 days' },
  ],
  identifiedIssues: [
    'Manual handoffs create delay between discovery and delivery.',
    'No shared success metrics across client and partner teams.',
    'Evidence and decisions from workshops are not centralized.',
  ],
  keyDecisions: [
    'Proceed with a partner-led pilot scoped to the top use case.',
    'Use Google Cloud services as the primary delivery stack.',
    'Executive sponsor will review progress bi-weekly.',
  ],
  followUps: [
    'Confirm security review window with the customer platform team.',
    'Share a one-page funding brief with the partner PDM.',
  ],
};

const SUMMARIES: Record<string, RunSummary> = {
  'insurance-docs': {
    issueSummary:
      'An insurance company receives a high volume of policy documents during submission. Manual review slows underwriting; the assessment recommends routing packets through cloud document extraction and validating fields against customer and policy data.',
    keyMetrics: [
      { label: 'Manual review backlog', value: '~1,200 packets / week' },
      { label: 'Avg. review cycle time', value: '3.5 days' },
      { label: 'Field mismatch rate', value: '18%' },
      { label: 'Target auto-pass rate', value: '70%' },
    ],
    identifiedIssues: [
      'Broker portal, email, and batch channels feed the same manual queue.',
      'Extracted fields are not systematically checked against Guidewire customer/policy records.',
      'Exception handling lacks confidence scoring, so underwriters touch almost every packet.',
      'Sensitive PII in submissions needs stronger storage and audit controls.',
    ],
    keyDecisions: [
      'Pilot Document AI extraction on new-business submissions first.',
      'Validate extracted fields against customer and policy systems before underwriter review.',
      'Route only low-confidence or mismatched packets to the exception queue.',
      'Partner owns architecture deep-dive; client Ops owns SLA targets for the pilot.',
    ],
    followUps: [
      'Provide 20 redacted sample packets for processor tuning.',
      'Confirm Guidewire read APIs for customer and policy lookup.',
      'Schedule security review for storage, redaction, and retention.',
    ],
  },
  'cloud-cost': {
    issueSummary:
      'Cloud spend has overrun budget. The assessment mapped cost centers, commitment gaps, and rightsizing opportunities that finance and FinOps can act on together.',
    keyMetrics: [
      { label: 'MoM spend variance', value: '+22%' },
      { label: 'Unowned cost centers', value: '7' },
      { label: 'Commitment coverage', value: '54%' },
      { label: 'Quick-win savings', value: '~$38k / mo' },
    ],
    identifiedIssues: [
      'Idle and oversized workloads are not reviewed on a cadence.',
      'Commitment coverage is uneven across teams.',
      'Finance lacks a shared dashboard of spend by owner.',
    ],
    keyDecisions: [
      'Stand up BigQuery billing exports as the FinOps source of truth.',
      'Assign owners to the top five cost centers this quarter.',
      'Publish executive Looker views for budget vs actual.',
    ],
    followUps: [
      'Export last 90 days of billing data for baseline modeling.',
      'Align budget alert thresholds with VP Finance.',
    ],
  },
  'data-silos': {
    issueSummary:
      'Fragmented source systems block shared decisions. Teams disagree on metrics because there is no governed warehouse and trusted metrics layer.',
    keyMetrics: [
      { label: 'Source systems in play', value: '11' },
      { label: 'Duplicate extracts / week', value: '40+' },
      { label: 'Metric conflicts reported', value: '6 critical' },
      { label: 'Phase-1 domains', value: 'Finance + Sales' },
    ],
    identifiedIssues: [
      'Finance and sales use different definitions for the same KPIs.',
      'Operational refreshes are manual and delayed.',
      'No named stewards for a shared metric catalog.',
    ],
    keyDecisions: [
      'Ingest priority sources into BigQuery via Dataflow.',
      'Publish a Looker metrics layer for finance and sales first.',
      'Name stewards before Phase-1 go-live.',
    ],
    followUps: [
      'Finalize Phase-1 source list and freshness SLAs.',
      'Book metric-steward workshop with analytics and ops.',
    ],
  },
  security: {
    issueSummary:
      'Audit pressure requires closing control gaps in evidence, detection, and access. The assessment sequenced remediation against the audit deadline.',
    keyMetrics: [
      { label: 'Days to audit', value: '67' },
      { label: 'Open high findings', value: '14' },
      { label: 'Accounts over-privileged', value: '23' },
      { label: 'Logging coverage', value: '72%' },
    ],
    identifiedIssues: [
      'Evidence collection is manual and incomplete.',
      'Threat investigation is disconnected from posture findings.',
      'Production access reviews are irregular.',
    ],
    keyDecisions: [
      'Use Security Command Center + Chronicle for posture and investigation.',
      'Institute a monthly IAM access review for production.',
      'Prioritize logging gaps that block audit evidence.',
    ],
    followUps: [
      'Share current finding export with the partner security architect.',
      'Confirm identity owners for production projects.',
    ],
  },
  modernization: {
    issueSummary:
      'A legacy workload is blocking delivery speed. The assessment selected a first migration slice and a target runtime pattern behind a stable API edge.',
    keyMetrics: [
      { label: 'Candidate services', value: '3' },
      { label: 'Cutover window', value: '4 hours' },
      { label: 'API consumers', value: '8' },
      { label: 'Pilot duration', value: '6 weeks' },
    ],
    identifiedIssues: [
      'Monolith coupling raises cutover risk.',
      'Missing APIs force brittle point-to-point integrations.',
      'Runtime choice (GKE vs Cloud Run) is still debated for stateful pieces.',
    ],
    keyDecisions: [
      'Pilot the first stateless service on Cloud Run or GKE with Apigee at the edge.',
      'Freeze consumer contracts before cutover.',
      'Defer stateful migration until the API edge is proven.',
    ],
    followUps: [
      'Complete dependency map for the first service.',
      'Align product and platform on the cutover rehearsal date.',
    ],
  },
};

@Component({
  selector: 'app-run',
  imports: [
    MatButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatCheckbox,
    MatChip,
    MatChipSet,
  ],
  templateUrl: './run.component.html',
  styleUrl: './run.component.scss',
})
export class Run {
  protected readonly engagement = inject(EngagementService);
  protected readonly dafRequested = signal(false);

  protected readonly summary = computed<RunSummary>(() => {
    const id = this.engagement.scenario()?.id;
    return (id && SUMMARIES[id]) || DEFAULT_SUMMARY;
  });

  protected isUseCase(solution: ProductSuggestion): boolean {
    return solution.accelerator != null;
  }

  protected setProduct(name: string, selected: boolean): void {
    if (this.engagement.selectedProducts().includes(name) === selected) {
      return;
    }
    this.engagement.toggleProduct(name);
  }

  protected requestDafFunding(): void {
    this.dafRequested.set(true);
  }

  protected downloadArtifacts(): void {
    const customer = this.engagement.customerName().trim() || 'Customer';
    const scenario = this.engagement.scenario()?.label ?? 'Assessment';
    const summary = this.summary();
    const markdown = [
      `# Assessment readout — ${customer}`,
      '',
      `**Scenario:** ${scenario}`,
      '',
      '## Issue summary',
      '',
      summary.issueSummary,
      '',
      '## Key metrics',
      '',
      ...summary.keyMetrics.map((m) => `- **${m.label}:** ${m.value}`),
      '',
      '## Identified issues',
      '',
      ...summary.identifiedIssues.map((item) => `- ${item}`),
      '',
      '## Key decisions',
      '',
      ...summary.keyDecisions.map((item) => `- ${item}`),
      '',
      '## Follow-ups',
      '',
      ...(summary.followUps.length
        ? summary.followUps.map((item) => `- ${item}`)
        : ['- None recorded.']),
      '',
    ].join('\n');

    const slug =
      customer
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'assessment';
    const filename = `${slug}-assessment-readout.md`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  protected complete(): void {
    this.engagement.completeCycle();
  }
}
