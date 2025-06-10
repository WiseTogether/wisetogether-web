import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { FadeLoader } from 'react-spinners';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useAuth();

  // Show a loading message while checking if user data is ready
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <FadeLoader />
      </div>
    );
  }

  // If there is no session, redirect to the login page
  if (!session) {
    return <Navigate to='/login' />;
  }

  // If the user is authenticated, render the protected route's children
  return <>{children}</>;
};

export default ProtectedRoute;