import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface EvidenceEditorProps {
  evidence: string[];
  onChange: (evidence: string[]) => void;
}

export default function EvidenceEditor({ evidence, onChange }: EvidenceEditorProps) {
  const addEvidence = () => {
    onChange([...evidence, '']);
  };

  const removeEvidence = (index: number) => {
    onChange(evidence.filter((_, i) => i !== index));
  };

  const updateEvidence = (index: number, value: string) => {
    const updated = [...evidence];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Evidence ({evidence.length})</h3>
        <Button type="button" variant="outline" size="sm" onClick={addEvidence}>
          <Plus className="mr-2 h-4 w-4" />
          Add Evidence
        </Button>
      </div>
      {evidence.length === 0 ? (
        <p className="text-muted-foreground text-sm">No evidence added yet</p>
      ) : (
        <div className="space-y-3">
          {evidence.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={item}
                      onChange={(e) => updateEvidence(index, e.target.value)}
                      placeholder="Evidence description..."
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvidence(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
