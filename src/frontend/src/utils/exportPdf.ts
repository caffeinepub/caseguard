import type { DecryptedCase } from '../services/cases/caseCodec';
import { getStatusLabel } from '../services/status/statusRules';

export function exportPdf(cases: DecryptedCase[], dateColumn: 'creation' | 'nextHearing') {
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

  const csvContent = [
    ['Case Number', 'Client Name', dateColumn === 'creation' ? 'Creation Date' : 'Next Hearing', 'Status'],
    ...cases.map((c) => [
      c.caseNumber,
      c.clientName,
      formatDate(dateColumn === 'creation' ? c.creationDate : c.nextHearing),
      getStatusLabel(c.status),
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `caseguard-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
