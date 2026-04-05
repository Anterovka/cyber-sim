'use client';

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import {
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ReloadIcon,
  PlayIcon,
  LightningBoltIcon,
} from '@radix-ui/react-icons';

type DefenseType = 'firewall' | 'antivirus' | 'encryption' | 'backup' | '2fa';
type EnemyType = 'rat' | 'phishing' | 'ransomware' | 'spyware' | 'trojan';

interface DefenseUnit {
  id: string;
  type: DefenseType;
  row: number;
  col: number;
  health: number;
  maxHealth: number;
  damage: number;
  icon: string;
  color: string;
  name: string;
  description: string;
}

interface EnemyUnit {
  id: string;
  type: EnemyType;
  row: number;
  col: number;
  health: number;
  maxHealth: number;
  speed: number;
  icon: string;
  color: string;
  name: string;
  description: string;
}

interface Projectile {
  id: string;
  row: number;
  col: number;
  damage: number;
  icon: string;
  color: string;
}

interface GameResources {
  energy: number;
  maxEnergy: number;
  energyPerTick: number;
}

interface CyberDefenseProps {
  onAction: (action: string, data?: any) => void;
  onWin?: () => void;
  onLose?: () => void;
}

const DEFENSE_UNITS: Record<DefenseType, { icon: string; color: string; name: string; description: string; cost: number; health: number; damage: number }> = {
  firewall: { icon: '🛡️', color: '#2196F3', name: 'Файрвол', description: 'Блокирует входящие атаки', cost: 25, health: 150, damage: 25 },
  antivirus: { icon: '🔍', color: '#4CAF50', name: 'Антивирус', description: 'Обнаруживает и удаляет угрозы', cost: 35, health: 100, damage: 40 },
  encryption: { icon: '🔐', color: '#9C27B0', name: 'Шифрование', description: 'Замедляет и повреждает', cost: 50, health: 180, damage: 15 },
  backup: { icon: '💾', color: '#FF9800', name: 'Бэкап', description: 'Прочный щит', cost: 30, health: 250, damage: 0 },
  '2fa': { icon: '🔑', color: '#F44336', name: '2FA', description: 'Быстрая атака', cost: 40, health: 120, damage: 35 },
};

const ENEMY_TYPES: Record<EnemyType, { icon: string; color: string; name: string; description: string; health: number; speed: number; damage: number }> = {
  rat: { icon: '🐀', color: '#795548', name: 'RAT', description: 'Удалённый доступ', health: 30, speed: 0.3, damage: 10 },
  phishing: { icon: '🎣', color: '#00BCD4', name: 'Фишинг', description: 'Кража данных', health: 20, speed: 0.5, damage: 15 },
  ransomware: { icon: '🔒', color: '#F44336', name: 'Ransomware', description: 'Шифрование файлов', health: 50, speed: 0.2, damage: 25 },
  spyware: { icon: '👁️', color: '#607D8B', name: 'Spyware', description: 'Шпионское ПО', health: 25, speed: 0.4, damage: 12 },
  trojan: { icon: '🐴', color: '#8BC34A', name: 'Троян', description: 'Скрытая угроза', health: 40, speed: 0.25, damage: 20 },
};

const ROWS = 5;
const COLS = 9;

