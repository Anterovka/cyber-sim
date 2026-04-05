'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { adminGetUser, adminUpdateUser, type AdminUserDetail } from '@/lib/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

const leagueConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Новичок', color: 'default' },
  intermediate: { label: 'Средний', color: 'primary' },
  advanced: { label: 'Продвинутый', color: 'success' },
  expert: { label: 'Эксперт', color: 'warning' },
};

export default function AdminUserDetail() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();

  const [adminUser, setAdminUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [league, setLeague] = useState('');
  const [role, setRole] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { isAuthenticated, user: authUser } = useAuthStore();
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    if (!isAuthenticated || authUser?.role !== 'admin') return;
    adminGetUser(userId)
      .then((data) => {
        if (!abortRef.current) {
          setAdminUser(data);
          setLeague(data.league);
          setRole(data.role);
          setTotalScore(data.totalScore);
        }
      })
      .catch(() => {})
      .finally(() => { if (!abortRef.current) setLoading(false); });
    return () => { abortRef.current = true; };
  }, [userId, isAuthenticated, authUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await adminUpdateUser(userId, { league, role, totalScore });
      setAdminUser((prev) => (prev ? { ...prev, ...updated } : null));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!adminUser) return null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}ч ${m}м`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => router.push('/admin/users')} variant="text" sx={{ borderRadius: 2 }}>Назад</Button>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{adminUser.username}</Typography>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 3 }}>Данные сохранены</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {}
        <Box>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Информация</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Email</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{adminUser.email}</Typography></Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Дата регистрации</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(adminUser.createdAt).toLocaleDateString('ru-RU')}</Typography></Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Лига</Typography><Chip label={leagueConfig[adminUser.league]?.label || adminUser.league} size="small" color={leagueConfig[adminUser.league]?.color as any} /></Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Роль</Typography><Chip label={adminUser.role === 'admin' ? 'Администратор' : 'Пользователь'} size="small" variant="outlined" color={adminUser.role === 'admin' ? 'warning' : 'default'} /></Box>
            </Box>
          </Paper>
        </Box>

        {}
        <Box>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Статистика</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Общие баллы</Typography><Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{adminUser.totalScore}</Typography></Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Баллы за сценарии</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{adminUser.totalScenarioScore}</Typography></Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Сценариев пройдено</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{adminUser.scenariosCompleted}</Typography></Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Ошибок</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>{adminUser.totalMistakes}</Typography></Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Время в обучении</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formatTime(adminUser.totalTimeSpent)}</Typography></Box>
            </Box>
          </Paper>
        </Box>

        {}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Редактирование</Typography>
            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <FormControl fullWidth><InputLabel>Лига</InputLabel><Select value={league} label="Лига" onChange={(e) => setLeague(e.target.value)}><MenuItem value="beginner">Новичок</MenuItem><MenuItem value="intermediate">Средний</MenuItem><MenuItem value="advanced">Продвинутый</MenuItem><MenuItem value="expert">Эксперт</MenuItem></Select></FormControl>
                <FormControl fullWidth><InputLabel>Роль</InputLabel><Select value={role} label="Роль" onChange={(e) => setRole(e.target.value)}><MenuItem value="user">Пользователь</MenuItem><MenuItem value="admin">Администратор</MenuItem></Select></FormControl>
                <TextField label="Общие баллы" type="number" value={totalScore} onChange={(e) => setTotalScore(parseInt(e.target.value) || 0)} fullWidth />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: 2 }}>{saving ? <CircularProgress size={20} /> : 'Сохранить'}</Button>
                  <Button variant="outlined" onClick={() => setEditing(false)} sx={{ borderRadius: 2 }}>Отмена</Button>
                </Box>
              </Box>
            ) : (
              <Button variant="outlined" onClick={() => setEditing(true)} sx={{ borderRadius: 2 }}>Редактировать</Button>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
