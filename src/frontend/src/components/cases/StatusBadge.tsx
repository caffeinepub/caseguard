import { Badge } from '@/components/ui/badge';
import { getStatusLabel, getStatusColor } from '../../services/status/statusRules';
import type { Status } from '../../backend';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <Badge className={`${getStatusColor(status)} ${className}`} variant="outline">
      {getStatusLabel(status)}
    </Badge>
  );
}
