'use client';

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import {
  LockClosedIcon,
  LockOpen2Icon,
  ExclamationTriangleIcon,
  DownloadIcon,
  PaperPlaneIcon,
  PersonIcon,
  CrossCircledIcon,
  EyeOpenIcon,
  RocketIcon,
  ArchiveIcon,
} from '@radix-ui/react-icons';

const glitchKeyframes = `
  @keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-3px, 3px); }
    40% { transform: translate(-3px, -3px); }
    60% { transform: translate(3px, 3px); }
    80% { transform: translate(3px, -3px); }
    100% { transform: translate(0); }
  }
  @keyframes glitchText {
    0% { opacity: 1; }
    50% { opacity: 0.8; text-shadow: 2px 0 #ff0000, -2px 0 #00ffff; }
    100% { opacity: 1; text-shadow: none; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scanline {
    0% { top: 0%; }
    100% { top: 100%; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes borderGlow {
    0%, 100% { box-shadow: 0 0 5px rgba(211, 47, 47, 0.5); }
    50% { box-shadow: 0 0 20px rgba(211, 47, 47, 0.8), 0 0 40px rgba(211, 47, 47, 0.3); }
  }
`;

interface HackStep {
  icon: React.ReactNode;
  label: string;
  description: string;
  severity: 'warning' | 'error' | 'info';
}

