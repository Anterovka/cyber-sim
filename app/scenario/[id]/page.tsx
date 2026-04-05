'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProgressStore } from '../../../lib/store';
import { getScenarioById } from '../../../lib/scenarios';
import ScenarioView from '../../../components/ScenarioView';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import {StarFilledIcon, StarIcon, BookmarkIcon, BackpackIcon} from '@radix-ui/react-icons';

export default function ScenarioPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.id as string;

  const { progress, submitScenarioResult, updateSecurityLevel } = useProgressStore();

  const [scenario, setScenario] = useState(getScenarioById(scenarioId));
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [consequence, setConsequence] = useState('');
  const [scenarioCompleted, setScenarioCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!scenario) {
      router.push('/dashboard');
    }
  }, [scenario, router]);

  if (!scenario) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>Сценарий не найден</Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard')}>Вернуться к дашборду</Button>
      </Container>
    );
  }

  const step = scenario.steps[currentStep];
  if (!step) return null;

  const handleActionSelect = (actionId: string) => {
    const correct = actionId === step.correctActionId;
    setIsCorrect(correct);
    setConsequence(correct ? step.consequenceOnSuccess : step.consequenceOnFail);
    setShowResult(true);
    updateSecurityLevel(correct ? 5 : -15);
  };

  const handleContinue = () => {
    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setShowResult(false);
      setIsCorrect(null);
      setConsequence('');
    } else {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
      const score = Math.max(0, 100);
      const mistakes = isCorrect === false ? 1 : 0;
      submitScenarioResult(scenario.id, { score, mistakes, timeSpentSeconds });
      setScenarioCompleted(true);
    }
  };

  if (scenarioCompleted) {
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
    const score = isCorrect === false ? 80 : 100;
    const mistakes = isCorrect === false ? 1 : 0;

    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ color: mistakes === 0 ? '#FFD700' : mistakes <= 1 ? '#C0C0C0' : '#CD7F32' }}>
              {mistakes === 0 ? <StarFilledIcon width={64} height={64} /> : mistakes <= 1 ? <StarIcon width={64} height={64} /> : <BookmarkIcon width={64} height={64} />}
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Сценарий завершён!</Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 4 }}>
            {[
              { value: score, label: 'Очки' },
              { value: mistakes, label: 'Ошибки' },
              { value: `${Math.floor(timeSpentSeconds / 60)}:${(timeSpentSeconds % 60).toString().padStart(2, '0')}`, label: 'Время' },
            ].map((s, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
              </Paper>
            ))}
          </Box>

          <Paper variant="outlined" sx={{ p: 3, mb: 4, textAlign: 'left', bgcolor: '#E8F5E9', borderColor: '#2E7D32', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BackpackIcon width={18} height={18} color="#2E7D32" />
              <Typography sx={{ fontWeight: 700, color: '#1B5E20' }}>Что вы изучили:</Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: '#1B5E20' }}>{scenario.description}</Typography>
            {scenario.cweReference && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#1B5E20', fontWeight: 600 }}>CWE: </Typography>
                <Link href={`https://cwe.mitre.org/data/definitions/${scenario.cweReference.split(':')[1]}.html`} target="_blank" sx={{ color: '#1B5E20', textDecoration: 'underline' }}>
                  <Typography component="span" variant="caption">{scenario.cweReference}</Typography>
                </Link>
              </Box>
            )}
            {scenario.owaspReference && (
              <Box>
                <Typography variant="caption" sx={{ color: '#1B5E20', fontWeight: 600 }}>OWASP: </Typography>
                <Link href="https://owasp.org/Top10/" target="_blank" sx={{ color: '#1B5E20', textDecoration: 'underline' }}>
                  <Typography component="span" variant="caption">{scenario.owaspReference}</Typography>
                </Link>
              </Box>
            )}
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => router.push('/dashboard')} sx={{ borderRadius: 1 }}>К сценариям</Button>
            <Button variant="contained" onClick={() => { setCurrentStep(0); setShowResult(false); setIsCorrect(null); setScenarioCompleted(false); }} sx={{ borderRadius: 1 }}>Пройти снова</Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <ScenarioView
      scenario={scenario}
      currentStep={currentStep}
      onActionSelect={handleActionSelect}
      onContinue={handleContinue}
      showResult={showResult}
      isCorrect={isCorrect}
      consequence={consequence}
      securityLevel={progress?.securityLevel ?? 100}
    />
  );
}
