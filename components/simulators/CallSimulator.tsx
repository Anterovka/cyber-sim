'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import {
  CrossCircledIcon,
  MixerVerticalIcon,
  MixerHorizontalIcon,
  SpeakerLoudIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@radix-ui/react-icons';

interface CallSimulatorProps {
  callerName: string;
  callerNumber: string;
  callerAvatar: string;
  isFake?: boolean;
  script: string[];
  onAction: (action: string, data?: string) => void;
}

export default function CallSimulator({
  callerName,
  callerNumber,
  callerAvatar,
  isFake = false,
  script,
  onAction,
}: CallSimulatorProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callActive, setCallActive] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextLine = () => {
    if (currentLine < script.length - 1) {
      setCurrentLine((prev) => prev + 1);
      setCallDuration((prev) => prev + 5);
    }
  };

  const endCall = () => {
    setCallActive(false);
    onAction('end_call');
  };

  if (!callActive) {
    return (
      <Paper sx={{ p: 4, borderRadius: 2, border: `1px solid ${'#E0E0E0'}`, textAlign: 'center', bgcolor: '#F5F5F5' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>📞</Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Звонок завершён</Typography>
        <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>Длительность: {formatTime(callDuration)}</Typography>
        <Button variant="contained" onClick={() => onAction('analyze_call')} sx={{ borderRadius: 1 }}>
          Проанализировать звонок
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${'#E0E0E0'}` }}>
      {}
      <Box sx={{ bgcolor: isFake ? '#FFF3E0' : '#2E7D32', color: isFake ? '#E65100' : 'white', p: 3, textAlign: 'center' }}>
        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: isFake ? '#FF9800' : 'rgba(255,255,255,0.2)', fontSize: '1.5rem' }}>
          {callerAvatar}
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{callerName}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>{callerNumber}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
          <ClockIcon style={{ fontSize: 16 }} />
          <Typography variant="body2">{formatTime(callDuration)}</Typography>
        </Box>
        {isFake && (
          <Chip icon={<ExclamationTriangleIcon />} label="Подозрительный звонок" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'inherit' }} />
        )}
      </Box>

      {}
      <Box sx={{ p: 3, bgcolor: '#FFFFFF', minHeight: 200 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#757575' }}>
          Собеседник говорит:
        </Typography>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ lineHeight: 1.6, fontStyle: 'italic' }}>
            "{script[currentLine]}"
          </Typography>
        </Paper>

        {}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#9E9E9E' }}>
            {currentLine + 1} / {script.length}
          </Typography>
          <Slider
            value={((currentLine + 1) / script.length) * 100}
            sx={{ flex: 1 }}
            disabled
          />
        </Box>

        {currentLine < script.length - 1 && (
          <Button variant="outlined" onClick={nextLine} fullWidth sx={{ borderRadius: 1, mb: 2 }}>
            Продолжить разговор →
          </Button>
        )}
      </Box>

      {}
      <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'center', gap: 3 }}>
        <IconButton onClick={() => setIsMuted(!isMuted)} sx={{ bgcolor: isMuted ? '#FFCDD2' : '#F5F5F5' }}>
          {isMuted ? <MixerVerticalIcon /> : <MixerHorizontalIcon />}
        </IconButton>
        <IconButton sx={{ bgcolor: '#F5F5F5' }}>
          <SpeakerLoudIcon />
        </IconButton>
        <IconButton onClick={endCall} sx={{ bgcolor: '#FFCDD2', color: '#D32F2F', '&:hover': { bgcolor: '#EF9A9A' } }}>
          <CrossCircledIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
