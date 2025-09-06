import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // --- CHANGE: Logic to handle users without a role ---
  if (isAuthenticated && !user?.role) {
    // If authenticated but has no role, redirect to role selection
    // unless they are already on that page.
    if (location.pathname !== '/select-role') {
      return <Navigate to="/select-role" replace />;
    }
  }

  // --- CHANGE: Logic to handle users with a role trying to access role selection ---
  if (isAuthenticated && user?.role && location.pathname === '/select-role') {
    // If they have a role, they shouldn't be on the role selection page. Redirect them home.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};