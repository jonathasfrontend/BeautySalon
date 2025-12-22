'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initializeTheme = useUIStore((state) => state.initializeTheme);

  useEffect(() => {
    // Initialize theme when component mounts
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
}
