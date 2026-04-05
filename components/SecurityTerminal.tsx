'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { CodeIcon, ResetIcon, InfoCircledIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useThemeMode } from '@/lib/ThemeModeContext';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  content: string;
}

interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => string;
}

const SECURITY_COMMANDS: Record<string, Omit<Command, 'name'>> = {
  help: {
    description: 'Показать список команд',
    execute: () =>
      `Доступные команды:
  help          — справка
  ping <host>   — проверить доступность хоста
  whois <domain> — информация о домене
  nslookup <domain> — DNS-записи домена
  traceroute <host> — путь пакета до хоста
  check-url <url>   — анализ подозрительной ссылки
  check-email <email> — анализ подозрительного письма
  decode <text>     — декодировать base64
  hash <text>       — хешировать текст (SHA-256)
  scan <ip>         — сканировать порты (симуляция)
  clear             — очистить терминал`,
  },
  ping: {
    description: 'Проверить доступность хоста',
    execute: (args) => {
      if (!args[0]) return 'Использование: ping <host>\nПример: ping google.com';
      const host = args[0];
      return `PING ${host} (93.184.216.34): 56 байт данных\n64 байт от ${host}: icmp_seq=0 ttl=56 время=14.2 мс\n64 байт от ${host}: icmp_seq=1 ttl=56 время=13.8 мс\n64 байт от ${host}: icmp_seq=2 ttl=56 время=14.1 мс\n\n--- ${host} ping statistics ---\n3 пакетов передано, 3 получено, 0% потерь`;
    },
  },
  whois: {
    description: 'Информация о домене',
    execute: (args) => {
      if (!args[0]) return 'Использование: whois <domain>\nПример: whois example.com';
      const domain = args[0];
      return `Domain Name: ${domain.toUpperCase()}\nRegistry Domain ID: D123456-REGISTRY\nRegistrar: Example Registrar Inc.\nCreation Date: 2020-01-15T10:00:00Z\nRegistry Expiry Date: 2027-01-15T10:00:00Z\nName Server: NS1.EXAMPLE.COM\nName Server: NS2.EXAMPLE.COM\nDNSSEC: unsigned\n\n⚠️ Совет: проверьте дату регистрации — свежие домены (< 30 дней) часто используются для фишинга.`;
    },
  },
  nslookup: {
    description: 'DNS-записи домена',
    execute: (args) => {
      if (!args[0]) return 'Использование: nslookup <domain>';
      const domain = args[0];
      return `Server:  8.8.8.8\nAddress: 8.8.8.8#53\n\nNon-authoritative answer:\nName:    ${domain}\nAddress:  93.184.216.34\nName:    ${domain}\nAddress:  2606:2800:220:1:248:1893:25c8:1946\n\nMX record: mail.${domain} (priority: 10)\nTXT record: "v=spf1 include:_spf.${domain} ~all"\n\n🔍 Проверьте SPF/DKIM записи для верификации отправителя письма.`;
    },
  },
  'check-url': {
    description: 'Анализ подозрительной ссылки',
    execute: (args) => {
      if (!args[0]) return 'Использование: check-url <url>\nПример: check-url http://sberbank-security.verify-account.ru';
      const url = args[0];
      const suspicious = url.includes('.') && url.split('.').length > 2;
      const hasHttp = url.startsWith('http://');
      const hasSuspiciousWords = /login|verify|secure|account|bank|password/i.test(url);

      let result = `🔍 Анализ URL: ${url}\n${'─'.repeat(50)}\n`;
      result += `Протокол: ${hasHttp ? '❌ HTTP (небезопасно)' : '✅ HTTPS'}\n`;
      result += `Поддоменов: ${url.split('.').length - 1} ${suspicious ? '⚠️ МНОГО ПОДДОМЕНОВ!' : '✅ OK'}\n`;
      result += `Подозрительные слова: ${hasSuspiciousWords ? '❌ ОБНАРУЖЕНЫ' : '✅ Нет'}\n`;

      if (suspicious || hasHttp || hasSuspiciousWords) {
        result += `\n🚨 ВЕРДИКТ: ПОДОЗРИТЕЛЬНАЯ ССЫЛКА!\n`;
        result += `Это может быть фишинговая страница.\n`;
        result += `Правильный алгоритм:\n`;
        result += `  1. Не переходите по ссылке\n`;
        result += `  2. Откройте сайт банка вручную через адресную строку\n`;
        result += `  3. Проверьте сертификат сайта (🔒 в браузере)\n`;
        result += `  4. Сообщите о фишинге в техподдержку`;
      } else {
        result += `\n✅ ВЕРДИКТ: Ссылка выглядит безопасно`;
      }
      return result;
    },
  },
  'check-email': {
    description: 'Анализ подозрительного письма',
    execute: (args) => {
      if (!args[0]) return 'Использование: check-email <email>\nПример: check-email support@sberbank-verify.ru';
      const email = args[0];
      const domain = email.split('@')[1] || '';
      const suspiciousDomains = ['verify', 'secure', 'account', 'support', 'help'];
      const isSuspicious = suspiciousDomains.some((d) => domain.includes(d) && !domain.startsWith('sberbank') && !domain.startsWith('google') && !domain.startsWith('yandex'));

      let result = `📧 Анализ отправителя: ${email}\n${'─'.repeat(50)}\n`;
      result += `Домен: ${domain}\n`;
      result += `SPF: ${isSuspicious ? '❌ НЕ ПРОЙДЕН' : '✅ Пройден'}\n`;
      result += `DKIM: ${isSuspicious ? '❌ ПОДПИСЬ ОТСУТСТВУЕТ' : '✅ Подпись верна'}\n`;
      result += `DMARC: ${isSuspicious ? '❌ ПОЛИТИКА НЕ ПРИМЕНЯЕТСЯ' : '✅ Политика соблюдена'}\n`;

      if (isSuspicious) {
        result += `\n🚨 ВЕРДИКТ: ПОДОЗРИТЕЛЬНОЕ ПИСЬМО!\n`;
        result += `Домен отправителя подозрителен.\n`;
        result += `Правильный алгоритм:\n`;
        result += `  1. Не открывайте вложения и ссылки\n`;
        result += `  2. Проверьте заголовки письма (Show Original)\n`;
        result += `  3. Сравните SPF/DKIM/DMARC записи\n`;
        result += `  4. Перешлите письмо в отдел ИБ\n`;
        result += `  5. Удалите письмо`;
      } else {
        result += `\n✅ ВЕРДИКТ: Письмо выглядит легитимным`;
      }
      return result;
    },
  },
  decode: {
    description: 'Декодировать base64',
    execute: (args) => {
      if (!args[0]) return 'Использование: decode <base64>\nПример: decode SGVsbG8gV29ybGQ=';
      try {
        const decoded = atob(args[0]);
        return `Base64: ${args[0]}\nDecoded: ${decoded}\n\n💡 Base64 часто используется в фишинговых ссылках для скрытия реального URL.`;
      } catch {
        return '❌ Ошибка: невалидный base64';
      }
    },
  },
  hash: {
    description: 'Хешировать текст (SHA-256)',
    execute: (args) => {
      if (!args[0]) return 'Использование: hash <text>';
      const text = args.join(' ');
      const hash = Array.from(new TextEncoder().encode(text))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return `Input:  ${text}\nSHA-256: ${hash.slice(0, 64)}...\n\n💡 Хеш используется для проверки целостности файлов.`;
    },
  },
  scan: {
    description: 'Сканировать порты (симуляция)',
    execute: (args) => {
      if (!args[0]) return 'Использование: scan <ip>\nПример: scan 192.168.1.1';
      const ip = args[0];
      return `Starting port scan of ${ip}...\n\nPORT     STATE  SERVICE\n21/tcp   open   ftp\n22/tcp   open   ssh\n25/tcp   closed smtp\n80/tcp   open   http\n443/tcp  open   https\n3306/tcp closed mysql\n\n⚠️ Открытые порты 21 (FTP) и 22 (SSH) — убедитесь, что они защищены.\n💡 FTP передаёт данные в открытом виде — используйте SFTP.`;
    },
  },
  traceroute: {
    description: 'Путь пакета до хоста',
    execute: (args) => {
      if (!args[0]) return 'Использование: traceroute <host>';
      const host = args[0];
      return `traceroute to ${host} (93.184.216.34), 30 hops max\n 1  192.168.1.1       1.2ms   1.1ms   1.0ms\n 2  10.0.0.1         5.3ms   5.1ms   5.4ms\n 3  100.64.0.1      12.1ms  11.8ms  12.3ms\n 4  93.184.216.34   14.2ms  13.9ms  14.1ms\n\n✅ Пакет дошёл без аномалий.\n💡 Неожиданные промежуточные узлы могут указывать на MITM-атаку.`;
    },
  },
};

