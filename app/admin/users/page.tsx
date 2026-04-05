'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { adminListUsers, adminDeleteUser, adminBulkUsersOperation, type AdminUser } from '@/lib/api';
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
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import { MagnifyingGlassIcon, TrashIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useThemeMode } from '@/lib/ThemeModeContext';

const leagueConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Новичок', color: 'default' },
  intermediate: { label: 'Средний', color: 'primary' },
  advanced: { label: 'Продвинутый', color: 'success' },
  expert: { label: 'Эксперт', color: 'warning' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'change_league' | 'change_role'>('delete');
  const [bulkLeague, setBulkLeague] = useState('beginner');
  const [bulkRole, setBulkRole] = useState('user');
  const [bulkResult, setBulkResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const router = useRouter();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const { isAuthenticated, user } = useAuthStore();
  const abortRef = useRef(false);

  const loadUsers = useCallback(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    abortRef.current = false;
    setLoading(true);
    adminListUsers(page + 1, rowsPerPage, search || undefined)
      .then((data) => {
        if (!abortRef.current) {
          setUsers(data.users);
          setTotal(data.total);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!abortRef.current) setLoading(false);
      });
  }, [page, rowsPerPage, search, isAuthenticated, user]);

  useEffect(() => {
    loadUsers();
    return () => {
      abortRef.current = true;
    };
  }, [loadUsers]);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await adminDeleteUser(deleteDialog);
      setDeleteDialog(null);
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(deleteDialog);
        return next;
      });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadUsers();
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkOperation = async () => {
    setBulkLoading(true);
    try {
      const result = await adminBulkUsersOperation({
        user_ids: Array.from(selectedUsers),
        operation: bulkOperation,
        league: bulkOperation === 'change_league' ? bulkLeague : undefined,
        role: bulkOperation === 'change_role' ? bulkRole : undefined,
      });
      setBulkResult(result);
      setBulkDialog(false);
      setSelectedUsers(new Set());
      loadUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            Пользователи
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
            Всего: {total} пользователей
          </Typography>
        </Box>
        {selectedUsers.size > 0 && (
          <Button
            variant="contained"
            color="warning"
            onClick={() => setBulkDialog(true)}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Массовая операция ({selectedUsers.size})
          </Button>
        )}
      </Box>

      {bulkResult && (
        <Alert
          severity={bulkResult.failed > 0 ? 'warning' : 'success'}
          sx={{ mb: 2 }}
          onClose={() => setBulkResult(null)}
        >
          Успешно: {bulkResult.success}, Ошибки: {bulkResult.failed}
          {bulkResult.errors.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              {bulkResult.errors.slice(0, 3).join('; ')}
              {bulkResult.errors.length > 3 && ` +${bulkResult.errors.length - 3} ещё`}
            </Typography>
          )}
        </Alert>
      )}

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
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
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
                  <TableCell padding="checkbox" sx={{ width: 48 }}>
                    <Checkbox
                      indeterminate={selectedUsers.size > 0 && selectedUsers.size < users.length}
                      checked={users.length > 0 && selectedUsers.size === users.length}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Лига</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell align="right">Баллы</TableCell>
                  <TableCell align="right">Сценариев</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover selected={selectedUsers.has(u.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.has(u.id)}
                        onChange={() => toggleSelectUser(u.id)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{u.username}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={leagueConfig[u.league]?.label || u.league}
                        size="small"
                        color={leagueConfig[u.league]?.color as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.role === 'admin' ? 'Админ' : 'Пользователь'}
                        size="small"
                        variant="outlined"
                        color={u.role === 'admin' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{u.totalScore}</TableCell>
                    <TableCell align="right">{u.scenariosCompleted}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => router.push(`/admin/users/${u.id}`)}>
                        <EyeOpenIcon width={18} height={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog(u.id)}
                      >
                        <TrashIcon width={18} height={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Пользователи не найдены
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
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Удалить пользователя?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Это действие нельзя отменить. Все данные пользователя будут удалены.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Отмена</Button>
          <Button color="error" onClick={handleDelete} variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Массовая операция</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <DialogContentText>
            Выбрано пользователей: {selectedUsers.size}
          </DialogContentText>

          <FormControl fullWidth>
            <InputLabel>Операция</InputLabel>
            <Select
              value={bulkOperation}
              label="Операция"
              onChange={(e) => setBulkOperation(e.target.value as any)}
            >
              <MenuItem value="delete">Удалить</MenuItem>
              <MenuItem value="change_league">Сменить лигу</MenuItem>
              <MenuItem value="change_role">Сменить роль</MenuItem>
            </Select>
          </FormControl>

          {bulkOperation === 'change_league' && (
            <FormControl fullWidth>
              <InputLabel>Лига</InputLabel>
              <Select value={bulkLeague} label="Лига" onChange={(e) => setBulkLeague(e.target.value)}>
                <MenuItem value="beginner">Новичок</MenuItem>
                <MenuItem value="intermediate">Средний</MenuItem>
                <MenuItem value="advanced">Продвинутый</MenuItem>
                <MenuItem value="expert">Эксперт</MenuItem>
              </Select>
            </FormControl>
          )}

          {bulkOperation === 'change_role' && (
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select value={bulkRole} label="Роль" onChange={(e) => setBulkRole(e.target.value)}>
                <MenuItem value="user">Пользователь</MenuItem>
                <MenuItem value="admin">Администратор</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialog(false)}>Отмена</Button>
          <Button
            color={bulkOperation === 'delete' ? 'error' : 'warning'}
            onClick={handleBulkOperation}
            variant="contained"
            disabled={bulkLoading}
          >
            {bulkLoading ? <CircularProgress size={20} /> : 'Выполнить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
