'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import {LockClosedIcon, CheckCircledIcon, CrossCircledIcon, ArrowLeftIcon, CalendarIcon, StarFilledIcon, TargetIcon, LightningBoltIcon} from '@radix-ui/react-icons';
import { useThemeMode } from '../../../../lib/ThemeModeContext';

const leagueConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Новичок', color: '#757575' },
  intermediate: { label: 'Средний', color: '#1976D2' },
  advanced: { label: 'Продвинутый', color: '#2E7D32' },
  expert: { label: 'Эксперт', color: '#FFD700' },
};

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const userId = params.userId as string;
  const score = params.score as string;

  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (!userId || !score) {
      setIsValid(false);
    }
  }, [userId, score]);


  const scoreNum = parseInt(score) || 0;
  const league = scoreNum >= 1000 ? 'expert' : scoreNum >= 500 ? 'advanced' : scoreNum >= 200 ? 'intermediate' : 'beginner';
  const leagueInfo = leagueConfig[league];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowLeftIcon width={18} height={18} />} onClick={() => router.push('/')} sx={{ mb: 3, borderRadius: 1.5 }}>
        На главную
      </Button>

      {isValid ? (
        <>
          {}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3, bgcolor: isDark ? 'rgba(46,125,50,0.15)' : '#E8F5E9', border: `2px solid ${leagueInfo.color}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: leagueInfo.color }}>
                <CheckCircledIcon width={28} height={28} color="white" />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: leagueInfo.color }}>
                  Сертификат подтверждён
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Данный сертификат выдан платформой CyberSim и является действительным.
                </Typography>
              </Box>
              <Chip label="✓ Верифицирован" size="small" sx={{ bgcolor: leagueInfo.color, color: 'white', fontWeight: 600 }} />
            </Box>
          </Paper>

          {}
          <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2, mb: 3, border: `3px solid ${leagueInfo.color}` }}>
            {}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: leagueInfo.color }}>
                  <LockClosedIcon width={32} height={32} color="white" />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: leagueInfo.color, mb: 0.5 }}>
                CyberSim
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Образовательный симулятор кибербезопасности
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Сертификат выдан пользователю</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>{userId.substring(0, 8).toUpperCase()}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                успешно завершившему курс «Основы кибербезопасности»
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ px: 4, py: 2, borderRadius: 2, bgcolor: `${leagueInfo.color}20`, border: `2px solid ${leagueInfo.color}` }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: leagueInfo.color }}>
                    {leagueInfo.label}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
              {[
                { icon: <StarFilledIcon width={18} height={18} />, label: 'Общий счёт', value: scoreNum },
                { icon: <TargetIcon width={18} height={18} />, label: 'Сценариев пройдено', value: Math.floor(scoreNum / 100) },
                { icon: <LightningBoltIcon width={18} height={18} />, label: 'Успешность', value: `${Math.min(100, Math.round(scoreNum / 10))}%` },
              ].map((s, i) => (
                <Box key={i} sx={{ textAlign: 'center', p: 2, borderRadius: 1.5, bgcolor: isDark ? '#252525' : '#F5F5F5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, color: leagueInfo.color }}>{s.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            {}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon width={12} height={12} /> Дата выдачи: {new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                  ID сертификата: CERT-{userId}-{score}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                cybersec-simulator.ru
              </Typography>
            </Box>
          </Paper>

          {}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Информация о проверке</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: 'Статус', value: 'Действителен', color: 'success.main' },
                { label: 'ID пользователя', value: userId },
                { label: 'Итоговый счёт', value: score },
                { label: 'Достигнутая лига', value: leagueInfo.label },
                { label: 'Дата проверки', value: new Date().toLocaleString('ru-RU') },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: i < 4 ? `1px solid ${isDark ? '#333' : '#E0E0E0'}` : 'none' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: (item as any).color || 'text.primary' }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar sx={{ width: 72, height: 72, borderRadius: 3, bgcolor: 'error.main' }}>
              <CrossCircledIcon width={36} height={36} color="white" />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
            Сертификат не найден
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Данный сертификат недействителен или не существует в нашей базе.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/')} sx={{ borderRadius: 1.5 }}>
            На главную
          </Button>
        </Paper>
      )}
    </Container>
  );
}
