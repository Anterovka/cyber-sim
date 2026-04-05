'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { useRouter } from 'next/navigation';
import { useThemeMode } from '../lib/ThemeModeContext';
import { scenarioLocations } from '../lib/scenarios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import {
  LockClosedIcon,
  BookmarkIcon,
  TargetIcon,
  StarFilledIcon,
  EnvelopeClosedIcon,
  CardStackIcon,
  PersonIcon,
  RocketIcon,
  GlobeIcon,
  ArrowRightIcon,
  BackpackIcon,
  HomeIcon,
  EyeOpenIcon,
  LaptopIcon,
  LockOpen2Icon,
  CodeIcon,
  ChatBubbleIcon,
  VideoIcon,
  ActivityLogIcon,
  ReaderIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  LightningBoltIcon,
  ClockIcon,
} from '@radix-ui/react-icons';

const iconMap: Record<string, React.ReactNode> = {
  Briefcase: <BackpackIcon width={28} height={28} />,
  Home: <HomeIcon width={28} height={28} />,
  Wifi: <GlobeIcon width={28} height={28} />,
};

const features = [
  { icon: <BookmarkIcon width={28} height={28} />, title: 'Сюжетные миссии', description: 'Проходите реалистичные сценарии: от фишинговых писем до дипфейков' },
  { icon: <TargetIcon width={28} height={28} />, title: 'Обучение через действие', description: 'Принимайте решения и видите их последствия в безопасной среде' },
  { icon: <StarFilledIcon width={28} height={28} />, title: 'Система рейтингов', description: 'Поднимайтесь по лигам: от новичка до эксперта кибербезопасности' },
];

const attackTypes = [
  { icon: <EnvelopeClosedIcon width={24} height={24} />, name: 'Фишинг', desc: 'Поддельные письма и сайты', severity: 'high' },
  { icon: <CardStackIcon width={24} height={24} />, name: 'Скимминг', desc: 'Кража данных карт', severity: 'high' },
  { icon: <LockClosedIcon width={24} height={24} />, name: 'Подбор пароля', desc: 'Brute-force атаки', severity: 'medium' },
  { icon: <PersonIcon width={24} height={24} />, name: 'Социальная инженерия', desc: 'Манипуляции по телефону', severity: 'high' },
  { icon: <RocketIcon width={24} height={24} />, name: 'Дипфейки', desc: 'AI-подделка голоса и видео', severity: 'critical' },
  { icon: <GlobeIcon width={24} height={24} />, name: 'MITM', desc: 'Перехват трафика в Wi-Fi', severity: 'medium' },
];

const stats = [
  { value: '10+', label: 'Сценариев', icon: <LaptopIcon width={20} height={20} /> },
  { value: '6', label: 'Типов атак', icon: <LockOpen2Icon width={20} height={20} /> },
  { value: '4', label: 'Лиги', icon: <LightningBoltIcon width={20} height={20} /> },
  { value: '15 мин', label: 'На урок', icon: <ClockIcon width={20} height={20} /> },
];

const steps = [
  { step: '01', icon: <ReaderIcon width={24} height={24} />, title: 'Изучите теорию', desc: 'Краткие материалы о типах киберугроз и методах защиты' },
  { step: '02', icon: <EyeOpenIcon width={24} height={24} />, title: 'Пройдите сценарий', desc: 'Окажитесь в реалистичной ситуации и примите решения' },
  { step: '03', icon: <LockClosedIcon width={24} height={24} />, title: 'Увидьте последствия', desc: 'Наглядная анимация покажет, что произошло бы в реальности' },
  { step: '04', icon: <CheckCircledIcon width={24} height={24} />, title: 'Закрепите навыки', desc: 'Повторяйте и поднимайтесь по рейтинговой таблице' },
];

