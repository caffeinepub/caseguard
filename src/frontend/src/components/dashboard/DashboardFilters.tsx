import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';
import { Status } from '../../backend';
import { getStatusLabel } from '../../services/status/statusRules';

interface DashboardFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  dateColumn: 'creation' | 'nextHearing';
  onDateColumnChange: (value: 'creation' | 'nextHearing') => void;
}

export default function DashboardFilters({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  dateColumn,
  onDateColumnChange,
}: DashboardFiltersProps) {
  const statuses: Status[] = [Status.open, Status.closed, Status.awaitingCourt, Status.reviewingEvidence, Status.scheduled];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="search" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search
        </Label>
        <Input
          id="search"
          placeholder="Search by case number or client..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Status
        </Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateColumn">Date Column</Label>
        <Select value={dateColumn} onValueChange={(v) => onDateColumnChange(v as 'creation' | 'nextHearing')}>
          <SelectTrigger id="dateColumn">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="creation">Creation Date</SelectItem>
            <SelectItem value="nextHearing">Next Hearing</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
