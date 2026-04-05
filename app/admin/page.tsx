'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { adminGetStats } from '@/lib/api';
import type { AdminStats } from '@/lib/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { PersonIcon, LaptopIcon, StarFilledIcon, BarChartIcon } from '@radix-ui/react-icons';
import { useThemeMode } from '@/lib/ThemeModeContext';

const leagueConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Новичок', color: 'default' },
  intermediate: { label: 'Средний', color: 'primary' },
  advanced: { label: 'Продвинутый', color: 'success' },
  expert: { label: 'Эксперт', color: 'warning' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    if (!isAuthenticated || user?.role !== 'admin') return;
    adminGetStats()
      .then((data) => { if (!abortRef.current) setStats(data); })
      .catch(() => {})
      .finally(() => { if (!abortRef.current) setLoading(false); });
    return () => { abortRef.current = true; };
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Пользователи', value: stats.totalUsers, icon: <PersonIcon width={24} height={24} />, color: '#2196F3', gradient: isDark ? 'linear-gradient(135deg,#1a2a3a,#0f1923)' : 'linear-gradient(135deg,#e3f2fd,#bbdefb)' },
    { label: 'Сценариев пройдено', value: stats.totalScenarios, icon: <LaptopIcon width={24} height={24} />, color: '#4CAF50', gradient: isDark ? 'linear-gradient(135deg,#1a3a2a,#0f2315)' : 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' },
    { label: 'Сертификатов', value: stats.totalCertificates, icon: <StarFilledIcon width={24} height={24} />, color: '#FF9800', gradient: isDark ? 'linear-gradient(135deg,#3a2a1a,#23190f)' : 'linear-gradient(135deg,#fff3e0,#ffe0b2)' },
    { label: 'Средний балл', value: Math.round(stats.averageScore), icon: <BarChartIcon width={24} height={24} />, color: '#9C27B0', gradient: isDark ? 'linear-gradient(135deg,#2a1a3a,#190f23)' : 'linear-gradient(135deg,#f3e5f5,#e1bee7)' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: 'text.primary' }}>Обзор</Typography>

      {}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {statCards.map((card) => (
          <Card key={card.label} sx={{ borderRadius: 2, background: card.gradient, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', boxShadow: 'none', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{card.label}</Typography>
                <Box sx={{ width: 44, height: 44, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: card.color, color: '#fff' }}>{card.icon}</Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '2.5rem', lineHeight: 1 }}>{card.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {}
        <Box>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Пользователи по лигам</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(stats.usersByLeague).map(([league, count]) => (
                <Box key={league} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip label={leagueConfig[league]?.label || league} size="small" color={leagueConfig[league]?.color as any} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {}
        <Box>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Последние регистрации</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stats.recentRegistrations.map((u: { id: string; username: string; createdAt: string }) => (
                <Box key={u.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.username}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Топ пользователей</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>Лига</TableCell>
                  <TableCell align="right">Баллы</TableCell>
                  <TableCell align="right">Сценариев</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.topUsers.map((u: { id: string; username: string; league: string; totalScore: number; scenariosCompleted: number }, i: number) => (
                  <TableRow key={u.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/users/${u.id}`)}>
                    <TableCell sx={{ fontWeight: 700, color: i < 3 ? 'success.main' : 'text.primary' }}>{i + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{u.username}</TableCell>
                    <TableCell><Chip label={leagueConfig[u.league]?.label || u.league} size="small" color={leagueConfig[u.league]?.color as any} /></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{u.totalScore}</TableCell>
                    <TableCell align="right">{u.scenariosCompleted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
