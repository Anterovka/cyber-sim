'use client';

import { useAuthStore, useProgressStore } from '../lib/store';
import { useRouter, usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import {LockClosedIcon, GridIcon, BarChartIcon, StarFilledIcon, EnterIcon, SunIcon, MoonIcon, ExitIcon, ReloadIcon, GearIcon} from '@radix-ui/react-icons';
import { useThemeMode } from '../lib/ThemeModeContext';

const leagueConfig: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' }> = {
  beginner: { label: 'Новичок', color: 'default' },
  intermediate: { label: 'Средний', color: 'primary' },
  advanced: { label: 'Продвинутый', color: 'success' },
  expert: { label: 'Эксперт', color: 'success' },
};

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { progress } = useProgressStore();
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';


  if (pathname?.startsWith('/admin')) return null;

  const navItems = [
    { path: '/dashboard', label: 'Сценарии', icon: <GridIcon width={16} height={16} /> },
    { path: '/terminal', label: 'Терминал', icon: <LockClosedIcon width={16} height={16} /> },
    { path: '/leaderboard', label: 'Рейтинг', icon: <StarFilledIcon width={16} height={16} /> },
    { path: '/profile', label: 'Профиль', icon: <GearIcon width={16} height={16} /> },
  ];

  const isAdmin = isAuthenticated && user?.role === 'admin';

  const league = progress?.league || user?.league || 'beginner';
  const username = user?.username || '';
  const isLoggedIn = isAuthenticated && !!user;

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
        {}
        <Box onClick={() => router.push('/')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', mr: 4 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="CyberSim"
            sx={{ width: 60, height: 60, objectFit: 'contain' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
            CyberSim
          </Typography>
        </Box>

        {}
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {}
          <Tooltip title={mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
            <IconButton onClick={toggleMode} size="small" sx={{ mr: 1 }}>
              {mode === 'dark' ? <SunIcon width={20} height={20} /> : <MoonIcon width={20} height={20} />}
            </IconButton>
          </Tooltip>

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Button
                  onClick={() => router.push('/admin')}
                  variant={pathname?.startsWith('/admin') ? 'contained' : 'text'}
                  color="warning"
                  size="small"
                  startIcon={<GearIcon width={16} height={16} />}
                  sx={{ borderRadius: 2, minWidth: 'auto', px: 2, mr: 1 }}
                >
                  Админ
                </Button>
              )}
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  variant={pathname === item.path ? 'contained' : 'text'}
                  color="primary"
                  size="small"
                  startIcon={item.icon}
                  sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                >
                  {item.label}
                </Button>
              ))}

              <Divider orientation="vertical" flexItem sx={{ mx: 1.5, my: 1 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>{username}</Typography>
                  <Chip
                    label={leagueConfig[league]?.label}
                    size="small"
                    color={leagueConfig[league]?.color}
                    sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                  />
                </Box>
                <IconButton
                  onClick={logout}
                  size="small"
                  sx={{ bgcolor: isDark ? 'rgba(244,67,54,0.2)' : 'error.light', color: isDark ? '#ff8a80' : 'error.contrastText', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                >
                <ExitIcon width={18} height={18} />
                </IconButton>
              </Box>
            </>
          ) : (
            <Button onClick={() => router.push('/login')} variant="contained" color="primary" size="small" startIcon={<EnterIcon width={16} height={16} />} sx={{ borderRadius: 2 }}>
              Войти
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
