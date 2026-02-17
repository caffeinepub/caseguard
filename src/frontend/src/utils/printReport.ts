import type { DecryptedCase } from '../services/cases/caseCodec';
import { getStatusLabel } from '../services/status/statusRules';

export function printReport(cases: DecryptedCase[], dateColumn: 'creation' | 'nextHearing') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the report');
    return;
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CaseGuard Report - ${new Date().toLocaleDateString()}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            @page { margin: 1cm; }
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.5;
            color: #000;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #666;
            margin-bottom: 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }
          .status-open { background-color: #dbeafe; color: #1e40af; }
          .status-closed { background-color: #f3f4f6; color: #374151; }
          .status-awaitingCourt { background-color: #fef3c7; color: #92400e; }
          .status-reviewingEvidence { background-color: #e9d5ff; color: #6b21a8; }
          .status-scheduled { background-color: #d1fae5; color: #065f46; }
        </style>
      </head>
      <body>
        <h1>CaseGuard Report</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Client Name</th>
              <th>${dateColumn === 'creation' ? 'Creation Date' : 'Next Hearing'}</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${cases
              .map(
                (c) => `
              <tr>
                <td>${c.caseNumber}</td>
                <td>${c.clientName}</td>
                <td>${formatDate(dateColumn === 'creation' ? c.creationDate : c.nextHearing)}</td>
                <td><span class="status status-${c.status}">${getStatusLabel(c.status)}</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
