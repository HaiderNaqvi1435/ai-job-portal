'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AuthProvider({ children }) {
  useAuth();
  return <>{children}</>;
}
