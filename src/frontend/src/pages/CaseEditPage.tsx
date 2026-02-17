import { useParams, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useGetCaseByNumber, useAddCase, useUpdateCase } from '../hooks/useQueries';
import { useEncryption } from '../hooks/useEncryption';
import { decryptCase, encryptCase, type DecryptedCase } from '../services/cases/caseCodec';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import CaseForm from '../components/cases/CaseForm';
import { toast } from 'sonner';
import { Status } from '../backend';

export default function CaseEditPage() {
  const params = useParams({ strict: false });
  const caseNumber = params.caseNumber;
  const navigate = useNavigate();
  const isNewCase = !caseNumber || caseNumber === 'new';
  
  const { data: encryptedCase, isLoading } = useGetCaseByNumber(caseNumber || '');
  const { encryptText, decryptText, isLocked } = useEncryption();
  const addCase = useAddCase();
  const updateCase = useUpdateCase();
  
  const [decryptedCase, setDecryptedCase] = useState<DecryptedCase | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    if (isNewCase) {
      setDecryptedCase({
        caseNumber: '',
        creationDate: new Date().toISOString().split('T')[0],
        nextHearing: '',
        clientName: '',
        clientContact: '',
        evidence: [],
        hearings: [],
        status: Status.open,
      });
    } else if (encryptedCase && !isLocked) {
      setIsDecrypting(true);
      decryptCase(encryptedCase, decryptText)
        .then(setDecryptedCase)
        .catch((err) => {
          console.error('Decryption error:', err);
          toast.error('Failed to decrypt case');
        })
        .finally(() => setIsDecrypting(false));
    }
  }, [isNewCase, encryptedCase, isLocked, decryptText]);

  const handleSubmit = async (data: DecryptedCase) => {
    try {
      const encrypted = await encryptCase(data, encryptText);
      if (isNewCase) {
        await addCase.mutateAsync(encrypted);
        navigate({ to: '/' });
      } else {
        await updateCase.mutateAsync(encrypted);
        navigate({ to: '/case/$caseNumber', params: { caseNumber: data.caseNumber } });
      }
    } catch (error: any) {
      toast.error('Failed to save case: ' + error.message);
    }
  };

  if (!isNewCase && (isLoading || isDecrypting)) {
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: isNewCase ? '/' : '/case/$caseNumber', params: { caseNumber: caseNumber || '' } })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isNewCase ? 'New Case' : 'Edit Case'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CaseForm
            initialData={decryptedCase}
            onSubmit={handleSubmit}
            isSubmitting={addCase.isPending || updateCase.isPending}
            isNewCase={isNewCase}
          />
        </CardContent>
      </Card>
    </div>
  );
}
