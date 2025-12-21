import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Spinner } from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';

type RoleGuardProps = {
  roles: string[];
  children: ReactNode;
};

const RoleGuard = ({ roles, children }: RoleGuardProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hasAccess = user?.roles?.some((role) => roles.includes(role));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
