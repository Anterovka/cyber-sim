'use client';

import { Box, Typography, LinearProgress, linearProgressClasses, styled } from '@mui/material';

const StyledLinearProgress = styled(LinearProgress)(({ theme, color = 'primary' }) => {
  const colorMap: Record<string, string> = {
    green: theme.palette.success.main,
    red: theme.palette.error.main,
    blue: theme.palette.primary.main,
    yellow: theme.palette.warning.main,
  };

  return {
    height: 8,
    borderRadius: 2,
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 2,
      backgroundColor: colorMap[color] || theme.palette.primary.main,
    },
  };
});

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

export default function ProgressBar({ value, max, label, color = 'green' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {value}/{max}
          </Typography>
        </Box>
      )}
      <StyledLinearProgress variant="determinate" value={percentage}
        color={color === 'green' ? 'success' : color === 'red' ? 'error' : color === 'yellow' ? 'warning' : 'primary'} />
    </Box>
  );
}
