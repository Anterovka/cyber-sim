'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PlusCircledIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeOpenIcon,
  EyeNoneIcon,
  BellIcon,
  GearIcon,
  QuestionMarkCircledIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  Cross1Icon,
} from '@radix-ui/react-icons';

export interface BankAccount {
  id: string;
  name: string;
  type: 'card' | 'account' | 'deposit';
  balance: number;
  currency: string;
  last4: string;
  isBlocked?: boolean;
}

export interface BankTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  merchant: string;
  date: string;
  isSuspicious?: boolean;
  status: 'completed' | 'pending' | 'blocked';
}

interface MobileBankingProps {
  accounts: BankAccount[];
  transactions: BankTransaction[];
  selectedAccountId?: string | null;
  onAction: (action: string, data?: any) => void;
  showSuspiciousWarnings?: boolean;
}

type TabValue = 'home' | 'history' | 'payments' | 'more';

const catIcons: Record<string, string> = {
  'Продукты': '🛒', 'Перевод': '💸', 'Развлечения': '🎮', 'Снятие': '🏧',
  'Подписки': '📺', 'Транспорт': '🚕', 'Рестораны': '🍕', 'Здоровье': '💊',
  'Одежда': '👕', 'Связь': '📱', 'ЖКХ': '🏠',
};

