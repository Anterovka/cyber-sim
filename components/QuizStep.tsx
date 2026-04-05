'use client';

import { useState, useEffect } from 'react';
import type { QuizStep as QuizStepType, QuizSession } from '../lib/quizTypes';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import {CheckCircledIcon, CrossCircledIcon, LightningBoltIcon, ExclamationTriangleIcon, ArrowRightIcon, ReloadIcon} from '@radix-ui/react-icons';
import HackAnimation from './HackAnimation';

interface QuizStepProps {
  step: QuizStepType;
  session: QuizSession;
  onOptionSelect: (optionId: string) => void;
  onTryAgain: () => void;
  onNextStep: () => void;
  isDark: boolean;
}

export default function QuizStep({ step, session, onOptionSelect, onTryAgain, onNextStep, isDark }: QuizStepProps) {
  const selectedOption = step.options.find((o) => o.id === session.selectedOptionId);
  const isWrong = session.stepStatus === 'wrong';
  const isCorrect = session.stepStatus === 'correct';
  const [showHackAnim, setShowHackAnim] = useState(false);


  useEffect(() => {
    if (isWrong && !showHackAnim) {
      setShowHackAnim(true);
    }
  }, [isWrong]);

  const handleHackContinue = () => {
    setShowHackAnim(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {}
      <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: isDark ? '#1E1E1E' : '#FFFFFF', border: `1px solid ${isDark ? '#333' : '#E0E0E0'}` }}>
        <Typography variant="body1" sx={{ color: isDark ? '#E0E0E0' : '#212121', lineHeight: 1.7, mb: 2 }}>
          {step.context}
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#E0E0E0' : '#212121' }}>
          {step.question}
        </Typography>

        {}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {step.options.map((option, index) => {
            const isSelected = option.id === session.selectedOptionId;
            let borderColor = isDark ? '#333' : '#E0E0E0';
            let bgcolor = isDark ? '#1E1E1E' : '#FFFFFF';
            let avatarBg = isDark ? '#333' : '#F5F5F5';
            let avatarColor = isDark ? '#BDBDBD' : '#757575';

            if (isWrong && isSelected) {
              borderColor = '#D32F2F';
              bgcolor = isDark ? 'rgba(211,47,47,0.1)' : '#FFEBEE';
              avatarBg = '#D32F2F';
              avatarColor = 'white';
            } else if (isCorrect && isSelected) {
              borderColor = '#2E7D32';
              bgcolor = isDark ? 'rgba(46,125,50,0.1)' : '#E8F5E9';
              avatarBg = '#2E7D32';
              avatarColor = 'white';
            } else if (isSelected && session.stepStatus === 'answering') {
              borderColor = '#2E7D32';
              bgcolor = isDark ? 'rgba(46,125,50,0.1)' : '#E8F5E9';
              avatarBg = '#2E7D32';
              avatarColor = 'white';
            }

            return (
              <Card
                key={option.id}
                sx={{
                  border: 2,
                  borderStyle: 'solid',
                  borderColor,
                  bgcolor,
                  transition: 'all 0.2s',
                  '&:hover': session.stepStatus === 'answering' ? { borderColor: '#2E7D32', bgcolor: isDark ? 'rgba(46,125,50,0.05)' : '#E8F5E9' } : {},
                }}
              >
                <CardActionArea
                  onClick={() => session.stepStatus === 'answering' && onOptionSelect(option.id)}
                  disabled={session.stepStatus !== 'answering'}
                  sx={{ p: 1 }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: avatarBg, color: avatarColor, borderRadius: 1, fontSize: '0.85rem', fontWeight: 700 }}>
                      {String.fromCharCode(65 + index)}
                    </Avatar>
                    <Typography sx={{ flex: 1, color: isDark ? '#E0E0E0' : '#212121', fontWeight: isSelected ? 600 : 400 }}>
                      {option.text}
                    </Typography>
                    {isWrong && isSelected && <CrossCircledIcon width={20} height={20} color="#D32F2F" />}
                    {isCorrect && isSelected && <CheckCircledIcon width={20} height={20} color="#2E7D32" />}
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Paper>

      {}
      {isWrong && selectedOption && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {}
          {showHackAnim ? (
            <HackAnimation
              attackType={(step as any).attackType || 'phishing'}
              consequence={step.consequence}
              onContinue={handleHackContinue}
            />
          ) : (
            <>
              {}
              <Alert severity="error" variant="filled" sx={{ borderRadius: 1.5 }}>
                <AlertTitle sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ExclamationTriangleIcon width={18} height={18} /> Неправильно!
                </AlertTitle>
                {selectedOption.explanation && (
                  <Typography variant="body2" sx={{ mb: 1, opacity: 0.95 }}>
                    {selectedOption.explanation}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {step.consequence}
                </Typography>
              </Alert>

              {}
              {session.hintShown && (
                <Paper sx={{ p: 2, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,167,38,0.1)' : '#FFF8E1', border: `1px solid ${isDark ? '#FFA726' : '#FF9800'}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ color: isDark ? '#FFA726' : '#F57C00', mt: 0.5 }}>
                      <LightningBoltIcon width={20} height={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#FFA726' : '#E65100', mb: 0.5 }}>
                        Подсказка:
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDark ? '#FFB74D' : '#BF360C' }}>
                        {step.hint}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {}
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(76,175,80,0.06)' : '#E8F5E9',
                  border: `1px solid ${isDark ? 'rgba(76,175,80,0.2)' : '#4CAF50'}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4CAF50', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🛡️ Как правильно действовать
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#C8E6C9' : '#2E7D32', lineHeight: 1.8, mb: 1.5 }}>
                  {getCorrectAlgorithm((step as any).attackType || 'phishing')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {getResources((step as any).attackType || 'phishing').map((res, i) => (
                    <Chip
                      key={i}
                      label={res}
                      size="small"
                      sx={{
                        bgcolor: isDark ? 'rgba(76,175,80,0.15)' : 'rgba(76,175,80,0.1)',
                        color: '#4CAF50',
                        border: '1px solid rgba(76,175,80,0.3)',
                        fontSize: '0.7rem',
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </>
          )}

          {}
          {!showHackAnim && (
            <Button
              variant="contained"
              onClick={onTryAgain}
              startIcon={<ReloadIcon width={18} height={18} />}
              fullWidth
              sx={{ borderRadius: 1.5, py: 1.5, bgcolor: isDark ? '#424242' : '#757575', '&:hover': { bgcolor: isDark ? '#616161' : '#616161' } }}
            >
              Попробовать снова
            </Button>
          )}
        </Box>
      )}

      {}
      {isCorrect && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="success" variant="filled" sx={{ borderRadius: 1.5 }}>
            <AlertTitle sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircledIcon width={18} height={18} /> Правильно!
            </AlertTitle>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              Отлично! Вы правильно определили угрозу.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            onClick={onNextStep}
            endIcon={<ArrowRightIcon width={18} height={18} />}
            fullWidth
            sx={{ borderRadius: 1.5, py: 1.5 }}
          >
            {session.currentStepIndex + 1 >= (step as any)._totalSteps ? 'Завершить' : 'Следующий шаг'}
          </Button>
        </Box>
      )}
    </Box>
  );
}

const correctAlgorithms: Record<string, string> = {
  phishing:
    '1️⃣ Наведите курсор на ссылку, не нажимая — посмотрите реальный URL в статусной строке браузера.\n' +
    '2️⃣ Проверьте домен: sberbank.ru ≠ sberbank-security.verify-account.ru.\n' +
    '3️⃣ Проверьте SPF/DKIM заголовки письма (Show Original).\n' +
    '4️⃣ Не открывайте вложения от неизвестных отправителей.\n' +
    '5️⃣ При сомнениях — откройте сайт банка вручную через адресную строку.',
  skimming:
    '1️⃣ Осмотрите банкомат: накладки на картридер, камеры, подозрительные устройства.\n' +
    '2️⃣ Прикройте руку при вводе PIN-кода.\n' +
    '3️⃣ Используйте бесконтактную оплату (NFC) — скиммер не перехватит данные.\n' +
    '4️⃣ Настройте push-уведомления о каждой операции по карте.\n' +
    '5️⃣ При подозрении — заблокируйте карту в приложении банка.',
  brute_force:
    '1️⃣ Используйте уникальные пароли длиной 12+ символов.\n' +
    '2️⃣ Включите двухфакторную аутентификацию (2FA).\n' +
    '3️⃣ Используйте менеджер паролей (KeePass, Bitwarden).\n' +
    '4️⃣ Не используйте один пароль на нескольких сайтах.\n' +
    '5️⃣ Регулярно проверяйте утечки на haveibeenpwned.com.',
  social_engineering:
    '1️⃣ Банки НИКОГДА не звонят с просьбой сообщить код из SMS.\n' +
    '2️⃣ Положите трубку и перезвоните в банк по номеру с официальной карты.\n' +
    '3️⃣ Не сообщайте коды подтверждения, CVV, PIN.\n' +
    '4️⃣ Не переходите по ссылкам из SMS от «банка».\n' +
    '5️⃣ Сообщите о звонке в отдел безопасности банка.',
  deepfake:
    '1️⃣ Задайте контрольный вопрос, который знает только реальный человек.\n' +
    '2️⃣ Обратите внимание на артефакты: неестественную мимику, рассинхронизацию губ.\n' +
    '3️⃣ Перезвоните по известному номеру для подтверждения.\n' +
    '4️⃣ Не переводите деньги по голосовым запросам без дополнительной верификации.\n' +
    '5️⃣ Используйте «стоп-слово» с близкими для экстренных ситуаций.',
  malware:
    '1️⃣ Не скачивайте файлы из непроверенных источников.\n' +
    '2️⃣ Проверяйте расширения файлов (.exe.pdf — это исполняемый файл!).\n' +
    '3️⃣ Используйте антивирус и регулярно обновляйте ОС.\n' +
    '4️⃣ Не разрешайте макросы в документах Word/Excel.\n' +
    '5️⃣ При заражении — отключите устройство от сети и сообщите в ИТ-отдел.',
  man_in_the_middle:
    '1️⃣ Не подключайтесь к открытым Wi-Fi без VPN.\n' +
    '2️⃣ Проверяйте HTTPS и замок в адресной строке.\n' +
    '3️⃣ Не вводите пароли и данные карт в публичных сетях.\n' +
    '4️⃣ Используйте VPN для шифрования всего трафика.\n' +
    '5️⃣ Отключите автоподключение к открытым сетям на устройстве.',
  smishing:
    '1️⃣ Не переходите по ссылкам из SMS от неизвестных отправителей.\n' +
    '2️⃣ Компании не рассылают ссылки на «подтверждение» через SMS.\n' +
    '3️⃣ Проверьте номер: короткие номера часто подделываются.\n' +
    '4️⃣ Удалите подозрительное SMS и заблокируйте номер.\n' +
    '5️⃣ Сообщите о фишинговом SMS оператору связи.',
  ransomware:
    '1️⃣ Регулярно делайте резервные копии на внешние носители.\n' +
    '2️⃣ Не открывайте вложения из подозрительных писем.\n' +
    '3️⃣ Не платите выкуп — нет гарантии восстановления данных.\n' +
    '4️⃣ Отключите устройство от сети при первых признаках шифрования.\n' +
    '5️⃣ Обратитесь в правоохранительные органы и ИТ-отдел.',
};

const resourceTags: Record<string, string[]> = {
  phishing: ['OWASP A03: Injection', 'CWE-79', 'SPF/DKIM/DMARC', 'Минцифры: фишинг'],
  skimming: ['OWASP A01: Broken Access', 'CWE-306', 'NFC безопасность', 'Касперский: банки'],
  brute_force: ['OWASP A07: Auth Failure', 'CWE-521', '2FA', 'haveibeenpwned.com'],
  social_engineering: ['OWASP A09: Security Log', 'CWE-74', 'Соц. инженерия', 'Минцифры: звонки'],
  deepfake: ['CWE-345', 'Дипфейки', 'Верификация', 'Стоп-слово'],
  malware: ['OWASP A08: Data Integrity', 'CWE-94', 'Антивирус', 'Макросы Office'],
  man_in_the_middle: ['OWASP A02: Crypto Failure', 'CWE-295', 'VPN', 'TLS 1.3'],
  smishing: ['CWE-79', 'SMS-фишинг', 'Минцифры', 'Касперский: мобильные'],
  ransomware: ['OWASP A05: Security Misconfig', 'CWE-732', 'Бэкапы', 'Правоохранительные органы'],
};

function getCorrectAlgorithm(attackType: string): string {
  return correctAlgorithms[attackType] || correctAlgorithms.phishing;
}

function getResources(attackType: string): string[] {
  return resourceTags[attackType] || resourceTags.phishing;
}
