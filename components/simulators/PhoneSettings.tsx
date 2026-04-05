'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import {
  MixIcon,
  UpdateIcon,
  DrawingPinFilledIcon,
  PersonIcon,
  LockClosedIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  MobileIcon,
  ReaderIcon,
  GlobeIcon,
  BellIcon,
} from '@radix-ui/react-icons';

export interface PhoneSetting {
  id: string;
  icon: React.ReactNode | string;
  title: string;
  description: string;
  type: 'toggle' | 'slider' | 'button' | 'info';
  value?: boolean | number;
  isDangerous?: boolean;
  warning?: string;
}

interface PhoneSettingsProps {
  settings: PhoneSetting[];
  onToggle: (id: string, value: boolean) => void;
  onAction: (action: string, data?: string) => void;
  connectedWifi?: { name: string; isSecure: boolean };
  showWarning?: boolean;
}

export default function PhoneSettings({
  settings,
  onToggle,
  onAction,
  connectedWifi,
  showWarning = false,
}: PhoneSettingsProps) {
  return (
    <Paper
      sx={{
        height: 600,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${'#E0E0E0'}`,
        bgcolor: '#F5F5F5',
      }}
    >
      {}
      <Box sx={{ bgcolor: '#2E7D32', color: 'white', px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>9:41</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {connectedWifi && <MixIcon style={{ fontSize: 16 }} />}
          <Box sx={{ width: 24, height: 10, border: '1px solid white', borderRadius: 1, position: 'relative' }}>
            <Box sx={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: 18, bgcolor: 'white', borderRadius: 0.5 }} />
          </Box>
        </Box>
      </Box>

      {}
      <Box sx={{ bgcolor: '#FFFFFF', px: 2, py: 2, borderBottom: '1px solid #E0E0E0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MobileIcon style={{ color: '#2E7D32' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Настройки</Typography>
            <Typography variant="caption" sx={{ color: '#9E9E9E' }}>iPhone • iOS 17.2</Typography>
          </Box>
        </Box>
      </Box>

      {}
      {showWarning && (
        <Box sx={{ p: 2 }}>
          <Alert severity="warning" sx={{ borderRadius: 1 }}>
            <AlertTitle>Обнаружена угроза</AlertTitle>
            <Typography variant="caption">
              Вы подключены к незащищённой сети. Злоумышленник может перехватывать ваш трафик.
            </Typography>
          </Alert>
        </Box>
      )}

      {}
      {connectedWifi && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: connectedWifi.isSecure ? '#E8F5E9' : '#FFF8E1', borderColor: connectedWifi.isSecure ? '#4CAF50' : '#FF9800', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MixIcon style={{ color: connectedWifi.isSecure ? '#4CAF50' : '#FF9800', fontSize: 20 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{connectedWifi.name}</Typography>
                <Typography variant="caption" sx={{ color: connectedWifi.isSecure ? '#2E7D32' : '#E65100' }}>
                  {connectedWifi.isSecure ? 'Защищено (WPA2)' : 'Без пароля — небезопасно'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 0 }}>
          {settings.map((setting, index) => (
            <Box key={setting.id}>
              <ListItem
                sx={{
                  py: setting.type === 'toggle' ? 1 : 2,
                  px: 2,
                  bgcolor: setting.isDangerous ? '#FFF8E1' : 'transparent',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, fontSize: '1.3rem' }}>
                  {typeof setting.icon === 'string' ? <span>{setting.icon}</span> : setting.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {setting.title}
                      </Typography>
                      {setting.isDangerous && (
                        <Chip label="Риск" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FFF3E0', color: '#E65100' }} />
                      )}
                    </Box>
                  }
                  secondary={setting.description}
                  secondaryTypographyProps={{ fontSize: '0.75rem', color: '#9E9E9E' }}
                />
                <ListItemSecondaryAction>
                  {setting.type === 'toggle' && (
                    <Switch
                      edge="end"
                      checked={setting.value as boolean}
                      onChange={(e) => onToggle(setting.id, e.target.checked)}
                      size="small"
                    />
                  )}
                  {setting.type === 'button' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onAction(setting.id)}
                      color={setting.isDangerous ? 'warning' : 'primary'}
                      sx={{ borderRadius: 1, fontSize: '0.75rem' }}
                    >
                      {setting.title}
                    </Button>
                  )}
                  {setting.type === 'info' && (
                    <Typography variant="caption" sx={{ color: '#757575' }}>
                      {setting.value}
                    </Typography>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              {setting.warning && (
                <Box sx={{ px: 2, py: 1, bgcolor: '#FFF3E0' }}>
                  <Typography variant="caption" sx={{ color: '#E65100', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ExclamationTriangleIcon style={{ fontSize: 14 }} /> {setting.warning}
                  </Typography>
                </Box>
              )}
              {index < settings.length - 1 && <Divider />}
            </Box>
          ))}
        </List>

        {}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button variant="outlined" size="small" onClick={() => onAction('check_security')} sx={{ borderRadius: 1, flex: 1 }}>
            <LockClosedIcon style={{ marginRight: 4, fontSize: 18 }} /> Проверить безопасность
          </Button>
          <Button variant="contained" size="small" onClick={() => onAction('apply_all')} sx={{ borderRadius: 1, flex: 1 }}>
            <CheckCircledIcon style={{ marginRight: 4, fontSize: 18 }} /> Применить всё
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
