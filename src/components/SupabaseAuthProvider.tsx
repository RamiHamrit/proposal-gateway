
import { AuthProvider as LegacyAuthProvider } from '@/context/AuthContext';
import { AuthProvider as SupabaseAuthProvider } from '@/hooks/use-supabase-auth';

interface AuthProvidersProps {
  children: React.ReactNode;
}

// This component wraps both auth providers to facilitate migration
export const AuthProviders = ({ children }: AuthProvidersProps) => {
  return (
    <SupabaseAuthProvider>
      <LegacyAuthProvider>
        {children}
      </LegacyAuthProvider>
    </SupabaseAuthProvider>
  );
};

export default AuthProviders;
