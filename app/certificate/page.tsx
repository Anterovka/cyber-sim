'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useProgressStore } from '../../lib/store';
import { requestCertificate } from '../../lib/api';
import type { Certificate } from '../../lib/types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import { QRCodeSVG } from 'qrcode.react';
import {StarFilledIcon, LockClosedIcon, DownloadIcon, ArrowLeftIcon, CalendarIcon, CheckCircledIcon} from '@radix-ui/react-icons';
import { useThemeMode } from '../../lib/ThemeModeContext';

const leagueConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Новичок', color: '#757575' },
  intermediate: { label: 'Средний', color: '#1976D2' },
  advanced: { label: 'Продвинутый', color: '#2E7D32' },
  expert: { label: 'Эксперт', color: '#FFD700' },
};

export default function CertificatePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { progress, loadProgress } = useProgressStore();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const certRef = useRef<HTMLDivElement>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [certError, setCertError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); }
    else {
      loadProgress();

      requestCertificate()
        .then(setCertificate)
        .catch((err) => setCertError(err.message || 'Ошибка получения сертификата'));
    }
  }, [isAuthenticated, loadProgress, router]);

  if (!isAuthenticated || !user || !progress) return null;

  const currentLeague = leagueConfig[progress.league || 'beginner'];
  const totalCompleted = progress.statistics.totalScenariosCompleted;
  const successRate = progress.statistics.successRate.toFixed(0);
  const issuedAt = certificate
    ? new Date(certificate.issuedAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });


  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const qrImageUrl = certificate?.qrCodeUrl
    ? `http://localhost:8000${certificate.qrCodeUrl}`
    : `${origin}/verify/${user.id}/${progress.totalScore}`;

  const handleDownloadQR = async () => {
    if (certificate?.qrCodeUrl) {

      const response = await fetch(`http://localhost:8000${certificate.qrCodeUrl}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `cybersim-qr-${user.username}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else {

      const svg = document.querySelector('[data-qr="true"] svg') as SVGElement;
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `cybersim-qr-${user.username}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const handleDownloadCert = async () => {
    const el = certRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`cybersim-certificate-${user.username}.pdf`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowLeftIcon width={18} height={18} />} onClick={() => router.push('/profile')} sx={{ mb: 3, borderRadius: 1.5 }}>
        Назад в профиль
      </Button>

      {certError && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 1.5 }}>
          {certError}. Сертификат отображается локально.
        </Alert>
      )}

      {}
      <Paper ref={certRef} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2, bgcolor: isDark ? '#1E1E1E' : '#FFFFFF', border: `3px solid ${currentLeague.color}` }}>
        {}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{ width: 72, height: 72, borderRadius: 3, bgcolor: currentLeague.color }}>
              <LockClosedIcon width={36} height={36} color="white" />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: currentLeague.color }}>
            CyberSim
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            Сертификат о прохождении обучения
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Настоящим подтверждается, что пользователь
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            {user.username}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            успешно завершил(а) курс «Основы кибербезопасности» и достиг(ла) уровня
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ px: 4, py: 2, borderRadius: 2, bgcolor: `${currentLeague.color}20`, border: `2px solid ${currentLeague.color}` }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: currentLeague.color }}>
                {currentLeague.label}
              </Typography>
            </Box>
          </Box>
        </Box>

        {}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
          {[
            { icon: <CheckCircledIcon width={18} height={18} />, label: 'Сценариев пройдено', value: totalCompleted },
            { icon: <StarFilledIcon width={18} height={18} />, label: 'Общий счёт', value: progress.totalScore },
            { icon: <LockClosedIcon width={18} height={18} />, label: 'Успешность', value: `${successRate}%` },
          ].map((s, i) => (
            <Box key={i} sx={{ textAlign: 'center', p: 2, borderRadius: 1.5, bgcolor: isDark ? '#252525' : '#F5F5F5' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, color: currentLeague.color }}>{s.icon}</Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        {}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon width={12} height={12} /> Дата выдачи: {issuedAt}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
              ID: {user.id}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box data-qr="true">
              {certificate?.qrCodeUrl ? (
                <img src={qrImageUrl} alt="QR Code" width={100} height={100} />
              ) : (
                <QRCodeSVG value={qrImageUrl} width={100} height={100} level="M" />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
              Отсканируйте для проверки
            </Typography>
          </Box>
        </Box>
      </Paper>

      {}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<DownloadIcon width={18} height={18} />} onClick={handleDownloadQR} sx={{ borderRadius: 1.5 }}>
          Скачать QR-код
        </Button>
        <Button variant="outlined" onClick={handleDownloadCert} sx={{ borderRadius: 1.5 }}>
          Сохранить сертификат
        </Button>
        <Button variant="contained" onClick={() => router.push('/profile')} sx={{ borderRadius: 1.5 }}>
          В профиль
        </Button>
      </Box>
    </Container>
  );
}
