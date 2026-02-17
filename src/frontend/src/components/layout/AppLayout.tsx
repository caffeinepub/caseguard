import { ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import LoginButton from '../auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Scale, Home, Settings, Heart } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import ProfileSetupDialog from '../profile/ProfileSetupDialog';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate({ to: '/' })}
                className="flex items-center gap-2 text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
              >
                <Scale className="h-6 w-6 text-primary" />
                <span>CaseGuard</span>
              </button>
              {isAuthenticated && (
                <nav className="hidden md:flex items-center gap-2">
                  <Button
                    variant={currentPath === '/' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => navigate({ to: '/' })}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant={currentPath === '/integrations' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => navigate({ to: '/integrations' })}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Integrations
                  </Button>
                </nav>
              )}
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CaseGuard. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'caseguard-app'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <ProfileSetupDialog />
    </div>
  );
}
