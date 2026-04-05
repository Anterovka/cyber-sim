'use client';

import { useState } from 'react';
import type { ScenarioViewProps } from '../lib/types';
import ProgressBar from './ProgressBar';
import HackAnimation from './HackAnimation';
import ActionCard from './ActionCard';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import {EnvelopeClosedIcon, CardStackIcon, LockClosedIcon, PersonIcon, RocketIcon, GlobeIcon, DesktopIcon, ExclamationTriangleIcon, CheckCircledIcon, CrossCircledIcon, BookmarkIcon, BellIcon, BackpackIcon} from '@radix-ui/react-icons';
import MailClient from './simulators/MailClient';
import Messenger, { type ChatMessage } from './simulators/Messenger';
import PhoneSettings from './simulators/PhoneSettings';
import SMSSimulator from './simulators/SMSSimulator';
import CallSimulator from './simulators/CallSimulator';
import ATMSimulator from './simulators/ATMSimulator';
import PublicPCSimulator from './simulators/PublicPCSimulator';
import { useThemeMode } from '../lib/ThemeModeContext';
import { correctAlgorithms, resourceTags } from '@/lib/educationalContent';

const attackTypeLabels: Record<string, string> = {
  phishing: 'Фишинг',
  skimming: 'Скимминг',
  brute_force: 'Подбор пароля',
  social_engineering: 'Социальная инженерия',
  deepfake: 'Дипфейк',
  malware: 'Вредоносное ПО',
  man_in_the_middle: 'Человек посередине',
};

