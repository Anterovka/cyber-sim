'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  EnvelopeClosedIcon,
  ResetIcon,
  ExternalLinkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  Link2Icon,
  StarIcon,
  ArchiveIcon,
  DotsVerticalIcon,
  MagnifyingGlassIcon,
  ReloadIcon,
  Cross1Icon,
  ArrowLeftIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment?: boolean;
  linkUrl?: string;
  linkText?: string;
  isPhishing?: boolean;
  spfResult?: 'pass' | 'fail' | 'softfail';
  dkimResult?: 'pass' | 'fail';
}

interface MailClientProps {
  emails: Email[];
  selectedEmailId?: string | null;
  onSelectEmail?: (id: string) => void;
  onAction: (action: string, data?: any) => void;
  showHeaders?: boolean;
}

export default function MailClient({
  emails: initialEmails,
  selectedEmailId,
  onSelectEmail,
  onAction,
  showHeaders = false,
}: MailClientProps) {
  const [emails, setEmails] = useState(initialEmails);
  const [selectedId, setSelectedId] = useState<string | null>(selectedEmailId || initialEmails[0]?.id || null);
  const [showHeadersState, setShowHeadersState] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedEmail = emails.find((e) => e.id === selectedId);
  const filteredEmails = searchQuery
    ? emails.filter((e) =>
        e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.body.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : emails;

  const unreadCount = emails.filter((e) => !e.isRead).length;

  const handleSelectEmail = (id: string) => {
    setSelectedId(id);
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, isRead: true } : e)));
    onSelectEmail?.(id);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'check_headers':
        setShowHeadersState(true);
        setShowAlert('headers_checked');
        onAction('check_headers', selectedId);
        break;
      case 'delete':
        setShowDeleteConfirm(true);
        break;
      case 'confirm_delete':
        setEmails((prev) => prev.filter((e) => e.id !== selectedId));
        if (emails.length > 1) {
          const idx = emails.findIndex((e) => e.id === selectedId);
          const nextEmail = emails[idx + 1] || emails[idx - 1];
          if (nextEmail) setSelectedId(nextEmail.id);
        } else {
          setSelectedId(null);
        }
        setShowDeleteConfirm(false);
        setShowAlert('deleted');
        onAction('delete', selectedId);
        break;
      case 'reply':
        setShowAlert('reply');
        onAction('reply', selectedId);
        break;
      case 'forward':
        setShowAlert('forward');
        onAction('forward', selectedId);
        break;
      case 'star':
        setEmails((prev) =>
          prev.map((e) => (e.id === selectedId ? { ...e, isStarred: !e.isStarred } : e))
        );
        onAction('star', selectedId);
        break;
      case 'archive':
        setEmails((prev) => prev.filter((e) => e.id !== selectedId));
        setShowAlert('archived');
        onAction('archive', selectedId);
        break;
      default:
        onAction(action);
    }
    setTimeout(() => setShowAlert(null), 3000);
  };

  return (
    <Paper
      sx={{
        height: 680,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        overflow: 'hidden',
        border: '1px solid #D0D0D0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {}
      <Box sx={{ bgcolor: '#F3F3F3', px: 2, py: 0.75, display: 'flex', alignItems: 'center', borderBottom: '1px solid #E0E0E0' }}>
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F57' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28CA41' }} />
        </Box>
        <Typography sx={{ flex: 1, textAlign: 'center', color: '#4D4D4D', fontWeight: 500, fontSize: '0.8rem' }}>
          Почта — {selectedEmail ? selectedEmail.subject : 'Входящие'}
        </Typography>
        <Box sx={{ width: 52 }} />
      </Box>

      {}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EnvelopeClosedIcon style={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#202124' }}>Почта</Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#F1F3F4',
              borderRadius: 2,
              px: 2,
              py: 0.75,
              width: '100%',
              maxWidth: 400,
              gap: 1,
            }}
          >
            <MagnifyingGlassIcon style={{ color: '#5F6368', fontSize: 18 }} />
            <InputBase
              placeholder="Поиск писем..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{ fontSize: '0.9rem' }}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery('')}><Cross1Icon style={{ fontSize: 14 }} /></IconButton>
            )}
          </Box>
        </Box>

        <IconButton size="small" onClick={() => onAction('refresh')} sx={{ bgcolor: '#F1F3F4', '&:hover': { bgcolor: '#E8EAED' } }}>
          <ReloadIcon style={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {}
        <Box sx={{ width: 200, bgcolor: '#F8F9FA', borderRight: '1px solid #E0E0E0', p: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<span style={{ fontSize: 18 }}>✏️</span>}
            sx={{ mb: 2, borderRadius: 2, py: 1.2, bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' }, fontWeight: 600 }}
          >
            Написать
          </Button>

          <List disablePadding dense>
            {[
              { icon: '📥', label: 'Входящие', count: unreadCount, active: true },
              { icon: '⭐', label: 'Избранные', count: emails.filter((e) => e.isStarred).length },
              { icon: '📤', label: 'Отправленные' },
              { icon: '📁', label: 'Архив' },
              { icon: '🗑️', label: 'Корзина' },
            ].map((item) => (
              <ListItem
                key={item.label}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.25,
                  bgcolor: item.active ? '#E8F0FE' : 'transparent',
                  color: item.active ? '#1967D2' : '#5F6368',
                  cursor: 'pointer',
                  py: 1,
                  px: 1.5,
                  '&:hover': { bgcolor: item.active ? '#D2E3FC' : '#F1F3F4' },
                }}
              >
                <span style={{ marginRight: 12, fontSize: 18 }}>{item.icon}</span>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: item.active ? 600 : 400 }}
                />
                {item.count !== undefined && item.count > 0 && (
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: item.active ? '#1967D2' : '#DC2626' }}>
                    {item.count}
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        </Box>

        {}
        <Box sx={{ width: 300, borderRight: '1px solid #E0E0E0', overflow: 'auto', bgcolor: '#FFFFFF' }}>
          <Box sx={{ px: 2, py: 1, bgcolor: '#F8F9FA', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#202124' }}>Входящие</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#5F6368' }}>{filteredEmails.length} писем</Typography>
          </Box>

          <List disablePadding>
            {filteredEmails.map((email) => (
              <ListItem
                key={email.id}
                onClick={() => handleSelectEmail(email.id)}
                sx={{
                  cursor: 'pointer',
                  borderBottom: '1px solid #F1F3F4',
                  bgcolor: selectedId === email.id ? '#E8F0FE' : email.isPhishing ? '#FFF8E1' : email.isRead ? '#FFFFFF' : '#F2F6FC',
                  '&:hover': { bgcolor: selectedId === email.id ? '#D2E3FC' : '#F8F9FA' },
                  py: 1.5,
                  px: 2,
                  borderLeft: selectedId === email.id ? '3px solid #1967D2' : '3px solid transparent',
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: email.isPhishing ? '#DC2626' : email.isRead ? '#9CA3AF' : '#1967D2', borderRadius: '50%', fontSize: '0.85rem', fontWeight: 600 }}>
                    {email.from[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: email.isRead ? 400 : 700, fontSize: '0.85rem', color: '#202124' }}>
                        {email.from}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#5F6368' }}>{email.date}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box component="div">
                      <Typography sx={{ fontSize: '0.8rem', color: '#5F6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {email.subject}
                      </Typography>
                      {email.isPhishing && (
                        <Chip label="⚠ Подозрительное" size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', bgcolor: '#FEF3C7', color: '#D97706' }} />
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
          {selectedEmail ? (
            <Box>
              {}
              <Box sx={{ p: 3, borderBottom: '1px solid #E0E0E0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1.3rem', color: '#202124', flex: 1 }}>
                    {selectedEmail.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="В архив"><IconButton size="small" onClick={() => handleAction('archive')} sx={{ bgcolor: '#F1F3F4' }}><ArchiveIcon /></IconButton></Tooltip>
                    <Tooltip title="Удалить"><IconButton size="small" onClick={() => handleAction('delete')} sx={{ bgcolor: '#F1F3F4' }}><TrashIcon /></IconButton></Tooltip>
                    <Tooltip title="Не прочитано"><IconButton size="small" onClick={() => { setEmails((prev) => prev.map((e) => (e.id === selectedId ? { ...e, isRead: false } : e))); }} sx={{ bgcolor: '#F1F3F4' }}><EnvelopeClosedIcon /></IconButton></Tooltip>
                  </Box>
                </Box>

                {}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: selectedEmail.isPhishing ? '#DC2626' : '#1967D2', borderRadius: '50%', fontSize: '1.2rem', fontWeight: 600 }}>
                    {selectedEmail.from[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedEmail.from}</Typography>
                      {selectedEmail.isPhishing && (
                        <Chip
                          icon={<ExclamationTriangleIcon style={{ fontSize: 14 }} />}
                          label="Внешний отправитель"
                          size="small"
                          sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#FEF3C7', color: '#D97706' }}
                        />
                      )}
                    </Box>
                    <Typography sx={{ color: '#5F6368', fontSize: '0.8rem' }}>{selectedEmail.fromEmail}</Typography>
                  </Box>
                  <Typography sx={{ color: '#5F6368', fontSize: '0.8rem' }}>{selectedEmail.date}</Typography>
                </Box>

                {}
                {showHeadersState && (selectedEmail.spfResult || selectedEmail.dkimResult) && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#F8F9FA', borderRadius: 1.5 }}>
                    <Typography sx={{ fontWeight: 600, display: 'block', mb: 1, fontSize: '0.85rem' }}>
                      🔐 Заголовки безопасности:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Chip
                        label={`SPF: ${selectedEmail.spfResult?.toUpperCase()}`}
                        size="small"
                        sx={{
                          bgcolor: selectedEmail.spfResult === 'pass' ? '#D1FAE5' : '#FEE2E2',
                          color: selectedEmail.spfResult === 'pass' ? '#059669' : '#DC2626',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={`DKIM: ${selectedEmail.dkimResult?.toUpperCase()}`}
                        size="small"
                        sx={{
                          bgcolor: selectedEmail.dkimResult === 'pass' ? '#D1FAE5' : '#FEE2E2',
                          color: selectedEmail.dkimResult === 'pass' ? '#059669' : '#DC2626',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Paper>
                )}
              </Box>

              {}
              <Box sx={{ p: 3 }}>
                <Typography sx={{ lineHeight: 1.8, color: '#202124', whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
                  {selectedEmail.body}
                </Typography>

                {}
                {selectedEmail.linkUrl && (
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: selectedEmail.isPhishing ? '#FEF3C7' : '#F8F9FA',
                      borderColor: selectedEmail.isPhishing ? '#F59E0B' : '#E0E0E0',
                      borderRadius: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Link2Icon style={{ color: selectedEmail.isPhishing ? '#F59E0B' : '#1967D2', fontSize: 18 }} />
                      <Typography sx={{ color: '#1967D2', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}>
                        {selectedEmail.linkText || selectedEmail.linkUrl}
                      </Typography>
                    </Box>
                    {selectedEmail.isPhishing && (
                      <Typography sx={{ color: '#D97706', display: 'block', mt: 0.5, fontSize: '0.8rem' }}>
                        ⚠ Реальный URL: {selectedEmail.linkUrl}
                      </Typography>
                    )}
                  </Paper>
                )}

                {}
                <Box sx={{ display: 'flex', gap: 1, mt: 3, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                  <Button variant="outlined" size="small" startIcon={<ResetIcon />} onClick={() => handleAction('reply')} sx={{ borderRadius: 1.5 }}>
                    Ответить
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<ExternalLinkIcon />} onClick={() => handleAction('forward')} sx={{ borderRadius: 1.5 }}>
                    Переслать
                  </Button>
                  <Button variant="outlined" size="small" color="error" startIcon={<TrashIcon />} onClick={() => handleAction('delete')} sx={{ borderRadius: 1.5 }}>
                    Удалить
                  </Button>
                  <Button variant="contained" size="small" onClick={() => handleAction('check_headers')} sx={{ ml: 'auto', borderRadius: 1.5, bgcolor: '#1967D2', '&:hover': { bgcolor: '#1557B0' } }}>
                    🔍 Проверить заголовки
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368' }}>
              <Box sx={{ textAlign: 'center' }}>
                <EnvelopeClosedIcon style={{ fontSize: 64, marginBottom: 16, color: '#D1D5DB' }} />
                <Typography sx={{ fontSize: '1.1rem' }}>Выберите письмо</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {}
      {showAlert && (
        <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Alert severity={showAlert === 'deleted' ? 'success' : 'info'} sx={{ borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {showAlert === 'deleted' && 'Письмо удалено'}
            {showAlert === 'archived' && 'Письмо архивировано'}
            {showAlert === 'reply' && 'Открыт ответ на письмо'}
            {showAlert === 'forward' && 'Открыта пересылка'}
            {showAlert === 'headers_checked' && 'Заголовки безопасности проверены'}
          </Alert>
        </Box>
      )}

      {}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrashIcon style={{ color: '#DC2626' }} />
          Удалить письмо?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#5F6368' }}>Вы уверены, что хотите удалить это письмо?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDeleteConfirm(false)}>Отмена</Button>
          <Button onClick={() => handleAction('confirm_delete')} color="error" variant="contained" sx={{ borderRadius: 1.5 }}>Удалить</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
