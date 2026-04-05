'use client';

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import {
  PlusIcon,
  TrashIcon,
  CopyIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeOpenIcon,
  EyeNoneIcon,
  MobileIcon,
  ArrowLeftIcon,
  DotsVerticalIcon,
} from '@radix-ui/react-icons';

export interface OTPAccount {
  id: string;
  name: string;
  service: string;
  secret: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: 6 | 8;
  period: number;
  icon?: string;
  color?: string;
  isVerified?: boolean;
  isSuspicious?: boolean;
}

interface OTPGeneratorSimulatorProps {
  accounts: OTPAccount[];
  onAction: (action: string, data?: any) => void;
  showSecurityWarnings?: boolean;
}

const serviceColors: Record<string, string> = {
  'Google': '#4285F4', 'GitHub': '#333', 'банк': '#21A038',
  'Яндекс': '#FC3F1D', 'VK': '#2787F5', 'Telegram': '#0088CC',
  'Microsoft': '#00A4EF', 'Apple': '#555',
};

export default function OTPGeneratorSimulator({
  accounts: initialAccounts, onAction, showSecurityWarnings = true,
}: OTPGeneratorSimulatorProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', service: '', secret: '' });
  const [verifyCode, setVerifyCode] = useState('');
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'success' | 'error' | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(initialAccounts[0]?.id || null);
  const [showAlert, setShowAlert] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const generateOTP = useCallback((secret: string, time: number, period: number, digits: number): string => {
    const input = secret + Math.floor(time / 1000 / period);
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString().padStart(digits, '0').slice(-digits);
  }, []);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setShowAlert('copied');
    onAction('copy_code', code);
    setTimeout(() => setShowAlert(null), 2000);
  };

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.service || !newAccount.secret) return;
    const newAcc: OTPAccount = {
      id: `otp-${Date.now()}`,
      name: newAccount.name,
      service: newAccount.service,
      secret: newAccount.secret,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      icon: newAccount.service[0],
      isVerified: false,
      isSuspicious: false,
    };
    setAccounts([...accounts, newAcc]);
    setShowAddDialog(false);
    setNewAccount({ name: '', service: '', secret: '' });
    setShowAlert('account_added');
    onAction('add_account', newAccount);
    setTimeout(() => setShowAlert(null), 3000);
  };

  const handleDeleteAccount = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setShowAlert('account_deleted');
    onAction('delete_account', accountId);
    setTimeout(() => setShowAlert(null), 3000);
  };

  const handleVerifyCode = () => {
    const account = accounts.find((a) => a.id === selectedAccount);
    if (!account) return;
    const expectedCode = generateOTP(account.secret, currentTime, account.period, account.digits);
    if (verifyCode === expectedCode) {
      setVerifyResult('success');
      onAction('verify_success', { accountId: selectedAccount });
    } else {
      setVerifyResult('error');
      onAction('verify_error', { accountId: selectedAccount, code: verifyCode });
    }
  };

  const timeRemaining = accounts.length > 0 ? accounts[0].period - (Math.floor(currentTime / 1000) % accounts[0].period) : 0;
  const progress = accounts.length > 0 ? (timeRemaining / accounts[0].period) * 100 : 0;
  const suspiciousAccounts = accounts.filter((a) => a.isSuspicious);

  return (
    <Paper sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', border: '1px solid #E0E0E0', bgcolor: '#FFFFFF', maxWidth: 420, mx: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'relative' }}>
      {}
      <Box sx={{ bgcolor: '#FFFFFF', px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F0F0' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>9:41</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <MobileIcon style={{ fontSize: 14 }} />
          <Box sx={{ width: 22, height: 10, border: '1.5px solid #333', borderRadius: 2, position: 'relative' }}>
            <Box sx={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: 16, bgcolor: '#333', borderRadius: 1 }} />
          </Box>
        </Box>
      </Box>

      {}
      <Box sx={{ bgcolor: '#FFFFFF', px: 2.5, py: 2, borderBottom: '1px solid #F0F0F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LockClosedIcon style={{ color: '#4285F4', fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '1.25rem', color: '#202124' }}>Google Authenticator</Typography>
            <Typography sx={{ color: '#5F6368', fontSize: '0.8rem' }}>Одноразовые коды</Typography>
          </Box>
          <IconButton size="small" onClick={() => setShowAddDialog(true)} sx={{ bgcolor: '#F1F3F4', '&:hover': { bgcolor: '#E8EAED' } }}>
            <PlusIcon style={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {}
      {showSecurityWarnings && suspiciousAccounts.length > 0 && (
        <Box sx={{ px: 2.5, py: 1.5 }}>
          <Alert severity="warning" sx={{ borderRadius: 1.5, fontSize: '0.8rem' }} icon={<ExclamationTriangleIcon />}>
            <AlertTitle sx={{ fontSize: '0.85rem' }}>Подозрительные аккаунты</AlertTitle>
            Обнаружено {suspiciousAccounts.length} аккаунтов, которые вы не добавляли
          </Alert>
        </Box>
      )}

      {}
      {accounts.length > 0 && (
        <Box sx={{ px: 2.5, py: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ color: '#5F6368', fontSize: '0.75rem' }}>Коды обновятся через</Typography>
            <Typography sx={{ color: '#5F6368', fontWeight: 600, fontSize: '0.85rem' }}>{timeRemaining}с</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              borderRadius: 2,
              height: 4,
              bgcolor: '#E8EAED',
              '& .MuiLinearProgress-bar': {
                bgcolor: timeRemaining <= 10 ? '#EA4335' : timeRemaining <= 20 ? '#FBBC04' : '#34A853',
                transition: 'width 1s linear, background-color 0.3s',
              },
            }}
          />
        </Box>
      )}

      {}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, pb: 1 }}>
        {accounts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LockClosedIcon style={{ fontSize: 64, color: '#E0E0E0', marginBottom: 16 }} />
            <Typography sx={{ color: '#5F6368', mb: 1, fontWeight: 500, fontSize: '1.1rem' }}>Нет аккаунтов</Typography>
            <Typography sx={{ color: '#9AA0A6', display: 'block', mb: 2.5, fontSize: '0.85rem' }}>Добавьте аккаунт для генерации кодов</Typography>
            <Button variant="contained" onClick={() => setShowAddDialog(true)} sx={{ borderRadius: 2, bgcolor: '#1A73E8', '&:hover': { bgcolor: '#1557B0' } }}>
              Добавить аккаунт
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {accounts.map((account) => {
              const code = generateOTP(account.secret, currentTime, account.period, account.digits);
              const color = serviceColors[account.service] || '#5F6368';

              return (
                <Paper
                  key={account.id}
                  onClick={() => setSelectedAccount(account.id)}
                  sx={{
                    p: 2,
                    mb: 0.75,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: account.isSuspicious ? '#FFF8E1' : '#FFFFFF',
                    border: account.id === selectedAccount ? '2px solid #1A73E8' : '1px solid #E0E0E0',
                    '&:hover': { bgcolor: '#F8F9FA' },
                    transition: 'all 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: account.isSuspicious ? '#FF9800' : color, borderRadius: '50%', fontSize: '1.1rem', fontWeight: 700 }}>
                      {account.icon || account.service[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 600, color: '#202124', fontSize: '0.95rem' }}>{account.service}</Typography>
                        {account.isSuspicious && <ExclamationTriangleIcon style={{ color: '#FF9800', fontSize: 16 }} />}
                      </Box>
                      <Typography sx={{ color: '#5F6368', fontSize: '0.8rem' }}>{account.name}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        sx={{
                          fontWeight: 400,
                          fontFamily: 'monospace',
                          letterSpacing: '0.12em',
                          color: account.isSuspicious ? '#FF9800' : '#202124',
                          fontSize: '1.6rem',
                        }}
                      >
                        {code.slice(0, code.length / 2)} {code.slice(code.length / 2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleCopyCode(code, e)}
                        sx={{ width: 32, height: 32, bgcolor: '#F1F3F4', '&:hover': { bgcolor: '#E8EAED' } }}
                      >
                        <CopyIcon style={{ fontSize: 16, color: '#5F6368' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteAccount(account.id, e)}
                        sx={{ width: 32, height: 32, bgcolor: '#F1F3F4', '&:hover': { bgcolor: '#FCE8E6' } }}
                      >
                        <TrashIcon style={{ fontSize: 16, color: '#D93025' }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {account.isSuspicious && (
                    <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 1.5, fontSize: '0.75rem' }}>
                      <Typography sx={{ fontSize: '0.75rem' }}>Вы не добавляли этот аккаунт. Возможно, кто-то получил доступ к вашему устройству.</Typography>
                    </Alert>
                  )}
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      {}
      {accounts.length > 0 && (
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0', display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => { setShowVerifyDialog(true); setVerifyResult(null); setVerifyCode(''); }}
            sx={{ borderRadius: 2, color: '#1A73E8', borderColor: '#1A73E8' }}
          >
            Проверить код
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowAddDialog(true)}
            startIcon={<PlusIcon />}
            sx={{ borderRadius: 2, bgcolor: '#1A73E8', '&:hover': { bgcolor: '#1557B0' } }}
          >
            Добавить
          </Button>
        </Box>
      )}

      {}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PlusIcon style={{ fontSize: 20 }} />
          Добавить аккаунт
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1, minWidth: 300 }}>
            <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: '0.8rem' }}>
              <Typography sx={{ fontSize: '0.75rem' }}>Введите секретный ключ из сервиса или отсканируйте QR-код</Typography>
            </Alert>
            <TextField label="Имя" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} fullWidth size="small" placeholder="your@email.com" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
            <TextField label="Сервис" value={newAccount.service} onChange={(e) => setNewAccount({ ...newAccount, service: e.target.value })} fullWidth size="small" placeholder="Google, GitHub, etc." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
            <TextField
              label="Секретный ключ"
              type={showSecret ? 'text' : 'password'}
              value={newAccount.secret}
              onChange={(e) => setNewAccount({ ...newAccount, secret: e.target.value })}
              fullWidth
              size="small"
              placeholder="JBSWY3DPEHPK3PXP"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => setShowSecret(!showSecret)} edge="end">
                    {showSecret ? <EyeNoneIcon /> : <EyeOpenIcon />}
                  </IconButton>
                ),
              }}
            />
            <Button variant="outlined" fullWidth sx={{ borderRadius: 1.5, color: '#5F6368', borderColor: '#DADCE0' }}>
              <span style={{ marginRight: 8 }}>📷</span> Сканировать QR-код
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowAddDialog(false)} sx={{ color: '#5F6368' }}>Отмена</Button>
          <Button onClick={handleAddAccount} variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#1A73E8', '&:hover': { bgcolor: '#1557B0' } }}>Добавить</Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog open={showVerifyDialog} onClose={() => { setShowVerifyDialog(false); setVerifyResult(null); }} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Проверка кода</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1, minWidth: 300 }}>
            {selectedAccount && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: serviceColors[accounts.find((a) => a.id === selectedAccount)?.service || ''] || '#5F6368', borderRadius: '50%' }}>
                  {accounts.find((a) => a.id === selectedAccount)?.icon || accounts.find((a) => a.id === selectedAccount)?.service[0]}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{accounts.find((a) => a.id === selectedAccount)?.service}</Typography>
                  <Typography sx={{ color: '#5F6368', fontSize: '0.8rem' }}>{accounts.find((a) => a.id === selectedAccount)?.name}</Typography>
                </Box>
              </Box>
            )}
            <TextField
              label="Код подтверждения"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              fullWidth
              size="small"
              placeholder="123456"
              inputProps={{ style: { textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.3em', fontFamily: 'monospace' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
            {verifyResult === 'success' && (
              <Alert severity="success" sx={{ borderRadius: 1.5 }}>
                <AlertTitle>Код верный!</AlertTitle>
                <Typography sx={{ fontSize: '0.75rem' }}>Двухфакторная аутентификация работает корректно.</Typography>
              </Alert>
            )}
            {verifyResult === 'error' && (
              <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                <AlertTitle>Неверный код</AlertTitle>
                <Typography sx={{ fontSize: '0.75rem' }}>Попробуйте снова. Убедитесь, что время на устройстве синхронизировано.</Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setShowVerifyDialog(false); setVerifyResult(null); }} sx={{ color: '#5F6368' }}>Отмена</Button>
          <Button onClick={handleVerifyCode} variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#1A73E8', '&:hover': { bgcolor: '#1557B0' } }}>Проверить</Button>
        </DialogActions>
      </Dialog>

      {}
      {showAlert && (
        <Box sx={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Alert severity={showAlert === 'copied' || showAlert === 'account_added' || showAlert === 'account_deleted' ? 'success' : 'info'} sx={{ borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {showAlert === 'copied' && '📋 Код скопирован'}
            {showAlert === 'account_added' && '✅ Аккаунт добавлен'}
            {showAlert === 'account_deleted' && '🗑️ Аккаунт удалён'}
          </Alert>
        </Box>
      )}
    </Paper>
  );
}
