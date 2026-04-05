'use client';

import { useState } from 'react';
import type { FindOnScreenData, FindOnScreenSession } from '../../lib/interactiveTaskTypes';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import {TargetIcon, CheckCircledIcon, CrossCircledIcon, EyeOpenIcon} from '@radix-ui/react-icons';

interface FindOnScreenProps {
  data: FindOnScreenData;
  session: FindOnScreenSession;
  isDark: boolean;
  status: 'answering' | 'checking' | 'wrong' | 'correct';
  onElementClick: (elementId: string) => void;
  onCheck: () => void;
  onReset: () => void;
}

export default function FindOnScreenTask({ data, session, isDark, status, onElementClick, onCheck, onReset }: FindOnScreenProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {}
      <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: isDark ? '#1E1E1E' : '#F5F5F5', border: `1px solid ${isDark ? '#333' : '#E0E0E0'}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <EyeOpenIcon width={18} height={18} color={isDark ? '#81C784' : '#4CAF50'} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#81C784' : '#4CAF50' }}>
            Экран:
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: isDark ? '#BDBDBD' : '#757575', mb: 2, lineHeight: 1.6 }}>
          {data.screenDescription}
        </Typography>

        {}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {data.elements.map((el) => {
            const isFound = session.foundElementIds.includes(el.id);
            const isTarget = data.targetElementIds.includes(el.id);

            let borderColor = isDark ? '#444' : 'divider';
            let bgcolor = isDark ? 'background.paper' : '#FFFFFF';
            let showIcon = null;

            if (status === 'correct' || status === 'checking') {
              if (isTarget && isFound) {
                borderColor = 'success.main';
                bgcolor = isDark ? 'rgba(46,125,50,0.15)' : 'success.light';
                showIcon = <CheckCircledIcon width={16} height={16} color="success.main" />;
              } else if (!isTarget && isFound) {
                borderColor = 'error.main';
                bgcolor = isDark ? 'rgba(211,47,47,0.15)' : 'error.light';
                showIcon = <CrossCircledIcon width={16} height={16} color="error.main" />;
              }
            } else if (isFound) {
              borderColor = 'success.main';
              bgcolor = isDark ? 'rgba(46,125,50,0.15)' : 'success.light';
            }

            return (
              <Paper
                key={el.id}
                onClick={() => status === 'answering' && onElementClick(el.id)}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: `2px solid ${borderColor}`,
                  bgcolor,
                  cursor: status === 'answering' ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  '&:hover': status === 'answering' ? { borderColor: 'success.main', bgcolor: isDark ? 'rgba(46,125,50,0.1)' : 'success.light' } : {},
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? 'divider' : '#212121', mb: 0.5 }}>
                      {el.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#BDBDBD' : '#757575' }}>
                      {el.description}
                    </Typography>
                  </Box>
                  {showIcon}
                  {isFound && status === 'answering' && (
                    <Chip label="Выбрано" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'success.main', color: 'white' }} />
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Paper>

      {}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          variant="contained"
          onClick={onCheck}
          disabled={session.foundElementIds.length === 0}
          startIcon={<TargetIcon width={18} height={18} />}
          fullWidth
          sx={{ borderRadius: 1.5, py: 1.5 }}
        >
          Проверить ({session.foundElementIds.length} найдено)
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
