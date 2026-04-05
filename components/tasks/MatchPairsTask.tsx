'use client';

import type { MatchPairsData, MatchPairsSession } from '../../lib/interactiveTaskTypes';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import {CodeIcon, CheckCircledIcon, CrossCircledIcon} from '@radix-ui/react-icons';

interface MatchPairsProps {
  data: MatchPairsData;
  session: MatchPairsSession;
  isDark: boolean;
  status: 'answering' | 'checking' | 'wrong' | 'correct';
  onSelectLeft: (id: string) => void;
  onSelectRight: (id: string) => void;
  onUnmatch: (leftId: string) => void;
  onCheck: () => void;
  onReset: () => void;
}

export default function MatchPairsTask({ data, session, isDark, status, onSelectLeft, onSelectRight, onUnmatch, onCheck, onReset }: MatchPairsProps) {
  const matchedRightIds = new Set(Object.values(session.matchedPairs));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#EF5350' : 'error.main', mb: 1, textAlign: 'center' }}>
            Атаки / Проблемы
          </Typography>
          {data.leftItems.map((item) => {
            const isMatched = session.matchedPairs[item.id] !== undefined;
            const isSelected = session.selectedLeft === item.id;
            const correctRight = data.correctPairs[item.id];
            const userRight = session.matchedPairs[item.id];
            const isCorrectMatch = userRight === correctRight;

            let borderColor = isDark ? '#444' : 'divider';
            let bgcolor = isDark ? 'background.paper' : '#FFFFFF';

            if (status === 'correct' || status === 'checking') {
              borderColor = isCorrectMatch ? 'success.main' : 'error.main';
              bgcolor = isCorrectMatch ? (isDark ? 'rgba(46,125,50,0.15)' : 'success.light') : (isDark ? 'rgba(211,47,47,0.15)' : 'error.light');
            } else if (isSelected) {
              borderColor = 'success.main';
              bgcolor = isDark ? 'rgba(46,125,50,0.15)' : 'success.light';
            } else if (isMatched) {
              borderColor = 'success.main';
              bgcolor = isDark ? 'rgba(46,125,50,0.1)' : 'success.light';
            }

            return (
              <Paper
                key={item.id}
                onClick={() => !isMatched && status === 'answering' && onSelectLeft(item.id)}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: `2px solid ${borderColor}`,
                  bgcolor,
                  cursor: !isMatched && status === 'answering' ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                <Typography variant="body2" sx={{ color: isDark ? 'divider' : '#212121', fontWeight: 600 }}>{item.text}</Typography>
                {isMatched && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <Chip label="→" size="small" sx={{ width: 20, height: 18, fontSize: '0.6rem' }} />
                    <Typography variant="caption" sx={{ color: isDark ? '#81C784' : 'success.main' }}>
                      {data.rightItems.find((r) => r.id === userRight)?.text}
                    </Typography>
                    {(status === 'correct' || status === 'checking') && (
                      isCorrectMatch ? <CheckCircledIcon width={14} height={14} color="success.main" /> : <CrossCircledIcon width={14} height={14} color="error.main" />
                    )}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>

        {}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#66BB6A' : 'success.main', mb: 1, textAlign: 'center' }}>
            Защита / Решения
          </Typography>
          {data.rightItems.map((item) => {
            const isMatched = matchedRightIds.has(item.id);

            let borderColor = isDark ? '#444' : 'divider';
            let bgcolor = isDark ? 'background.paper' : '#FFFFFF';

            if (isMatched) {
              borderColor = 'success.main';
              bgcolor = isDark ? 'rgba(46,125,50,0.1)' : 'success.light';
            } else if (status === 'answering' && session.selectedLeft) {
              borderColor = 'success.main';
              bgcolor = isDark ? 'rgba(46,125,50,0.05)' : 'success.light';
            }

            return (
              <Paper
                key={item.id}
                onClick={() => !isMatched && session.selectedLeft && status === 'answering' && onSelectRight(item.id)}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: `2px solid ${borderColor}`,
                  bgcolor,
                  cursor: !isMatched && session.selectedLeft && status === 'answering' ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                <Typography variant="body2" sx={{ color: isDark ? 'divider' : '#212121' }}>{item.text}</Typography>
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button variant="contained" onClick={onCheck} startIcon={<CodeIcon width={18} height={18} />} fullWidth sx={{ borderRadius: 1.5, py: 1.5 }}>
          Проверить ({Object.keys(session.matchedPairs).length}/{data.leftItems.length} пар)
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
