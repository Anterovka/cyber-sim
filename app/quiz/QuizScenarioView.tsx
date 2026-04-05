'use client';

import { useState, useCallback } from 'react';
import type { QuizSession } from '../../lib/quizTypes';
import { quizScenarios, getQuizScenarioById } from '../../lib/quizData';
import QuizStep from '../../components/QuizStep';
import ProgressBar from '../../components/ProgressBar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { useThemeMode } from '../../lib/ThemeModeContext';
import { useProgressStore } from '../../lib/store';
import { quizAttackTypeLabels } from '../../lib/quizData';
import {LockClosedIcon, BookmarkIcon, CheckCircledIcon, CrossCircledIcon, StarFilledIcon, StarIcon, ArrowRightIcon} from '@radix-ui/react-icons';

export default function QuizScenarioView({ scenarioId }: { scenarioId: string }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const { progress, submitScenarioResult, updateSecurityLevel } = useProgressStore();

  const scenario = getQuizScenarioById(scenarioId);
  if (!scenario) return null;

  const [session, setSession] = useState<QuizSession>({
    scenarioId,
    currentStepIndex: 0,
    mistakesOnCurrentStep: 0,
    hintShown: false,
    totalMistakes: 0,
    stepStatus: 'answering',
    selectedOptionId: null,
    isComplete: false,
  });

  const currentStep = scenario.steps[session.currentStepIndex];
  if (!currentStep) return null;

  const handleOptionSelect = useCallback((optionId: string) => {
    const option = currentStep.options.find((o) => o.id === optionId);
    if (!option) return;

    if (option.isCorrect) {

      setSession((prev) => {
        const nextStepIndex = prev.currentStepIndex + 1;
        const isComplete = nextStepIndex >= scenario.steps.length;

        if (isComplete) {

          const score = Math.max(0, 100 - prev.totalMistakes * 15);
          submitScenarioResult(scenarioId, { score, mistakes: prev.totalMistakes, timeSpentSeconds: 0 });
        }

        return {
          ...prev,
          currentStepIndex: nextStepIndex,
          mistakesOnCurrentStep: 0,
          hintShown: false,
          stepStatus: 'correct',
          selectedOptionId: optionId,
          isComplete,
        };
      });
      updateSecurityLevel(5);
    } else {

      setSession((prev) => ({
        ...prev,
        mistakesOnCurrentStep: prev.mistakesOnCurrentStep + 1,
        totalMistakes: prev.totalMistakes + 1,
        hintShown: true,
        stepStatus: 'wrong',
        selectedOptionId: optionId,
      }));
      updateSecurityLevel(-15);
    }
  }, [currentStep, scenarioId, scenario.steps.length, submitScenarioResult, updateSecurityLevel]);

  const handleTryAgain = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      stepStatus: 'answering',
      selectedOptionId: null,
    }));
  }, []);

  const handleNextStep = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      stepStatus: 'answering',
      selectedOptionId: null,
      mistakesOnCurrentStep: 0,
      hintShown: false,
    }));
  }, []);


  if (session.isComplete) {
    const score = Math.max(0, 100 - session.totalMistakes * 15);
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 2, textAlign: 'center', bgcolor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ color: session.totalMistakes === 0 ? '#FFD700' : session.totalMistakes <= 2 ? '#C0C0C0' : '#CD7F32' }}>
              {session.totalMistakes === 0 ? <StarFilledIcon width={64} height={64} /> : session.totalMistakes <= 2 ? <StarIcon width={64} height={64} /> : <BookmarkIcon width={64} height={64} />}
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: isDark ? '#E0E0E0' : '#212121' }}>Сценарий пройден!</Typography>
          <Typography variant="body1" sx={{ color: isDark ? '#BDBDBD' : '#757575', mb: 3 }}>
            {scenario.title}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: isDark ? '#252525' : '#F5F5F5' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#E0E0E0' : '#212121' }}>{score}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#BDBDBD' : '#757575' }}>Очки</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: isDark ? '#252525' : '#F5F5F5' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#E0E0E0' : '#212121' }}>{session.totalMistakes}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#BDBDBD' : '#757575' }}>Ошибки</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: isDark ? '#252525' : '#F5F5F5' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#E0E0E0' : '#212121' }}>{scenario.steps.length}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#BDBDBD' : '#757575' }}>Шагов</Typography>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => window.history.back()} sx={{ borderRadius: 1 }}>
              К сценариям
            </Button>
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ borderRadius: 1 }}>
              Пройти снова
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {}
      <Paper sx={{ p: 2.5, background: isDark ? 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', color: 'white', borderRadius: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip label={quizAttackTypeLabels[scenario.attackType]} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Шаг {session.currentStepIndex + 1} из {scenario.steps.length}</Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{scenario.title}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>{scenario.description}</Typography>
      </Paper>

      {}
      <ProgressBar
        value={progress?.securityLevel ?? 100}
        max={100}
        label="Уровень безопасности"
        color={(progress?.securityLevel ?? 100) > 60 ? 'green' : (progress?.securityLevel ?? 100) > 30 ? 'yellow' : 'red'}
      />

      {}
      {session.currentStepIndex === 0 && session.stepStatus === 'answering' && (
        <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: isDark ? '#252525' : '#F5F5F5', borderLeft: '4px solid #2E7D32' }}>
          <Typography variant="body1" sx={{ color: isDark ? '#E0E0E0' : '#212121', lineHeight: 1.7 }}>{scenario.intro}</Typography>
        </Paper>
      )}

      {}
      <QuizStep
        step={currentStep}
        session={session}
        onOptionSelect={handleOptionSelect}
        onTryAgain={handleTryAgain}
        onNextStep={handleNextStep}
        isDark={isDark}
      />
    </Box>
  );
}
