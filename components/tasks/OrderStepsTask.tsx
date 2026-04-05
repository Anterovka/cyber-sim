'use client';

import { useState } from 'react';
import type { OrderStepsData, OrderStepsSession } from '../../lib/interactiveTaskTypes';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import {DragHandleDots2Icon, CheckCircledIcon, CrossCircledIcon, ListBulletIcon} from '@radix-ui/react-icons';

interface OrderStepsProps {
  data: OrderStepsData;
  session: OrderStepsSession;
  isDark: boolean;
  status: 'answering' | 'checking' | 'wrong' | 'correct';
  onReorder: (newOrder: string[]) => void;
  onCheck: () => void;
  onReset: () => void;
}

export default function OrderStepsTask({ data, session, isDark, status, onReorder, onCheck, onReset }: OrderStepsProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newOrder = [...session.currentOrder];
    const dragIdx = newOrder.indexOf(draggedId);
    const targetIdx = newOrder.indexOf(targetId);

    newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, draggedId);
    onReorder(newOrder);
  };
  const handleDragEnd = () => setDraggedId(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: isDark ? '#1E1E1E' : '#F5F5F5', border: `1px solid ${isDark ? '#333' : '#E0E0E0'}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ListBulletIcon width={18} height={18} color={isDark ? 'success.main' : 'success.main'} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? 'success.main' : 'success.main' }}>
            Расставь шаги в правильном порядке:
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {session.currentOrder.map((stepId, index) => {
            const step = data.shuffledSteps.find((s) => s.id === stepId);
            if (!step) return null;

            const correctIndex = data.correctOrder.indexOf(stepId);
            const isCorrectPosition = correctIndex === index;

            let borderColor = isDark ? '#444' : 'divider';
            let bgcolor = isDark ? 'background.paper' : '#FFFFFF';

            if (status === 'correct' || status === 'checking') {
              if (isCorrectPosition) {
                borderColor = 'success.main';
                bgcolor = isDark ? 'rgba(46,125,50,0.15)' : 'success.light';
              } else {
                borderColor = '#FF9800';
                bgcolor = isDark ? 'rgba(255,152,0,0.15)' : '#FFF8E1';
              }
            }

            return (
              <Paper
                key={step.id}
                draggable={status === 'answering'}
                onDragStart={() => handleDragStart(step.id)}
                onDragOver={(e) => handleDragOver(e, step.id)}
                onDragEnd={handleDragEnd}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: `2px solid ${borderColor}`,
                  bgcolor,
                  cursor: status === 'answering' ? 'grab' : 'default',
                  transition: 'all 0.2s',
                  opacity: draggedId === step.id ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <DragHandleDots2Icon width={16} height={16} color={isDark ? 'text.secondary' : 'text.disabled'} />
                  <Chip
                    label={index + 1}
                    size="small"
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: isCorrectPosition && (status === 'correct' || status === 'checking') ? 'success.main' : isDark ? 'text.secondary' : 'divider',
                      color: isCorrectPosition && (status === 'correct' || status === 'checking') ? 'white' : isDark ? '#BDBDBD' : '#757575',
                    }}
                  />
                </Box>
                <Typography sx={{ flex: 1, color: isDark ? 'divider' : '#212121' }}>{step.text}</Typography>
                {(status === 'correct' || status === 'checking') && (
                  isCorrectPosition ? <CheckCircledIcon width={18} height={18} color="success.main" /> : <CrossCircledIcon width={18} height={18} color="#FF9800" />
                )}
              </Paper>
            );
          })}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button variant="contained" onClick={onCheck} startIcon={<ListBulletIcon width={18} height={18} />} fullWidth sx={{ borderRadius: 1.5, py: 1.5 }}>
          Проверить порядок
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
