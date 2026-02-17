import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthUi } from '../../hooks/useAuthUi';
import { logAuthLifecycle } from '../../utils/authDiagnostics';

export default function LoginButton() {
  const { isAuthenticated, isLoggingIn, startLogin, logout } = useAuthUi();

  const handleClick = async () => {
    if (isAuthenticated) {
      logAuthLifecycle('LoginButton logout clicked');
      await logout();
    } else {
      logAuthLifecycle('LoginButton login clicked');
      startLogin();
    }
  };

  const disabled = isLoggingIn;
  const text = isLoggingIn ? 'Signing in...' : isAuthenticated ? 'Logout' : 'Sign In';

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
    >
      {isAuthenticated ? (
        <LogOut className="mr-2 h-4 w-4" />
      ) : (
        <LogIn className="mr-2 h-4 w-4" />
      )}
      {text}
    </Button>
  );
}
