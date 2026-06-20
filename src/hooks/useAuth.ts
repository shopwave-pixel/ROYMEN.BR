import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext';

/**
 * Access the application authentication state and operations.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider root banner wrapper.');
  }
  return context;
};

export default useAuth;
