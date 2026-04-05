'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { useThemeMode } from '../../../lib/ThemeModeContext';
import { useProgressStore } from '../../../lib/store';
import { quizAttackTypeLabels, getQuizScenarioById } from '../../../lib/quizData';
import { getTasksForScenario } from '../../../lib/interactiveTaskData';
import type { InteractiveTask, TaskSession } from '../../../lib/interactiveTaskTypes';
import type { SimulatorData } from '../../../lib/quizTypes';
import { getImportedScenario } from '../../../lib/api';
import type { ImportedScenario } from '../../../lib/api';
import { correctAlgorithms, resourceTags } from '../../../lib/educationalContent';
import TaskRenderer from '../../../components/tasks/TaskRenderer';
import SimulatorRenderer from '../../../components/simulators/SimulatorRenderer';
import ProgressBar from '../../../components/ProgressBar';
import HackAnimation from '../../../components/HackAnimation';
import {
  LightningBoltIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  ReloadIcon,
  ArrowRightIcon,
  StarFilledIcon,
  StarIcon,
  BookmarkIcon,
  DesktopIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';

function createInitialSession(task: InteractiveTask): TaskSession {
  const base = { taskId: task.id, status: 'answering' as const, mistakes: 0, hintShown: false };
  switch (task.type) {
    case 'findOnScreen': return { ...base, findOnScreen: { foundElementIds: [] } };
    case 'orderSteps': return { ...base, orderSteps: { currentOrder: (task.data as any).shuffledSteps.map((s: any) => s.id) } };
    case 'matchPairs': return { ...base, matchPairs: { selectedLeft: null, matchedPairs: {} } };
    case 'textInput': return { ...base, textInput: { value: '' } };
    case 'multiSelect': return { ...base, multiSelect: { selectedOptionIds: [] } };
    default: return base;
  }
}

function ImportedScenarioView({ scenario }: { scenario: ImportedScenario }) {
  const router = useRouter();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: isDark ? '#E0E0E0' : '#212121' }}>
          {scenario.title}
        </Typography>
        <Typography variant="body1" sx={{ color: isDark ? '#BDBDBD' : '#757575', mb: 2 }}>
          {scenario.description}
        </Typography>
        <Chip label={scenario.attackType} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={() => router.push('/dashboard')}>К сценариям</Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default function InteractiveScenarioView() {
  const params = useParams();
  const router = useRouter();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const { progress, submitScenarioResult, updateSecurityLevel } = useProgressStore();

  const scenarioId = params.id as string;
  const quizScenario = getQuizScenarioById(scenarioId);
  const quizTasks = getTasksForScenario(scenarioId);

  const [importedScenario, setImportedScenarioState] = useState<ImportedScenario | null>(null);
  const [isLoadingImported, setIsLoadingImported] = useState(!quizScenario);

  useEffect(() => {
    if (!quizScenario) {
      getImportedScenario(scenarioId)
        .then((data) => { setImportedScenarioState(data); setIsLoadingImported(false); })
        .catch(() => setIsLoadingImported(false));
    }
  }, [quizScenario, scenarioId]);

  const isImported = !!importedScenario && !quizScenario;

  if (isLoadingImported) {
    return <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}><CircularProgress /></Container>;
  }

  if (!quizScenario && !importedScenario) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>Сценарий не найден</Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard')}>К сценариям</Button>
      </Container>
    );
  }

  if (isImported) {
    return <ImportedScenarioView scenario={importedScenario!} />;
  }

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [sessions, setSessions] = useState<TaskSession[]>(() => quizTasks!.map(createInitialSession));
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showHackAnimation, setShowHackAnimation] = useState(false);
  const [simulatorExpanded, setSimulatorExpanded] = useState(true);

  const currentTask = quizTasks![currentTaskIndex];
  const session = sessions[currentTaskIndex];

  const handleTaskComplete = useCallback((success: boolean) => {
    if (success) {
      setShowHackAnimation(false);
      if (currentTaskIndex + 1 >= quizTasks!.length) {
        const score = Math.max(0, 100 - totalMistakes * 10);
        submitScenarioResult(scenarioId, { score, mistakes: totalMistakes, timeSpentSeconds: 0 });
        setIsComplete(true);
      } else {
        setCurrentTaskIndex((prev) => prev + 1);
        setSimulatorExpanded(true);
      }
    } else {
      setShowHackAnimation(true);
      setSessions((prev) => {
        const newSessions = [...prev];
        newSessions[currentTaskIndex] = { ...session, status: 'wrong', mistakes: session.mistakes + 1, hintShown: true };
        return newSessions;
      });
      setTotalMistakes((prev) => prev + 1);
      updateSecurityLevel(-15);
    }
  }, [currentTaskIndex, quizTasks!.length, totalMistakes, session, scenarioId, submitScenarioResult, updateSecurityLevel]);

  const handleTryAgain = useCallback(() => {
    setSessions((prev) => {
      const newSessions = [...prev];
      newSessions[currentTaskIndex] = createInitialSession(currentTask);
      return newSessions;
    });
    setShowHackAnimation(false);
  }, [currentTaskIndex, currentTask]);

  // Экран завершения
  if (isComplete) {
    const score = Math.max(0, 100 - totalMistakes * 10);
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 2, textAlign: 'center', bgcolor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ color: totalMistakes === 0 ? 'success.main' : totalMistakes <= 2 ? 'text.secondary' : 'text.secondary' }}>
              {totalMistakes === 0 ? <StarFilledIcon width={64} height={64} /> : totalMistakes <= 2 ? <StarIcon width={64} height={64} /> : <BookmarkIcon width={64} height={64} />}
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: isDark ? '#E0E0E0' : '#212121' }}>Все задания пройдены!</Typography>
          <Typography variant="body1" sx={{ color: isDark ? '#BDBDBD' : '#757575', mb: 3 }}>{quizScenario!.title}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: isDark ? '#252525' : '#F5F5F5' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#E0E0E0' : '#212121' }}>{score}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#BDBDBD' : '#757575' }}>Очки</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: isDark ? '#252525' : '#F5F5F5' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#E0E0E0' : '#212121' }}>{totalMistakes}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#BDBDBD' : '#757575' }}>Ошибки</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: isDark ? '#252525' : '#F5F5F5' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#E0E0E0' : '#212121' }}>{quizTasks!.length}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#BDBDBD' : '#757575' }}>Заданий</Typography>
            </Paper>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ borderRadius: 1.5 }}>К сценариям</Button>
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ borderRadius: 1.5 }}>Пройти снова</Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Handlers для TaskRenderer
  const taskHandlers = {
    onFindElementClick: (id: string) => {
      setSessions((prev) => {
        const newSessions = [...prev];
        const s = newSessions[currentTaskIndex];
        const found = s.findOnScreen!.foundElementIds.includes(id)
          ? s.findOnScreen!.foundElementIds.filter((e: string) => e !== id)
          : [...s.findOnScreen!.foundElementIds, id];
        newSessions[currentTaskIndex] = { ...s, findOnScreen: { foundElementIds: found } };
        return newSessions;
      });
    },
    onFindCheck: () => {
      const s = session.findOnScreen!;
      const task = currentTask;
      const correct = (task.data as any).targetElementIds.every((id: string) => s.foundElementIds.includes(id)) &&
        s.foundElementIds.every((id: string) => (task.data as any).targetElementIds.includes(id));
      handleTaskComplete(correct);
    },
    onFindReset: () => handleTryAgain(),

    onOrderReorder: (order: string[]) => {
      setSessions((prev) => {
        const newSessions = [...prev];
        newSessions[currentTaskIndex] = { ...session, orderSteps: { currentOrder: order } };
        return newSessions;
      });
    },
    onOrderCheck: () => {
      const correct = session.orderSteps!.currentOrder.every((id, i) => id === ((currentTask.data) as any).correctOrder[i]);
      handleTaskComplete(correct);
    },
    onOrderReset: () => handleTryAgain(),

    onMatchSelectLeft: (id: string) => {
      setSessions((prev) => {
        const newSessions = [...prev];
        newSessions[currentTaskIndex] = { ...session, matchPairs: { ...session.matchPairs!, selectedLeft: id } };
        return newSessions;
      });
    },
    onMatchSelectRight: (id: string) => {
      if (!session.matchPairs!.selectedLeft) return;
      setSessions((prev) => {
        const newSessions = [...prev];
        const pairs = { ...session.matchPairs!.matchedPairs, [session.matchPairs!.selectedLeft!]: id };
        newSessions[currentTaskIndex] = { ...session, matchPairs: { ...session.matchPairs!, matchedPairs: pairs, selectedLeft: null } };
        return newSessions;
      });
    },
    onMatchUnmatch: (leftId: string) => {
      setSessions((prev) => {
        const newSessions = [...prev];
        const pairs = { ...session.matchPairs!.matchedPairs };
        delete pairs[leftId];
        newSessions[currentTaskIndex] = { ...session, matchPairs: { ...session.matchPairs!, matchedPairs: pairs } };
        return newSessions;
      });
    },
    onMatchCheck: () => {
      const pairs = session.matchPairs!.matchedPairs;
      const correct = Object.entries(pairs).every(([l, r]) => ((currentTask.data) as any).correctPairs[l] === r) &&
        Object.keys(pairs).length === Object.keys(((currentTask.data) as any).correctPairs).length;
      handleTaskComplete(correct);
    },
    onMatchReset: () => handleTryAgain(),

    onTextChange: (value: string) => {
      setSessions((prev) => {
        const newSessions = [...prev];
        newSessions[currentTaskIndex] = { ...session, textInput: { value } };
        return newSessions;
      });
    },
    onTextCheck: () => {
      const correct = ((currentTask.data) as any).correctAnswers.some((a: string) => a.toLowerCase() === session.textInput!.value.toLowerCase());
      handleTaskComplete(correct);
    },
    onTextReset: () => {
      setSessions((prev) => {
        const newSessions = [...prev];
        newSessions[currentTaskIndex] = { ...session, textInput: { value: '' } };
        return newSessions;
      });
    },

    onMultiToggle: (id: string) => {
      setSessions((prev) => {
        const newSessions = [...prev];
        const selected = session.multiSelect!.selectedOptionIds.includes(id)
          ? session.multiSelect!.selectedOptionIds.filter((o) => o !== id)
          : [...session.multiSelect!.selectedOptionIds, id];
        newSessions[currentTaskIndex] = { ...session, multiSelect: { selectedOptionIds: selected } };
        return newSessions;
      });
    },
    onMultiCheck: () => {
      const selected = new Set(session.multiSelect!.selectedOptionIds);
      const correctIds = new Set(((currentTask.data) as any).correctOptionIds);
      const correct = selected.size === correctIds.size && [...selected].every((id: string) => correctIds.has(id));
      handleTaskComplete(correct);
    },
    onMultiReset: () => {
      setSessions((prev) => {
        const newSessions = [...prev];
        newSessions[currentTaskIndex] = { ...session, multiSelect: { selectedOptionIds: [] } };
        return newSessions;
      });
    },
  };

  // Берём simulatorData из первого step сценария, который его имеет
  // и используем для всех заданий этого сценария
  const scenarioSimulatorData = quizScenario!.steps.find((step) => step.simulatorData)?.simulatorData as SimulatorData | undefined;
  const hasSimulatorData = !!scenarioSimulatorData;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', color: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Chip label={quizAttackTypeLabels[quizScenario!.attackType]} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Задание {currentTaskIndex + 1} из {quizTasks!.length}</Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{quizScenario!.title}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>{quizScenario!.description}</Typography>
      </Paper>

      {/* HP */}
      <ProgressBar value={progress?.securityLevel ?? 100} max={100} label="Уровень безопасности" color={(progress?.securityLevel ?? 100) > 60 ? 'green' : (progress?.securityLevel ?? 100) > 30 ? 'yellow' : 'red'} />

      {/* Intro */}
      {currentTaskIndex === 0 && session.status === 'answering' && (
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? '#252525' : '#F5F5F5', borderLeft: '4px solid #2E7D32' }}>
          <Typography variant="body1" sx={{ color: isDark ? '#E0E0E0' : '#212121', lineHeight: 1.7 }}>{quizScenario!.intro}</Typography>
        </Paper>
      )}

      {/* ===== СИМУЛЯТОР СВЕРХУ ===== */}
      {hasSimulatorData && scenarioSimulatorData && (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${isDark ? '#333' : '#E0E0E0'}` }}>
          {/* Toggle bar */}
          <Box
            onClick={() => setSimulatorExpanded(!simulatorExpanded)}
            sx={{
              px: 2,
              py: 1,
              bgcolor: isDark ? '#252525' : '#F5F5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: `1px solid ${isDark ? '#333' : '#E0E0E0'}`,
              '&:hover': { bgcolor: isDark ? '#2a2a2a' : '#EEEEEE' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DesktopIcon style={{ color: '#2E7D32' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDark ? '#E0E0E0' : '#212121' }}>
                🖥️ Интерактивный симулятор — исследуй и найди угрозы
              </Typography>
            </Box>
            {simulatorExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Box>

          {/* Simulator content */}
          {simulatorExpanded && (
            <Box sx={{ p: 1.5, bgcolor: isDark ? '#1a1a1a' : '#FAFAFA' }}>
              <SimulatorRenderer
                simulatorData={scenarioSimulatorData}
                onAction={(action, data) => {
                  console.log('Simulator action:', action, data);
                }}
                isDark={isDark}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* ===== КОНТЕКСТ + ВОПРОС ===== */}
      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? '#1E1E1E' : '#FFFFFF', border: `1px solid ${isDark ? '#333' : '#E0E0E0'}` }}>
        <Typography variant="body2" sx={{ color: isDark ? '#BDBDBD' : '#757575', mb: 1 }}>{currentTask.context}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#E0E0E0' : '#212121' }}>{currentTask.instruction}</Typography>
      </Paper>

      {/* ===== ЗАДАНИЕ ===== */}
      <TaskRenderer task={currentTask} session={session} isDark={isDark} {...taskHandlers} />

      {/* ===== РЕЗУЛЬТАТ ===== */}
      {session.status === 'wrong' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {showHackAnimation ? (
            <HackAnimation
              attackType={quizScenario!.attackType}
              consequence={currentTask.consequence}
              onContinue={() => setShowHackAnimation(false)}
            />
          ) : (
            <>
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                <AlertTitle sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ExclamationTriangleIcon width={18} height={18} /> Неправильно!
                </AlertTitle>
                <Typography variant="body2" sx={{ opacity: 0.95 }}>{currentTask.consequence}</Typography>
              </Alert>

              {session.hintShown && (
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,167,38,0.1)' : 'warning.light', border: `1px solid ${isDark ? '#FFA726' : 'warning.main'}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ color: isDark ? '#FFA726' : 'warning.main', mt: 0.5 }}><LightningBoltIcon width={20} height={20} /></Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#FFA726' : 'warning.dark', mb: 0.5 }}>Подсказка:</Typography>
                      <Typography variant="body2" sx={{ color: isDark ? 'warning.light' : 'warning.dark' }}>{currentTask.hint}</Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </>
          )}

          <Button variant="contained" onClick={handleTryAgain} startIcon={<ReloadIcon width={18} height={18} />} fullWidth sx={{ borderRadius: 2, py: 1.5, bgcolor: isDark ? '#424242' : '#757575', '&:hover': { bgcolor: isDark ? '#616161' : '#616161' } }}>
            Попробовать снова
          </Button>
        </Box>
      )}

      {session.status === 'correct' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircledIcon width={18} height={18} /> Правильно!
            </AlertTitle>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>Отлично! Ты правильно справился с заданием.</Typography>
          </Alert>
          <Button variant="contained" onClick={() => handleTaskComplete(true)} endIcon={<ArrowRightIcon width={18} height={18} />} fullWidth sx={{ borderRadius: 2, py: 1.5 }}>
            {currentTaskIndex + 1 >= quizTasks!.length ? 'Завершить' : 'Следующее задание →'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
