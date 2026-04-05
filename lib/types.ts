

import type { Email } from '../components/simulators/MailClient';
import type { ChatContact, ChatMessage } from '../components/simulators/Messenger';
import type { PhoneSetting } from '../components/simulators/PhoneSettings';

export interface User {
  id: string;
  username: string;
  email: string;
  league: League;
  role: UserRole;
  totalScore: number;
  createdAt: string;
}

export type UserRole = 'user' | 'admin';

export type League = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface AuthCredentials {
  username: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type AttackType =
  | 'phishing'
  | 'skimming'
  | 'brute_force'
  | 'social_engineering'
  | 'deepfake'
  | 'malware'
  | 'man_in_the_middle';

export type ScenarioLocation = 'office' | 'home' | 'public_wifi';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  location: ScenarioLocation;
  difficulty: number;
  attackType: AttackType;
  narrative: string[];
  steps: ScenarioStep[];
  cweReference?: string;
  owaspReference?: string;
}

export interface ScenarioStep {
  id: string;
  narrative: string;
  attackContext?: string;
  actions: Action[];
  correctActionId: string;
  consequenceOnFail: string;
  consequenceOnSuccess: string;
  simulatorData?: {
    emails?: Email[];
    selectedEmailId?: string;
    contacts?: ChatContact[];
    messages?: ChatMessage[];
    selectedContactId?: string;
    settings?: Array<{ id: string; icon: string; title: string; description: string; type: 'toggle' | 'slider' | 'button' | 'info'; value?: boolean | number; isDangerous?: boolean; warning?: string }>;
    connectedWifi?: { name: string; isSecure: boolean };
  };
}

export interface ImportedScenario {
  id: string;
  title: string;
  description: string;
  location: string;
  attackType: string;
  difficulty: number;
  steps: any;
}

export interface Action {
  id: string;
  text: string;
  hint?: string;
}

export interface UserProgress {
  userId: string;
  completedScenarios: CompletedScenario[];
  totalScore: number;
  league: League;
  securityLevel: number;
  streak: number;
  statistics: UserStatistics;
}

export interface CompletedScenario {
  scenarioId: string;
  completedAt: string;
  score: number;
  mistakes: number;
  timeSpentSeconds: number;
}

export interface UserStatistics {
  totalScenariosCompleted: number;
  totalMistakes: number;
  successRate: number;
  attackTypeStats: Record<AttackType, AttackTypeStat>;
  weeklyActivity: WeeklyActivity[];
}

export interface AttackTypeStat {
  encountered: number;
  successfullyDefended: number;
}

export interface WeeklyActivity {
  week: string;
  scenariosCompleted: number;
  averageScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  league: League;
  totalScore: number;
  scenariosCompleted: number;
}

export interface Certificate {
  id: string;
  userId: string;
  issuedAt: string;
  league: League;
  finalScore: number;
  qrCodeUrl: string;
}

export interface WsEvent {
  type: 'scenario_update' | 'leaderboard_update' | 'achievement_unlocked';
  payload: unknown;
}

export interface ActionCardProps {
  actions: Action[];
  onSelect: (actionId: string) => void;
  disabled?: boolean;
  selectedId?: string | null;
  isCorrect?: boolean | null;
}

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

export interface ScenarioViewProps {
  scenario: Scenario;
  currentStep: number;
  onActionSelect: (actionId: string) => void;
  onContinue: () => void;
  showResult: boolean;
  isCorrect: boolean | null;
  consequence: string;
  securityLevel: number;
}
