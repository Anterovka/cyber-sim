'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { CodeIcon, UploadIcon, CopyIcon } from '@radix-ui/react-icons';
import { useThemeMode } from '@/lib/ThemeModeContext';

const LOCATIONS = ['office', 'home', 'public_wifi', 'mobile', 'cloud'];
const ATTACK_TYPES = ['phishing', 'skimming', 'brute_force', 'social_engineering', 'deepfake', 'malware', 'man_in_the_middle', 'smishing', 'ransomware'];

const SAMPLE_IMPORT = `{
  "title": "Фишинг в рабочей почте",
  "description": "Сотрудник получает письмо от «руководства» с просьбой срочно перейти по ссылке",
  "location": "office",
  "attack_type": "phishing",
  "difficulty": 2,
  "steps": [
    {
      "text": "Вам пришло письмо от директора с темой «Срочное изменение зарплаты»",
      "actions": [
        { "id": "a1", "text": "Открыть ссылку из письма", "is_correct": false, "consequence_on_fail": "Вы перешли на фишинговый сайт. Ваши учётные данные скомпрометированы.", "hint": "Проверьте адрес отправителя" },
        { "id": "a2", "text": "Проверить адрес отправителя", "is_correct": true, "consequence_on_success": "Вы заметили что email отправителя поддельный!", "hint": "" },
        { "id": "a3", "text": "Удалить письмо", "is_correct": false, "consequence_on_fail": "Вы удалили письмо, но могли пропустить другие фишинговые письма.", "hint": "" }
      ]
    }
  ]
}`;

export default function AdminScenariosImport() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const router = useRouter();

  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = JSON.parse(jsonInput);
      const token = localStorage.getItem('auth_token');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

      const response = await fetch(`${API_BASE}/admin/scenarios/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(err.message || `Ошибка: ${response.status}`);
      }

      const result = await response.json();
      setResult({ success: true, message: `Сценарий "${result.title}" импортирован! ID: ${result.id}` });
      setJsonInput('');
    } catch (err: any) {
      setError(err.message || 'Ошибка парсинга JSON');
    } finally {
      setLoading(false);
    }
  };

  const handleSample = () => {
    setJsonInput(SAMPLE_IMPORT);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
          Импорт сценариев
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
          Добавьте новые сценарии через JSON API
        </Typography>
      </Box>

      {result && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setResult(null)}>
          {result.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          boxShadow: 'none',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon width={20} height={20} /> JSON сценария
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={handleSample}
              sx={{ borderRadius: 2 }}
            >
              Пример
            </Button>
          </Box>
        </Box>

        <TextField
          multiline
          rows={16}
          fullWidth
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Вставьте JSON сценария..."
          sx={{
            mb: 2,
            fontFamily: 'monospace',
            '& .MuiInputBase-input': {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.8rem',
              lineHeight: 1.6,
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => setJsonInput('')}
            sx={{ borderRadius: 2 }}
          >
            Очистить
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
            onClick={handleImport}
            disabled={!jsonInput.trim() || loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Импорт...' : 'Импортировать'}
          </Button>
        </Box>
      </Paper>

      {}
      <Paper
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          boxShadow: 'none',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          📋 Формат JSON
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.8 }}>
          <strong>Обязательные поля:</strong> title, location, attack_type, steps<br/>
          <strong>Опциональные:</strong> description, difficulty (1-5)<br/>
          <strong>Локации:</strong> {LOCATIONS.join(', ')}<br/>
          <strong>Типы атак:</strong> {ATTACK_TYPES.join(', ')}
        </Typography>

        <Box
          component="pre"
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#f5f5f5',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            overflow: 'auto',
            maxHeight: 300,
          }}
        >
{`{
  "title": "Название сценария",
  "description": "Описание (опционально)",
  "location": "office | home | public_wifi | mobile | cloud",
  "attack_type": "phishing | skimming | brute_force | ...",
  "difficulty": 1-5,
  "steps": [
    {
      "text": "Описание шага",
      "actions": [
        {
          "id": "a1",
          "text": "Вариант действия",
          "is_correct": true/false,
          "consequence_on_fail": "Текст последствия при ошибке",
          "consequence_on_success": "Текст при правильном выборе",
          "hint": "Подсказка (опционально)"
        }
      ]
    }
  ]
}`}
        </Box>
      </Paper>
    </Box>
  );
}
