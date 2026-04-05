'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '../../lib/api';
import type { LeaderboardEntry } from '../../lib/types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import {StarFilledIcon, StarIcon, LightningBoltIcon} from '@radix-ui/react-icons';
import { useThemeMode } from '../../lib/ThemeModeContext';

const leagueIcons: Record<string, React.ReactElement> = {
  beginner: <StarFilledIcon width={12} height={12} />,
  intermediate: <StarIcon width={12} height={12} />,
  advanced: <LightningBoltIcon width={12} height={12} />,
  expert: <StarFilledIcon width={12} height={12} />,
};
const leagueNames: Record<string, string> = { beginner: 'Новичок', intermediate: 'Средний', advanced: 'Продвинутый', expert: 'Эксперт' };

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  useEffect(() => {
    getLeaderboard().then(setLeaderboard).catch(() => setLeaderboard([])).finally(() => setIsLoading(false));
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Таблица лидеров</Typography>
        <Typography sx={{ color: 'text.secondary' }}>Лучшие защитники киберпространства</Typography>
      </Box>

      {}
      {!isLoading && leaderboard.length >= 3 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 4 }}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 1.5, bgcolor: isDark ? '#2A2A2A' : '#E0E0E0', mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}><Box sx={{ color: isDark ? '#BDBDBD' : '#757575' }}><StarFilledIcon width={40} height={40} /></Box></Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{leaderboard[1].username}</Typography>
            <Chip icon={leagueIcons[leaderboard[1].league]} label={leagueNames[leaderboard[1].league]} size="small" sx={{ mb: 1, height: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{leaderboard[1].totalScore}</Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 1.5, bgcolor: 'success.main', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}><StarFilledIcon width={52} height={52} color="white" /></Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{leaderboard[0].username}</Typography>
            <Chip icon={leagueIcons[leaderboard[0].league]} label={leagueNames[leaderboard[0].league]} size="small" sx={{ mb: 1, height: 22, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{leaderboard[0].totalScore}</Typography>
          </Paper>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 1.5, bgcolor: isDark ? '#3E2723' : '#D7CCC8', mt: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}><StarFilledIcon width={32} height={32} color={isDark ? '#BCAAA4' : '#8D6E63'} /></Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{leaderboard[2].username}</Typography>
            <Chip icon={leagueIcons[leaderboard[2].league]} label={leagueNames[leaderboard[2].league]} size="small" sx={{ mb: 1, height: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{leaderboard[2].totalScore}</Typography>
          </Paper>
        </Box>
      )}

      {}
      <Paper sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}><Typography sx={{ color: 'text.secondary' }}>Загрузка...</Typography></Box>
        ) : (
          <Box>
            {leaderboard.map((entry, index) => (
              <Box key={entry.userId}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, '&:hover': { bgcolor: isDark ? '#252525' : '#F5F5F5' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: entry.rank === 1 ? 'primary.main' : entry.rank === 2 ? (isDark ? '#BDBDBD' : '#9E9E9E') : entry.rank === 3 ? (isDark ? '#8D6E63' : '#A1887F') : isDark ? '#252525' : '#F5F5F5', color: entry.rank <= 3 ? 'white' : 'text.secondary', fontWeight: 700 }}>
                      {entry.rank}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{entry.username}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{leagueIcons[entry.league]} {leagueNames[entry.league]}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontWeight: 700 }}>{entry.totalScore}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{entry.scenariosCompleted} сценариев</Typography>
                  </Box>
                </Box>
                {index < leaderboard.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