const hackSteps: Record<string, HackStep[]> = {
  phishing: [
    { icon: <EyeOpenIcon />, label: 'Переход по ссылке', description: 'Вы перешли по фишинговой ссылке', severity: 'warning' },
    { icon: <LockOpen2Icon />, label: 'Ввод данных', description: 'Вы ввели логин и пароль на поддельном сайте', severity: 'error' },
    { icon: <DownloadIcon />, label: 'Кража данных', description: 'Злоумышленник получил ваши учётные данные', severity: 'error' },
    { icon: <PaperPlaneIcon />, label: 'Рассылка от вашего имени', description: 'Мошенники отправили фишинговые письма вашим коллегам', severity: 'error' },
    { icon: <CrossCircledIcon />, label: 'Утечка данных', description: 'Конфиденциальные документы компании скачаны', severity: 'error' },
  ],
  brute_force: [
    { icon: <RocketIcon />, label: 'Начало атаки', description: 'Злоумышленник запустил подбор пароля', severity: 'warning' },
    { icon: <ExclamationTriangleIcon />, label: 'Перебор вариантов', description: 'Проверены 10 000+ комбинаций за 5 минут', severity: 'warning' },
    { icon: <LockOpen2Icon />, label: 'Пароль подобран', description: 'Ваш пароль оказался в словаре популярных', severity: 'error' },
    { icon: <PersonIcon />, label: 'Вход в аккаунт', description: 'Злоумышленник вошёл в вашу учётную запись', severity: 'error' },
    { icon: <PaperPlaneIcon />, label: 'Рассылка коллегам', description: 'От вашего имени отправлены вредоносные письма', severity: 'error' },
  ],
  social_engineering: [
    { icon: <PersonIcon />, label: 'Звонок мошенника', description: 'Вам позвонил злоумышленник под видом сотрудника банка', severity: 'warning' },
    { icon: <ExclamationTriangleIcon />, label: 'Манипуляция', description: 'Он назвал ваши данные и создал ощущение срочности', severity: 'warning' },
    { icon: <LockOpen2Icon />, label: 'Раскрытие кода', description: 'Вы сообщили код из SMS для «подтверждения»', severity: 'error' },
    { icon: <DownloadIcon />, label: 'Перевод средств', description: 'Мошенник подтвердил перевод 15 000₽', severity: 'error' },
    { icon: <CrossCircledIcon />, label: 'Потеря денег', description: 'Деньги переведены на счёт мошенника', severity: 'error' },
  ],
  skimming: [
    { icon: <EyeOpenIcon />, label: 'Поддельный сайт', description: 'Вы зашли на фишинговый сайт оплаты ЖКХ', severity: 'warning' },
    { icon: <LockOpen2Icon />, label: 'Ввод данных карты', description: 'Вы ввели номер, CVV и срок действия', severity: 'error' },
    { icon: <DownloadIcon />, label: 'Перехват данных', description: 'Данные карты отправлены злоумышленнику', severity: 'error' },
    { icon: <ExclamationTriangleIcon />, label: 'Несанкционированные списания', description: 'С вашего счёта начали списывать деньги', severity: 'error' },
    { icon: <CrossCircledIcon />, label: 'Потеря средств', description: 'Списано 47 000₽ за неделю', severity: 'error' },
  ],
  man_in_the_middle: [
    { icon: <LockClosedIcon />, label: 'Подключение к Wi-Fi', description: 'Вы подключились к открытой сети в кафе', severity: 'info' },
    { icon: <ExclamationTriangleIcon />, label: 'MITM-атака', description: 'Злоумышленник в той же сети перехватывает трафик', severity: 'warning' },
    { icon: <LockOpen2Icon />, label: 'Подмена сертификата', description: 'SSL-сертификат подменён через ARP-spoofing', severity: 'error' },
    { icon: <EyeOpenIcon />, label: 'Перехват сессии', description: 'Куки сессии онлайн-банка перехвачены', severity: 'error' },
    { icon: <CrossCircledIcon />, label: 'Доступ к счёту', description: 'Злоумышленник получил доступ к вашему счёту', severity: 'error' },
  ],
  malware: [
    { icon: <ArchiveIcon />, label: 'Открытие вложения', description: 'Вы открыли Excel-файл из подозрительного письма', severity: 'warning' },
    { icon: <ExclamationTriangleIcon />, label: 'Включение макросов', description: 'Вы разрешили выполнение макросов', severity: 'error' },
    { icon: <LockOpen2Icon />, label: 'Запуск вредоносного кода', description: 'Макрос установил шифровальщик на ваш ПК', severity: 'error' },
    { icon: <DownloadIcon />, label: 'Шифрование файлов', description: 'Все файлы на ПК и сервере зашифрованы', severity: 'error' },
    { icon: <CrossCircledIcon />, label: 'Требование выкупа', description: 'Мошенники требуют 200 000₽ за расшифровку', severity: 'error' },
  ],
  deepfake: [
    { icon: <PersonIcon />, label: 'Видеозвонок', description: 'Вам позвонил «руководитель» по видеосвязи', severity: 'info' },
    { icon: <RocketIcon />, label: 'AI-подделка', description: 'Голос и лицо были сгенерированы нейросетью', severity: 'warning' },
    { icon: <EyeOpenIcon />, label: 'Доверие', description: 'Вы поверили, что это действительно руководитель', severity: 'warning' },
    { icon: <DownloadIcon />, label: 'Перевод денег', description: 'Вы перевели 250 000₽ на счёт мошенников', severity: 'error' },
    { icon: <CrossCircledIcon />, label: 'Финансовые потери', description: 'Компания потеряла деньги, вас привлекли к ответственности', severity: 'error' },
  ],
};

function AnimatedStep({
  step,
  index,
  isActive,
  isCompleted,
}: {
  step: HackStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
}) {
  const severityColors: Record<string, string> = {
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  };

  const color = isCompleted ? severityColors[step.severity] : isActive ? '#fff' : '#555';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2,
        borderRadius: 1.5,
        bgcolor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
        animation: isActive ? 'slideIn 0.4s ease-out, pulse 2s ease-in-out infinite' : isCompleted ? 'slideIn 0.3s ease-out' : 'none',
        opacity: isCompleted ? 0.7 : isActive ? 1 : 0.3,
        transition: 'all 0.3s ease',
      }}
    >
      {}
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
          animation: isActive ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
      >
        {isCompleted ? '✓' : index + 1}
      </Box>

      {}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isActive ? 700 : 500,
            color: isActive ? '#fff' : '#999',
            mb: 0.5,
            animation: isActive ? 'glitchText 0.5s ease-in-out' : 'none',
          }}
        >
          {step.label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isActive ? '#ccc' : '#666',
            lineHeight: 1.4,
          }}
        >
          {step.description}
        </Typography>
      </Box>

      {}
      <Box
        sx={{
          color,
          display: 'flex',
          alignItems: 'center',
          animation: isActive ? 'pulse 1s ease-in-out infinite' : 'none',
        }}
      >
        {step.icon}
      </Box>
    </Box>
  );
}

