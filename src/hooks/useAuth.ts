import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, User } from '@/services/api';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = authAPI.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      // Verify token is still valid
      authAPI.getCurrentUser().then(currentUser => {
        setUser(currentUser);
        setLoading(false);
      }).catch(() => {
        setUser(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { user } = await authAPI.signUp(email, password, fullName);
      setUser(user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
      return { data: { user }, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await authAPI.signIn(email, password);
      setUser(user);
      toast.success('Signed in successfully!');
      navigate('/dashboard');
      return { data: { user }, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return { user, session: null, loading, signUp, signIn, signOut };
};