export default function InteractiveTerminal() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', content: '╔══════════════════════════════════════════╗' },
    { type: 'info', content: '║  CyberSim Security Terminal v1.0        ║' },
    { type: 'info', content: '║  Практикуйте команды безопасности       ║' },
    { type: 'info', content: '║  Введите "help" для списка команд      ║' },
    { type: 'info', content: '╚══════════════════════════════════════════╝' },
    { type: 'output', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/);
      const commandName = parts[0].toLowerCase();
      const args = parts.slice(1);

      const newLines: TerminalLine[] = [
        ...lines,
        { type: 'input', content: `$ ${trimmed}` },
      ];

      if (commandName === 'clear') {
        setLines([]);
        setInput('');
        return;
      }

      const command = SECURITY_COMMANDS[commandName];
      if (command) {
        const output = command.execute(args);
        const lines_output = output.split('\n');
        lines_output.forEach((line) => {
          let type: TerminalLine['type'] = 'output';
          if (line.startsWith('🚨') || line.startsWith('❌')) type = 'error';
          else if (line.startsWith('✅')) type = 'success';
          else if (line.startsWith('⚠️') || line.startsWith('💡') || line.startsWith('🔍') || line.startsWith('📧') || line.startsWith('╔') || line.startsWith('║') || line.startsWith('╚')) type = 'info';
          newLines.push({ type, content: line });
        });
      } else {
        newLines.push({
          type: 'error',
          content: `bash: ${commandName}: команда не найдена. Введите "help" для справки.`,
        });
      }

      setLines(newLines);
      setHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
      setInput('');
    },
    [lines]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const quickCommands = [
    { label: 'check-url', cmd: 'check-url http://sberbank-security.verify-account.ru' },
    { label: 'check-email', cmd: 'check-email support@sberbank-verify.ru' },
    { label: 'whois', cmd: 'whois example.com' },
    { label: 'decode', cmd: 'decode SGVsbG8gV29ybGQ=' },
    { label: 'scan', cmd: 'scan 192.168.1.1' },
  ];

  return (
    <Paper
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        bgcolor: isDark ? '#0a0a0a' : '#1e1e1e',
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      }}
    >
      {}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: isDark ? '#111' : '#252525',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CodeIcon width={16} height={16} style={{ color: '#4caf50' }} />
          <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600, fontSize: '0.8rem' }}>
            Security Terminal
          </Typography>
        </Box>
        <Tooltip title="Очистить терминал">
          <IconButton size="small" onClick={() => setLines([])} sx={{ color: '#666' }}>
            <ResetIcon width={14} height={14} />
          </IconButton>
        </Tooltip>
      </Box>

      {}
      <Box
        ref={terminalRef}
        sx={{
          p: 2,
          height: 400,
          overflowY: 'auto',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
        }}
      >
        {lines.map((line, i) => (
          <Typography
            key={i}
            sx={{
              color:
                line.type === 'error'
                  ? '#ff6b6b'
                  : line.type === 'success'
                    ? '#51cf66'
                    : line.type === 'input'
                      ? '#fff'
                      : line.type === 'info'
                        ? '#ffd43b'
                        : '#ccc',
              fontWeight: line.type === 'input' ? 600 : 400,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {line.type === 'input' && (
              <span style={{ color: '#4caf50', marginRight: 8 }}>➜</span>
            )}
            {line.content}
          </Typography>
        ))}
      </Box>

      {}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          bgcolor: isDark ? '#111' : '#252525',
        }}
      >
        <ChevronRightIcon width={16} height={16} style={{ color: '#4caf50', marginRight: 8, flexShrink: 0 }} />
        <TextField
          inputRef={inputRef}
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите команду..."
          autoFocus
          sx={{
            '& .MuiInputBase-input': {
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'transparent' },
              '&.Mui-focused fieldset': { borderColor: 'transparent' },
            },
          }}
        />
      </Box>

      {}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          bgcolor: isDark ? '#0d0d0d' : '#222',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Tooltip title="Быстрые команды для практики">
          <InfoCircledIcon width={16} height={16} style={{ color: '#666', alignSelf: 'center' }} />
        </Tooltip>
        {quickCommands.map((qc) => (
          <Chip
            key={qc.label}
            label={qc.label}
            size="small"
            onClick={() => {
              setInput(qc.cmd);
              inputRef.current?.focus();
            }}
            sx={{
              bgcolor: 'rgba(76,175,80,0.15)',
              color: '#4caf50',
              border: '1px solid rgba(76,175,80,0.3)',
              fontSize: '0.7rem',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(76,175,80,0.25)' },
            }}
          />
        ))}
      </Box>
    </Paper>
  );
}
