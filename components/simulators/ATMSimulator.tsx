'use client';
'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import {CardStackIcon, VideoIcon, ExclamationTriangleIcon, CheckCircledIcon, CrossCircledIcon, LockClosedIcon, MagnifyingGlassIcon} from '@radix-ui/react-icons';

interface ATMSimulatorProps {
  onAction: (action: string, data?: string) => void;
}

export default function ATMSimulator({
  onAction,
}: ATMSimulatorProps) {
  const [pin, setPin] = useState('');
  const [cardInserted, setCardInserted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [step, setStep] = useState<'inspect' | 'card' | 'pin' | 'done'>('inspect');

  const handleInspect = () => {
    setShowWarning(true);
    setStep('inspect');
  };

  const handleInsertCard = () => {
    setCardInserted(true);
    setStep('card');
  };

  const handleEnterPin = () => {
    if (pin.length === 4) {
      setStep('done');
      onAction('enter_pin', pin);
    }
  };

  const handleReport = () => {
    setStep('done');
    onAction('report_atm');
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${'#E0E0E0'}`, bgcolor: '#F5F5F5' }}>
      {}
      <Box sx={{ p: 3, bgcolor: '#263238', color: 'white', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>🏧 Банкомат</Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>Осмотр перед использованием</Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {}
        {step === 'inspect' && (
          <Box>
            <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>🔍 Осмотрите банкомат:</Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Paper sx={{ p: 2, bgcolor: '#FFF8E1', border: '1px solid #FF9800', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CardStackIcon color="#FF9800" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Картоприёмник</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#E65100' }}>Накладка толще обычного</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: '#FFF8E1', border: '1px solid #FF9800', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <VideoIcon color="#FF9800" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Клавиатура</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#E65100' }}>Подозрительный объект рядом</Typography>
                </Paper>
              </Box>

              {showWarning && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
                  Обнаружены признаки скиммера! Не используйте этот банкомат.
                </Alert>
              )}
            </Paper>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" onClick={handleInspect} sx={{ borderRadius: 1, flex: 1 }}>
                🔍 Осмотреть внимательнее
              </Button>
              <Button variant="contained" onClick={handleInsertCard} sx={{ borderRadius: 1, flex: 1 }}>
                Вставить карту
              </Button>
              <Button variant="outlined" color="error" onClick={handleReport} sx={{ borderRadius: 1, flex: 1 }}>
                🚨 Сообщить в банк
              </Button>
            </Box>
          </Box>
        )}

        {}
        {step === 'card' && (
          <Box sx={{ textAlign: 'center' }}>
            <Paper variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 1 }}>
              <CardStackIcon width={48} height={48} color="#2E7D32" />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Карта вставлена</Typography>
              <Typography variant="body2" sx={{ color: '#757575' }}>Введите PIN-код для продолжения</Typography>
            </Paper>
            <TextField
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="****"
              inputProps={{ maxLength: 4, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' } }}
              sx={{ mb: 2, width: 200 }}
            />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="contained" onClick={handleEnterPin} disabled={pin.length !== 4} sx={{ borderRadius: 1, flex: 1 }}>
                Ввести PIN
              </Button>
              <Button variant="outlined" onClick={() => { setCardInserted(false); setStep('inspect'); }} sx={{ borderRadius: 1, flex: 1 }}>
                Забрать карту
              </Button>
            </Box>
          </Box>
        )}

        {}
        {step === 'done' && (
          <Box sx={{ textAlign: 'center' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>{showWarning ? 'ok' : 'fail'}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {showWarning ? 'Вы заметили скиммер!' : 'Данные карты скопированы'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
                {showWarning
                  ? 'Вы правильно определили угрозу и не стали использовать банкомат.'
                  : 'Скиммер считал данные карты, камера зафиксировала PIN.'}
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