interface HackAnimationProps {
  attackType: string;
  consequence: string;
  onContinue: () => void;
}

export default function HackAnimation({ attackType, consequence, onContinue }: HackAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);

  const steps = hackSteps[attackType] || hackSteps.phishing;
  const totalSteps = steps.length;

  useEffect(() => {
    if (currentStep >= totalSteps) {
      setIsComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 300);
      setCurrentStep((prev) => prev + 1);
    }, 1400);

    return () => clearTimeout(timer);
  }, [currentStep, totalSteps]);

  const progressPercent = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <>
      <style>{glitchKeyframes}</style>
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: '#1a1a2e',
          color: 'white',
          border: '2px solid #D32F2F',
          position: 'relative',
          overflow: 'hidden',
          animation: 'borderGlow 2s ease-in-out infinite',
        }}
      >
        {}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            bgcolor: 'rgba(255, 0, 0, 0.3)',
            animation: 'scanline 3s linear infinite',
            pointerEvents: 'none',
          }}
        />

        {}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
            animation: showGlitch ? 'glitch 0.3s ease-in-out' : 'none',
          }}
        >
          <CrossCircledIcon style={{ color: '#FF5252', fontSize: 24 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#FF5252',
              animation: showGlitch ? 'glitchText 0.3s ease-in-out' : 'none',
            }}
          >
            ⚠ ВЗЛОМ ПРОИЗОШЁЛ
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>
          Вот что произошло после вашего действия:
        </Typography>

        {}
        <Box sx={{ mb: 3 }}>
          {steps.map((step, index) => (
            <AnimatedStep
              key={index}
              step={step}
              index={index}
              isActive={index === currentStep}
              isCompleted={index < currentStep}
            />
          ))}
        </Box>

        {}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#888' }}>
              Прогресс атаки
            </Typography>
            <Typography variant="caption" sx={{ color: '#FF5252', fontWeight: 600 }}>
              {Math.round(progressPercent)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#333',
              '& .MuiLinearProgress-bar': {
                bgcolor: progressPercent >= 100 ? '#F44336' : '#FF9800',
                transition: 'width 0.5s ease',
              },
            }}
          />
        </Box>

        {}
        {isComplete && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 1.5,
              bgcolor: 'rgba(211, 47, 47, 0.15)',
              color: '#FF8A80',
              border: '1px solid rgba(211, 47, 47, 0.3)',
              animation: 'fadeInUp 0.5s ease-out',
            }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}> Итог:</AlertTitle>
            <Typography variant="body2">{consequence}</Typography>
          </Alert>
        )}

        {}
        <Button
          variant="contained"
          onClick={onContinue}
          disabled={!isComplete}
          fullWidth
          sx={{
            bgcolor: isComplete ? '#2E7D32' : '#333',
            color: isComplete ? '#fff' : '#666',
            borderRadius: 1.5,
            py: 1.5,
            fontWeight: 600,
            transition: 'all 0.3s ease',
            animation: isComplete ? 'fadeInUp 0.5s ease-out' : 'none',
            '&:hover': {
              bgcolor: isComplete ? '#1B5E20' : '#333',
            },
          }}
        >
          {isComplete ? '✓ Понятно, продолжить' : '...'}
        </Button>
      </Paper>
    </>
  );
}