export default function CyberDefenseGame({ onAction, onWin, onLose }: CyberDefenseProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won' | 'lost'>('menu');
  const [defenses, setDefenses] = useState<DefenseUnit[]>([]);
  const [enemies, setEnemies] = useState<EnemyUnit[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [resources, setResources] = useState<GameResources>({ energy: 200, maxEnergy: 500, energyPerTick: 15 });
  const [selectedDefense, setSelectedDefense] = useState<DefenseType | null>(null);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [gameTick, setGameTick] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [waveActive, setWaveActive] = useState(false);


  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setResources((prev) => ({
        ...prev,
        energy: Math.min(prev.energy + prev.energyPerTick, prev.maxEnergy),
      }));
      setGameTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);


  const spawnEnemies = useCallback((waveNum: number) => {
    const newEnemies: EnemyUnit[] = [];
    const count = 2 + waveNum;
    const types: EnemyType[] = ['rat', 'phishing', 'spyware'];
    if (waveNum >= 2) types.push('trojan');
    if (waveNum >= 3) types.push('ransomware');

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const config = ENEMY_TYPES[type];
      newEnemies.push({
        id: `enemy-${waveNum}-${i}`,
        type,
        row: Math.floor(Math.random() * ROWS),
        col: COLS,
        health: config.health + waveNum * 5,
        maxHealth: config.health + waveNum * 5,
        speed: config.speed,
        icon: config.icon,
        color: config.color,
        name: config.name,
        description: config.description,
      });
    }
    setEnemies(newEnemies);
    setWaveActive(true);
    setMessage(`⚠️ Волна ${waveNum}: ${count} угроз приближаются!`);
    setTimeout(() => setMessage(null), 3000);
  }, []);


  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {

      setEnemies((prev) => {
        const moved = prev.map((e) => ({ ...e, col: e.col - e.speed * 0.1 }));

        if (moved.some((e) => e.col <= 0)) {
          setGameState('lost');
          onLose?.();
        }
        return moved;
      });


      setDefenses((defs) => {
        const newProjectiles: Projectile[] = [];
        defs.forEach((def) => {
          if (def.damage > 0) {
            const enemyInRow = enemies.some((e) => e.row === def.row && e.col > def.col);
            if (enemyInRow && Math.random() < 0.6) {
              newProjectiles.push({
                id: `proj-${def.id}-${Date.now()}`,
                row: def.row,
                col: def.col + 0.5,
                damage: def.damage,
                icon: def.type === 'antivirus' ? '🔍' : def.type === '2fa' ? '🔑' : '⚡',
                color: def.color,
              });
            }
          }
        });
        if (newProjectiles.length > 0) {
          setProjectiles((prev) => [...prev, ...newProjectiles]);
        }
        return defs;
      });


      setProjectiles((prev) => {
        const moved = prev.map((p) => ({ ...p, col: p.col + 0.5 }));
        const remaining: Projectile[] = [];

        moved.forEach((proj) => {
          let hit = false;
          setEnemies((prevEnemies) => {
            return prevEnemies.map((enemy) => {
              if (enemy.row === proj.row && Math.abs(enemy.col - proj.col) < 0.5 && !hit) {
                hit = true;
                const newHealth = enemy.health - proj.damage;
                if (newHealth <= 0) {
                  setScore((s) => s + 10);
                  setResources((r) => ({ ...r, energy: Math.min(r.energy + 20, r.maxEnergy) }));
                }
                return { ...enemy, health: newHealth };
              }
              return enemy;
            }).filter((e) => e.health > 0);
          });
          if (!hit && proj.col < COLS + 1) {
            remaining.push(proj);
          }
        });

        return remaining;
      });


      setEnemies((currentEnemies) => {
        if (currentEnemies.length === 0 && gameState === 'playing' && waveActive) {
          if (wave >= 5) {
            setGameState('won');
            onWin?.();
          } else {
            setWaveActive(false);
            setWave((w) => w + 1);
            setTimeout(() => spawnEnemies(wave + 1), 2000);
          }
        }
        return currentEnemies;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, enemies, wave, spawnEnemies, onWin, onLose]);

  const startGame = () => {
    setGameState('playing');
    setDefenses([]);
    setEnemies([]);
    setProjectiles([]);
    setResources({ energy: 200, maxEnergy: 500, energyPerTick: 15 });
    setWave(1);
    setScore(0);
    setGameTick(0);
    setWaveActive(false);
    setTimeout(() => spawnEnemies(1), 2000);
    onAction('game_start');
  };

  const placeDefense = (row: number, col: number) => {
    if (!selectedDefense) return;
    const config = DEFENSE_UNITS[selectedDefense];
    if (resources.energy < config.cost) {
      setMessage('❌ Недостаточно энергии!');
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    if (defenses.some((d) => d.row === row && d.col === col)) return;

    const newDefense: DefenseUnit = {
      id: `def-${row}-${col}-${Date.now()}`,
      type: selectedDefense,
      row,
      col,
      health: config.health,
      maxHealth: config.health,
      damage: config.damage,
      icon: config.icon,
      color: config.color,
      name: config.name,
      description: config.description,
    };

    setDefenses([...defenses, newDefense]);
    setResources((prev) => ({ ...prev, energy: prev.energy - config.cost }));
    onAction('place_defense', { type: selectedDefense, row, col });
  };

  const getCellContent = (row: number, col: number) => {
    const defense = defenses.find((d) => d.row === row && d.col === col);
    const enemy = enemies.find((e) => e.row === row && Math.round(e.col) === col);
    const projectile = projectiles.find((p) => p.row === row && Math.round(p.col) === col);

    if (defense) {
      const healthPercent = (defense.health / defense.maxHealth) * 100;
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <span style={{ fontSize: 28 }}>{defense.icon}</span>
          <LinearProgress variant="determinate" value={healthPercent} sx={{ width: '80%', height: 3, mt: 0.5, borderRadius: 1, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: healthPercent > 50 ? '#4CAF50' : healthPercent > 25 ? '#FF9800' : '#F44336' } }} />
        </Box>
      );
    }
    if (enemy) {
      const healthPercent = (enemy.health / enemy.maxHealth) * 100;
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
          <span style={{ fontSize: 28, position: 'absolute', left: `${(enemy.col - col) * 100}%` }}>{enemy.icon}</span>
          <LinearProgress variant="determinate" value={healthPercent} sx={{ width: '80%', height: 3, mt: 0.5, borderRadius: 1, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: '#F44336' } }} />
        </Box>
      );
    }
    if (projectile) {
      return <span style={{ fontSize: 16, position: 'absolute', left: `${(projectile.col - col) * 100}%` }}>{projectile.icon}</span>;
    }
    return null;
  };


  if (gameState === 'menu') {
    return (
      <Paper sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', border: '1px solid #D0D0D0', bgcolor: '#1a1a2e', color: 'white' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Typography sx={{ fontSize: 48, mb: 2 }}>🛡️</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '2rem', mb: 1, textAlign: 'center', background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CyberDefense
          </Typography>
          <Typography sx={{ color: '#888', mb: 3, textAlign: 'center', fontSize: '0.9rem' }}>
            Защити систему от хакеров и вредоносного ПО!
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3, width: '100%', maxWidth: 360 }}>
            {Object.entries(DEFENSE_UNITS).map(([key, unit]) => (
              <Paper key={key} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#16213e', border: `1px solid ${unit.color}33` }}>
                <span style={{ fontSize: 24 }}>{unit.icon}</span>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mt: 0.5 }}>{unit.name}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>{unit.description}</Typography>
                <Chip label={`${unit.cost}⚡`} size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', bgcolor: '#0f3460', color: '#FFD700' }} />
              </Paper>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="contained" onClick={startGame} startIcon={<PlayIcon />} sx={{ borderRadius: 2, px: 4, py: 1.5, bgcolor: '#3a7bd5', '&:hover': { bgcolor: '#2d5aa0' }, fontWeight: 600 }}>
              Играть
            </Button>
            <Button variant="outlined" onClick={() => setShowHelp(true)} sx={{ borderRadius: 2, color: '#888', borderColor: '#333' }}>
              Помощь
            </Button>
          </Box>
        </Box>

        <Dialog open={showHelp} onClose={() => setShowHelp(false)} PaperProps={{ sx: { borderRadius: 2, bgcolor: '#16213e', color: 'white' } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>🛡️ Как играть</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
              <Typography sx={{ fontSize: '0.9rem' }}>1. Выбери средство защиты снизу</Typography>
              <Typography sx={{ fontSize: '0.9rem' }}>2. Кликни на клетку поля, чтобы установить</Typography>
              <Typography sx={{ fontSize: '0.9rem' }}>3. Средства защиты автоматически стреляют по угрозам</Typography>
              <Typography sx={{ fontSize: '0.9rem' }}>4. Не дай угрозам дойти до левого края!</Typography>
              <Typography sx={{ fontSize: '0.9rem' }}>5. Выживи 5 волн атак</Typography>
              <Box sx={{ mt: 1, p: 1.5, bgcolor: '#0f3460', borderRadius: 1.5 }}>
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Враги:</Typography>
                {Object.entries(ENEMY_TYPES).map(([key, enemy]) => (
                  <Typography key={key} sx={{ fontSize: '0.8rem' }}>{enemy.icon} {enemy.name} — {enemy.description}</Typography>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHelp(false)} sx={{ color: '#3a7bd5' }}>Понятно!</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }


  if (gameState === 'won' || gameState === 'lost') {
    return (
      <Paper sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', border: '1px solid #D0D0D0', bgcolor: '#1a1a2e', color: 'white' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Typography sx={{ fontSize: 64, mb: 2 }}>{gameState === 'won' ? '🏆' : '💀'}</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '2rem', mb: 1, color: gameState === 'won' ? '#4CAF50' : '#F44336' }}>
            {gameState === 'won' ? 'Победа!' : 'Поражение!'}
          </Typography>
          <Typography sx={{ color: '#888', mb: 1 }}>
            {gameState === 'won' ? 'Система защищена! Все угрозы устранены.' : 'Хакеры проникли в систему!'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mb: 3, mt: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.5rem' }}>{score}</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Очки</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.5rem' }}>{wave}</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Волн</Typography>
            </Box>
          </Box>
          <Button variant="contained" onClick={startGame} startIcon={<ReloadIcon />} sx={{ borderRadius: 2, px: 4, py: 1.5, bgcolor: '#3a7bd5', fontWeight: 600 }}>
            Играть снова
          </Button>
        </Box>
      </Paper>
    );
  }


  return (
    <Paper sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', border: '1px solid #D0D0D0', bgcolor: '#1a1a2e', color: 'white' }}>
      {}
      <Box sx={{ bgcolor: '#16213e', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #0f3460' }}>
        <Chip label={`⚡ ${resources.energy}`} sx={{ bgcolor: '#0f3460', color: '#FFD700', fontWeight: 600 }} />
        <Chip label={`🌊 Волна ${wave}/5`} sx={{ bgcolor: '#0f3460', color: '#00d2ff', fontWeight: 600 }} />
        <Chip label={`⭐ ${score}`} sx={{ bgcolor: '#0f3460', color: '#4CAF50', fontWeight: 600 }} />
        <Box sx={{ flex: 1 }} />
        <Button size="small" onClick={() => { setGameState('menu'); }} sx={{ color: '#888' }}>Меню</Button>
      </Box>

      {}
      {message && (
        <Box sx={{ px: 2, py: 0.5 }}>
          <Alert severity={message.includes('❌') ? 'error' : 'warning'} sx={{ borderRadius: 1, fontSize: '0.8rem' }}>
            <Typography sx={{ fontSize: '0.75rem' }}>{message}</Typography>
          </Alert>
        </Box>
      )}

      {}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 1, py: 0.5 }}>
        {Array.from({ length: ROWS }).map((_, row) => (
          <Box key={row} sx={{ display: 'flex', height: '20%', gap: 0.5, mb: 0.5 }}>
            {Array.from({ length: COLS }).map((_, col) => {
              const hasDefense = defenses.some((d) => d.row === row && d.col === col);
              return (
                <Box
                  key={col}
                  onClick={() => placeDefense(row, col)}
                  sx={{
                    flex: 1,
                    bgcolor: hasDefense ? '#0f3460' : (row + col) % 2 === 0 ? '#16213e' : '#1a1a2e',
                    border: selectedDefense && !hasDefense ? '1px solid #3a7bd5' : '1px solid #0f3460',
                    borderRadius: 1,
                    cursor: selectedDefense && !hasDefense ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': selectedDefense && !hasDefense ? { bgcolor: '#0f3460' } : {},
                  }}
                >
                  {getCellContent(row, col)}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {}
      <Box sx={{ bgcolor: '#16213e', px: 2, py: 1.5, borderTop: '1px solid #0f3460' }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#888', mb: 1 }}>Выбери средство защиты:</Typography>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
          {Object.entries(DEFENSE_UNITS).map(([key, unit]) => {
            const canAfford = resources.energy >= unit.cost;
            const isSelected = selectedDefense === key;
            return (
              <Paper
                key={key}
                onClick={() => canAfford && setSelectedDefense(key as DefenseType)}
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  minWidth: 80,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  bgcolor: isSelected ? '#0f3460' : '#1a1a2e',
                  border: `2px solid ${isSelected ? unit.color : canAfford ? '#333' : '#222'}`,
                  opacity: canAfford ? 1 : 0.5,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 22 }}>{unit.icon}</span>
                <Typography sx={{ fontWeight: 600, fontSize: '0.7rem', mt: 0.5 }}>{unit.name}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#FFD700' }}>{unit.cost}⚡</Typography>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}
