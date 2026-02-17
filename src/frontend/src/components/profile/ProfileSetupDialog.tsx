import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
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
import { UserCircle } from 'lucide-react';

export default function ProfileSetupDialog() {
  const { identity } = useInternetIdentity();
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleSave = async () => {
    if (!name.trim()) return;
    // Store name in localStorage as backend doesn't support user profiles yet
    localStorage.setItem(`caseguard_user_name_${identity?.getPrincipal().toString()}`, name.trim());
    setIsOpen(false);
  };

  // Check if user has already set their name
  const hasName = isAuthenticated && localStorage.getItem(`caseguard_user_name_${identity?.getPrincipal().toString()}`);

  // Only show dialog if authenticated and no name is set
  const showDialog = isAuthenticated && !hasName && !isOpen;

  return (
    <Dialog open={showDialog} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Welcome to CaseGuard</DialogTitle>
          <DialogDescription className="text-center">
            Please enter your name to complete your profile setup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleSave();
                }
              }}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
