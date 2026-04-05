'use client';

import type { TextInputData, TextInputSession } from '../../lib/interactiveTaskTypes';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import {TextIcon, CheckCircledIcon, CrossCircledIcon} from '@radix-ui/react-icons';

interface TextInputProps {
  data: TextInputData;
  session: TextInputSession;
  isDark: boolean;
  status: 'answering' | 'checking' | 'wrong' | 'correct';
  onChange: (value: string) => void;
  onCheck: () => void;
  onReset: () => void;
}

export default function TextInputTask({ data, session, isDark, status, onChange, onCheck, onReset }: TextInputProps) {
  const isCorrect = status === 'correct' || (status === 'checking' && data.correctAnswers.some((a) => a.toLowerCase() === session.value.toLowerCase()));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: isDark ? '#1E1E1E' : '#F5F5F5', border: `1px solid ${isDark ? '#333' : '#E0E0E0'}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TextIcon width={18} height={18} color={isDark ? 'success.main' : 'success.main'} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? 'success.main' : 'success.main' }}>
            Введи ответ:
          </Typography>
        </Box>

        <TextField
          fullWidth
          value={session.value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={data.placeholder || 'Введи ответ...'}
          type={data.inputType || 'text'}
          disabled={status !== 'answering'}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              borderColor: isCorrect ? 'success.main' : status === 'wrong' ? 'error.main' : isDark ? '#444' : 'divider',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {status === 'correct' && <CheckCircledIcon width={20} height={20} color="success.main" />}
                {status === 'wrong' && <CrossCircledIcon width={20} height={20} color="error.main" />}
              </InputAdornment>
            ),
          }}
        />

        {data.exampleAnswer && status === 'wrong' && (
          <Typography variant="caption" sx={{ color: isDark ? '#FFB74D' : '#F57C00', mt: 1, display: 'block' }}>
            Пример правильного ответа: {data.exampleAnswer}
          </Typography>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button variant="contained" onClick={onCheck} disabled={!session.value.trim()} fullWidth sx={{ borderRadius: 1.5, py: 1.5 }}>
          Проверить
        </Button>
        {status === 'wrong' && (
          <Button variant="outlined" onClick={onReset} startIcon={<CrossCircledIcon width={18} height={18} />} sx={{ borderRadius: 1.5 }}>
            Сбросить
          </Button>
        )}
      </Box>
    </Box>
  );
}
