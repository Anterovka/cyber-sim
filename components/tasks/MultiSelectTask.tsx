'use client';

import type { MultiSelectData, MultiSelectSession } from '../../lib/interactiveTaskTypes';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import {CheckIcon, CheckCircledIcon, CrossCircledIcon} from '@radix-ui/react-icons';

interface MultiSelectProps {
  data: MultiSelectData;
  session: MultiSelectSession;
  isDark: boolean;
  status: 'answering' | 'checking' | 'wrong' | 'correct';
  onToggle: (optionId: string) => void;
  onCheck: () => void;
  onReset: () => void;
}

export default function MultiSelectTask({ data, session, isDark, status, onToggle, onCheck, onReset }: MultiSelectProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: isDark ? '#1E1E1E' : '#F5F5F5', border: `1px solid ${isDark ? '#333' : '#E0E0E0'}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CheckIcon width={18} height={18} color={isDark ? 'success.main' : 'success.main'} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? 'success.main' : 'success.main' }}>
            Выбери все правильные ответы:
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {data.options.map((option) => {
            const isSelected = session.selectedOptionIds.includes(option.id);
            const isCorrect = option.isCorrect;

            let borderColor = isDark ? '#444' : 'divider';
            let bgcolor = isDark ? 'background.paper' : '#FFFFFF';

            if (status === 'correct' || status === 'checking') {
              if (isCorrect && isSelected) {
                borderColor = 'success.main';
                bgcolor = isDark ? 'rgba(46,125,50,0.15)' : 'success.light';
              } else if (!isCorrect && isSelected) {
                borderColor = 'error.main';
                bgcolor = isDark ? 'rgba(211,47,47,0.15)' : 'error.light';
              } else if (isCorrect && !isSelected) {
                borderColor = '#FF9800';
                bgcolor = isDark ? 'rgba(255,152,0,0.1)' : '#FFF8E1';
              }
            } else if (isSelected) {
              borderColor = 'success.main';
              bgcolor = isDark ? 'rgba(46,125,50,0.1)' : 'success.light';
            }

            return (
              <Paper
                key={option.id}
                onClick={() => status === 'answering' && onToggle(option.id)}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: `2px solid ${borderColor}`,
                  bgcolor,
                  cursor: status === 'answering' ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Checkbox checked={isSelected} size="small" sx={{ p: 0 }} />
                <Typography sx={{ flex: 1, color: isDark ? 'divider' : '#212121' }}>{option.text}</Typography>
                {(status === 'correct' || status === 'checking') && (
                  isCorrect && isSelected ? (
                    <CheckCircledIcon width={18} height={18} color="success.main" />
                  ) : !isCorrect && isSelected ? (
                    <CrossCircledIcon width={18} height={18} color="error.main" />
                  ) : isCorrect && !isSelected ? (
                    <Chip label="Пропущено" size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: '#FF9800', color: 'white' }} />
                  ) : null
                )}
              </Paper>
            );
          })}
        </Box>

        {status === 'wrong' && (
          <Box sx={{ mt: 1 }}>
            {data.options
              .filter((o) => session.selectedOptionIds.includes(o.id) && !o.isCorrect && o.explanation)
              .map((o) => (
                <Typography key={o.id} variant="caption" sx={{ color: isDark ? '#EF5350' : 'error.main', display: 'block', mb: 0.5 }}>
                  ✗ {o.explanation}
                </Typography>
              ))}
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          variant="contained"
          onClick={onCheck}
          disabled={session.selectedOptionIds.length === 0}
          startIcon={<CheckIcon width={18} height={18} />}
          fullWidth
          sx={{ borderRadius: 1.5, py: 1.5 }}
        >
          Проверить ({session.selectedOptionIds.length} выбрано)
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
