import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import type { DecryptedCase } from '../../services/cases/caseCodec';
import { Status } from '../../backend';
import { getStatusLabel } from '../../services/status/statusRules';
import HearingsEditor from './HearingsEditor';
import EvidenceEditor from './EvidenceEditor';

interface CaseFormProps {
  initialData: DecryptedCase;
  onSubmit: (data: DecryptedCase) => void;
  isSubmitting: boolean;
  isNewCase: boolean;
}

export default function CaseForm({ initialData, onSubmit, isSubmitting, isNewCase }: CaseFormProps) {
  const [formData, setFormData] = useState<DecryptedCase>(initialData);

  const statuses: Status[] = [Status.open, Status.closed, Status.awaitingCourt, Status.reviewingEvidence, Status.scheduled];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof DecryptedCase, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="caseNumber">Case Number *</Label>
          <Input
            id="caseNumber"
            value={formData.caseNumber}
            onChange={(e) => updateField('caseNumber', e.target.value)}
            placeholder="e.g., CR-2024-001"
            required
            disabled={!isNewCase}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(v) => updateField('status', v as Status)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="creationDate">Creation Date *</Label>
          <Input
            id="creationDate"
            type="date"
            value={formData.creationDate}
            onChange={(e) => updateField('creationDate', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextHearing">Next Hearing Date</Label>
          <Input
            id="nextHearing"
            type="date"
            value={formData.nextHearing}
            onChange={(e) => updateField('nextHearing', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientContact">Contact Information</Label>
            <Input
              id="clientContact"
              value={formData.clientContact}
              onChange={(e) => updateField('clientContact', e.target.value)}
              placeholder="Phone or email"
            />
          </div>
        </div>
      </div>

      <Separator />

      <HearingsEditor
        hearings={formData.hearings}
        onChange={(hearings) => updateField('hearings', hearings)}
      />

      <Separator />

      <EvidenceEditor
        evidence={formData.evidence}
        onChange={(evidence) => updateField('evidence', evidence)}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Case'}
        </Button>
      </div>
    </form>
  );
}
