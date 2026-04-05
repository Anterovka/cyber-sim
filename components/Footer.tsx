'use client';

import { usePathname } from 'next/navigation';
import { useThemeMode } from '../lib/ThemeModeContext';

export default function Footer() {
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';


  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer style={{
      padding: '12px 0',
      textAlign: 'center',
      fontSize: '0.8rem',
      color: isDark ? '#666' : '#9e9e9e',
      borderTop: `1px solid ${isDark ? '#1e1e1e' : '#e0e0e0'}`,
      background: isDark ? '#0a0a0a' : '#fafafa',
    }}>
      © 2026 CyberSim — Образовательный симулятор защиты личных данных
    </footer>
  );
}
