'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  ExclamationTriangleIcon,
  GlobeIcon,
  LockClosedIcon,
  DesktopIcon,
  ClockIcon,
  ComponentInstanceIcon,
  ExitIcon,
} from '@radix-ui/react-icons';

interface PublicPCSimulatorProps {
  onAction: (action: string, data?: string) => void;
}

export default function PublicPCSimulator({
  onAction,
}: PublicPCSimulatorProps) {
  const [loggedOut, setLoggedOut] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [showThreats, setShowThreats] = useState(false);
  const [step, setStep] = useState<'discover' | 'action' | 'done'>('discover');

  const threats = [
    { icon: <ClockIcon />, title: 'История браузера', desc: 'Сохранены все посещённые сайты', danger: true },
    { icon: <LockClosedIcon />, title: 'Сохранённые пароли', desc: 'Доступ к аккаунтам предыдущего пользователя', danger: true },
    { icon: <ComponentInstanceIcon />, title: 'Кейлоггер', desc: 'Программа записывает нажатия клавиш', danger: true },
    { icon: <DesktopIcon />, title: 'Удалённый доступ', desc: 'Злоумышленник может видеть экран', danger: false },
  ];

  const handleLogout = () => {
    setLoggedOut(true);
    setStep('action');
  };

  const handleChangePassword = () => {
    setPasswordChanged(true);
    setStep('done');
    onAction('secure');
  };

  const handleIgnore = () => {
    setStep('done');
    onAction('ignore');
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${'#E0E0E0'}` }}>
      {}
      <Box sx={{ bgcolor: '#1a237e', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DesktopIcon />
          <Typography variant="body2">Публичный ПК • Интернет-кафе</Typography>
        </Box>
        <Chip label="Чужой компьютер" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
      </Box>

      <Box sx={{ p: 3 }}>
        {step === 'discover' && (
          <Box>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
              Вы зашли в почту с публичного компьютера и отошли на 5 минут, не выйдя из аккаунта.
            </Alert>

            <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>🖥️ Что вы видите на экране:</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><GlobeIcon style={{ color: '#2E7D32' }} /></ListItemIcon>
                  <ListItemText primary="Открытая почта" secondary="Ваш аккаунт всё ещё активен" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ClockIcon style={{ color: '#FF9800' }} /></ListItemIcon>
                  <ListItemText primary="История браузера" secondary="150+ посещённых сайтов" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LockClosedIcon style={{ color: '#4CAF50' }} /></ListItemIcon>
                  <ListItemText primary="Сохранённые пароли" secondary="23 аккаунта в менеджере паролей" />
                </ListItem>
              </List>
            </Paper>

            <Button variant="outlined" onClick={() => setShowThreats(true)} fullWidth sx={{ borderRadius: 1, mb: 2 }}>
              🔍 Проверить угрозы
            </Button>

            {showThreats && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#FFF8E1', borderColor: '#FF9800', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#E65100' }}>
                  Обнаруженные угрозы:
                </Typography>
                {threats.map((t, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {t.icon}
                    <Typography variant="body2" sx={{ fontWeight: t.danger ? 600 : 400 }}>
                      {t.title}: {t.desc}
                    </Typography>
                    {t.danger && <Chip label="Риск" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FFEBEE', color: '#D32F2F' }} />}
                  </Box>
                ))}
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" onClick={handleLogout} sx={{ borderRadius: 1, flex: 1 }}>
                <ExitIcon style={{ marginRight: 4, fontSize: 18 }} /> Выйти из аккаунта
              </Button>
              <Button variant="contained" onClick={handleChangePassword} sx={{ borderRadius: 1, flex: 1 }}>
                <LockClosedIcon style={{ marginRight: 4, fontSize: 18 }} /> Выйти + сменить пароль
              </Button>
              <Button variant="outlined" onClick={handleIgnore} sx={{ borderRadius: 1, flex: 1 }}>
                Ничего
              </Button>
            </Box>
          </Box>
        )}

        {step === 'action' && (
          <Box sx={{ textAlign: 'center' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>Вы вышли из аккаунта</Typography>
              <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
                Но пароль всё ещё может быть скомпрометирован кейлоггером.
              </Typography>
              <Button variant="contained" onClick={handleChangePassword} sx={{ borderRadius: 1 }}>
                Сменить пароль для безопасности
              </Button>
            </Paper>
          </Box>
        )}

        {step === 'done' && (
          <Box sx={{ textAlign: 'center' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>{loggedOut && passwordChanged ? 'ok' : 'fail'}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {loggedOut && passwordChanged ? 'Аккаунт защищён' : 'Аккаунт под угрозой'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
                {loggedOut && passwordChanged
                  ? 'Вы вышли из аккаунта и сменили пароль. Данные в безопасности.'
                  : 'Кейлоггер мог записать ваш пароль. Смените его с другого устройства.'}
              </Typography>
              <Button variant="contained" onClick={() => onAction('continue')} sx={{ borderRadius: 1 }}>
                Продолжить
              </Button>
            </Paper>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
