'use client';

import { useEffect } from 'react';
import { useProgressStore } from '../../lib/store';
import { scenarios } from '../../lib/scenarios';
import ProgressBar from '../../components/ProgressBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import {StarFilledIcon, StarIcon, LockClosedIcon, LightningBoltIcon, ArrowUpIcon, ArrowDownIcon, EnvelopeClosedIcon, CardStackIcon, PersonIcon, RocketIcon, GlobeIcon, DesktopIcon, CheckCircledIcon, CrossCircledIcon, ClockIcon, TargetIcon} from '@radix-ui/react-icons';
import { useThemeMode } from '../../lib/ThemeModeContext';

const attackTypeIcons: Record<string, React.ReactNode> = {
  phishing: <EnvelopeClosedIcon width={16} height={16} />,
  skimming: <CardStackIcon width={16} height={16} />,
  brute_force: <LockClosedIcon width={16} height={16} />,
  social_engineering: <PersonIcon width={16} height={16} />,
  deepfake: <RocketIcon width={16} height={16} />,
  malware: <DesktopIcon width={16} height={16} />,
  man_in_the_middle: <GlobeIcon width={16} height={16} />,
};
const attackTypeLabels: Record<string, string> = {
  phishing: 'Фишинг', skimming: 'Скимминг', brute_force: 'Подбор пароля',
  social_engineering: 'Социальная инженерия', deepfake: 'Дипфейк',
  malware: 'Вредоносное ПО', man_in_the_middle: 'Человек посередине',
};
const leagueConfig: Record<string, { label: string; color: string; nextLeague?: string; nextScore?: number }> = {
  beginner: { label: 'Новичок', color: '#757575', nextLeague: 'Средний', nextScore: 200 },
  intermediate: { label: 'Средний', color: '#1976D2', nextLeague: 'Продвинутый', nextScore: 500 },
  advanced: { label: 'Продвинутый', color: '#2E7D32', nextLeague: 'Эксперт', nextScore: 1000 },
  expert: { label: 'Эксперт', color: '#FFD700' },
};

export default function StatsPage() {
  const { progress, loadProgress } = useProgressStore();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  useEffect(() => { loadProgress(); }, [loadProgress]);

  if (!progress) return <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}><Typography sx={{ color: 'text.secondary' }}>Загрузка...</Typography></Container>;

  const { statistics, completedScenarios, totalScore, league, securityLevel, streak } = progress;
  const currentLeague = leagueConfig[league];

  const totalByType: Record<string, number> = {};
  scenarios.forEach((s) => { totalByType[s.attackType] = (totalByType[s.attackType] || 0) + 1; });

  const successRate = statistics.successRate.toFixed(0);
  const totalCompleted = statistics.totalScenariosCompleted;
  const totalMistakes = statistics.totalMistakes;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 72, height: 72, borderRadius: 3, bgcolor: 'success.main', fontSize: '1.5rem', fontWeight: 700 }}>
            {progress.userId?.substring(0, 2).toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Личный кабинет
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={currentLeague.label}
                size="small"
                sx={{ bgcolor: currentLeague.color, color: 'white', fontWeight: 600 }}
              />
              {currentLeague.nextLeague && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  До «{currentLeague.nextLeague}»: {Math.max(0, (currentLeague.nextScore || 0) - totalScore)} очков
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>{totalScore}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Общий счёт</Typography>
          </Box>
        </Box>

        {}
        {currentLeague.nextLeague && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Прогресс до «{currentLeague.nextLeague}»</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{totalScore} / {currentLeague.nextScore}</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (totalScore / (currentLeague.nextScore || 1)) * 100)}
              sx={{ height: 8, borderRadius: 4, bgcolor: isDark ? '#333' : '#E0E0E0' }}
            />
          </Box>
        )}
      </Paper>

      {}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
        {[
          { label: 'Успешность', value: `${successRate}%`, icon: successRate >= '70' ? <ArrowUpIcon width={18} height={18} /> : <ArrowDownIcon width={18} height={18} />, color: successRate >= '70' ? 'success.main' : 'error.main' },
          { label: 'Безопасность', value: `${securityLevel}/100`, icon: <LockClosedIcon width={18} height={18} />, color: securityLevel > 60 ? 'success.main' : securityLevel > 30 ? 'warning.main' : 'error.main' },
          { label: 'Серия', value: streak, icon: <LightningBoltIcon width={18} height={18} />, color: 'success.main' },
          { label: 'Сценариев', value: `${totalCompleted}/${scenarios.length}`, icon: <TargetIcon width={18} height={18} />, color: 'success.main' },
        ].map((s, i) => (
          <Paper key={i} sx={{ p: 2.5, borderRadius: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ color: s.color }}>{s.icon}</Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
        {}
        <Card sx={{ borderRadius: 1.5 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Защита по типам атак</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(attackTypeLabels).map(([type, label]) => {
                const stat = statistics.attackTypeStats[type as keyof typeof statistics.attackTypeStats];
                const encountered = stat?.encountered || 0;
                const defended = stat?.successfullyDefended || 0;
                const total = totalByType[type] || 0;
                const rate = encountered > 0 ? (defended / encountered) * 100 : 0;
                return (
                  <Box key={type}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: 'success.main' }}>{attackTypeIcons[type]}</Box>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{label}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{defended}/{total} ({rate.toFixed(0)}%)</Typography>
                    </Box>
                    <ProgressBar value={defended} max={Math.max(total, 1)} color={rate >= 70 ? 'green' : rate >= 40 ? 'yellow' : 'red'} />
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        {}
        <Card sx={{ borderRadius: 1.5 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Последние сценарии</Typography>
            {completedScenarios.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TargetIcon width={48} height={48} color={isDark ? '#555' : '#E0E0E0'} style={{ marginBottom: 16 }} />
                <Typography sx={{ color: 'text.secondary' }}>Вы ещё не прошли ни одного сценария</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 400, overflow: 'auto' }}>
                {completedScenarios.slice(-5).reverse().map((c, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {c.mistakes === 0 ? (
                        <CheckCircledIcon width={20} height={20} color="#2E7D32" />
                      ) : (
                        <CrossCircledIcon width={20} height={20} color="#D32F2F" />
                      )}
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>#{c.scenarioId}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ClockIcon width={12} height={12} /> {new Date(c.completedAt).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.score} очков</Typography>
                      <Typography variant="caption" sx={{ color: c.mistakes > 0 ? 'error.main' : 'text.disabled' }}>
                        {c.mistakes > 0 ? `${c.mistakes} ошиб.` : 'Без ошибок'}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {}
      <Card sx={{ borderRadius: 1.5 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Общая статистика</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
            {[
              { value: `${successRate}%`, label: 'Успешных отражений', color: 'success.main', icon: <CheckCircledIcon width={20} height={20} /> },
              { value: String(totalCompleted), label: 'Сценариев пройдено', color: 'success.main', icon: <TargetIcon width={20} height={20} /> },
              { value: String(totalMistakes), label: 'Ошибок допущено', color: 'error.main', icon: <CrossCircledIcon width={20} height={20} /> },
              { value: streak > 0 ? `${streak} 🔥` : '—', label: 'Текущая серия', color: 'success.main', icon: <LightningBoltIcon width={20} height={20} /> },
            ].map((s, i) => (
              <Box key={i} sx={{ textAlign: 'center', p: 2, borderRadius: 1.5, bgcolor: isDark ? '#252525' : '#F5F5F5' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, color: s.color }}>{s.icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: s.color, mb: 0.5 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
