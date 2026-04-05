'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ReloadIcon,
  LockClosedIcon,
  LockOpen1Icon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  GlobeIcon,
  BookmarkIcon,
  Share1Icon,
  DownloadIcon,
  Component1Icon,
  EyeOpenIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons';

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  isSecure: boolean;
  certificateInfo?: {
    issuer: string;
    validFrom: string;
    validTo: string;
    isValid: boolean;
  };
  isPhishing?: boolean;
  content: BrowserContent;
}

export interface BrowserContent {
  type: 'login_form' | 'banking' | 'download' | 'article' | 'popup';
  title: string;
  body: string;
  hasForm?: boolean;
  formFields?: { label: string; type: string; placeholder: string }[];
  hasDownload?: boolean;
  downloadFileName?: string;
  hasLinks?: boolean;
  links?: { text: string; url: string; isSuspicious?: boolean }[];
  warnings?: string[];
  logo?: string;
  headerColor?: string;
  headerText?: string;
}

export interface BrowserHistoryEntry {
  url: string;
  title: string;
  timestamp: string;
  isSuspicious?: boolean;
}

interface BrowserSimulatorProps {
  tabs: BrowserTab[];
  activeTabId?: string;
  history?: BrowserHistoryEntry[];
  onAction: (action: string, data?: any) => void;
  showSecurityWarnings?: boolean;
}

