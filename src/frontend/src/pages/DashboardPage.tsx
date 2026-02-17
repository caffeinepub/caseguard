import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCases } from '../hooks/useQueries';
import { useEncryption } from '../hooks/useEncryption';
import { decryptCase, type DecryptedCase } from '../services/cases/caseCodec';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Lock, FileText, Download, Printer } from 'lucide-react';
import UnlockVaultDialog from '../components/security/UnlockVaultDialog';
import CasesTable from '../components/dashboard/CasesTable';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import { printReport } from '../utils/printReport';
import { exportPdf } from '../utils/exportPdf';
import { toast } from 'sonner';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: encryptedCases = [], isLoading } = useGetCases();
  const { isLocked, decryptText } = useEncryption();
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [decryptedCases, setDecryptedCases] = useState<DecryptedCase[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateColumn, setDateColumn] = useState<'creation' | 'nextHearing'>('creation');

  useMemo(() => {
    if (!isLocked && encryptedCases.length > 0) {
      setIsDecrypting(true);
      Promise.all(
        encryptedCases.map((c) => decryptCase(c, decryptText))
      )
        .then(setDecryptedCases)
        .catch((err) => {
          console.error('Decryption error:', err);
          toast.error('Failed to decrypt cases');
        })
        .finally(() => setIsDecrypting(false));
    } else if (isLocked) {
      setDecryptedCases([]);
    }
  }, [encryptedCases, isLocked, decryptText]);

  const filteredCases = useMemo(() => {
    let filtered = decryptedCases;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(query) ||
          c.clientName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [decryptedCases, statusFilter, searchQuery]);

  const handlePrint = () => {
    printReport(filteredCases, dateColumn);
  };

  const handleExportPdf = () => {
    exportPdf(filteredCases, dateColumn);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cases...</p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Vault Locked</CardTitle>
              <CardDescription>
                Your case data is encrypted. Unlock your vault to view and manage cases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowUnlockDialog(true)} className="w-full" size="lg">
                <Lock className="mr-2 h-4 w-4" />
                Unlock Vault
              </Button>
            </CardContent>
          </Card>
        </div>
        <UnlockVaultDialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your criminal cases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={() => navigate({ to: '/case/new' })}>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>

      <DashboardFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        dateColumn={dateColumn}
        onDateColumnChange={setDateColumn}
      />

      {isDecrypting ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Decrypting cases...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredCases.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cases found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first case'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => navigate({ to: '/case/new' })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Case
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <CasesTable cases={filteredCases} dateColumn={dateColumn} />
      )}
    </div>
  );
}