export default function MobileBanking({
  accounts, transactions, selectedAccountId = null, onAction, showSuspiciousWarnings = true,
}: MobileBankingProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('home');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({ to: '', amount: '', message: '' });
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);
  const [showTxDetails, setShowTxDetails] = useState(false);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const suspiciousTx = transactions.filter((t) => t.isSuspicious);

  const handleTxClick = (tx: BankTransaction) => {
    setSelectedTx(tx);
    setShowTxDetails(true);
    if (tx.isSuspicious) onAction('suspicious_transaction', tx);
  };


  if (activeTab === 'home') return (
    <Box sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', bgcolor: '#F2F3F5', maxWidth: 420, mx: 'auto', position: 'relative' }}>
      {}
      <Box sx={{ bgcolor: '#FFFFFF', px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>9:41</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box sx={{ width: 18, height: 10, border: '1.5px solid #333', borderRadius: 2, position: 'relative' }}>
            <Box sx={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: 14, bgcolor: '#333', borderRadius: 1 }} />
          </Box>
        </Box>
      </Box>

      {}
      <Box sx={{ bgcolor: '#FFFFFF', px: 2.5, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#21A038' }}>банк</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="medium"><BellIcon style={{ fontSize: 22, color: '#666' }} /></IconButton>
        </Box>
      </Box>

      {}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, pb: 1 }}>
        {}
        {showSuspiciousWarnings && suspiciousTx.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem' }} icon={<ExclamationTriangleIcon />}>
            <AlertTitle sx={{ fontSize: '0.85rem' }}>Подозрительные операции</AlertTitle>
            Обнаружено {suspiciousTx.length} транзакций, которые вы не совершали
          </Alert>
        )}

        {}
        <Box sx={{ mb: 2.5 }}>
          {accounts.map((acc, idx) => (
            <Paper
              key={acc.id}
              onClick={() => onAction('select_account', acc.id)}
              sx={{
                p: 2.5,
                borderRadius: 3,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                background: acc.isBlocked
                  ? 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%)'
                  : 'linear-gradient(135deg, #1B5E20 0%, #21A038 50%, #4CAF50 100%)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(33,160,56,0.25)',
                mb: 1.5,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' },
              }}
            >
              <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
              <Box sx={{ position: 'absolute', bottom: -40, right: 50, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ opacity: 0.9, fontWeight: 500, fontSize: '0.9rem' }}>{acc.name}</Typography>
                  {acc.isBlocked && <Chip label="Заблокирована" size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />}
                </Box>

                <Typography sx={{ fontWeight: 700, mb: 0.5, fontSize: '2rem' }}>
                  {balanceVisible ? `${acc.balance.toLocaleString('ru-RU')} ${acc.currency}` : '••••••'}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 3 }}>
                  <Typography sx={{ opacity: 0.8, fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '0.2em' }}>
                    •••• {acc.last4}
                  </Typography>
                  <Typography sx={{ opacity: 0.7, fontSize: '0.75rem', fontWeight: 600 }}>
                    {acc.type === 'card' ? 'VISA' : acc.type === 'account' ? 'СЧЁТ' : 'ВКЛАД'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {}
        <Paper sx={{ p: 2, mb: 2.5, borderRadius: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
            {[
              { icon: '💸', label: 'Перевод', action: () => setShowTransfer(true) },
              { icon: '📱', label: 'Платежи', action: () => onAction('payments') },
              { icon: '➕', label: 'Пополнить', action: () => onAction('top_up') },
              { icon: '📊', label: 'Аналитика', action: () => onAction('analytics') },
            ].map((item, idx) => (
              <Button key={idx} onClick={item.action} sx={{ flexDirection: 'column', py: 1.5, px: 0.5, borderRadius: 2, '&:hover': { bgcolor: '#F5F5F5' } }}>
                <span style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</span>
                <Typography sx={{ fontSize: '0.7rem', color: '#757575' }}>{item.label}</Typography>
              </Button>
            ))}
          </Box>
        </Paper>

        {}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Сегодня</Typography>
          <Button size="small" onClick={() => setActiveTab('history')} sx={{ color: '#21A038', fontSize: '0.85rem', fontWeight: 600 }}>Все →</Button>
        </Box>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {transactions.slice(0, 6).map((tx, idx) => (
            <Box key={tx.id}>
              <ListItem
                onClick={() => handleTxClick(tx)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: tx.isSuspicious ? '#FFF8E1' : '#FFFFFF',
                  '&:hover': { bgcolor: '#F5F5F5' },
                  py: 1.5,
                  px: 2,
                  borderLeft: tx.isSuspicious ? '3px solid #FF9800' : '3px solid transparent',
                }}
              >
                <ListItemAvatar sx={{ minWidth: 48 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: tx.isSuspicious ? '#FFF3E0' : '#F5F5F5', borderRadius: 2, fontSize: '1.4rem' }}>
                    {catIcons[tx.category] || (tx.type === 'income' ? '💰' : '💳')}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.merchant}</Typography>
                      {tx.isSuspicious && <ExclamationTriangleIcon style={{ color: '#FF9800', fontSize: 16 }} />}
                    </Box>
                  }
                  secondary={
                    <Box component="div">
                      <Typography sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>{tx.category}</Typography>
                      {tx.status === 'blocked' && (
                        <Chip label="Отклонено" size="small" sx={{ ml: 1, mt: 0.5, height: 20, fontSize: '0.7rem', bgcolor: '#FFEBEE', color: '#D32F2F' }} />
                      )}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
                <Typography sx={{ fontWeight: 700, color: tx.type === 'income' ? '#21A038' : '#212121', fontSize: '1rem' }}>
                  {tx.type === 'income' ? '+' : '−'}{tx.amount.toLocaleString('ru-RU')} {tx.currency}
                </Typography>
              </ListItem>
              {idx < Math.min(transactions.length, 6) - 1 && <Divider sx={{ ml: 16 }} />}
            </Box>
          ))}
        </Paper>
      </Box>

      {}
      <Box sx={{ bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0', display: 'flex', pb: 1, pt: 0.5 }}>
        {[
          { value: 'home' as TabValue, icon: '🏠', label: 'Главная' },
          { value: 'history' as TabValue, icon: '📋', label: 'История' },
          { value: 'payments' as TabValue, icon: '💳', label: 'Платежи' },
          { value: 'more' as TabValue, icon: '⚙️', label: 'Ещё' },
        ].map((tab) => (
          <Button key={tab.value} onClick={() => setActiveTab(tab.value)} sx={{ flex: 1, flexDirection: 'column', py: 0.75, color: activeTab === tab.value ? '#21A038' : '#9E9E9E', borderRadius: 0, minWidth: 0 }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <Typography sx={{ fontSize: '0.65rem', mt: 0.25, fontWeight: activeTab === tab.value ? 600 : 400 }}>{tab.label}</Typography>
          </Button>
        ))}
      </Box>

      {}
      <Dialog open={showTransfer} onClose={() => setShowTransfer(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Перевод</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
            <TextField label="Получатель" value={transferForm.to} onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })} fullWidth size="small" placeholder="Телефон или карта" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Сумма" type="number" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} fullWidth size="small" placeholder="0 ₽" InputProps={{ endAdornment: <Typography sx={{ color: '#9E9E9E' }}>₽</Typography> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Сообщение" value={transferForm.message} onChange={(e) => setTransferForm({ ...transferForm, message: e.target.value })} fullWidth size="small" placeholder="Необязательно" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowTransfer(false)} sx={{ color: '#757575' }}>Отмена</Button>
          <Button onClick={() => { onAction('transfer', transferForm); setShowTransfer(false); }} variant="contained" sx={{ borderRadius: 2, bgcolor: '#21A038', px: 3, fontWeight: 600 }}>Перевести</Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog open={showTxDetails} onClose={() => setShowTxDetails(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedTx && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: selectedTx.isSuspicious ? '#FFF3E0' : '#F5F5F5', fontSize: '1.2rem' }}>{catIcons[selectedTx.category] || '💳'}</Avatar>
              {selectedTx.merchant}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: selectedTx.type === 'income' ? '#21A038' : '#212121' }}>
                  {selectedTx.type === 'income' ? '+' : '−'}{selectedTx.amount.toLocaleString('ru-RU')} {selectedTx.currency}
                </Typography>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#9E9E9E' }}>Категория</Typography><Typography sx={{ fontWeight: 500 }}>{selectedTx.category}</Typography></Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#9E9E9E' }}>Дата</Typography><Typography sx={{ fontWeight: 500 }}>{selectedTx.date}</Typography></Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#9E9E9E' }}>Статус</Typography><Typography sx={{ fontWeight: 500 }}>{selectedTx.status === 'completed' ? '✅ Выполнено' : selectedTx.status === 'pending' ? '⏳ В обработке' : '❌ Отклонено'}</Typography></Box>
                {selectedTx.isSuspicious && (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <AlertTitle>Подозрительная операция</AlertTitle>
                    Вы не совершали эту транзакцию. Рекомендуем заблокировать и сообщить в банк.
                  </Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setShowTxDetails(false)}>Закрыть</Button>
              {selectedTx.isSuspicious && (
                <Button onClick={() => { onAction('block_transaction', selectedTx.id); setShowTxDetails(false); }} color="error" variant="outlined" sx={{ borderRadius: 2 }}>Заблокировать</Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );


  if (activeTab === 'history') return (
    <Box sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', bgcolor: '#F2F3F5', maxWidth: 420, mx: 'auto' }}>
      <Box sx={{ bgcolor: '#FFFFFF', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #E0E0E0' }}>
        <IconButton size="small" onClick={() => setActiveTab('home')}><ArrowLeftIcon /></IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>История операций</Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        {transactions.map((tx) => (
          <Paper key={tx.id} onClick={() => handleTxClick(tx)} sx={{ p: 2, mb: 1.5, borderRadius: 3, cursor: 'pointer', bgcolor: tx.isSuspicious ? '#FFF8E1' : '#FFFFFF', '&:hover': { bgcolor: '#F5F5F5' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: tx.isSuspicious ? '#FFF3E0' : '#F5F5F5', borderRadius: 2, fontSize: '1.4rem' }}>{catIcons[tx.category] || '💳'}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.merchant}</Typography>
                  {tx.isSuspicious && <ExclamationTriangleIcon style={{ color: '#FF9800', fontSize: 16 }} />}
                </Box>
                <Typography sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>{tx.category} • {tx.date}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, color: tx.type === 'income' ? '#21A038' : '#212121' }}>
                {tx.type === 'income' ? '+' : '−'}{tx.amount.toLocaleString('ru-RU')} {tx.currency}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
      <Box sx={{ bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0', display: 'flex', pb: 1, pt: 0.5 }}>
        {[
          { value: 'home' as TabValue, icon: '🏠', label: 'Главная' },
          { value: 'history' as TabValue, icon: '📋', label: 'История' },
          { value: 'payments' as TabValue, icon: '💳', label: 'Платежи' },
          { value: 'more' as TabValue, icon: '⚙️', label: 'Ещё' },
        ].map((tab) => (
          <Button key={tab.value} onClick={() => setActiveTab(tab.value)} sx={{ flex: 1, flexDirection: 'column', py: 0.75, color: activeTab === tab.value ? '#21A038' : '#9E9E9E', borderRadius: 0, minWidth: 0 }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <Typography sx={{ fontSize: '0.65rem', mt: 0.25, fontWeight: activeTab === tab.value ? 600 : 400 }}>{tab.label}</Typography>
          </Button>
        ))}
      </Box>
    </Box>
  );


  if (activeTab === 'payments') return (
    <Box sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', bgcolor: '#F2F3F5', maxWidth: 420, mx: 'auto' }}>
      <Box sx={{ bgcolor: '#FFFFFF', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #E0E0E0' }}>
        <IconButton size="small" onClick={() => setActiveTab('home')}><ArrowLeftIcon /></IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Платежи</Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 2, fontSize: '1.05rem' }}>Категории</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {[
              { icon: '📱', label: 'Мобильная связь' },
              { icon: '🏠', label: 'ЖКХ' },
              { icon: '⚡', label: 'Электричество' },
              { icon: '🌐', label: 'Интернет' },
              { icon: '🎮', label: 'Развлечения' },
              { icon: '🚕', label: 'Транспорт' },
            ].map((cat, idx) => (
              <Button key={idx} onClick={() => onAction('payment_category', cat.label)} sx={{ flexDirection: 'column', py: 2, borderRadius: 3, bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#EEEEEE' } }}>
                <span style={{ fontSize: 32, marginBottom: 6 }}>{cat.icon}</span>
                <Typography sx={{ fontSize: '0.75rem', color: '#757575' }}>{cat.label}</Typography>
              </Button>
            ))}
          </Box>
        </Paper>
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: '1.05rem' }}>Избранные</Typography>
          {['МТС +7 (999) 123-45-67', 'Мосэнергосбыт Л/С 123456', 'Ростелеком Л/С 789012'].map((item, idx) => (
            <ListItem key={idx} onClick={() => onAction('payment_favorite', item)} sx={{ cursor: 'pointer', borderRadius: 2, '&:hover': { bgcolor: '#F5F5F5' }, px: 1, py: 1 }}>
              <ListItemAvatar><Avatar sx={{ bgcolor: '#E8F5E9', borderRadius: 2, fontSize: '1.2rem' }}>💳</Avatar></ListItemAvatar>
              <ListItemText primary={<Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{item}</Typography>} />
            </ListItem>
          ))}
        </Paper>
      </Box>
      <Box sx={{ bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0', display: 'flex', pb: 1, pt: 0.5 }}>
        {[
          { value: 'home' as TabValue, icon: '🏠', label: 'Главная' },
          { value: 'history' as TabValue, icon: '📋', label: 'История' },
          { value: 'payments' as TabValue, icon: '💳', label: 'Платежи' },
          { value: 'more' as TabValue, icon: '⚙️', label: 'Ещё' },
        ].map((tab) => (
          <Button key={tab.value} onClick={() => setActiveTab(tab.value)} sx={{ flex: 1, flexDirection: 'column', py: 0.75, color: activeTab === tab.value ? '#21A038' : '#9E9E9E', borderRadius: 0, minWidth: 0 }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <Typography sx={{ fontSize: '0.65rem', mt: 0.25, fontWeight: activeTab === tab.value ? 600 : 400 }}>{tab.label}</Typography>
          </Button>
        ))}
      </Box>
    </Box>
  );


  return (
    <Box sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', bgcolor: '#F2F3F5', maxWidth: 420, mx: 'auto' }}>
      <Box sx={{ bgcolor: '#FFFFFF', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #E0E0E0' }}>
        <IconButton size="small" onClick={() => setActiveTab('home')}><ArrowLeftIcon /></IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Ещё</Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        <Paper sx={{ p: 3, mb: 2, borderRadius: 3, textAlign: 'center' }}>
          <Avatar sx={{ width: 72, height: 72, mx: 'auto', mb: 1.5, bgcolor: '#21A038', fontSize: '1.8rem' }}>👤</Avatar>
          <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>Иван Иванов</Typography>
          <Typography sx={{ color: '#9E9E9E', fontSize: '0.85rem' }}>+7 (999) 123-45-67</Typography>
        </Paper>
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {[
            { icon: <LockClosedIcon />, title: 'Безопасность', desc: '2FA, биометрия' },
            { icon: <BellIcon />, title: 'Уведомления', desc: 'Push, SMS' },
            { icon: <QuestionMarkCircledIcon />, title: 'Помощь', desc: 'Чат, звонки' },
            { icon: <GearIcon />, title: 'Настройки', desc: 'Тема, язык' },
          ].map((item, idx) => (
            <Box key={item.title}>
              <ListItem onClick={() => onAction('settings', item.title)} sx={{ cursor: 'pointer', py: 2, '&:hover': { bgcolor: '#F5F5F5' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box sx={{ color: '#21A038', fontSize: 22 }}>{item.icon}</Box>
                  <ListItemText primary={<Typography sx={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.title}</Typography>} secondary={item.desc} />
                </Box>
              </ListItem>
              {idx < 3 && <Divider sx={{ ml: 12 }} />}
            </Box>
          ))}
        </Paper>
      </Box>
      <Box sx={{ bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0', display: 'flex', pb: 1, pt: 0.5 }}>
        {[
          { value: 'home' as TabValue, icon: '🏠', label: 'Главная' },
          { value: 'history' as TabValue, icon: '📋', label: 'История' },
          { value: 'payments' as TabValue, icon: '💳', label: 'Платежи' },
          { value: 'more' as TabValue, icon: '⚙️', label: 'Ещё' },
        ].map((tab) => (
          <Button key={tab.value} onClick={() => setActiveTab(tab.value)} sx={{ flex: 1, flexDirection: 'column', py: 0.75, color: activeTab === tab.value ? '#21A038' : '#9E9E9E', borderRadius: 0, minWidth: 0 }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <Typography sx={{ fontSize: '0.65rem', mt: 0.25, fontWeight: activeTab === tab.value ? 600 : 400 }}>{tab.label}</Typography>
          </Button>
        ))}
      </Box>
    </Box>
  );
}
