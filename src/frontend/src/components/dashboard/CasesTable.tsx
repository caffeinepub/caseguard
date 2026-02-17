import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, ArrowUpDown } from 'lucide-react';
import StatusBadge from '../cases/StatusBadge';
import type { DecryptedCase } from '../../services/cases/caseCodec';

interface CasesTableProps {
  cases: DecryptedCase[];
  dateColumn: 'creation' | 'nextHearing';
}

type SortField = 'caseNumber' | 'date' | 'status' | 'clientName';
type SortDirection = 'asc' | 'desc';

export default function CasesTable({ cases, dateColumn }: CasesTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedCases = useMemo(() => {
    const sorted = [...cases];
    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'caseNumber':
          aVal = a.caseNumber;
          bVal = b.caseNumber;
          break;
        case 'date':
          aVal = dateColumn === 'creation' ? new Date(a.creationDate) : new Date(a.nextHearing || '9999-12-31');
          bVal = dateColumn === 'creation' ? new Date(b.creationDate) : new Date(b.nextHearing || '9999-12-31');
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'clientName':
          aVal = a.clientName;
          bVal = b.clientName;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [cases, sortField, sortDirection, dateColumn]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('caseNumber')} className="h-8 px-2">
                  Case Number
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('clientName')} className="h-8 px-2">
                  Client Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('date')} className="h-8 px-2">
                  {dateColumn === 'creation' ? 'Creation Date' : 'Next Hearing'}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('status')} className="h-8 px-2">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCases.map((caseData) => (
              <TableRow
                key={caseData.caseNumber}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate({ to: '/case/$caseNumber', params: { caseNumber: caseData.caseNumber } })}
              >
                <TableCell className="font-medium">{caseData.caseNumber}</TableCell>
                <TableCell>{caseData.clientName}</TableCell>
                <TableCell>
                  {formatDate(dateColumn === 'creation' ? caseData.creationDate : caseData.nextHearing)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={caseData.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({ to: '/case/$caseNumber', params: { caseNumber: caseData.caseNumber } });
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
