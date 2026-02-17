import { useParams, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useGetCaseByNumber, useDeleteCase } from '../hooks/useQueries';
import { useEncryption } from '../hooks/useEncryption';
import { decryptCase, type DecryptedCase } from '../services/cases/caseCodec';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Calendar, User, Phone, FileText, Gavel } from 'lucide-react';
import StatusBadge from '../components/cases/StatusBadge';
import { toast } from 'sonner';

export default function CaseDetailPage() {
  const { caseNumber } = useParams({ from: '/case/$caseNumber' });
  const navigate = useNavigate();
  const { data: encryptedCase, isLoading } = useGetCaseByNumber(caseNumber);
  const { decryptText, isLocked } = useEncryption();
  const deleteCase = useDeleteCase();
  const [decryptedCase, setDecryptedCase] = useState<DecryptedCase | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    if (encryptedCase && !isLocked) {
      setIsDecrypting(true);
      decryptCase(encryptedCase, decryptText)
        .then(setDecryptedCase)
        .catch((err) => {
          console.error('Decryption error:', err);
          toast.error('Failed to decrypt case');
        })
        .finally(() => setIsDecrypting(false));
    }
  }, [encryptedCase, isLocked, decryptText]);

  const handleDelete = async () => {
    if (!decryptedCase) return;
    await deleteCase.mutateAsync(caseNumber);
    navigate({ to: '/' });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading || isDecrypting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case...</p>
        </div>
      </div>
    );
  }

  if (!decryptedCase) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Case not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/case/$caseNumber/edit', params: { caseNumber } })}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Case</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this case? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{decryptedCase.caseNumber}</CardTitle>
              <CardDescription className="mt-2">Case Details</CardDescription>
            </div>
            <StatusBadge status={decryptedCase.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Creation Date
              </div>
              <p className="text-base">{formatDate(decryptedCase.creationDate)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Next Hearing
              </div>
              <p className="text-base">{formatDate(decryptedCase.nextHearing)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{decryptedCase.clientName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Contact</p>
                <p className="text-base">{decryptedCase.clientContact || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Hearings ({decryptedCase.hearings.length})
            </h3>
            {decryptedCase.hearings.length === 0 ? (
              <p className="text-muted-foreground">No hearings recorded</p>
            ) : (
              <div className="space-y-4">
                {decryptedCase.hearings.map((hearing, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium">{formatDate(hearing.date)}</p>
                        <StatusBadge status={hearing.status} />
                      </div>
                      {hearing.outcome && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground">Outcome</p>
                          <p className="text-sm mt-1">{hearing.outcome}</p>
                        </div>
                      )}
                      {hearing.notes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground">Notes</p>
                          <p className="text-sm mt-1">{hearing.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Evidence ({decryptedCase.evidence.length})
            </h3>
            {decryptedCase.evidence.length === 0 ? (
              <p className="text-muted-foreground">No evidence recorded</p>
            ) : (
              <div className="space-y-2">
                {decryptedCase.evidence.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="py-3">
                      <p className="text-sm">{item}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
