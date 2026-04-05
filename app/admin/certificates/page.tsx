'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import {
  adminListCertificates,
  adminDeleteCertificate,
  adminRevokeCertificate,
  type AdminCertificate,
} from '@/lib/api';
import { useThemeMode } from '@/lib/ThemeModeContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import { MagnifyingGlassIcon, TrashIcon, CrossCircledIcon } from '@radix-ui/react-icons';

const leagueConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Новичок', color: 'default' },
  intermediate: { label: 'Средний', color: 'primary' },
  advanced: { label: 'Продвинутый', color: 'success' },
  expert: { label: 'Эксперт', color: 'warning' },
};

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [validOnly, setValidOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<{ type: 'delete' | 'revoke'; id: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const abortRef = useRef(false);

  const loadCertificates = useCallback(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    abortRef.current = false;
    setLoading(true);
    adminListCertificates(page + 1, rowsPerPage, search || undefined, validOnly)
      .then((data) => {
        if (!abortRef.current) {
          setCertificates(data.certificates);
          setTotal(data.total);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!abortRef.current) setLoading(false);
      });
  }, [page, rowsPerPage, search, validOnly, isAuthenticated, user]);

  useEffect(() => {
    loadCertificates();
    return () => {
      abortRef.current = true;
    };
  }, [loadCertificates]);

  const handleSearch = () => {
    setPage(0);
    loadCertificates();
  };

  const handleAction = async () => {
    if (!actionDialog) return;
    setActionLoading(true);
    try {
      if (actionDialog.type === 'delete') {
        await adminDeleteCertificate(actionDialog.id);
      } else {
        await adminRevokeCertificate(actionDialog.id);
      }
      setActionDialog(null);
      loadCertificates();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            Сертификаты
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
            Всего: {total} сертификатов
          </Typography>
        </Box>
      </Box>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          boxShadow: 'none',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
        }}
      >
        {}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1 }}
            slotProps={{
              input: {
                startAdornment: <MagnifyingGlassIcon width={16} height={16} />,
              },
            }}
          />
          <Button variant="contained" size="small" onClick={handleSearch} sx={{ borderRadius: 2 }}>
            Найти
          </Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={validOnly}
                onChange={(e) => {
                  setValidOnly(e.target.checked);
                  setPage(0);
                }}
              />
            }
            label="Только действительные"
            sx={{ ml: 1 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Лига</TableCell>
                  <TableCell align="right">Баллы</TableCell>
                  <TableCell>Дата выдачи</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{cert.username}</TableCell>
                    <TableCell>
                      <Chip
                        label={leagueConfig[cert.league]?.label || cert.league}
                        size="small"
                        color={leagueConfig[cert.league]?.color as any}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{cert.finalScore}</TableCell>
                    <TableCell>
                      {new Date(cert.issuedAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cert.isValid ? 'Действителен' : 'Отозван'}
                        size="small"
                        color={cert.isValid ? 'success' : 'error'}
                        variant={cert.isValid ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {cert.isValid && (
                        <Tooltip title="Отозвать">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => setActionDialog({ type: 'revoke', id: cert.id })}
                          >
                            <CrossCircledIcon width={18} height={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setActionDialog({ type: 'delete', id: cert.id })}
                        >
                          <TrashIcon width={18} height={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {certificates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Сертификаты не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="На странице"
            />
          </>
        )}
      </Paper>

      {}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)}>
        <DialogTitle>
          {actionDialog?.type === 'delete'
            ? 'Удалить сертификат?'
            : 'Отозвать сертификат?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionDialog?.type === 'delete'
              ? 'Это действие нельзя отменить. Сертификат будет полностью удалён.'
              : 'Сертификат станет недействительным. Это действие можно отменить только выдав новый сертификат.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)} disabled={actionLoading}>
            Отмена
          </Button>
          <Button
            color={actionDialog?.type === 'delete' ? 'error' : 'warning'}
            onClick={handleAction}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : actionDialog?.type === 'delete' ? 'Удалить' : 'Отозвать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
