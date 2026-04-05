'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '../../lib/store';
import { quizScenarios, quizScenarioLocations, quizAttackTypeLabels } from '../../lib/quizData';
import { getImportedScenarios } from '@/lib/api';
import type { ImportedScenario } from '@/lib/api';
import ProgressBar from '../../components/ProgressBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import {LockClosedIcon, StarFilledIcon, ListBulletIcon, TargetIcon, CheckCircledIcon, BackpackIcon, HomeIcon, GlobeIcon, ExclamationTriangleIcon, LaptopIcon} from '@radix-ui/react-icons';
import { useThemeMode } from '../../lib/ThemeModeContext';

const locationIcons: Record<string, React.ReactNode> = {
  office: <BackpackIcon width={22} height={22} />,
  home: <HomeIcon width={22} height={22} />,
  public_wifi: <GlobeIcon width={22} height={22} />,
  imported: <LaptopIcon width={22} height={22} />,
};

const difficultyColor = (d: number): 'success' | 'warning' | 'error' => d <= 3 ? 'success' : d <= 6 ? 'warning' : 'error';
const leagueConfig: Record<string, { label: string }> = {
  beginner: { label: 'Новичок' }, intermediate: { label: 'Средний' },
  advanced: { label: 'Продвинутый' }, expert: { label: 'Эксперт' },
};

const attackLabels: Record<string, string> = {
  phishing: 'Фишинг', skimming: 'Скимминг', brute_force: 'Подбор пароля',
  social_engineering: 'Соц. инженерия', deepfake: 'Дипфейк', malware: 'Вредоносное ПО',
  man_in_the_middle: 'MITM', smishing: 'SMS-фишинг', ransomware: 'Вымогатели',
};

const locationLabels: Record<string, string> = {
  office: 'Офис', home: 'Дом', public_wifi: 'Public Wi-Fi',
  mobile: 'Мобильный', cloud: 'Облако',
};

export default function DashboardPage() {
  const router = useRouter();
  const { progress, loadProgress } = useProgressStore();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [importedScenarios, setImportedScenarios] = useState<ImportedScenario[]>([]);

  useEffect(() => {
    loadProgress();
    getImportedScenarios().then(setImportedScenarios).catch(() => {});
  }, [loadProgress]);

  const uniqueCompletedCount = new Set(progress?.completedScenarios.map((c) => c.scenarioId) || []).size;

  const scenariosByLocation = quizScenarios.reduce<Record<string, typeof quizScenarios>>((acc, s) => {
    if (!acc[s.location]) acc[s.location] = [];
    acc[s.location].push(s);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {progress && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
          {[
            { label: 'Уровень безопасности', value: <ProgressBar value={progress.securityLevel} max={100} color={progress.securityLevel > 60 ? 'green' : progress.securityLevel > 30 ? 'yellow' : 'red'} />, icon: <LockClosedIcon width={16} height={16} /> },
            { label: 'Лига', value: <Typography variant="h6" sx={{ fontWeight: 700 }}>{leagueConfig[progress.league]?.label}</Typography>, icon: <StarFilledIcon width={16} height={16} /> },
            { label: 'Пройдено сценариев', value: <Typography variant="h5" sx={{ fontWeight: 700 }}>{uniqueCompletedCount} / {quizScenarios.length}</Typography>, icon: <ListBulletIcon width={16} height={16} /> },
            { label: 'Успешность', value: <Typography variant="h5" sx={{ fontWeight: 700 }}>{progress.statistics.successRate.toFixed(0)}%</Typography>, icon: <TargetIcon width={16} height={16} /> },
          ].map((stat, i) => (
            <Paper key={i} sx={{ p: 2.5, borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ color: 'success.main' }}>{stat.icon}</Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{stat.label}</Typography>
              </Box>
              {stat.value}
            </Paper>
          ))}
        </Box>
      )}

      {Object.entries(scenariosByLocation).map(([location, locationScenarios]) => {
        const locInfo = quizScenarioLocations[location as keyof typeof quizScenarioLocations];
        return (
          <Box key={location} sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'success.light', color: 'primary.contrastText' }}>
                {locationIcons[location]}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{locInfo.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{locInfo.description}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
              {locationScenarios.map((scenario) => {
                const completedEntry = progress?.completedScenarios.find((c) => c.scenarioId === scenario.id);
                const isCompleted = !!completedEntry;
                const hasMistakes = completedEntry?.mistakes ? completedEntry.mistakes > 0 : false;
                return (
                  <Card key={scenario.id} sx={{ height: '100%', borderRadius: 1.5, border: isCompleted ? 2 : 1, borderColor: isCompleted ? (hasMistakes ? 'warning.main' : 'success.main') : 'divider', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: 3, transform: 'translateY(-2px)' } }}>
                    <CardActionArea onClick={() => router.push(`/quiz/${scenario.id}`)} sx={{ p: 1 }}>
                      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Chip label={quizAttackTypeLabels[scenario.attackType]} size="small" color="primary" variant="outlined" />
                          {isCompleted && (hasMistakes ? <ExclamationTriangleIcon width={18} height={18} color={isDark ? '#FFA726' : '#ED6C02'} /> : <CheckCircledIcon width={18} height={18} color={isDark ? '#66BB6A' : '#2E7D32'} />)}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>{scenario.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{scenario.description}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip label={`Сложность: ${scenario.difficulty}/10`} size="small" color={difficultyColor(scenario.difficulty)} sx={{ fontWeight: 600 }} />
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>{scenario.steps.length} шаг(ов)</Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>
        );
      })}

      {importedScenarios.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'warning.light', color: 'primary.contrastText' }}>
              {locationIcons.imported}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Импорт сценариев</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Пользовательские сценарии</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
            {importedScenarios.map((s) => (
              <Card key={s.id} sx={{ height: '100%', borderRadius: 1.5, border: 1, borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: 3, transform: 'translateY(-2px)' } }}>
                <CardActionArea onClick={() => router.push(`/quiz/${s.id}`)} sx={{ p: 1 }}>
                  <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Chip label={attackLabels[s.attackType] || s.attackType} size="small" color="warning" variant="outlined" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>{s.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{s.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label={`Сложность: ${s.difficulty}/5`} size="small" color={difficultyColor(s.difficulty * 2)} sx={{ fontWeight: 600 }} />
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>{s.steps?.length || 0} шаг(ов)</Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}
