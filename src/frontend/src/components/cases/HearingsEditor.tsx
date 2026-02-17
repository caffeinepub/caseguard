import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import type { DecryptedHearing } from '../../services/cases/caseCodec';
import { Status } from '../../backend';
import { getStatusLabel } from '../../services/status/statusRules';

interface HearingsEditorProps {
  hearings: DecryptedHearing[];
  onChange: (hearings: DecryptedHearing[]) => void;
}

export default function HearingsEditor({ hearings, onChange }: HearingsEditorProps) {
  const statuses: Status[] = [Status.open, Status.closed, Status.awaitingCourt, Status.reviewingEvidence, Status.scheduled];

  const addHearing = () => {
    onChange([
      ...hearings,
      { date: '', outcome: '', notes: '', status: Status.scheduled },
    ]);
  };

  const removeHearing = (index: number) => {
    onChange(hearings.filter((_, i) => i !== index));
  };

  const updateHearing = (index: number, field: keyof DecryptedHearing, value: any) => {
    const updated = [...hearings];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Hearings ({hearings.length})</h3>
        <Button type="button" variant="outline" size="sm" onClick={addHearing}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hearing
        </Button>
      </div>
      {hearings.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hearings added yet</p>
      ) : (
        <div className="space-y-4">
          {hearings.map((hearing, index) => (
            <Card key={index}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">Hearing {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHearing(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={hearing.date}
                      onChange={(e) => updateHearing(index, 'date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={hearing.status}
                      onValueChange={(v) => updateHearing(index, 'status', v as Status)}
                    >
                      <SelectTrigger>
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
                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Input
                    value={hearing.outcome}
                    onChange={(e) => updateHearing(index, 'outcome', e.target.value)}
                    placeholder="Brief outcome description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={hearing.notes}
                    onChange={(e) => updateHearing(index, 'notes', e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
