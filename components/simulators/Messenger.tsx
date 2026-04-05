'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import {
  ChatBubbleIcon,
  PaperPlaneIcon,
  FileIcon,
  FaceIcon,
  MagnifyingGlassIcon,
  MobileIcon,
  VideoIcon,
  DotsVerticalIcon,
  ExclamationTriangleIcon,
  Cross1Icon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn?: boolean;
  isUrgent?: boolean;
  hasLink?: boolean;
  linkUrl?: string;
  hasFile?: boolean;
  fileName?: string;
  isFake?: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  unread: number;
  online: boolean;
  isFake?: boolean;
}

interface MessengerProps {
  contacts: ChatContact[];
  messages: ChatMessage[];
  selectedContactId?: string | null;
  onSelectContact?: (id: string) => void;
  onAction: (action: string, data?: any) => void;
  showWarning?: boolean;
}

export default function Messenger({
  contacts: initialContacts,
  messages: initialMessages,
  selectedContactId: initialSelectedId,
  onSelectContact,
  onAction,
  showWarning = false,
}: MessengerProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const grouped: Record<string, ChatMessage[]> = {};
    initialMessages.forEach((msg) => {
      const contactId = msg.isOwn ? 'me' : msg.senderId;
      if (!grouped[contactId]) grouped[contactId] = [];
      grouped[contactId].push(msg);
    });
    return grouped;
  });
  const [selectedContactId, setSelectedContactId] = useState<string | null>(initialSelectedId || initialContacts[0]?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [showAlert, setShowAlert] = useState<string | null>(null);

  const selectedContact = contacts.find((c) => c.id === selectedContactId);
  const chatMessages = allMessages[selectedContactId || ''] || [];

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    onSelectContact?.(id);

    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContactId) return;

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'Вы',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setAllMessages((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), msg],
    }));


    setContacts((prev) =>
      prev.map((c) => (c.id === selectedContactId ? { ...c, lastMessage: newMessage } : c))
    );

    onAction('send_message', { contactId: selectedContactId, text: newMessage });
    setNewMessage('');


    if (selectedContact?.isFake) {
      setTimeout(() => {
        const replies = [
          'Срочно переведи деньги!',
          'Карта не работает, нужен перевод!',
          'Пожалуйста, это очень важно!',
          'Не могу сейчас говорить, просто переведи!',
        ];
        const reply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          senderId: selectedContactId,
          senderName: selectedContact.name,
          text: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          isOwn: false,
          isFake: true,
          isUrgent: true,
        };
        setAllMessages((prev) => ({
          ...prev,
          [selectedContactId]: [...(prev[selectedContactId] || []), reply],
        }));
        setContacts((prev) =>
          prev.map((c) => (c.id === selectedContactId ? { ...c, lastMessage: reply.text, unread: c.unread + 1 } : c))
        );
      }, 2000);
    }
  };

  const handleCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setShowCallDialog(true);
    onAction('call', { contactId: selectedContactId, type });
  };

  const handleLinkClick = (url: string) => {
    onAction('click_link', { url, contactId: selectedContactId });
    setShowAlert('link_clicked');
    setTimeout(() => setShowAlert(null), 3000);
  };

  return (
    <Paper sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', border: '1px solid #D0D0D0', bgcolor: '#FFFFFF', position: 'relative' }}>
      {}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChatBubbleIcon style={{ color: 'white', fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', flexGrow: 1 }}>Мессенджер</Typography>
        <IconButton size="small"><MagnifyingGlassIcon style={{ fontSize: 20, color: '#666' }} /></IconButton>
        <IconButton size="small"><DotsVerticalIcon style={{ fontSize: 20, color: '#666' }} /></IconButton>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {}
        <Box sx={{ width: 280, borderRight: '1px solid #E0E0E0', overflow: 'auto', bgcolor: '#FFFFFF' }}>
          <Box sx={{ px: 2, py: 1, bgcolor: '#F5F5F5', borderBottom: '1px solid #E0E0E0' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Чаты</Typography>
          </Box>
          <List disablePadding>
            {contacts.map((contact) => (
              <ListItem
                key={contact.id}
                onClick={() => handleSelectContact(contact.id)}
                sx={{
                  cursor: 'pointer',
                  borderBottom: '1px solid #F5F5F5',
                  bgcolor: selectedContactId === contact.id ? '#E8F5E9' : contact.isFake ? '#FFF8E1' : 'transparent',
                  '&:hover': { bgcolor: '#F5F5F5' },
                  py: 1.5,
                  px: 2,
                  borderLeft: selectedContactId === contact.id ? '3px solid #2E7D32' : '3px solid transparent',
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40, position: 'relative' }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: contact.isFake ? '#FF9800' : '#2E7D32', borderRadius: 2, fontSize: '1.2rem' }}>
                    {contact.avatar}
                  </Avatar>
                  {contact.online && (
                    <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%', border: '2px solid white' }} />
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{contact.name}</Typography>
                        {contact.isFake && <ExclamationTriangleIcon style={{ color: '#FF9800', fontSize: 14 }} />}
                      </Box>
                      {contact.unread > 0 && (
                        <Badge badgeContent={contact.unread} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18, minWidth: 18 } }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography sx={{ fontSize: '0.8rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contact.lastMessage}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#F0F2F5' }}>
          {selectedContact ? (
            <>
              {}
              <Box sx={{ bgcolor: '#FFFFFF', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #E0E0E0' }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: selectedContact.isFake ? '#FF9800' : '#2E7D32', borderRadius: 2, fontSize: '1.1rem' }}>
                  {selectedContact.avatar}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedContact.name}</Typography>
                    {selectedContact.isFake && (
                      <Chip icon={<ExclamationTriangleIcon style={{ fontSize: 14 }} />} label="Подозрительный" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#FFF3E0', color: '#E65100' }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: selectedContact.online ? '#4CAF50' : '#999' }}>
                    {selectedContact.online ? 'в сети' : 'был(а) недавно'}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => handleCall('voice')} sx={{ bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#E8F5E9' } }}>
                  <MobileIcon style={{ fontSize: 18, color: '#2E7D32' }} />
                </IconButton>
                <IconButton size="small" onClick={() => handleCall('video')} sx={{ bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#E8F5E9' } }}>
                  <VideoIcon style={{ fontSize: 18, color: '#2E7D32' }} />
                </IconButton>
              </Box>

              {}
              {showWarning && selectedContact.isFake && (
                <Box sx={{ px: 2, py: 1 }}>
                  <Alert severity="warning" sx={{ borderRadius: 1.5, fontSize: '0.8rem' }}>
                    ⚠️ Этот контакт может быть мошенником! Не переводите деньги и не переходите по ссылкам.
                  </Alert>
                </Box>
              )}

              {}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {chatMessages.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ChatBubbleIcon style={{ fontSize: 48, marginBottom: 8, color: '#DDD' }} />
                      <Typography>Начните разговор</Typography>
                    </Box>
                  </Box>
                ) : (
                  chatMessages.map((msg) => (
                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.isOwn ? 'flex-end' : 'flex-start' }}>
                      <Box
                        sx={{
                          maxWidth: '70%',
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: msg.isOwn ? '#2E7D32' : msg.isFake ? '#FFF8E1' : '#FFFFFF',
                          color: msg.isOwn ? 'white' : '#212121',
                          border: msg.isFake ? '1px solid #FF9800' : 'none',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          borderBottomRightRadius: msg.isOwn ? 0 : 2,
                          borderBottomLeftRadius: msg.isOwn ? 2 : 0,
                        }}
                      >
                        {!msg.isOwn && (
                          <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color: msg.isFake ? '#E65100' : '#2E7D32', mb: 0.5 }}>
                            {msg.senderName}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.text}</Typography>
                        {msg.hasLink && msg.linkUrl && (
                          <Typography
                            onClick={() => handleLinkClick(msg.linkUrl!)}
                            sx={{ color: msg.isOwn ? '#BBDEFB' : '#1976D2', textDecoration: 'underline', cursor: 'pointer', mt: 0.5, fontSize: '0.8rem' }}
                          >
                            🔗 {msg.linkUrl}
                          </Typography>
                        )}
                        {msg.hasFile && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, p: 0.5, bgcolor: msg.isOwn ? 'rgba(255,255,255,0.1)' : '#F5F5F5', borderRadius: 1 }}>
                            <FileIcon style={{ fontSize: 16 }} />
                            <Typography sx={{ fontSize: '0.8rem' }}>{msg.fileName}</Typography>
                          </Box>
                        )}
                        <Typography sx={{ display: 'block', textAlign: 'right', mt: 0.5, fontSize: '0.65rem', opacity: 0.7 }}>
                          {msg.timestamp} {msg.isOwn && '✓✓'}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>

              {}
              <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderTop: '1px solid #E0E0E0', display: 'flex', gap: 1, alignItems: 'center' }}>
                <IconButton size="small" onClick={() => onAction('attach_file')} sx={{ bgcolor: '#F5F5F5' }}>
                  <FileIcon style={{ fontSize: 18, color: '#666' }} />
                </IconButton>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small"><FaceIcon style={{ fontSize: 18, color: '#666' }} /></IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  sx={{ borderRadius: 2, minWidth: 'auto', p: 1.2, bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                >
                  <PaperPlaneIcon style={{ fontSize: 18 }} />
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
              <Box sx={{ textAlign: 'center' }}>
                <ChatBubbleIcon style={{ fontSize: 64, marginBottom: 16, color: '#DDD' }} />
                <Typography sx={{ fontSize: '1.1rem' }}>Выберите чат</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {}
      <Dialog open={showCallDialog} onClose={() => setShowCallDialog(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          {callType === 'video' ? <VideoIcon /> : <MobileIcon />}
          {callType === 'video' ? 'Видеозвонок' : 'Звонок'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 1.5, bgcolor: selectedContact?.isFake ? '#FF9800' : '#2E7D32', fontSize: '1.8rem' }}>
              {selectedContact?.avatar}
            </Avatar>
            <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedContact?.name}</Typography>
            <Typography sx={{ color: '#999', fontSize: '0.85rem', mt: 0.5 }}>
              {selectedContact?.isFake ? '⚠️ Подозрительный контакт!' : 'Вызов...'}
            </Typography>
            {selectedContact?.isFake && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 1.5 }}>
                <Typography sx={{ fontSize: '0.8rem' }}>Этот контакт может быть мошенником! Не сообщайте личные данные.</Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowCallDialog(false)}>Отмена</Button>
          <Button onClick={() => { onAction('call_accepted', { contactId: selectedContactId, type: callType }); setShowCallDialog(false); }} variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#2E7D32' }}>
            Принять
          </Button>
        </DialogActions>
      </Dialog>

      {}
      {showAlert && (
        <Box sx={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Alert severity="warning" sx={{ borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <Typography sx={{ fontSize: '0.8rem' }}>⚠️ Вы перешли по подозрительной ссылке!</Typography>
          </Alert>
        </Box>
      )}
    </Paper>
  );
}
