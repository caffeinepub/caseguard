import type { DecryptedCase } from '../cases/caseCodec';
import { Status } from '../../backend';

export function calculateAutoStatus(caseData: DecryptedCase): Status {
  const now = new Date();
  
  if (!caseData.nextHearing || caseData.nextHearing.trim() === '') {
    return Status.open;
  }

  try {
    const nextHearingDate = new Date(caseData.nextHearing);
    const daysUntilHearing = Math.ceil((nextHearingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilHearing < 0) {
      return Status.awaitingCourt;
    } else if (daysUntilHearing <= 7) {
      return Status.scheduled;
    } else if (caseData.evidence.length > 0) {
      return Status.reviewingEvidence;
    } else {
      return Status.open;
    }
  } catch {
    return Status.open;
  }
}

export function getStatusLabel(status: Status): string {
  const labels: Record<Status, string> = {
    [Status.open]: 'Open',
    [Status.closed]: 'Closed',
    [Status.awaitingCourt]: 'Awaiting Court',
    [Status.reviewingEvidence]: 'Reviewing Evidence',
    [Status.scheduled]: 'Scheduled',
  };
  return labels[status] || status;
}

export function getStatusColor(status: Status): string {
  const colors: Record<Status, string> = {
    [Status.open]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [Status.closed]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    [Status.awaitingCourt]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [Status.reviewingEvidence]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [Status.scheduled]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
