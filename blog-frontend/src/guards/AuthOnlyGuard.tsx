import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';

type AuthOnlyGuardProps = {
  children: ReactNode;
};

const AuthOnlyGuard = ({ children }: AuthOnlyGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/not-found" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default AuthOnlyGuard;
