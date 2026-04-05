

export type TaskType = 'findOnScreen' | 'orderSteps' | 'matchPairs' | 'textInput' | 'multiSelect';

export interface InteractiveTask {
  id: string;
  type: TaskType;

  context: string;

  instruction: string;

  hint: string;

  consequence: string;

  data: TaskData;
}

export type TaskData =
  | FindOnScreenData
  | OrderStepsData
  | MatchPairsData
  | TextInputData
  | MultiSelectData;

export interface FindOnScreenData {
  type: 'findOnScreen';

  screenDescription: string;

  elements: ScreenElement[];

  targetElementIds: string[];

  minFound: number;
}

export interface ScreenElement {
  id: string;
  label: string;
  description: string;
  isTarget: boolean;
  explanation: string;
}

export interface OrderStepsData {
  type: 'orderSteps';

  correctOrder: string[];

  shuffledSteps: OrderStep[];
}

export interface OrderStep {
  id: string;
  text: string;
}

export interface MatchPairsData {
  type: 'matchPairs';

  leftItems: MatchItem[];

  rightItems: MatchItem[];

  correctPairs: Record<string, string>;
}

export interface MatchItem {
  id: string;
  text: string;
}

export interface TextInputData {
  type: 'textInput';
  placeholder?: string;

  correctAnswers: string[];

  exampleAnswer?: string;

  inputType?: 'text' | 'url' | 'password' | 'email';
}

export interface MultiSelectData {
  type: 'multiSelect';
  options: MultiSelectOption[];

  correctOptionIds: string[];

  minCorrect: number;
}

export interface MultiSelectOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface TaskSession {
  taskId: string;
  status: 'answering' | 'checking' | 'wrong' | 'correct';
  mistakes: number;
  hintShown: boolean;

  findOnScreen?: FindOnScreenSession;
  orderSteps?: OrderStepsSession;
  matchPairs?: MatchPairsSession;
  textInput?: TextInputSession;
  multiSelect?: MultiSelectSession;
}

export interface FindOnScreenSession {
  foundElementIds: string[];
}

export interface OrderStepsSession {
  currentOrder: string[];
}

export interface MatchPairsSession {
  selectedLeft: string | null;
  matchedPairs: Record<string, string>;
}

export interface TextInputSession {
  value: string;
}

export interface MultiSelectSession {
  selectedOptionIds: string[];
}
