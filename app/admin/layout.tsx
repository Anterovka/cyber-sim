'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import {
  DashboardIcon,
  PersonIcon,
  StarIcon,
  ArrowLeftIcon,
  GearIcon,
  LaptopIcon,
} from '@radix-ui/react-icons';
import { useThemeMode } from '@/lib/ThemeModeContext';

const DRAWER_WIDTH = 260;

const navItems = [
  { path: '/admin', label: 'Дашборд', icon: <DashboardIcon /> },
  { path: '/admin/users', label: 'Пользователи', icon: <PersonIcon /> },
  { path: '/admin/certificates', label: 'Сертификаты', icon: <StarIcon /> },
  { path: '/admin/scenarios/import', label: 'Импорт сценариев', icon: <LaptopIcon /> },
];

const COLORS = {
  dark: {
    sidebar: '#0f0f0f',
    sidebarBorder: '#1e1e1e',
    activeBg: '#1a3a2a',
    activeBorder: '#22c55e',
    inactiveHover: 'rgba(255,255,255,0.06)',
    text: '#e0e0e0',
    textSecondary: '#888',
    divider: '#1e1e1e',
  },
  light: {
    sidebar: '#f5f5f5',
    sidebarBorder: '#e0e0e0',
    activeBg: '#e8f5e9',
    activeBorder: '#4caf50',
    inactiveHover: 'rgba(0,0,0,0.04)',
    text: '#333',
    textSecondary: '#999',
    divider: '#e8e8e8',
  },
};

function getInitials(username: string): string {
  return username
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const c = isDark ? COLORS.dark : COLORS.light;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: c.sidebarBorder,
            bgcolor: c.sidebar,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {}
        <Box sx={{ p: 2.5, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="CyberSim"
              sx={{ width: 36, height: 36, objectFit: 'contain' }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2, color: c.text }}>
                CyberSim
              </Typography>
              <Chip
                label="ADMIN"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  bgcolor: 'rgba(76,175,80,0.15)',
                  color: '#4caf50',
                  border: '1px solid rgba(76,175,80,0.3)',
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: c.divider }} />

        {}
        <List sx={{ px: 1.5, py: 1, flexGrow: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={item.label} placement="right" arrow>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => router.push(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      pr: 2,
                      ...(isActive
                        ? {
                            bgcolor: c.activeBg,
                            color: '#4caf50',
                            fontWeight: 600,
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 3,
                              height: '60%',
                              borderRadius: '0 2px 2px 0',
                              bgcolor: c.activeBorder,
                            },
                          }
                        : {
                            color: c.textSecondary,
                            '&:hover': { bgcolor: c.inactiveHover },
                          }),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'inherit',
                        minWidth: 40,
                        '& svg, & > span': {
                          width: 20,
                          height: 20,
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ borderColor: c.divider }} />

        {}
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1,
              borderRadius: 2,
              bgcolor: c.inactiveHover,
              cursor: 'pointer',
              '&:hover': { opacity: 0.85 },
            }}
            onClick={() => router.push('/')}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#4caf50',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {getInitials(user?.username || 'U')}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: c.text,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.username}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontSize: '0.65rem', color: c.textSecondary }}
              >
                На сайт →
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4, xl: 6 },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
