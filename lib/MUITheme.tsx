'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode, useMemo } from 'react';
import { useThemeMode } from './ThemeModeContext';

function getTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#66BB6A' : '#2E7D32', contrastText: isDark ? '#1B5E20' : '#FFF' },
      secondary: { main: isDark ? '#81C784' : '#4CAF50', contrastText: isDark ? '#1B5E20' : '#FFF' },
      error: { main: isDark ? '#EF5350' : '#D32F2F', contrastText: '#FFF' },
      warning: { main: '#ED6C02', contrastText: '#FFF' },
      success: { main: isDark ? '#66BB6A' : '#2E7D32', contrastText: '#FFF' },
      background: { default: isDark ? '#121212' : '#F5F5F5', paper: isDark ? '#1E1E1E' : '#FFF' },
      text: { primary: isDark ? '#E0E0E0' : '#212121', secondary: isDark ? '#BDBDBD' : '#757575' },
      divider: isDark ? '#333' : '#E0E0E0',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 400, fontSize: '3.5rem', lineHeight: '4rem' },
      h2: { fontWeight: 400, fontSize: '2.75rem', lineHeight: '3.25rem' },
      h3: { fontWeight: 400, fontSize: '2.25rem', lineHeight: '2.75rem' },
      h4: { fontWeight: 500, fontSize: '1.5rem', lineHeight: '2rem' },
      h5: { fontWeight: 500, fontSize: '1.25rem', lineHeight: '1.75rem' },
      h6: { fontWeight: 500, fontSize: '1.1rem', lineHeight: '1.5rem' },
      subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: '1.5rem' },
      subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: '1.25rem' },
      body1: { fontSize: '1rem', lineHeight: '1.5rem' },
      body2: { fontSize: '0.875rem', lineHeight: '1.25rem' },
      caption: { fontSize: '0.75rem', lineHeight: '1rem' },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: { root: { borderRadius: 20, padding: '10px 24px', textTransform: 'none', fontWeight: 500 } },
        defaultProps: { disableElevation: true },
      },
      MuiCard: { styleOverrides: { root: { borderRadius: 16, border: 'none' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } } },
      MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 28 } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4, height: 8 }, bar: { borderRadius: 4 } } },
      MuiAvatar: { styleOverrides: { root: { borderRadius: 16 } } },
      MuiFab: { styleOverrides: { root: { borderRadius: 16 } } },
      MuiAppBar: { styleOverrides: { root: { boxShadow: 'none' } } },
      MuiListItem: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
    },
  });
}

export default function MUIThemeProvider({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
