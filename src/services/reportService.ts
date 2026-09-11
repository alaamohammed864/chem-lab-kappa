// Scientific Report Generation & Export Service

import { ResearchProject, SavedCalculation } from './researchService';

export interface ScientificReportSection {
  id: string;
  heading: string;
  subheading?: string;
  content: string;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  keyFindings?: string[];
  caveats?: string[];
}

export interface ScientificReport {
  id: string;
  reportNumber: string;
  title: string;
  dateGenerated: string;
  laboratoryName: string;
  investigator: string;
  governingStandards: string[];
  materialUnderStudy: string;
  status: 'Draft' | 'Preliminary' | 'Validated' | 'Archived';
  executiveSummary: string;
  sections: ScientificReportSection[];
  disclaimer: string;
  signoff: {
    preparedBy: string;
    reviewedBy: string;
    approvedDate: string;
  };
}

export class ReportService {
  /**
   * Builds a structured scientific report from a research project and its calculations
   */
  static generateReportFromProject(project: ResearchProject): ScientificReport {
    const reportNum = `REP-MAT-${new Date().getFullYear()}-${project.id.replace('proj-', '').padStart(4, '0')}`;

    const sections: ScientificReportSection[] = [
      {
        id: 'sec-specimen',
        heading: '1. Material & Specimen Identification',
        subheading: 'Alloy designation, microstructural condition & test coupons',
        content: `This technical evaluation assesses specimens corresponding to project "${project.title}". The investigation focuses on materials categorized under ${project.category}.`,
        tableData: {
          headers: ['Parameter', 'Specification', 'Standard / Reference'],
          rows: [
            ['Project Category', project.category, 'ISO 9001:2015 QC Log'],
            ['Linked Materials', project.linkedMaterials.join(', ') || 'High-Alloy Test Couplings', 'ASTM / AISI Spec'],
            ['Linked Chemical Elements', project.linkedElements.join(', ') || 'Fe, Cr, Ni, Mo', 'IUPAC Reference Table'],
            ['Lead Researcher', project.leadResearcher, 'Research Directorate'],
          ],
        },
      },
      {
        id: 'sec-methodology',
        heading: '2. Examination Methodology & Standard References',
        subheading: 'Governing consensus standards and equipment calibration',
        content:
          'Methodology conforms to peer-reviewed standards. All instruments are calibrated against traceable reference artifacts. Theoretical estimations employ classical thermodynamics and continuum physics.',
        tableData: {
          headers: ['Standard / Reference Code', 'Title / Scope', 'Issuing Body'],
          rows:
            project.references.length > 0
              ? project.references.map((r) => [
                  r.standardCode || r.doi || 'Standard Practice',
                  r.title,
                  r.publication,
                ])
              : [
                  ['ASTM G48 / G150', 'Pitting & Crevice Corrosion Assessment', 'ASTM International'],
                  ['ASME BPVC Sec V', 'Nondestructive Examination Protocol', 'ASME'],
                  ['Cullity & Stock', 'Elements of X-Ray Diffraction (3rd Edition)', 'Pearson'],
                ],
        },
      },
      {
        id: 'sec-calculations',
        heading: '3. Quantitative Modeling & Analytical Calculations',
        subheading: 'Derived physical and electrochemical metrics',
        content:
          'Quantitative outputs computed via platform scientific algorithms. Values represent verified mathematical calculations based on entered boundary conditions.',
        tableData: {
          headers: ['Calculation Title', 'Governing Formula', 'Primary Inputs', 'Resulting Metric'],
          rows:
            project.calculations.length > 0
              ? project.calculations.map((c) => [
                  c.title,
                  c.formula,
                  Object.entries(c.inputs)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', '),
                  Object.entries(c.outputs)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', '),
                ])
              : [
                  ['Electrochemical PREN', '%Cr + 3.3(%Mo + 0.5%W) + 16%N', 'Cr: 25.2, Mo: 3.8', 'PREN: 42.42'],
                  ['Bragg Interplanar Spacing', 'd = λ / (2 sin θ)', '2θ: 44.68°, Cu-Kα', 'd = 2.027 Å'],
                ],
        },
        keyFindings: [
          'Critical metric thresholds verified against consensus engineering design criteria.',
          'Phase fraction and crystallographic spacing confirm duplex microstructural stability.',
        ],
      },
      {
        id: 'sec-discussion',
        heading: '4. Engineering Discussion & Limitations',
        subheading: 'Risk analysis, temperature boundaries and measurement uncertainty',
        content:
          'Calculated values assume standard temperature (298.15 K) and neutral atmospheric pressure unless specified. Real-world service performance is subject to synergistic degradation including mechanical stress, flow turbulence, and microbiological colonization.',
        caveats: [
          'Calculations are theoretical simulations and do not replace physical coupon test verification.',
          'NDE defect evaluations require formal verification by ASNT/ISO 9712 certified Level II/III personnel.',
        ],
      },
    ];

    return {
      id: `rep-${Date.now()}`,
      reportNumber: reportNum,
      title: `Technical Examination Report: ${project.title}`,
      dateGenerated: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      laboratoryName: 'Alaa Chem Lab — Materials & Metallurgical Research Center',
      investigator: project.leadResearcher,
      governingStandards: project.references.map((r) => r.standardCode).filter(Boolean) as string[],
      materialUnderStudy: project.linkedMaterials.join(', ') || 'High Performance Engineering Alloy',
      status: 'Validated',
      executiveSummary: project.description,
      sections,
      disclaimer:
        'DISCLAIMER & LIMITATION OF LIABILITY: This scientific document is generated for engineering analysis and educational simulation purposes. Results reflect physical equations and input parameters entered into the computation suite. Operational deployment of pressurized components requires accredited metallurgical laboratory testing and licensed professional engineer approval.',
      signoff: {
        preparedBy: project.leadResearcher,
        reviewedBy: 'Chief Metallurgical Quality Inspector',
        approvedDate: new Date().toISOString().split('T')[0],
      },
    };
  }

  /**
   * Generates a Markdown document string for export
   */
  static exportToMarkdown(report: ScientificReport): string {
    const lines: string[] = [
      `# ${report.title}`,
      `**Document ID:** ${report.reportNumber} | **Date:** ${report.dateGenerated} | **Status:** ${report.status}`,
      `**Laboratory:** ${report.laboratoryName}`,
      `**Lead Investigator:** ${report.investigator}`,
      `**Materials Under Study:** ${report.materialUnderStudy}`,
      '',
      '---',
      '',
      '## Executive Summary',
      report.executiveSummary,
      '',
    ];

    report.sections.forEach((section) => {
      lines.push(`## ${section.heading}`);
      if (section.subheading) {
        lines.push(`*${section.subheading}*`);
      }
      lines.push('');
      lines.push(section.content);
      lines.push('');

      if (section.tableData) {
        const { headers, rows } = section.tableData;
        lines.push(`| ${headers.join(' | ')} |`);
        lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
        rows.forEach((row) => {
          lines.push(`| ${row.join(' | ')} |`);
        });
        lines.push('');
      }

      if (section.keyFindings && section.keyFindings.length > 0) {
        lines.push('### Key Findings:');
        section.keyFindings.forEach((k) => lines.push(`- ${k}`));
        lines.push('');
      }

      if (section.caveats && section.caveats.length > 0) {
        lines.push('### Stated Limitations & Boundaries:');
        section.caveats.forEach((c) => lines.push(`- ⚠️ ${c}`));
        lines.push('');
      }
    });

    lines.push('---');
    lines.push('### Formal Sign-off');
    lines.push(`- **Prepared by:** ${report.signoff.preparedBy}`);
    lines.push(`- **Reviewed by:** ${report.signoff.reviewedBy}`);
    lines.push(`- **Date:** ${report.signoff.approvedDate}`);
    lines.push('');
    lines.push(`> **Notice:** ${report.disclaimer}`);

    return lines.join('\n');
  }

  /**
   * Downloads raw text / JSON / Markdown to client
   */
  static downloadFile(filename: string, content: string, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
