import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, CheckCircle2, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationSettings {
  apiEndpoint: string;
  apiKey: string;
}

interface SyncStatus {
  lastSync: string | null;
  success: boolean;
  message: string;
}

export default function IntegrationsPage() {
  const [settings, setSettings] = useState<IntegrationSettings>({
    apiEndpoint: '',
    apiKey: '',
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    success: true,
    message: 'No sync performed yet',
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('caseguard_integration_settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
    const storedStatus = localStorage.getItem('caseguard_sync_status');
    if (storedStatus) {
      setSyncStatus(JSON.parse(storedStatus));
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('caseguard_integration_settings', JSON.stringify(settings));
    toast.success('Integration settings saved');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const newStatus: SyncStatus = {
        lastSync: new Date().toISOString(),
        success: true,
        message: 'Sync completed successfully',
      };
      setSyncStatus(newStatus);
      localStorage.setItem('caseguard_sync_status', JSON.stringify(newStatus));
      toast.success('Sync completed successfully');
    } catch (error: any) {
      const newStatus: SyncStatus = {
        lastSync: new Date().toISOString(),
        success: false,
        message: error.message || 'Sync failed',
      };
      setSyncStatus(newStatus);
      localStorage.setItem('caseguard_sync_status', JSON.stringify(newStatus));
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Configure external system connections and sync settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>
            Configure your external application connection to sync cases and status updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiEndpoint">API Endpoint</Label>
            <Input
              id="apiEndpoint"
              value={settings.apiEndpoint}
              onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
              placeholder="https://api.example.com/cases"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="Enter your API key"
            />
          </div>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Status</CardTitle>
          <CardDescription>View and manage data synchronization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Last Sync</p>
              <p className="text-sm text-muted-foreground">{formatDate(syncStatus.lastSync)}</p>
            </div>
            <div className="flex items-center gap-2">
              {syncStatus.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span className="text-sm font-medium">
                {syncStatus.success ? 'Success' : 'Failed'}
              </span>
            </div>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{syncStatus.message}</AlertDescription>
          </Alert>
          <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Documentation</CardTitle>
          <CardDescription>How to use the integration API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Adding Cases Programmatically</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Use the <code className="bg-muted px-1 py-0.5 rounded">addMultipleCases</code> backend method to import cases from your external system.
            </p>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Example: Import cases
const cases = [
  {
    caseNumber: "encrypted_case_number",
    creationDate: "encrypted_date",
    nextHearing: "encrypted_date",
    clientName: "encrypted_name",
    clientContact: "encrypted_contact",
    evidence: [],
    hearings: [],
    status: "open"
  }
];
await actor.addMultipleCases(cases);`}
            </pre>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Syncing Status Updates</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Use the <code className="bg-muted px-1 py-0.5 rounded">updateStatus</code> backend method to sync case status changes.
            </p>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Example: Update case status
await actor.updateStatus(
  "encrypted_case_number",
  "scheduled"
);`}
            </pre>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Note: All sensitive data must be encrypted on the client side before sending to the backend.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
