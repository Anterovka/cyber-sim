'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  LockClosedIcon,
  Cross1Icon,
  CheckCircledIcon,
  UpdateIcon,
  EnterIcon,
  ReloadIcon,
  HomeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: string;
  sizeBytes?: number;
  modified?: string;
  isSuspicious?: boolean;
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  threatDescription?: string;
  isEncrypted?: boolean;
  isHidden?: boolean;
  hash?: string;
  children?: FileSystemItem[];
}

interface FileExplorerSimulatorProps {
  fileSystem: FileSystemItem[];
  onAction: (action: string, data?: any) => void;
  showThreatWarnings?: boolean;
}

const fileIcons: Record<string, string> = {
  exe: '⚙️', msi: '📦', bat: '⚡', scr: '🎭', cmd: '⚡',
  pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗',
  jpg: '🖼️', png: '🖼️', gif: '🖼️',
  zip: '📦', rar: '📦', '7z': '📦',
  txt: '📋', js: '📜', py: '🐍', html: '🌐', css: '🎨',
};

type SortField = 'name' | 'size' | 'modified' | 'type';
type SortDirection = 'asc' | 'desc';

export default function FileExplorerSimulator({
  fileSystem: rootFileSystem, onAction, showThreatWarnings = true,
}: FileExplorerSimulatorProps) {

  const [navStack, setNavStack] = useState<{ path: string; items: FileSystemItem[] }[]>([
    { path: 'C:\\Users\\User\\Downloads', items: rootFileSystem },
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const [scanInProgress, setScanInProgress] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

  const currentNav = navStack[navStack.length - 1];
  const currentPath = currentNav.path;
  const currentItems = currentNav.items;

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDirection('asc'); }
    setSortAnchorEl(null);
  };

  const items = currentItems.filter((item) => showHidden || !item.isHidden);
  const filteredItems = searchQuery
    ? items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const folders = filteredItems.filter((item) => item.type === 'folder');
  const files = filteredItems.filter((item) => item.type === 'file');

  const sortItems = (items: FileSystemItem[]) => {
    return [...items].sort((a, b) => {
      let c = 0;
      switch (sortField) {
        case 'name': c = a.name.localeCompare(b.name); break;
        case 'size': c = (a.sizeBytes || 0) - (b.sizeBytes || 0); break;
        case 'modified': c = (a.modified || '').localeCompare(b.modified || ''); break;
        case 'type': c = (a.extension || '').localeCompare(b.extension || ''); break;
      }
      return sortDirection === 'asc' ? c : -c;
    });
  };

  const sortedFolders = sortItems(folders);
  const sortedFiles = sortItems(files);
  const suspiciousItems = items.filter((item) => item.isSuspicious);

  const handleNavigate = (folder: FileSystemItem) => {
    const newPath = `${currentPath}\\${folder.name}`;
    const newItems = folder.children || [];
    setNavStack([...navStack, { path: newPath, items: newItems }]);
    setSelectedItems([]);
    setSearchQuery('');
    onAction('navigate', { path: newPath });
  };

  const handleGoBack = () => {
    if (navStack.length > 1) {
      setNavStack(navStack.slice(0, -1));
      setSelectedItems([]);
      setSearchQuery('');
    }
  };

  const handleGoHome = () => {
    setNavStack([{ path: 'C:\\Users\\User', items: rootFileSystem }]);
    setSelectedItems([]);
    setSearchQuery('');
  };

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      handleNavigate(item);
    } else {
      setSelectedItems([item.id]);
      setShowFileDetails(true);
      if (item.isSuspicious) onAction('suspicious_file', item);
    }
  };

  const handleDeleteFile = (fileId: string) => {

    const newItems = currentItems.filter((f) => f.id !== fileId);
    setNavStack((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], items: newItems };
      return updated;
    });
    setShowDeleteConfirm(false);
    setShowFileDetails(false);
    setShowAlert('deleted');
    onAction('delete_file', fileId);
    setTimeout(() => setShowAlert(null), 3000);
  };

  const handleQuarantineFile = (fileId: string) => {
    const newItems = currentItems.filter((f) => f.id !== fileId);
    setNavStack((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], items: newItems };
      return updated;
    });
    setShowFileDetails(false);
    setShowAlert('quarantined');
    onAction('quarantine_file', fileId);
    setTimeout(() => setShowAlert(null), 3000);
  };

  const handleScan = () => {
    setScanInProgress(true);
    setScanProgress(0);
    onAction('scan_start');
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanInProgress(false);
          onAction('scan_complete', { suspiciousCount: suspiciousItems.length });
          setShowAlert('scan_complete');
          setTimeout(() => setShowAlert(null), 3000);
          return 100;
        }
        return prev + 3;
      });
    }, 80);
  };

  const selectedItem = currentItems.find((item) => item.id === selectedItems[0]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span style={{ marginLeft: 4, opacity: 0.3 }}>↕</span>;
    return sortDirection === 'asc' ? <ChevronUpIcon style={{ marginLeft: 4, fontSize: 14 }} /> : <ChevronDownIcon style={{ marginLeft: 4, fontSize: 14 }} />;
  };

  return (
    <Paper sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', border: '1px solid #D0D0D0', bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'relative' }}>
      {}
      <Box sx={{ bgcolor: '#F3F3F3', px: 2, py: 0.75, display: 'flex', alignItems: 'center', borderBottom: '1px solid #E0E0E0' }}>
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F57' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28CA41' }} />
        </Box>
        <Typography sx={{ flex: 1, textAlign: 'center', color: '#4D4D4D', fontWeight: 500, fontSize: '0.8rem' }}>
          Проводник — {currentPath}
        </Typography>
        <Box sx={{ width: 52 }} />
      </Box>

      {}
      <Box sx={{ bgcolor: '#F9F9F9', borderBottom: '1px solid #E0E0E0', px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton size="small" onClick={handleGoBack} disabled={navStack.length <= 1} sx={{ color: '#666' }}>
          <EnterIcon style={{ transform: 'rotate(180deg)' }} />
        </IconButton>
        <IconButton size="small" onClick={handleGoHome} sx={{ color: '#666' }}><HomeIcon /></IconButton>
        <IconButton size="small" onClick={() => { setSelectedItems([]); setSearchQuery(''); }} sx={{ color: '#666' }}><ReloadIcon /></IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Button size="small" variant="outlined" onClick={handleScan} disabled={scanInProgress} startIcon={<MagnifyingGlassIcon />} sx={{ borderRadius: 1.5, fontSize: '0.75rem', color: '#666', borderColor: '#D0D0D0' }}>
          {scanInProgress ? 'Сканирование...' : 'Проверить'}
        </Button>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <IconButton size="small" onClick={() => setShowHidden(!showHidden)} sx={{ color: showHidden ? '#1976D2' : '#666' }}>
          <span style={{ fontSize: 18 }}>{showHidden ? '👁' : '👁‍🗨'}</span>
        </IconButton>

        {}
        <Button size="small" variant="outlined" onClick={(e) => setSortAnchorEl(e.currentTarget)} endIcon={sortField === 'name' ? (sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : undefined} sx={{ borderRadius: 1.5, fontSize: '0.75rem', color: '#666', borderColor: '#D0D0D0', textTransform: 'none' }}>
          Сортировка
        </Button>
        <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={() => setSortAnchorEl(null)}>
          <MenuItem onClick={() => handleSort('name')} selected={sortField === 'name'}>По имени <SortIcon field="name" /></MenuItem>
          <MenuItem onClick={() => handleSort('size')} selected={sortField === 'size'}>По размеру <SortIcon field="size" /></MenuItem>
          <MenuItem onClick={() => handleSort('modified')} selected={sortField === 'modified'}>По дате <SortIcon field="modified" /></MenuItem>
          <MenuItem onClick={() => handleSort('type')} selected={sortField === 'type'}>По типу <SortIcon field="type" /></MenuItem>
        </Menu>

        <Box sx={{ flex: 1 }} />

        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск..."
          size="small"
          sx={{ width: 180, '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.8rem', bgcolor: '#FFFFFF' } }}
          InputProps={{ startAdornment: <MagnifyingGlassIcon style={{ marginRight: 4, color: '#9E9E9E', fontSize: 16 }} /> }}
        />
      </Box>

      {}
      <Box sx={{ px: 2, py: 0.75, bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', gap: 1 }}>
        <span style={{ fontSize: 16 }}>📁</span>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          {currentPath.split('\\').map((part, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {idx > 0 && <Typography sx={{ color: '#999', fontSize: '0.8rem' }}>\</Typography>}
              <Chip
                label={part || 'Этот компьютер'}
                size="small"
                onClick={() => {
                  const newPath = currentPath.split('\\').slice(0, idx + 1).join('\\');
                  // Navigate to that level
                  const targetStack = navStack.slice(0, idx + 1);
                  if (targetStack.length > 0) {
                    setNavStack(targetStack);
                  }
                  setSelectedItems([]);
                  setSearchQuery('');
                }}
                sx={{ fontSize: '0.8rem', height: 24, cursor: 'pointer', bgcolor: '#F0F0F0', '&:hover': { bgcolor: '#E0E0E0' } }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* ===== SCAN PROGRESS ===== */}
      {scanInProgress && (
        <Box sx={{ px: 2, py: 1, bgcolor: '#E3F2FD', borderBottom: '1px solid #BBDEFB' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <UpdateIcon style={{ fontSize: 18, color: '#1976D2' }} />
            <Typography sx={{ color: '#1976D2', fontWeight: 600, fontSize: '0.8rem' }}>Сканирование файлов...</Typography>
          </Box>
          <LinearProgress variant="determinate" value={scanProgress} sx={{ borderRadius: 1, height: 4 }} />
          <Typography sx={{ color: '#757575', fontSize: '0.75rem' }}>{scanProgress}%</Typography>
        </Box>
      )}

      {/* ===== THREAT WARNING ===== */}
      {showThreatWarnings && suspiciousItems.length > 0 && !scanInProgress && (
        <Box sx={{ px: 2, py: 1, bgcolor: '#FFEBEE', borderBottom: '1px solid #EF9A9A' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ExclamationTriangleIcon style={{ color: '#D32F2F', fontSize: 20 }} />
            <Box>
              <Typography sx={{ fontWeight: 600, color: '#D32F2F', fontSize: '0.85rem' }}>Обнаружены угрозы!</Typography>
              <Typography sx={{ color: '#BF360C', fontSize: '0.75rem' }}>{suspiciousItems.length} подозрительных файлов</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ===== FILE LIST ===== */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#FFFFFF' }}>
        {filteredItems.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
            <Box sx={{ textAlign: 'center' }}>
              <span style={{ fontSize: 48, marginBottom: 16, display: 'block' }}>📂</span>
              <Typography sx={{ fontSize: '1rem' }}>Папка пуста</Typography>
            </Box>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('name')}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>Имя <SortIcon field="name" /></Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', width: 100, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('size')}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>Размер <SortIcon field="size" /></Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', width: 140, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('modified')}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>Изменён <SortIcon field="modified" /></Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', width: 100, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('type')}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>Тип <SortIcon field="type" /></Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...sortedFolders, ...sortedFiles].map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: item.isSuspicious ? '#FFF8E1' : selectedItems.includes(item.id) ? '#E3F2FD' : 'transparent',
                      '&:hover': { bgcolor: item.isSuspicious ? '#FFF3E1' : '#F5F5F5' },
                      borderLeft: item.isSuspicious ? '3px solid #FF9800' : '3px solid transparent',
                    }}
                  >
                    <TableCell sx={{ borderBottom: '1px solid #F0F0F0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: 20 }}>
                          {item.type === 'folder' ? '📁' : fileIcons[item.extension || ''] || '📄'}
                        </span>
                        <Typography sx={{ fontWeight: item.isSuspicious ? 600 : 400, fontSize: '0.85rem' }}>
                          {item.name}
                        </Typography>
                        {item.isSuspicious && <ExclamationTriangleIcon style={{ color: '#FF9800', fontSize: 16 }} />}
                        {item.isEncrypted && <LockClosedIcon style={{ color: '#FF9800', fontSize: 14 }} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#757575', borderBottom: '1px solid #F0F0F0' }}>{item.size || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#757575', borderBottom: '1px solid #F0F0F0' }}>{item.modified || '—'}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F0F0F0' }}>
                      {item.isSuspicious && item.threatLevel && (
                        <Chip label={item.threatLevel === 'critical' ? 'Критический' : item.threatLevel === 'high' ? 'Высокий' : item.threatLevel === 'medium' ? 'Средний' : 'Низкий'} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: item.threatLevel === 'critical' ? '#D32F2F' : item.threatLevel === 'high' ? '#FF9800' : item.threatLevel === 'medium' ? '#FFC107' : '#4CAF50', color: 'white' }} />
                      )}
                      {!item.isSuspicious && (
                        <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>
                          {item.type === 'folder' ? `Папка (${item.children?.length || 0})` : item.extension?.toUpperCase() || 'Файл'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* ===== STATUS BAR ===== */}
      <Box sx={{ px: 2, py: 0.75, bgcolor: '#F5F5F5', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: '#757575', fontSize: '0.75rem' }}>
          {sortedFolders.length} папок, {sortedFiles.length} файлов
        </Typography>
        {suspiciousItems.length > 0 && (
          <Typography sx={{ color: '#D32F2F', fontWeight: 600, fontSize: '0.75rem' }}>
            ⚠ {suspiciousItems.length} угроз
          </Typography>
        )}
      </Box>

      {/* ===== FILE DETAILS DIALOG ===== */}
      <Dialog open={showFileDetails} onClose={() => setShowFileDetails(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        {selectedItem && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: 24 }}>{selectedItem.type === 'folder' ? '📁' : fileIcons[selectedItem.extension || ''] || '📄'}</span>
              {selectedItem.name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#757575' }}>Тип</Typography><Typography sx={{ fontWeight: 500 }}>{selectedItem.type === 'folder' ? 'Папка' : `Файл (.${selectedItem.extension})`}</Typography></Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#757575' }}>Размер</Typography><Typography sx={{ fontWeight: 500 }}>{selectedItem.size || 'Неизвестно'}</Typography></Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#757575' }}>Изменён</Typography><Typography sx={{ fontWeight: 500 }}>{selectedItem.modified || 'Неизвестно'}</Typography></Box>
                {selectedItem.hash && <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: '#757575' }}>Хэш</Typography><Typography sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedItem.hash}</Typography></Box>}
                {selectedItem.isSuspicious && selectedItem.threatDescription && (
                  <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                    <AlertTitle>Обнаружена угроза</AlertTitle>
                    <Typography sx={{ fontSize: '0.8rem' }}>{selectedItem.threatDescription}</Typography>
                  </Alert>
                )}
                {selectedItem.isEncrypted && (
                  <Alert severity="warning" sx={{ borderRadius: 1.5 }}>Файл зашифрован! Возможно, это ransomware.</Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setShowFileDetails(false)}>Закрыть</Button>
              {selectedItem.isSuspicious && (
                <>
                  <Button onClick={() => handleQuarantineFile(selectedItem.id)} color="warning" variant="outlined" sx={{ borderRadius: 1.5 }}>В карантин</Button>
                  <Button onClick={() => setShowDeleteConfirm(true)} color="error" variant="contained" startIcon={<TrashIcon />} sx={{ borderRadius: 1.5 }}>Удалить</Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}><TrashIcon style={{ color: '#DC2626' }} /> Удалить файл?</DialogTitle>
        <DialogContent><Typography sx={{ color: '#5F6368' }}>Вы уверены, что хотите удалить этот файл?</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDeleteConfirm(false)}>Отмена</Button>
          <Button onClick={() => handleDeleteFile(selectedItems[0])} color="error" variant="contained" sx={{ borderRadius: 1.5 }}>Удалить</Button>
        </DialogActions>
      </Dialog>

      {/* Alert */}
      {showAlert && (
        <Box sx={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Alert severity={showAlert === 'deleted' || showAlert === 'quarantined' || showAlert === 'scan_complete' ? 'success' : 'info'} sx={{ borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {showAlert === 'deleted' && '🗑️ Файл удалён'}
            {showAlert === 'quarantined' && '🔒 Файл в карантине'}
            {showAlert === 'scan_complete' && `✅ Сканирование завершено. Найдено ${suspiciousItems.length} угроз.`}
          </Alert>
        </Box>
      )}
    </Paper>
  );
}
