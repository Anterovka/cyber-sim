'use client';
'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Link2Icon, ExclamationTriangleIcon, TrashIcon, StopIcon, BookmarkIcon } from '@radix-ui/react-icons';

export interface SMSMessage {
  id: string;
  sender: string;
  senderNumber: string;
  text: string;
  time: string;
  isRead: boolean;
  linkUrl?: string;
  linkText?: string;
  isPhishing?: boolean;
}

interface SMSSimulatorProps {
  messages: SMSMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAction: (action: string, data?: string) => void;
}

export default function SMSSimulator({
  messages,
  selectedId,
  onSelect,
  onAction,
}: SMSSimulatorProps) {
  const selected = messages.find((m) => m.id === selectedId);

  return (
    <Paper sx={{ height: 600, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', border: `1px solid ${'#E0E0E0'}` }}>
      {}
      <Box sx={{ bgcolor: '#2E7D32', color: 'white', px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>9:41</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption">LTE</Typography>
          <Box sx={{ width: 24, height: 10, border: '1px solid white', borderRadius: 1, position: 'relative' }}>
            <Box sx={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: 18, bgcolor: 'white', borderRadius: 0.5 }} />
          </Box>
        </Box>
      </Box>

      {}
      <Box sx={{ bgcolor: '#FFFFFF', px: 2, py: 2, borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5"></Typography>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Сообщения</Typography>
          <Typography variant="caption" sx={{ color: '#9E9E95' }}>{messages.filter((m) => !m.isRead).length} непрочитанных</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {}
        <Box sx={{ width: 280, borderRight: '1px solid #E0E0E0', overflow: 'auto', bgcolor: '#FFFFFF' }}>
          <List disablePadding>
            {messages.map((msg) => (
              <ListItem
                key={msg.id}
                onClick={() => onSelect(msg.id)}
                sx={{
                  cursor: 'pointer',
                  borderBottom: '1px solid #F5F5F5',
                  bgcolor: selectedId === msg.id ? '#E8F5E9' : msg.isPhishing ? '#FFF8E1' : 'transparent',
                  '&:hover': { bgcolor: '#F5F5F5' },
                  py: 1.5,
                  px: 2,
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: msg.isPhishing ? '#FF9800' : '#2E7D32', borderRadius: 1, fontSize: '0.8rem' }}>
                    {msg.sender[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: msg.isRead ? 400 : 700, fontSize: '0.85rem' }}>{msg.sender}</Typography>
                      <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.7rem' }}>{msg.time}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box component="div">
                      <Typography component="span" variant="body2" sx={{ fontSize: '0.8rem', color: '#424242', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {msg.text}
                      </Typography>
                      {msg.isPhishing && (
                        <Chip label="Подозрительное" size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', bgcolor: '#FFF3E0', color: '#E65100' }} />
                      )}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {}
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#FFFFFF' }}>
          {selected ? (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: selected.isPhishing ? '#FF9800' : '#2E7D32', borderRadius: 2 }}>
                  {selected.sender[0]}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{selected.sender}</Typography>
                  <Typography variant="body2" sx={{ color: '#9E9E9E' }}>{selected.senderNumber}</Typography>
                </Box>
              </Box>

              <Paper variant="outlined" sx={{ p: 2.5, mb: 2, bgcolor: '#F5F5F5', borderRadius: 2, maxWidth: '80%' }}>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{selected.text}</Typography>
              </Paper>

              {selected.linkUrl && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: selected.isPhishing ? '#FFF8E1' : '#F5F5F5', borderColor: selected.isPhishing ? '#FF9800' : '#E0E0E0', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Link2Icon style={{ color: selected.isPhishing ? '#FF9800' : '#2E7D32' }} />
                    <Typography variant="body2" sx={{ color: '#2E7D32', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => onAction('click_link', selected.linkUrl)}>
                      {selected.linkText || selected.linkUrl}
                    </Typography>
                  </Box>
                  {selected.isPhishing && (
                    <Typography variant="caption" sx={{ color: '#E65100', display: 'block', mt: 0.5 }}>
                      Подозрительная ссылка
                    </Typography>
                  )}
                </Paper>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="outlined" size="small" startIcon={<TrashIcon />} onClick={() => onAction('delete')}>Удалить</Button>
                <Button variant="outlined" size="small" startIcon={<StopIcon />} onClick={() => onAction('block')}>Заблокировать</Button>
                <Button variant="outlined" size="small" startIcon={<span>🚩</span>} onClick={() => onAction('report')}>Спам</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9E9E9E' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ mb: 2 }}></Typography>
                <Typography>Выберите сообщение</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