export default function BrowserSimulator({
  tabs,
  activeTabId,
  history = [],
  onAction,
  showSecurityWarnings = true,
}: BrowserSimulatorProps) {
  const [activeTab, setActiveTab] = useState(activeTabId || tabs[0]?.id || '');
  const [urlBar, setUrlBar] = useState(tabs.find((t) => t.id === activeTab)?.url || '');
  const [showCertInfo, setShowCertInfo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const currentTab = tabs.find((t) => t.id === activeTab);

  const handleUrlChange = (url: string) => {
    setUrlBar(url);
  };

  const handleNavigate = () => {
    onAction('navigate', urlBar);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) setUrlBar(tab.url);
  };

  const handleSubmitForm = () => {
    if (currentTab?.isPhishing) {
      onAction('submit_phishing_form', { tabId: activeTab, data: formData });
    } else {
      onAction('submit_form', { tabId: activeTab, data: formData });
    }
    setFormSubmitted(true);
    setFormData({});
  };

  const handleDownload = () => {
    if (currentTab?.content.hasDownload) {
      onAction('download', { fileName: currentTab.content.downloadFileName, tabId: activeTab });
    }
  };

  const handleLinkClick = (link: { text: string; url: string; isSuspicious?: boolean }) => {
    if (link.isSuspicious) {
      onAction('suspicious_link', link);
    } else {
      onAction('link_click', link);
    }
  };

  return (
    <Paper
      sx={{
        height: 650,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid #E0E0E0`,
        bgcolor: '#FFFFFF',
      }}
    >
      {}
      <Box sx={{ bgcolor: '#F5F5F5', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', px: 1, py: 0.5 }}>
        <Box sx={{ display: 'flex', gap: 0.5, flex: 1, overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <Box
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              sx={{
                px: 2,
                py: 0.75,
                bgcolor: tab.id === activeTab ? '#FFFFFF' : '#E0E0E0',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                maxWidth: 180,
                border: '1px solid #E0E0E0',
                borderBottom: tab.id === activeTab ? 'none' : '1px solid #E0E0E0',
              }}
            >
              {tab.isSecure ? (
                <LockClosedIcon style={{ color: '#4CAF50', fontSize: 14 }} />
              ) : (
                <LockOpen1Icon style={{ color: '#FF9800', fontSize: 14 }} />
              )}
              <Typography variant="caption" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                {tab.title}
              </Typography>
              {tab.isPhishing && (
                <Chip label="!" size="small" sx={{ height: 16, minWidth: 16, fontSize: '0.6rem', bgcolor: '#FF9800', color: 'white', ml: 0.5 }} />
              )}
            </Box>
          ))}
        </Box>
        <IconButton size="small" onClick={() => onAction('new_tab')} sx={{ ml: 0.5 }}>
          <Component1Icon style={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton size="small" onClick={() => onAction('back')}><ArrowLeftIcon /></IconButton>
        <IconButton size="small" onClick={() => onAction('forward')}><ArrowRightIcon /></IconButton>
        <IconButton size="small" onClick={() => onAction('reload')}><ReloadIcon /></IconButton>

        {}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#F5F5F5',
            borderRadius: 1.5,
            px: 1.5,
            py: 0.5,
            gap: 0.5,
            border: currentTab?.isPhishing ? '1px solid #FF9800' : '1px solid transparent',
          }}
        >
          {currentTab?.isSecure ? (
            <LockClosedIcon style={{ color: '#4CAF50', fontSize: 16, cursor: 'pointer' }} onClick={() => setShowCertInfo(true)} />
          ) : (
            <LockOpen1Icon style={{ color: '#FF9800', fontSize: 16, cursor: 'pointer' }} onClick={() => setShowCertInfo(true)} />
          )}
          <TextField
            value={urlBar}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            fullWidth
            size="small"
            variant="standard"
            InputProps={{ disableUnderline: true }}
            sx={{ fontSize: '0.85rem' }}
          />
          <IconButton size="small" onClick={() => onAction('bookmark')}><BookmarkIcon style={{ fontSize: 18 }} /></IconButton>
          <IconButton size="small" onClick={() => onAction('share')}><Share1Icon style={{ fontSize: 18 }} /></IconButton>
        </Box>

        <IconButton size="small" onClick={() => setShowHistory(!showHistory)}>
          <GlobeIcon style={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#FAFAFA' }}>
        {currentTab ? (
          currentTab.content.headerText === 'банк Онлайн' ? (

            <Box sx={{ height: '100%', bgcolor: '#F2F3F5', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ bgcolor: '#FFFFFF', px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E0E0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#21A038', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20, color: 'white' }}>✓</span>
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#21A038' }}>банк</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                <Paper sx={{ p: 3.5, borderRadius: 3, width: '100%', maxWidth: 360, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                      <span style={{ fontSize: 32 }}>👤</span>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#333', mb: 0.5 }}>Вход</Typography>
                    <Typography sx={{ color: '#999', fontSize: '0.85rem' }}>Введите логин и пароль</Typography>
                  </Box>
                  {currentTab.content.hasForm && currentTab.content.formFields && !formSubmitted && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {currentTab.content.formFields.map((field, idx) => (
                        <TextField key={idx} label={field.label} type={field.type} placeholder={field.placeholder} value={formData[field.label] || ''} onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      ))}
                      <Button variant="contained" onClick={handleSubmitForm} fullWidth sx={{ borderRadius: 2, py: 1.5, bgcolor: currentTab.isPhishing ? '#FF9800' : '#21A038', fontWeight: 600, fontSize: '1rem', mt: 1 }}>
                        {currentTab.isPhishing ? '⚠️ Войти (опасно!)' : 'Войти'}
                      </Button>
                      <Typography sx={{ color: '#21A038', fontSize: '0.85rem', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline' }}>Забыли логин или пароль?</Typography>
                    </Box>
                  )}
                  {formSubmitted && (
                    <Paper sx={{ p: 3, borderRadius: 2, bgcolor: currentTab.isPhishing ? '#FEF3C7' : '#D1FAE5', textAlign: 'center' }}>
                      {currentTab.isPhishing ? (
                        <>
                          <ExclamationTriangleIcon style={{ color: '#F59E0B', fontSize: 48, marginBottom: 16 }} />
                          <Typography sx={{ fontWeight: 600, color: '#D97706', fontSize: '1.1rem', mb: 1 }}>Данные отправлены мошенникам!</Typography>
                          <Typography sx={{ color: '#92400E', fontSize: '0.9rem' }}>Злоумышленник получил ваш логин и пароль.</Typography>
                        </>
                      ) : (
                        <>
                          <CheckCircledIcon style={{ color: '#059669', fontSize: 48, marginBottom: 16 }} />
                          <Typography sx={{ fontWeight: 600, color: '#059669', fontSize: '1.1rem', mb: 1 }}>Вход выполнен</Typography>
                        </>
                      )}
                    </Paper>
                  )}
                </Paper>
              </Box>
              <Box sx={{ px: 3, py: 2, textAlign: 'center', bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <span style={{ fontSize: 14 }}>🔒</span>
                  <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>Соединение защищено</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.7rem', color: '#BBB' }}>© 2024 ПАО банк. Генеральная лицензия №1481</Typography>
              </Box>
            </Box>
          ) : (

            <Box sx={{ p: 3 }}>
            {}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#212121' }}>
              {currentTab.content.title}
            </Typography>

            {}
            {currentTab.content.warnings && currentTab.content.warnings.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {currentTab.content.warnings.map((warning, idx) => (
                  <Alert key={idx} severity="warning" sx={{ borderRadius: 1 }}>
                    <Typography variant="caption">{warning}</Typography>
                  </Alert>
                ))}
              </Box>
            )}

            {}
            <Paper sx={{ p: 2.5, mb: 2, borderRadius: 1.5, bgcolor: '#FFFFFF' }}>
              <Typography variant="body1" sx={{ lineHeight: 1.7, color: '#424242', whiteSpace: 'pre-line' }}>
                {currentTab.content.body}
              </Typography>
            </Paper>

            {}
            {currentTab.content.hasLinks && currentTab.content.links && (
              <Paper sx={{ p: 2, mb: 2, borderRadius: 1.5, bgcolor: '#FFFFFF' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Ссылки на странице:</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {currentTab.content.links.map((link, idx) => (
                    <Box
                      key={idx}
                      onClick={() => handleLinkClick(link)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: link.isSuspicious ? '#FFF8E1' : 'transparent',
                        '&:hover': { bgcolor: '#F5F5F5' },
                      }}
                    >
                      <Share1Icon style={{ color: link.isSuspicious ? '#FF9800' : '#2E7D32', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: '#2E7D32', textDecoration: 'underline', flex: 1 }}>
                        {link.text}
                      </Typography>
                      {link.isSuspicious && (
                        <ExclamationTriangleIcon style={{ color: '#FF9800', fontSize: 16 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {}
            {currentTab.content.hasForm && currentTab.content.formFields && !formSubmitted && (
              <Paper sx={{ p: 2.5, mb: 2, borderRadius: 1.5, bgcolor: '#FFFFFF', border: currentTab.isPhishing ? '2px solid #FF9800' : '1px solid #E0E0E0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Форма:</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {currentTab.content.formFields.map((field, idx) => (
                    <TextField
                      key={idx}
                      label={field.label}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.label] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                      }}
                    />
                  ))}
                  <Button
                    variant="contained"
                    onClick={handleSubmitForm}
                    fullWidth
                    sx={{ borderRadius: 1.5, py: 1.5, bgcolor: currentTab.isPhishing ? '#FF9800' : '#2E7D32' }}
                  >
                    {currentTab.isPhishing ? 'Отправить (опасно!)' : 'Отправить'}
                  </Button>
                </Box>
              </Paper>
            )}

            {}
            {formSubmitted && (
              <Paper sx={{ p: 3, mb: 2, borderRadius: 1.5, bgcolor: currentTab.isPhishing ? '#FEF3C7' : '#D1FAE5', textAlign: 'center' }}>
                {currentTab.isPhishing ? (
                  <>
                    <ExclamationTriangleIcon style={{ color: '#F59E0B', fontSize: 56, marginBottom: 16 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#D97706', mb: 1 }}>💀 Все данные утекли!</Typography>
                    <Typography sx={{ color: '#92400E', fontSize: '0.9rem', mb: 1 }}>
                      Мошенники получили ваши данные и теперь могут ими воспользоваться.
                    </Typography>
                    <Typography sx={{ color: '#B45309', fontSize: '0.8rem', bgcolor: 'rgba(0,0,0,0.05)', p: 1.5, borderRadius: 1 }}>
                      ⚠️ Данные карты/аккаунта скомпрометированы. Срочно заблокируйте карту и обратитесь в банк!
                    </Typography>
                  </>
                ) : (
                  <>
                    <CheckCircledIcon style={{ color: '#059669', fontSize: 56, marginBottom: 16 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669', mb: 1 }}>✅ Отправлено</Typography>
                    <Typography sx={{ color: '#065F46', fontSize: '0.9rem' }}>Данные успешно отправлены.</Typography>
                  </>
                )}
              </Paper>
            )}

            {}
            {currentTab.content.hasDownload && (
              <Paper sx={{ p: 2, mb: 2, borderRadius: 1.5, bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2 }}>
                <DownloadIcon style={{ fontSize: 32, color: '#2E7D32' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentTab.content.downloadFileName}</Typography>
                  <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Нажмите для загрузки</Typography>
                </Box>
                <Button variant="outlined" onClick={handleDownload} sx={{ borderRadius: 1.5 }}>
                  Скачать
                </Button>
              </Paper>
            )}
          </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9E9E9E' }}>
            <Box sx={{ textAlign: 'center' }}>
              <GlobeIcon style={{ fontSize: 64, marginBottom: 8, color: '#E0E0E0' }} />
              <Typography>Откройте новую вкладку</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {}
      {showHistory && history.length > 0 && (
        <Paper sx={{ borderTop: '1px solid #E0E0E0', maxHeight: 200, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 2, py: 1, bgcolor: '#F5F5F5' }}>История просмотров</Typography>
          {history.map((entry, idx) => (
            <Box key={idx}>
              <ListItem sx={{ py: 0.5, bgcolor: entry.isSuspicious ? '#FFF8E1' : 'transparent' }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {entry.isSuspicious ? (
                    <ExclamationTriangleIcon style={{ color: '#FF9800', fontSize: 16 }} />
                  ) : (
                    <GlobeIcon style={{ fontSize: 16 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{entry.title}</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: '#9E9E9E' }}>{entry.url} • {entry.timestamp}</Typography>}
                />
              </ListItem>
              {idx < history.length - 1 && <Divider />}
            </Box>
          ))}
        </Paper>
      )}

      {}
      <Dialog open={showCertInfo} onClose={() => setShowCertInfo(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {currentTab?.isSecure ? (
              <LockClosedIcon style={{ color: '#4CAF50' }} />
            ) : (
              <LockOpen1Icon style={{ color: '#FF9800' }} />
            )}
            Информация о сертификате
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentTab?.certificateInfo ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, py: 1 }}>
              <Typography>
                <strong>Статус:</strong>{' '}
                {currentTab.certificateInfo.isValid ? (
                  <Chip label="Действителен" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }} />
                ) : (
                  <Chip label="Недействителен" size="small" sx={{ bgcolor: '#FFEBEE', color: '#D32F2F' }} />
                )}
              </Typography>
              <Typography><strong>Издатель:</strong> {currentTab.certificateInfo.issuer}</Typography>
              <Typography><strong>Действителен с:</strong> {currentTab.certificateInfo.validFrom}</Typography>
              <Typography><strong>Действителен по:</strong> {currentTab.certificateInfo.validTo}</Typography>
            </Box>
          ) : (
            <Alert severity="warning">Сертификат отсутствует</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCertInfo(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
