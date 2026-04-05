'use client';

import { useState, useEffect } from 'react';
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
import {LockClosedIcon, EnterIcon as LogIn} from '@radix-ui/react-icons';

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(loginInput, password);
  };

  if (isAuthenticated) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, width: '100%', borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'success.main', borderRadius: 2 }}>
              <LockClosedIcon width={32} height={32} color="white" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Вход в аккаунт</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Войдите, чтобы продолжить обучение</Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Email или имя пользователя" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} fullWidth required inputProps={{ minLength: 2 }} />
            <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required inputProps={{ minLength: 6 }} />

            {error && <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={isLoading} fullWidth startIcon={<LogIn width={18} height={18} />} sx={{ borderRadius: 1.5, py: 1.5 }}>
              {isLoading ? 'Загрузка...' : 'Войти'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Нет аккаунта?{' '}
              <Link component="button" onClick={() => router.push('/register')} sx={{ cursor: 'pointer', fontWeight: 600 }}>
                Зарегистрируйтесь
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
