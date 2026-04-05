import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProgress, League, AttackType } from './types';
import * as api from './api';
import { getScenarioById } from './scenarios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login({ username, password });
          localStorage.setItem('auth_token', response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Ошибка входа',
            isLoading: false,
          });
        }
      },

      register: async (username: string, password: string, email?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.register({ username, password, email });
          localStorage.setItem('auth_token', response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Ошибка регистрации',
            isLoading: false,
          });
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface ProgressState {
  progress: UserProgress | null;
  isLoading: boolean;

  loadProgress: () => Promise<void>;
  submitScenarioResult: (
    scenarioId: string,
    result: { score: number; mistakes: number; timeSpentSeconds: number }
  ) => Promise<void>;
  updateSecurityLevel: (delta: number) => void;
}

export const useProgressStore = create<ProgressState>()((set, get) => ({
  progress: null,
  isLoading: false,

  loadProgress: async () => {
    set({ isLoading: true });
    try {
      const progress = await api.getUserProgress();
      set({ progress, isLoading: false });
    } catch {

      set({ isLoading: false });
    }
  },

  submitScenarioResult: async (scenarioId, result) => {
    const current = get().progress;
    if (!current) return;


    const scenario = getScenarioById(scenarioId);
    const attackType = scenario?.attackType as AttackType;


    const currentAttackStat = current.statistics.attackTypeStats[attackType] || { encountered: 0, successfullyDefended: 0 };
    const updatedAttackStats = {
      ...current.statistics.attackTypeStats,
      [attackType]: {
        encountered: currentAttackStat.encountered + 1,
        successfullyDefended: currentAttackStat.successfullyDefended + (result.mistakes === 0 ? 1 : 0),
      },
    };

    const totalCompleted = current.statistics.totalScenariosCompleted + 1;
    const totalMistakes = current.statistics.totalMistakes + result.mistakes;
    const newTotalScore = current.totalScore + result.score;

    const getLeague = (score: number): League => {
      if (score >= 1000) return 'expert';
      if (score >= 500) return 'advanced';
      if (score >= 200) return 'intermediate';
      return 'beginner';
    };

    const updated: UserProgress = {
      ...current,
      totalScore: newTotalScore,
      league: getLeague(newTotalScore),
      securityLevel: Math.max(0, Math.min(100, current.securityLevel + (result.mistakes === 0 ? 5 : -10))),
      streak: result.mistakes === 0 ? current.streak + 1 : 0,
      completedScenarios: [
        ...current.completedScenarios,
        {
          scenarioId,
          completedAt: new Date().toISOString(),
          score: result.score,
          mistakes: result.mistakes,
          timeSpentSeconds: result.timeSpentSeconds,
        },
      ],
      statistics: {
        ...current.statistics,
        totalScenariosCompleted: totalCompleted,
        totalMistakes,
        successRate: totalCompleted > 0 ? ((totalCompleted - totalMistakes) / totalCompleted) * 100 : 0,
        attackTypeStats: updatedAttackStats,
      },
    };
    set({ progress: updated });


    try {
      await api.submitScenarioResult(scenarioId, result);

      await get().loadProgress();
    } catch {

    }
  },

  updateSecurityLevel: (delta: number) => {
    const current = get().progress;
    if (current) {
      set({
        progress: {
          ...current,
          securityLevel: Math.max(0, Math.min(100, current.securityLevel + delta)),
        },
      });
    }
  },
}));

interface ScenarioState {
  activeScenario: string | null;
  currentStep: number;
  showResult: boolean;
  isCorrect: boolean | null;
  consequence: string;
  mistakes: number;
  startTime: number | null;

  startScenario: (scenarioId: string) => void;
  selectAction: (isCorrect: boolean, consequence: string) => void;
  continueToNextStep: () => void;
  completeScenario: () => { score: number; mistakes: number; timeSpentSeconds: number };
  resetScenario: () => void;
}

export const useScenarioStore = create<ScenarioState>()((set, get) => ({
  activeScenario: null,
  currentStep: 0,
  showResult: false,
  isCorrect: null,
  consequence: '',
  mistakes: 0,
  startTime: null,

  startScenario: (scenarioId: string) => {
    set({
      activeScenario: scenarioId,
      currentStep: 0,
      showResult: false,
      isCorrect: null,
      consequence: '',
      mistakes: 0,
      startTime: Date.now(),
    });
  },

  selectAction: (isCorrect: boolean, consequence: string) => {
    set({
      showResult: true,
      isCorrect,
      consequence,
      mistakes: isCorrect ? get().mistakes : get().mistakes + 1,
    });
  },

  continueToNextStep: () => {
    set({
      showResult: false,
      isCorrect: null,
      consequence: '',
    });
  },

  completeScenario: () => {
    const state = get();
    const timeSpentSeconds = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    const score = Math.max(0, 100 - state.mistakes * 20);

    return {
      score,
      mistakes: state.mistakes,
      timeSpentSeconds,
    };
  },

  resetScenario: () => {
    set({
      activeScenario: null,
      currentStep: 0,
      showResult: false,
      isCorrect: null,
      consequence: '',
      mistakes: 0,
      startTime: null,
    });
  },
}));