function ParticleBackground() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.15 + 0.05,
    }))
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {particles.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            bgcolor: 'success.main',
            opacity: p.opacity,
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(15px); }
          50% { transform: translateY(-10px) translateX(-20px); }
          75% { transform: translateY(-40px) translateX(10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Box>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: isDark ? '#0a0a0a' : '#ffffff',
          color: isDark ? 'white' : 'text.primary',
          pt: { xs: 12, sm: 16 },
          pb: { xs: 12, sm: 16 },
        }}
      >
        <ParticleBackground />

        {}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,125,50,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,125,50,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', textAlign: 'center' }}>
          {}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              mb: 4,
              px: 2,
              py: 1,
              borderRadius: 100,
              border: '1px solid rgba(46,125,50,0.3)',
              bgcolor: 'rgba(46,125,50,0.1)',
            }}
          >
            <LockClosedIcon width={14} height={14} style={{ color: isDark ? '#4CAF50' : '#2E7D32' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDark ? '#4CAF50' : '#2E7D32', letterSpacing: 0.5 }}>
              ПЛАТФОРМА КИБЕРПОДГОТОВКИ
            </Typography>
          </Box>

          {}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Научитесь
            <br />
            <Typography
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              распознавать угрозы
            </Typography>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              maxWidth: 560,
              mx: 'auto',
              mb: 5,
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.2rem' },
              lineHeight: 1.6,
            }}
          >
            Практический тренажёр с реалистичными сценариями атак.
            Принимайте решения и видите последствия — без риска.
          </Typography>

          {}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
              endIcon={<ArrowRightIcon width={18} height={18} />}
              sx={{
                bgcolor: 'success.main',
                color: 'white',
                px: 4,
                py: 1.75,
                fontSize: '1.05rem',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 24px rgba(46,125,50,0.3)',
                '&:hover': { bgcolor: 'success.dark', boxShadow: '0 8px 32px rgba(46,125,50,0.4)' },
              }}
            >
              {isAuthenticated ? 'Начать обучение' : 'Начать бесплатно'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/dashboard')}
              sx={{
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                px: 4,
                py: 1.75,
                fontSize: '1.05rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { borderColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
              }}
            >
              Смотреть сценарии
            </Button>
          </Box>

          {}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
              gap: 2,
              mt: 8,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            {stats.map((s) => (
              <Box
                key={s.label}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(46,125,50,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(46,125,50,0.12)'}`,
                }}
              >
                <Box sx={{ color: isDark ? '#4CAF50' : '#2E7D32', mb: 1, display: 'flex', justifyContent: 'center' }}>{s.icon}</Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? 'white' : 'text.primary' }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {}
      <Box
        id="steps"
        data-animate
        sx={{
          py: { xs: 8, sm: 12 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="ПРОЦЕСС"
              size="small"
              sx={{ mb: 2, bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.75rem', sm: '2.5rem' }, color: 'text.primary' }}>
              Как это работает
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto', fontWeight: 400 }}>
              Четыре простых шага от теории к уверенным навыкам кибербезопасности
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {steps.map((s, i) => (
              <Paper
                key={s.step}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  opacity: isVisible('steps') ? 1 : 0,
                  transform: isVisible('steps') ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 0.1}s`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 8,
                    fontSize: '5rem',
                    fontWeight: 900,
                    color: 'text.disabled',
                    opacity: 0.08,
                    lineHeight: 1,
                  }}
                >
                  {s.step}
                </Typography>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    color: 'white',
                  }}
                >
                  {s.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>{s.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{s.desc}</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      <Divider />

      {}
      <Box
        id="scenarios"
        data-animate
        sx={{
          py: { xs: 8, sm: 12 },
          bgcolor: isDark ? '#111111' : '#f5f5f5',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="СРЕДЫ"
              size="small"
              sx={{ mb: 2, bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.75rem', sm: '2.5rem' }, color: 'text.primary' }}>
              Сценарии обучения
            </Typography>
            <Typography sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
              Три уникальные среды с реалистичными киберугрозами
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {Object.entries(scenarioLocations).map(([key, loc], i) => (
              <Card
                key={key}
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  opacity: isVisible('scenarios') ? 1 : 0,
                  transform: isVisible('scenarios') ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 0.15}s`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    borderColor: 'success.main',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                      color: 'white',
                    }}
                  >
                    {iconMap[loc.icon]}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>{loc.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{loc.description}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <Divider />

      {}
      <Box
        id="attacks"
        data-animate
        sx={{
          py: { xs: 8, sm: 12 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="УГРОЗЫ"
              size="small"
              sx={{ mb: 2, bgcolor: 'error.light', color: 'error.contrastText', fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.75rem', sm: '2.5rem' }, color: 'text.primary' }}>
              Типы атак
            </Typography>
            <Typography sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
              Вы научитесь распознавать самые распространённые киберугрозы
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            {attackTypes.map((a, i) => {
              const severityColors: Record<string, { bg: string; border: string; chip: string }> = {
                critical: { bg: isDark ? 'rgba(211,47,47,0.1)' : '#FFEBEE', border: 'rgba(211,47,47,0.2)', chip: '#D32F2F' },
                high: { bg: isDark ? 'rgba(255,152,0,0.1)' : '#FFF3E0', border: 'rgba(255,152,0,0.2)', chip: '#FF9800' },
                medium: { bg: isDark ? 'rgba(255,235,59,0.08)' : '#FFFDE7', border: 'rgba(255,235,59,0.2)', chip: '#F9A825' },
              };
              const colors = severityColors[a.severity];

              return (
                <Paper
                  key={a.name}
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    borderRadius: 2,
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.bg,
                    transition: 'all 0.3s',
                    opacity: isVisible('attacks') ? 1 : 0,
                    transform: isVisible('attacks') ? 'translateY(0)' : 'translateY(20px)',
                    transitionDelay: `${i * 0.08}s`,
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <Box sx={{ color: colors.chip, mt: 0.5, flexShrink: 0 }}>{a.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>{a.name}</Typography>
                      <Chip
                        label={a.severity === 'critical' ? 'Крит.' : a.severity === 'high' ? 'Выс.' : 'Сред.'}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          bgcolor: colors.chip,
                          color: 'white',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{a.desc}</Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Container>
      </Box>

      <Divider />

      {}
      <Box
        id="features"
        data-animate
        sx={{
          py: { xs: 8, sm: 12 },
          bgcolor: isDark ? '#111111' : '#f5f5f5',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="ВОЗМОЖНОСТИ"
              size="small"
              sx={{ mb: 2, bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.75rem', sm: '2.5rem' }, color: 'text.primary' }}>
              Почему это работает
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {features.map((f, i) => (
              <Paper
                key={f.title}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  opacity: isVisible('features') ? 1 : 0,
                  transform: isVisible('features') ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 0.1}s`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: 'white',
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>{f.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{f.description}</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {}
      <Box
        sx={{
          py: { xs: 10, sm: 14 },
          bgcolor: isDark ? '#0a0a0a' : '#0d1117',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,125,50,0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              bgcolor: 'rgba(46,125,50,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              color: '#4CAF50',
            }}
          >
            <LockClosedIcon width={32} height={32} />
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              color: 'white',
            }}
          >
            Готовы защитить свои данные?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 400,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Начните обучение прямо сейчас — это бесплатно и занимает 15 минут в день
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/login')}
            endIcon={<ArrowRightIcon width={18} height={18} />}
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              px: 5,
              py: 1.75,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 24px rgba(46,125,50,0.3)',
              '&:hover': { bgcolor: 'success.dark', boxShadow: '0 8px 32px rgba(46,125,50,0.4)' },
            }}
          >
            Начать бесплатно
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
