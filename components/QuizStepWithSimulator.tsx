'use client';

import type { QuizStep } from '../lib/quizTypes';
import type { SimulatorData } from '../lib/quizTypes';
import SimulatorRenderer from './simulators/SimulatorRenderer';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';

interface QuizStepWithSimulatorProps {
  step: QuizStep;
  isDark: boolean;
  onSimulatorAction: (action: string, data?: any) => void;
  onAnswer: (optionId: string) => void;
  selectedOptionId: string | null;
  isAnswered: boolean;
  showHint: boolean;
}

export default function QuizStepWithSimulator({
  step,
  isDark,
  onSimulatorAction,
  onAnswer,
  selectedOptionId,
  isAnswered,
  showHint,
}: QuizStepWithSimulatorProps) {
  const hasSimulator = !!step.simulatorData;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {}
      <Paper sx={{ p: 2, borderRadius: 1.5, bgcolor: isDark ? '#1E1E1E' : '#F5F5F5', border: `1px solid ${isDark ? '#333' : '#E0E0E0'}` }}>
        <Typography variant="body2" sx={{ color: isDark ? '#E0E0E0' : '#424242', mb: 1 }}>
          {step.context}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#FFFFFF' : '#212121' }}>
          {step.question}
        </Typography>
      </Paper>

      {}
      {hasSimulator && step.simulatorData && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: isDark ? '#E0E0E0' : '#424242' }}>
            🖥️ Симулятор:
          </Typography>
          <SimulatorRenderer
            simulatorData={step.simulatorData as SimulatorData}
            onAction={onSimulatorAction}
            isDark={isDark}
          />
        </Box>
      )}

      {}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDark ? '#E0E0E0' : '#424242' }}>
          Выбери ответ:
        </Typography>
        {step.options.map((option: any) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.isCorrect;
          const showResult = isAnswered && isSelected;

          return (
            <Paper
              key={option.id}
              onClick={() => !isAnswered && onAnswer(option.id)}
              sx={{
                p: 2,
                borderRadius: 1.5,
                cursor: isAnswered ? 'default' : 'pointer',
                bgcolor: showResult
                  ? isCorrect
                    ? isDark ? 'rgba(76,175,80,0.2)' : '#E8F5E9'
                    : isDark ? 'rgba(244,67,54,0.2)' : '#FFEBEE'
                  : isDark ? '#252525' : '#FFFFFF',
                border: showResult
                  ? isCorrect
                    ? '2px solid #4CAF50'
                    : '2px solid #F44336'
                  : isSelected
                    ? '2px solid #2E7D32'
                    : `1px solid ${isDark ? '#333' : '#E0E0E0'}`,
                '&:hover': !isAnswered ? { bgcolor: isDark ? '#252525' : '#F5F5F5' } : {},
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400, color: isDark ? '#E0E0E0' : '#212121' }}>
                {option.text}
              </Typography>
              {showResult && !isCorrect && option.explanation && (
                <Typography variant="caption" sx={{ color: isDark ? '#EF9A9A' : '#D32F2F', display: 'block', mt: 0.5 }}>
                  {option.explanation}
                </Typography>
              )}
            </Paper>
          );
        })}
      </Box>

      {}
      {showHint && step.hint && (
        <Paper sx={{ p: 2, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,167,38,0.15)' : 'warning.light', border: `1px solid ${isDark ? '#FFA726' : 'warning.main'}` }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box sx={{ color: isDark ? '#FFA726' : 'warning.main', mt: 0.5 }}>💡</Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#FFB74D' : 'warning.dark', mb: 0.5 }}>
                Подсказка:
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#FFE0B2' : '#E65100' }}>
                {step.hint}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {}
      {isAnswered && selectedOptionId && !step.options.find((o: any) => o.id === selectedOptionId)?.isCorrect && (
        <Alert severity="error" variant="filled" sx={{ borderRadius: 1.5 }}>
          <AlertTitle sx={{ fontWeight: 700, mb: 1, color: '#FFFFFF' }}>⚠️ Последствия:</AlertTitle>
          <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{step.consequence}</Typography>
        </Alert>
      )}
    </Box>
  );
}
