'use client';

import type { SimulatorData } from '../../lib/quizTypes';
import MailClient from '../simulators/MailClient';
import Messenger from '../simulators/Messenger';
import PhoneSettings from '../simulators/PhoneSettings';
import SMSSimulator from '../simulators/SMSSimulator';
import CallSimulator from '../simulators/CallSimulator';
import ATMSimulator from '../simulators/ATMSimulator';
import PublicPCSimulator from '../simulators/PublicPCSimulator';
import MobileBanking from '../simulators/MobileBanking';
import BrowserSimulator from '../simulators/BrowserSimulator';
import SocialMediaSimulator from '../simulators/SocialMediaSimulator';
import FileExplorerSimulator from '../simulators/FileExplorerSimulator';
import OTPGeneratorSimulator from '../simulators/OTPGeneratorSimulator';
import CyberDefenseGame from '../simulators/CyberDefenseGame';

interface SimulatorRendererProps {
  simulatorData: SimulatorData;
  onAction: (action: string, data?: any) => void;
  isDark: boolean;
}

export default function SimulatorRenderer({ simulatorData, onAction, isDark }: SimulatorRendererProps) {
  switch (simulatorData.type) {
    case 'mail':
      return (
        <MailClient
          emails={simulatorData.emails || []}
          selectedEmailId={simulatorData.selectedId || null}
          onSelectEmail={(id) => onAction('select_email', id)}
          onAction={onAction}
          showHeaders
        />
      );

    case 'messenger':
      return (
        <Messenger
          contacts={simulatorData.contacts || []}
          messages={simulatorData.messages || []}
          selectedContactId={simulatorData.selectedId || null}
          onSelectContact={(id) => onAction('select_contact', id)}
          onAction={onAction}
          showWarning
        />
      );

    case 'phone':
      return (
        <PhoneSettings
          settings={simulatorData.settings || []}
          onToggle={(id, value) => onAction('toggle_setting', { id, value })}
          onAction={onAction}
          connectedWifi={simulatorData.connectedWifi}
          showWarning
        />
      );

    case 'atm':
      return <ATMSimulator onAction={onAction} />;

    case 'public_pc':
      return <PublicPCSimulator onAction={onAction} />;

    case 'call':
      return (
        <CallSimulator
          callerName={simulatorData.messages?.[0]?.senderName || 'Неизвестный'}
          callerNumber={simulatorData.messages?.[0]?.senderId || '+7 (999) 123-45-67'}
          callerAvatar="?"
          script={simulatorData.messages?.map((m: any) => m.text) || ['Здравствуйте!']}
          onAction={onAction}
        />
      );

    case 'mobile_banking':
      return (
        <MobileBanking
          accounts={simulatorData.accounts || []}
          transactions={simulatorData.transactions || []}
          onAction={onAction}
          showSuspiciousWarnings
        />
      );

    case 'browser':
      return (
        <BrowserSimulator
          tabs={simulatorData.tabs || []}
          history={simulatorData.history || []}
          onAction={onAction}
          showSecurityWarnings
        />
      );

    case 'social_media':
      return (
        <SocialMediaSimulator
          posts={simulatorData.posts || []}
          stories={simulatorData.stories || []}
          messages={simulatorData.socialMessages || []}
          onAction={onAction}
          showWarnings
        />
      );

    case 'file_explorer':
      return (
        <FileExplorerSimulator
          fileSystem={simulatorData.fileSystem || []}
          onAction={onAction}
          showThreatWarnings
        />
      );

    case 'otp_generator':
      return (
        <OTPGeneratorSimulator
          accounts={simulatorData.otpAccounts || []}
          onAction={onAction}
          showSecurityWarnings
        />
      );

    case 'cyber_defense':
      return (
        <CyberDefenseGame
          onAction={onAction}
          onWin={() => onAction('game_win')}
          onLose={() => onAction('game_lose')}
        />
      );

    default:
      return null;
  }
}
