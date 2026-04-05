'use client';

import { useState } from 'react';
import { useAuthStore } from '../../lib/store';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import {LockClosedIcon, PersonIcon} from '@radix-ui/react-icons';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (password !== confirmPassword) return;
    await register(username, password, email);
  };

  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) { router.push('/dashboard'); return null; }

  const passwordsMatch = password === confirmPassword || confirmPassword.length === 0;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, width: '100%', borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'success.main', borderRadius: 2 }}>
              <PersonIcon width={32} height={32} color="white" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Регистрация</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Создайте аккаунт и начните обучение</Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth required inputProps={{ minLength: 3 }} />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required inputProps={{ type: 'email' }} />
            <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required inputProps={{ minLength: 6 }} />
            <TextField
              label="Подтвердите пароль"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              inputProps={{ minLength: 6 }}
              error={!passwordsMatch}
              helperText={!passwordsMatch ? 'Пароли не совпадают' : undefined}
            />

            {error && <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={isLoading || !passwordsMatch} fullWidth startIcon={<PersonIcon width={18} height={18} />} sx={{ borderRadius: 1.5, py: 1.5 }}>
              {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Уже есть аккаунт?{' '}
              <Link component="button" onClick={() => router.push('/login')} sx={{ cursor: 'pointer', fontWeight: 600 }}>
                Войдите
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component="button" onClick={() => router.push('/dashboard')} variant="caption" sx={{ cursor: 'pointer', color: 'text.disabled' }}>
              Пропустить и перейти к демо-режиму
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
