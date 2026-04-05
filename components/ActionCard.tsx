'use client';

import type { ActionCardProps } from '../lib/types';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';

export default function ActionCard({
  actions,
  onSelect,
  disabled = false,
  selectedId = null,
  isCorrect = null,
}: ActionCardProps) {
  const getCardStyles = (actionId: string) => {
    if (disabled && selectedId === actionId) {
      if (isCorrect === true) {
        return { borderColor: '#2E7D32', bgcolor: '#E8F5E9', opacity: 1 };
      }
      if (isCorrect === false) {
        return { borderColor: '#D32F2F', bgcolor: '#FFEBEE', opacity: 1 };
      }
    }
    if (selectedId === actionId) {
      return { borderColor: '#1976D2', bgcolor: '#E3F2FD', opacity: 1 };
    }
    if (disabled) {
      return { borderColor: '#E0E0E0', bgcolor: '#FAFAFA', opacity: 0.5 };
    }
    return { borderColor: '#E0E0E0', bgcolor: '#FFFFFF', opacity: 1 };
  };

  const getAvatarProps = (actionId: string) => {
    if (disabled && selectedId === actionId) {
      if (isCorrect === true) {
        return { children: <CheckCircledIcon style={{ fontSize: 24 }} />, sx: { bgcolor: '#2E7D32', color: 'white' } };
      }
      if (isCorrect === false) {
        return { children: <CrossCircledIcon style={{ fontSize: 24 }} />, sx: { bgcolor: '#D32F2F', color: 'white' } };
      }
    }
    if (selectedId === actionId) {
      return { children: actionId.replace('a', ''), sx: { bgcolor: '#1976D2', color: 'white' } };
    }
    return { children: actionId.replace('a', ''), sx: { bgcolor: '#F5F5F5', color: '#757575' } };
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#212121' }}>
        Выберите действие:
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {actions.map((action) => (
          <Card
            key={action.id}
            sx={{
              border: 2,
              borderStyle: 'solid',
              transition: 'all 0.2s',
              ...getCardStyles(action.id),
              '&:hover': !disabled
                ? {
                    borderColor: '#1976D2',
                    bgcolor: '#E3F2FD',
                    transform: 'translateY(-1px)',
                    boxShadow: 2,
                  }
                : {},
            }}
          >
            <CardActionArea
              onClick={() => onSelect(action.id)}
              disabled={disabled}
              sx={{ p: 1 }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                <Avatar {...getAvatarProps(action.id)} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ color: '#212121' }}>
                    {action.text}
                  </Typography>
                  {action.hint && (
                    <Typography
                      variant="caption"
                      sx={{ color: '#9E9E9E', display: 'block', mt: 0.5 }}
                    >
                      💡 {action.hint}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
