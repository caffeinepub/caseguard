import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useEncryption } from '../../hooks/useEncryption';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UnlockVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UnlockVaultDialog({ open, onOpenChange }: UnlockVaultDialogProps) {
  const { identity } = useInternetIdentity();
  const { isInitialized, initializeVault, unlockVault } = useEncryption();
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const needsInitialization = isAuthenticated && !isInitialized;

  useEffect(() => {
    if (!open) {
      setPassphrase('');
      setConfirmPassphrase('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (needsInitialization) {
        if (passphrase.length < 8) {
          setError('Passphrase must be at least 8 characters');
          setLoading(false);
          return;
        }
        if (passphrase !== confirmPassphrase) {
          setError('Passphrases do not match');
          setLoading(false);
          return;
        }
        await initializeVault(passphrase);
        onOpenChange(false);
      } else {
        const success = await unlockVault(passphrase);
        if (success) {
          onOpenChange(false);
        } else {
          setError('Incorrect passphrase');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {needsInitialization ? (
              <Lock className="h-6 w-6 text-primary" />
            ) : (
              <Unlock className="h-6 w-6 text-primary" />
            )}
          </div>
          <DialogTitle className="text-center">
            {needsInitialization ? 'Initialize Encryption' : 'Unlock Vault'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {needsInitialization
              ? 'Create a passphrase to encrypt your case data. This passphrase will be required to access your cases.'
              : 'Enter your passphrase to decrypt and view your case data.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase</Label>
            <Input
              id="passphrase"
              type="password"
              placeholder="Enter passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && passphrase && (!needsInitialization || confirmPassphrase)) {
                  handleSubmit();
                }
              }}
            />
          </div>
          {needsInitialization && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassphrase">Confirm Passphrase</Label>
              <Input
                id="confirmPassphrase"
                type="password"
                placeholder="Confirm passphrase"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && passphrase && confirmPassphrase) {
                    handleSubmit();
                  }
                }}
              />
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={loading || !passphrase || (needsInitialization && !confirmPassphrase)}
            className="w-full"
          >
            {loading ? 'Processing...' : needsInitialization ? 'Initialize' : 'Unlock'}
          </Button>
          {needsInitialization && (
            <p className="text-xs text-center text-muted-foreground">
              Important: Store your passphrase securely. It cannot be recovered if lost.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
