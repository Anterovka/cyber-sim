'use client';

import type { InteractiveTask, TaskSession } from '../../lib/interactiveTaskTypes';
import FindOnScreenTask from './FindOnScreenTask';
import OrderStepsTask from './OrderStepsTask';
import MatchPairsTask from './MatchPairsTask';
import TextInputTask from './TextInputTask';
import MultiSelectTask from './MultiSelectTask';

interface TaskRendererProps {
  task: InteractiveTask;
  session: TaskSession;
  isDark: boolean;
  onFindElementClick: (id: string) => void;
  onFindCheck: () => void;
  onFindReset: () => void;
  onOrderReorder: (order: string[]) => void;
  onOrderCheck: () => void;
  onOrderReset: () => void;
  onMatchSelectLeft: (id: string) => void;
  onMatchSelectRight: (id: string) => void;
  onMatchUnmatch: (leftId: string) => void;
  onMatchCheck: () => void;
  onMatchReset: () => void;
  onTextChange: (value: string) => void;
  onTextCheck: () => void;
  onTextReset: () => void;
  onMultiToggle: (id: string) => void;
  onMultiCheck: () => void;
  onMultiReset: () => void;
}

export default function TaskRenderer({ task, session, isDark, ...handlers }: TaskRendererProps) {
  switch (task.type) {
    case 'findOnScreen':
      return (
        <FindOnScreenTask
          data={task.data as any}
          session={session.findOnScreen!}
          isDark={isDark}
          status={session.status}
          onElementClick={handlers.onFindElementClick}
          onCheck={handlers.onFindCheck}
          onReset={handlers.onFindReset}
        />
      );
    case 'orderSteps':
      return (
        <OrderStepsTask
          data={task.data as any}
          session={session.orderSteps!}
          isDark={isDark}
          status={session.status}
          onReorder={handlers.onOrderReorder}
          onCheck={handlers.onOrderCheck}
          onReset={handlers.onOrderReset}
        />
      );
    case 'matchPairs':
      return (
        <MatchPairsTask
          data={task.data as any}
          session={session.matchPairs!}
          isDark={isDark}
          status={session.status}
          onSelectLeft={handlers.onMatchSelectLeft}
          onSelectRight={handlers.onMatchSelectRight}
          onUnmatch={handlers.onMatchUnmatch}
          onCheck={handlers.onMatchCheck}
          onReset={handlers.onMatchReset}
        />
      );
    case 'textInput':
      return (
        <TextInputTask
          data={task.data as any}
          session={session.textInput!}
          isDark={isDark}
          status={session.status}
          onChange={handlers.onTextChange}
          onCheck={handlers.onTextCheck}
          onReset={handlers.onTextReset}
        />
      );
    case 'multiSelect':
      return (
        <MultiSelectTask
          data={task.data as any}
          session={session.multiSelect!}
          isDark={isDark}
          status={session.status}
          onToggle={handlers.onMultiToggle}
          onCheck={handlers.onMultiCheck}
          onReset={handlers.onMultiReset}
        />
      );
    default:
      return null;
  }
}
