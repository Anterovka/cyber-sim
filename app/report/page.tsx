'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { DownloadIcon, ReloadIcon, CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { useThemeMode } from '@/lib/ThemeModeContext';
import { getUserProgress } from '@/lib/api';
import type { UserProgress } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const attackTypeLabels: Record<string, string> = {
  phishing: 'Фишинг',
  skimming: 'Скимминг',
  brute_force: 'Подбор пароля',
  social_engineering: 'Соц. инженерия',
  deepfake: 'Дипфейки',
  malware: 'Вредоносное ПО',
  man_in_the_middle: 'MITM-атака',
  smishing: 'SMS-фишинг',
  ransomware: 'Программы-вымогатели',
};

function RadarChart({ data, size = 300 }: { data: { label: string; value: number; max: number }[]; size?: number }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const center = size / 2;
  const radius = size / 2 - 50;
  const levels = 5;

  const getPoint = (index: number, value: number) => {
    const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {}
      {Array.from({ length: levels }).map((_, level) => {
        const r = ((level + 1) / levels) * radius;
        const points = data
          .map((_, i) => {
            const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          })
          .join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth={1}
          />
        );
      })}

      {}
      {data.map((_, i) => {
        const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth={1}
          />
        );
      })}

      {}
      <polygon
        points={data.map((d, i) => `${getPoint(i, d.value).x},${getPoint(i, d.value).y}`).join(' ')}
        fill="rgba(76,175,80,0.2)"
        stroke="#4caf50"
        strokeWidth={2}
      />

      {}
      {data.map((d, i) => {
        const point = getPoint(i, d.value);
        return (
          <g key={i}>
            <circle cx={point.x} cy={point.y} r={4} fill="#4caf50" />
            <text
              x={center + (radius + 25) * Math.cos((i / data.length) * 2 * Math.PI - Math.PI / 2)}
              y={center + (radius + 25) * Math.sin((i / data.length) * 2 * Math.PI - Math.PI / 2) + 4}
              textAnchor="middle"
              fontSize={10}
              fill={isDark ? '#ccc' : '#333'}
              fontWeight={600}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function SecurityReport() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const router = useRouter();

  const loadProgress = async () => {
    setLoading(true);
    try {
      const data = await getUserProgress();
      setProgress(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const generatePDF = async () => {
    if (!reportRef.current || !progress) return;
    setGenerating(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CyberSim_Security_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!progress) {
    return (
      <Box sx={{ textAlign: 'center', p: 6 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Нет данных для отчёта</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Пройдите хотя бы один сценарий, чтобы получить отчёт
        </Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard')} sx={{ borderRadius: 2 }}>
          Перейти к сценариям
        </Button>
      </Box>
    );
  }


  const attackStats = progress.statistics?.attackTypeStats || {};
  const radarData = Object.entries(attackTypeLabels).map(([key, label]) => {
    const stat = attackStats[key as keyof typeof attackStats];
    const successRate = stat && stat.encountered > 0
      ? Math.round((stat.successfullyDefended / stat.encountered) * 100)
      : 50;
    return { label: label.slice(0, 10), value: successRate, max: 100 };
  });

  const overallScore = progress.statistics.totalScenariosCompleted > 0
    ? Math.round(((progress.statistics.totalScenariosCompleted - progress.statistics.totalMistakes) / progress.statistics.totalScenariosCompleted) * 100)
    : 0;

  const weakPoints = radarData
    .filter((d) => d.value < 50)
    .sort((a, b) => a.value - b.value);

  const strongPoints = radarData
    .filter((d) => d.value >= 70)
    .sort((a, b) => b.value - a.value);

  const recommendations = [
    ...(weakPoints.length > 0
      ? [`⚠️ Уделите внимание: ${weakPoints.map((w) => w.label).join(', ')}`]
      : ['✅ Отличная защита по всем направлениям!']),
    '📚 Изучите раздел ресурсов для углубления знаний',
    '🏆 Получите сертификат при достижении 70%+ успеха',
    '🔄 Повторите сценарии, где допустили ошибки',
  ];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            Security Report
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
            Персональный отчёт по кибербезопасности
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ReloadIcon />}
            onClick={loadProgress}
            sx={{ borderRadius: 2 }}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={generatePDF}
            disabled={generating}
            sx={{ borderRadius: 2 }}
          >
            {generating ? 'Генерация...' : 'Скачать PDF'}
          </Button>
        </Box>
      </Box>

      {}
      <Box
        ref={reportRef}
        sx={{
          position: 'absolute',
          left: -9999,
          top: 0,
          width: 794,
          bgcolor: isDark ? 'background.paper' : '#fff',
          p: 4,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          🛡️ CyberSim Security Report
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Дата: {new Date().toLocaleDateString('ru-RU')} | Пользователь: {(progress as any).username || 'N/A'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Card sx={{ flex: 1, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Общий балл</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, color: overallScore >= 70 ? '#4caf50' : '#ff6b6b' }}>
                {overallScore}%
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Сценариев пройдено</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {progress.statistics.totalScenariosCompleted}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Уровень безопасности</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, color: progress.securityLevel >= 70 ? '#4caf50' : '#ff6b6b' }}>
                {progress.securityLevel}/100
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <RadarChart data={radarData} size={280} />

        <Divider sx={{ my: 2, borderColor: 'divider' }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
          Рекомендации
        </Typography>
        {recommendations.map((rec, i) => (
          <Typography key={i} variant="body2" sx={{ mb: 1, color: isDark ? '#ccc' : '#555' }}>
            {rec}
          </Typography>
        ))}
      </Box>

      {}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {}
        <Card sx={{ flex: 1, borderRadius: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Карта уязвимостей
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart data={radarData} />
            </Box>
          </CardContent>
        </Card>

        {}
        <Card sx={{ flex: 1, borderRadius: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Обзор
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Общий балл</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={overallScore}
                    sx={{
                      flexGrow: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: overallScore >= 70 ? '#4caf50' : overallScore >= 40 ? '#ff9800' : '#f44336',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 40 }}>
                    {overallScore}%
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Сценариев пройдено</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{progress.statistics.totalScenariosCompleted}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Ошибок</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{progress.statistics.totalMistakes}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Уровень безопасности</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{progress.securityLevel}/100</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Лига</Typography>
                <Chip label={progress.league} size="small" color="primary" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {}
      <Box sx={{ display: 'flex', gap: 3, mt: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Card sx={{ flex: 1, borderRadius: 1, border: '1px solid', borderColor: 'error.light', bgcolor: isDark ? 'rgba(244,67,54,0.05)' : 'rgba(244,67,54,0.03)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CrossCircledIcon /> Слабые места
            </Typography>
            {weakPoints.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {weakPoints.map((wp, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">{wp.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{wp.value}%</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Слабых мест не обнаружено 🎉</Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 1, border: '1px solid', borderColor: 'success.main', bgcolor: isDark ? 'rgba(76,175,80,0.05)' : 'rgba(76,175,80,0.03)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircledIcon /> Сильные стороны
            </Typography>
            {strongPoints.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {strongPoints.map((sp, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">{sp.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>{sp.value}%</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Пока нет данных. Пройдите сценарии!</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {}
      <Card sx={{ mt: 3, borderRadius: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            📋 Персональные рекомендации
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recommendations.map((rec, i) => (
              <Typography key={i} variant="body2" sx={{ color: 'text.secondary' }}>
                {rec}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
