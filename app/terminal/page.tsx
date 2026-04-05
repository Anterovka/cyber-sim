'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useThemeMode } from '@/lib/ThemeModeContext';
import InteractiveTerminal from '@/components/SecurityTerminal';

export default function TerminalPage() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
          Security Terminal
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
          Практикуйте команды безопасности в интерактивном терминале
        </Typography>
      </Box>

      <InteractiveTerminal />

      <Paper
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 1,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
          💡 Зачем это нужно?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
          Реальные специалисты по кибербезопасности постоянно используют эти команды для анализа угроз.
          Попробуйте проверить подозрительную ссылку или проанализировать email отправителя —
          эти навыки помогут вам распознать фишинг и другие атаки в реальной жизни.
        </Typography>
      </Paper>
    </Box>
  );
}
