'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'gudang' | 'cabang-1' | 'cabang-2' | 'cabang-3' | null;

interface AuthContextType {
  role: Role;
  login: (selectedRole: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage on mount
    const savedRole = localStorage.getItem('user_role') as Role;
    if (savedRole) {
      setRole(savedRole);
    } else if (pathname !== '/login') {
      router.replace('/login');
    }
    setIsMounted(true);
  }, [pathname, router]);

  const login = (selectedRole: Role) => {
    localStorage.setItem('user_role', selectedRole as string);
    setRole(selectedRole);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('user_role');
    setRole(null);
    router.push('/login');
  };

  // Prevent flash of unauthorized content
  if (!isMounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