export default function ScenarioView({
  scenario,
  currentStep,
  onActionSelect,
  onContinue,
  showResult,
  isCorrect,
  consequence,
  securityLevel,
}: ScenarioViewProps) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [showHackAnim, setShowHackAnim] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [interacted, setInteracted] = useState(false);
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const step = scenario.steps[currentStep];
  if (!step) return null;


  const handleSimulatorAction = (action: string, data?: string) => {
    setInteracted(true);
    if (action === 'check_headers') setShowHeaders(true);
    if (action === 'click_link') {

      const badAction = step.actions.find((a) => a.id === 'a1');
      if (badAction) {
        setSelectedActionId(badAction.id);
        handleConfirm(badAction.id);
      }
    }
  };

  const handleConfirm = (actionId?: string) => {
    const id = actionId || selectedActionId;
    if (!id) return;
    const correct = id === step.correctActionId;
    if (!correct) setShowHackAnim(true);
    onActionSelect(id);
    setSelectedActionId(null);
  };


  const renderSimulator = () => {
    switch (scenario.attackType) {
      case 'phishing':
        return (
          <MailClient
            emails={step.simulatorData?.emails || []}
            selectedEmailId={step.simulatorData?.selectedEmailId || null}
            onSelectEmail={() => setInteracted(true)}
            onAction={handleSimulatorAction}
            showHeaders={showHeaders}
          />
        );
      case 'brute_force':
        return (
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BellIcon width={20} height={20} /> Уведомления безопасности
            </Typography>
            {[
              { time: '09:41', text: 'Неудачная попытка входа. IP: 185.xx.xx.xx (Нидерланды)', icon: <ExclamationTriangleIcon width={20} height={20} color="#FF9800" /> },
              { time: '09:43', text: 'Неудачная попытка входа. IP: 185.xx.xx.xx (Нидерланды)', icon: <ExclamationTriangleIcon width={20} height={20} color="#FF9800" /> },
              { time: '09:45', text: 'Неудачная попытка входа. IP: 185.xx.xx.xx (Нидерланды)', icon: <ExclamationTriangleIcon width={20} height={20} color="#FF9800" /> },
              { time: '09:47', text: 'Неудачная попытка входа. IP: 185.xx.xx.xx (Нидерланды)', icon: <ExclamationTriangleIcon width={20} height={20} color="#D32F2F" /> },
              { time: '09:48', text: 'Неудачная попытка входа. IP: 185.xx.xx.xx (Нидерланды)', icon: <ExclamationTriangleIcon width={20} height={20} color="#D32F2F" /> },
            ].map((n, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, mb: 1, borderRadius: 1, bgcolor: i >= 3 ? '#FFF8E1' : '#FFFFFF', borderColor: i >= 3 ? '#FF9800' : '#E0E0E0' }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  {n.icon}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{n.text}</Typography>
                    <Typography variant="caption" sx={{ color: '#9E9E9E' }}>{n.time}</Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Paper>
        );
      case 'skimming':
        return (
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Оплата ЖКХ онлайн</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#FFF8E1', borderColor: '#FF9800', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Вы на сайте: <strong>gosuslugi-oplata.com</strong></Typography>
              <Typography variant="caption" sx={{ color: '#E65100' }}>Настоящий сайт: gosuslugi.ru | HTTPS: нет</Typography>
            </Paper>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Номер лицевого счёта</Typography>
                <Typography variant="body2">7700123456</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Сумма</Typography>
                <Typography variant="body2">3 450 ₽</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Данные карты</Typography>
                <Typography variant="body2">**** **** **** 4523</Typography>
              </Box>
            </Box>
          </Paper>
        );
      case 'social_engineering':

        if (scenario.id === 'tech-support-scam') {
          return (
            <CallSimulator
              callerName="Microsoft Support"
              callerNumber="+7 (800) 555-01-99"
              callerAvatar="MS"
              isFake={true}
              script={[
                'Здравствуйте! Это техподдержка Microsoft. Мы обнаружили критические уязвимости на вашем компьютере.',
                'Если не принять меры сейчас, компьютер будет заблокирован.',
                'Установите AnyDesk для удалённой помощи: anydesk.com/download',
                'СРОЧНО! Иначе компьютер будет заблокирован!',
              ]}
              onAction={handleSimulatorAction}
            />
          );
        }
        return (
          <Messenger
            contacts={step.simulatorData?.contacts || []}
            messages={step.simulatorData?.messages || []}
            selectedContactId={step.simulatorData?.selectedContactId || null}
            onSelectContact={() => setInteracted(true)}
            onAction={handleSimulatorAction}
            showWarning={false}
          />
        );
      case 'man_in_the_middle':
        if (scenario.id === 'public-pc') {
          return <PublicPCSimulator onAction={handleSimulatorAction} />;
        }
        return (
          <PhoneSettings
            settings={step.simulatorData?.settings || []}
            onToggle={() => setInteracted(true)}
            onAction={handleSimulatorAction}
            connectedWifi={step.simulatorData?.connectedWifi}
            showWarning={true}
          />
        );
      case 'deepfake':
        if (scenario.id === 'deepfake-relative') {
          return (
            <SMSSimulator
              messages={step.simulatorData?.messages?.map((m) => ({
                id: m.id,
                sender: m.senderName,
                senderNumber: '+7 (999) 123-45-67',
                text: m.text,
                time: m.timestamp,
                isRead: false,
                isPhishing: m.isFake,
                linkUrl: m.linkUrl,
              })) || []}
              selectedId={step.simulatorData?.selectedContactId || null}
              onSelect={() => setInteracted(true)}
              onAction={handleSimulatorAction}
            />
          );
        }
        return (
          <Messenger
            contacts={step.simulatorData?.contacts || []}
            messages={step.simulatorData?.messages || []}
            selectedContactId={step.simulatorData?.selectedContactId || null}
            onSelectContact={() => setInteracted(true)}
            onAction={handleSimulatorAction}
            showWarning={true}
          />
        );
      case 'phishing':
        if (scenario.id === 'smishing-delivery') {
          return (
            <SMSSimulator
              messages={step.simulatorData?.messages?.map((m) => ({
                id: m.id,
                sender: m.senderName,
                senderNumber: '+7 (900) 123-45-67',
                text: m.text,
                time: m.timestamp,
                isRead: false,
                isPhishing: m.isFake,
                linkUrl: m.linkUrl,
                linkText: m.linkUrl,
              })) || []}
              selectedId={step.simulatorData?.selectedContactId || null}
              onSelect={() => setInteracted(true)}
              onAction={handleSimulatorAction}
            />
          );
        }
        return (
          <MailClient
            emails={step.simulatorData?.emails || []}
            selectedEmailId={step.simulatorData?.selectedEmailId || null}
            onSelectEmail={() => setInteracted(true)}
            onAction={handleSimulatorAction}
            showHeaders={showHeaders}
          />
        );
      case 'malware':
        return (
          <MailClient
            emails={step.simulatorData?.emails || []}
            selectedEmailId={step.simulatorData?.selectedEmailId || null}
            onSelectEmail={() => setInteracted(true)}
            onAction={handleSimulatorAction}
            showHeaders={showHeaders}
          />
        );
      case 'skimming':
        if (scenario.id === 'atm-skimming') {
          return <ATMSimulator onAction={handleSimulatorAction} />;
        }
        return (
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Оплата ЖКХ онлайн</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#FFF8E1', borderColor: '#FF9800', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Вы на сайте: <strong>gosuslugi-oplata.com</strong></Typography>
              <Typography variant="caption" sx={{ color: '#E65100' }}>Настоящий сайт: gosuslugi.ru | HTTPS: нет</Typography>
            </Paper>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Номер лицевого счёта</Typography>
                <Typography variant="body2">7700123456</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Сумма</Typography>
                <Typography variant="body2">3 450 ₽</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Данные карты</Typography>
                <Typography variant="body2">**** **** **** 4523</Typography>
              </Box>
            </Box>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {}
      <Paper sx={{ p: 2.5, background: isDark ? 'linear-gradient(135deg, #1B5E20 0%, #1B5E20 100%)' : 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', color: 'white', borderRadius: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip label={attackTypeLabels[scenario.attackType]} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Сложность: {scenario.difficulty}/10</Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{scenario.title}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>{scenario.description}</Typography>
      </Paper>

      {}
      <ProgressBar value={securityLevel} max={100} label="Уровень безопасности" color={securityLevel > 60 ? 'green' : securityLevel > 30 ? 'yellow' : 'red'} />

      {}
      <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
        {scenario.narrative.map((text, i) => (
          <Typography key={i} variant="body1" sx={{ mb: 1, color: '#757575', lineHeight: 1.7 }}>{text}</Typography>
        ))}
        <Paper variant="outlined" sx={{ p: 2, mt: 2, borderLeft: 4, borderLeftColor: '#2E7D32', bgcolor: '#F5F5F5', borderRadius: 1 }}>
          <Typography variant="body1" sx={{ color: '#212121' }}>{step.narrative}</Typography>
        </Paper>
      </Paper>

      {}
      {renderSimulator()}

      {}
      {!showChoices && !showResult && (
        <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: isDark ? 'rgba(102,187,106,0.1)' : '#E8F5E9', border: '1px solid', borderColor: isDark ? '#4CAF50' : '#2E7D32', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: isDark ? '#66BB6A' : '#1B5E20' }}>
            Что вы будете делать?
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#81C784' : '#2E7D32', mb: 2 }}>
            Изучите ситуацию выше и выберите правильное действие
          </Typography>
          <Button variant="contained" onClick={() => setShowChoices(true)} sx={{ borderRadius: 1 }}>
            Показать варианты
          </Button>
        </Paper>
      )}

      {}
      {showChoices && !showResult && (
        <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
          <ActionCard
            actions={step.actions}
            onSelect={(id) => setSelectedActionId(id)}
            disabled={false}
            selectedId={selectedActionId}
          />
          {selectedActionId && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" onClick={() => setSelectedActionId(null)} sx={{ borderRadius: 1 }}>Отмена</Button>
              <Button variant="contained" onClick={() => handleConfirm()} sx={{ borderRadius: 1 }}>✓ Подтвердить выбор</Button>
            </Box>
          )}
        </Paper>
      )}

      {}
      {showHackAnim && !isCorrect && (
        <HackAnimation
          attackType={scenario.attackType}
          consequence={consequence}
          onContinue={() => { setShowHackAnim(false); onContinue(); }}
        />
      )}

      {}
      {showResult && !showHackAnim && (
        <Alert severity={isCorrect ? 'success' : 'error'} variant="filled" sx={{ borderRadius: 1 }}>
          <AlertTitle sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 1 }}>
            {isCorrect ? 'Угроза предотвращена!' : 'Ошибка!'}
          </AlertTitle>
          <Typography variant="body2" sx={{ opacity: 0.95, mb: 2 }}>{consequence}</Typography>

          {}
          {!isCorrect && correctAlgorithms[scenario.attackType] && (
            <Paper
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'rgba(76,175,80,0.12)',
                border: '1px solid rgba(76,175,80,0.25)',
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#66BB6A', mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.85rem' }}>
                🛡️ Как правильно действовать
              </Typography>
              <Typography variant="body2" sx={{ color: '#A5D6A7', lineHeight: 1.7, mb: 1, whiteSpace: 'pre-line' }}>
                {correctAlgorithms[scenario.attackType]}
              </Typography>
              {resourceTags[scenario.attackType] && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {resourceTags[scenario.attackType].map((res: string, i: number) => (
                    <Chip
                      key={i}
                      label={res}
                      size="small"
                      sx={{ bgcolor: 'rgba(76,175,80,0.15)', color: '#66BB6A', border: '1px solid rgba(76,175,80,0.3)', fontSize: '0.65rem', height: 22 }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          )}

          {(scenario.cweReference || scenario.owaspReference) && (
            <Box sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <BackpackIcon width={16} height={16} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Образовательные материалы:</Typography>
              </Box>
              {scenario.cweReference && (
                <Link href={`https://cwe.mitre.org/data/definitions/${scenario.cweReference.split(':')[1]}.html`} target="_blank" sx={{ color: 'inherit', display: 'block', mb: 0.5 }}>
                  <Typography variant="caption">{scenario.cweReference}</Typography>
                </Link>
              )}
              {scenario.owaspReference && (
                <Link href="https://owasp.org/Top10/" target="_blank" sx={{ color: 'inherit' }}>
                  <Typography variant="caption">{scenario.owaspReference}</Typography>
                </Link>
              )}
            </Box>
          )}
          <Button variant="contained" onClick={onContinue} sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }, borderRadius: 1 }}>
            Продолжить
          </Button>
        </Alert>
      )}
    </Box>
  );
}
