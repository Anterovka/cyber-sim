

export interface QuizScenario {
  id: string;
  title: string;
  description: string;
  location: ScenarioLocation;
  difficulty: number;
  attackType: AttackType;

  intro: string;

  steps: QuizStep[];
  cweReference?: string;
  owaspReference?: string;
}

export interface QuizStep {
  id: string;

  context: string;

  question: string;

  options: QuizOption[];

  hint: string;

  consequence: string;

  simulatorData?: SimulatorData;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;

  explanation?: string;
}

export type ScenarioLocation = 'office' | 'home' | 'public_wifi';
export type AttackType =
  | 'phishing'
  | 'skimming'
  | 'brute_force'
  | 'social_engineering'
  | 'deepfake'
  | 'malware'
  | 'man_in_the_middle';

export interface QuizSession {
  scenarioId: string;
  currentStepIndex: number;

  mistakesOnCurrentStep: number;

  hintShown: boolean;

  totalMistakes: number;

  stepStatus: 'answering' | 'wrong' | 'correct';

  selectedOptionId: string | null;

  isComplete: boolean;
}

export interface SimulatorData {
  type: 'mail' | 'messenger' | 'phone' | 'atm' | 'public_pc' | 'call' | 'mobile_banking' | 'browser' | 'social_media' | 'file_explorer' | 'otp_generator' | 'cyber_defense';

  emails?: any[];
  contacts?: any[];
  messages?: any[];
  settings?: any[];
  connectedWifi?: { name: string; isSecure: boolean };
  selectedId?: string;

  accounts?: any[];
  transactions?: any[];
  tabs?: any[];
  history?: any[];
  posts?: any[];
  stories?: any[];
  socialMessages?: any[];
  fileSystem?: any[];
  otpAccounts?: any[];
}
