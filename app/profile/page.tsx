'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useProgressStore } from '../../lib/store';
import { scenarios } from '../../lib/scenarios';
import ProgressBar from '../../components/ProgressBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import { useThemeMode } from '../../lib/ThemeModeContext';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookmarkIcon,
  CalendarIcon,
  CardStackIcon,
  CheckCircledIcon,
  ClockIcon,
  CrossCircledIcon,
  DesktopIcon,
  EnvelopeClosedIcon,
  ExitIcon,
  GearIcon,
  GlobeIcon,
  LightningBoltIcon,
  LockClosedIcon,
  PersonIcon,
  RocketIcon,
  StarFilledIcon,
  StarIcon,
  TargetIcon,
  BarChartIcon,
} from '@radix-ui/react-icons';

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { progress, loadProgress } = useProgressStore();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadProgress();
    }
  }, [isAuthenticated, loadProgress, router]);

  if (!isAuthenticated || !user || !progress) return null;

  const currentLeague = leagueConfig[progress.league || 'beginner'];
  const { statistics, completedScenarios, totalScore, league, securityLevel, streak } = progress;

  const totalByType: Record<string, number> = {};
  scenarios.forEach((s) => { totalByType[s.attackType] = (totalByType[s.attackType] || 0) + 1; });

  const successRate = statistics.successRate.toFixed(0);
  const totalCompleted = statistics.totalScenariosCompleted;
  const totalMistakes = statistics.totalMistakes;


  const scenarioTitles: Record<string, string> = {};
  scenarios.forEach((s) => { scenarioTitles[s.id] = s.title; });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 80, height: 80, borderRadius: 3, bgcolor: 'success.main', fontSize: '1.8rem', fontWeight: 700 }}>
            {user.username.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{user.username}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip label={currentLeague.label} size="small" sx={{ bgcolor: currentLeague.color, color: 'white', fontWeight: 600 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EnvelopeClosedIcon width={12} height={12} /> {user.email}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon width={12} height={12} /> Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
            </Typography>
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
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{Math.min(totalScore, currentLeague.nextScore || 0)} / {currentLeague.nextScore}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={Math.min(100, (totalScore / (currentLeague.nextScore || 1)) * 100)} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        )}
        {!currentLeague.nextLeague && (
          <Box sx={{ mt: 2 }}>
            <Chip label="🏆 Максимальная лига достигнута!" size="small" sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 600 }} />
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
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{defended}/{total} </Typography>
                    </Box>
                    <ProgressBar value={defended} max={Math.max(total, 1)} color={rate >= 70 ? 'green' : rate >= 40 ? 'yellow' : 'red'} />
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 1.5 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Последние сценарии</Typography>
            {completedScenarios.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TargetIcon width={48} height={48} color={isDark ? '#555' : '#E0E0E0'} style={{ marginBottom: 16 }} />
                <Typography sx={{ color: 'text.secondary' }}>Вы ещё не прошли ни одного сценария</Typography>
                <Button variant="contained" onClick={() => router.push('/dashboard')} sx={{ mt: 2, borderRadius: 1.5 }}>Начать обучение</Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 400, overflow: 'auto' }}>
                {completedScenarios.slice(-5).reverse().map((c, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {c.mistakes === 0 ? <CheckCircledIcon width={20} height={20} color="#2E7D32" /> : <CrossCircledIcon width={20} height={20} color="#D32F2F" />}
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{scenarioTitles[c.scenarioId] || c.scenarioId}</Typography>
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
      <Card sx={{ borderRadius: 1.5, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Общая статистика</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
            {[
              { value: `${successRate}%`, label: 'Успешных отражений', color: 'success.main', icon: <CheckCircledIcon width={20} height={20} /> },
              { value: String(totalCompleted), label: 'Сценариев пройдено', color: 'success.main', icon: <TargetIcon width={20} height={20} /> },
              { value: String(totalMistakes), label: 'Ошибок допущено', color: 'error.main', icon: <CrossCircledIcon width={20} height={20} /> },
              { value: streak > 0 ? `${streak} 🔥` : '—', label: 'Текущая серия', color: 'success.main', icon: <LightningBoltIcon width={20} height={20} /> },
            ].map((s, i) => (
              <Box key={i} sx={{ textAlign: 'center', p: 2, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F5F5F5', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, color: s.color }}>{s.icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: s.color, mb: 0.5 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {}
        <Card sx={{ borderRadius: 1.5 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GearIcon width={20} height={20} /> Настройки
            </Typography>

            {!showPasswordForm ? (
              <Button variant="outlined" fullWidth startIcon={<LockClosedIcon width={18} height={18} />} onClick={() => setShowPasswordForm(true)} sx={{ borderRadius: 1.5, mb: 2 }}>
                Сменить пароль
              </Button>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <TextField label="Текущий пароль" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} size="small" fullWidth />
                <TextField label="Новый пароль" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} size="small" fullWidth />
                {passwordMessage && (
                  <Alert severity={passwordMessage.startsWith('✓') ? 'success' : 'error'} sx={{ borderRadius: 1 }}>{passwordMessage}</Alert>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => {
                    if (oldPassword && newPassword.length >= 6) {
                      setPasswordMessage('✓ Пароль изменён (заглушка)');
                      setOldPassword(''); setNewPassword('');
                    } else { setPasswordMessage('Минимум 6 символов'); }
                  }} sx={{ borderRadius: 1, flex: 1 }}>Сохранить</Button>
                  <Button variant="outlined" size="small" onClick={() => { setShowPasswordForm(false); setPasswordMessage(''); }} sx={{ borderRadius: 1 }}>Отмена</Button>
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Button variant="outlined" fullWidth startIcon={<StarFilledIcon width={18} height={18} />} onClick={() => router.push('/certificate')} sx={{ borderRadius: 1.5, mb: 2 }}>
              Получить сертификат
            </Button>

            <Button variant="outlined" fullWidth startIcon={<BookmarkIcon width={18} height={18} />} onClick={() => router.push('/resources')} sx={{ borderRadius: 1.5, mb: 2 }}>
              Образовательные ресурсы
            </Button>

            <Button variant="outlined" fullWidth startIcon={<BarChartIcon width={18} height={18} />} onClick={() => router.push('/report')} sx={{ borderRadius: 1.5, mb: 2 }}>
              Security Report (PDF)
            </Button>

            <Button variant="outlined" fullWidth color="error" startIcon={<ExitIcon width={18} height={18} />} onClick={() => { logout(); router.push('/'); }} sx={{ borderRadius: 1.5 }}>
              Выйти из аккаунта
            </Button>
          </CardContent>
        </Card>

        {}
        <Card sx={{ borderRadius: 1.5 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarFilledIcon width={20} height={20} /> Достижения
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { icon: <LockClosedIcon width={18} height={18} />, label: 'Первый шаг', desc: 'Пройти первый сценарий', unlocked: totalCompleted >= 1 },
                { icon: <StarIcon width={18} height={18} />, label: 'Без ошибок', desc: 'Пройти сценарий без ошибок', unlocked: completedScenarios.some((c) => c.mistakes === 0) },
                { icon: <LightningBoltIcon width={18} height={18} />, label: 'Серия 3', desc: '3 правильных ответа подряд', unlocked: streak >= 3 },
                { icon: <TargetIcon width={18} height={18} />, label: 'Половина', desc: 'Пройти 50% сценариев', unlocked: totalCompleted >= scenarios.length / 2 },
                { icon: <StarFilledIcon width={18} height={18} />, label: 'Эксперт', desc: 'Достичь лиги «Эксперт»', unlocked: league === 'expert' },
              ].map((a, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1, bgcolor: a.unlocked ? (isDark ? 'rgba(46,125,50,0.12)' : '#E8F5E9') : (isDark ? 'rgba(255,255,255,0.03)' : '#F5F5F5'), border: '1px solid', borderColor: a.unlocked ? (isDark ? 'rgba(46,125,50,0.2)' : 'transparent') : (isDark ? 'rgba(255,255,255,0.04)' : 'transparent') }}>
                  <Box sx={{ color: a.unlocked ? 'success.main' : 'text.disabled' }}>{a.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: a.unlocked ? 'text.primary' : 'text.disabled' }}>{a.label}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{a.desc}</Typography>
                  </Box>
                  {a.unlocked && <CheckCircledIcon width={16} height={16} color="#2E7D32" />}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
