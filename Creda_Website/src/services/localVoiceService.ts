// Local voice service that doesn't depend on external APIs
import { VoiceUtils } from '@/utils/voiceUtils';

export interface LocalCommandResult {
  action: string;
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
}

export class LocalVoiceService {
  // Simple pattern-based command processing
  static processCommand(text: string): LocalCommandResult {
    const cleanText = VoiceUtils.cleanTranscript(text);
    
    // Navigation commands
    if (this.matchesPattern(cleanText, ['dashboard', 'home', 'main'])) {
      return {
        action: 'dashboard',
        intent: 'navigation',
        parameters: { page: 'dashboard' },
        confidence: 0.9
      };
    }
    
    if (this.matchesPattern(cleanText, ['portfolio', 'investments', 'stocks'])) {
      return {
        action: 'portfolio',
        intent: 'navigation',
        parameters: { page: 'portfolio' },
        confidence: 0.9
      };
    }
    
    if (this.matchesPattern(cleanText, ['budget', 'budgets', 'budgeting'])) {
      return {
        action: 'budget',
        intent: 'navigation',
        parameters: { page: 'budget' },
        confidence: 0.9
      };
    }
    
    if (this.matchesPattern(cleanText, ['voice', 'voice assistant', 'voice commands'])) {
      return {
        action: 'voice',
        intent: 'navigation',
        parameters: { page: 'voice' },
        confidence: 0.9
      };
    }
    
    if (this.matchesPattern(cleanText, ['settings', 'preferences', 'config'])) {
      return {
        action: 'settings',
        intent: 'navigation',
        parameters: { page: 'settings' },
        confidence: 0.9
      };
    }
    
    if (this.matchesPattern(cleanText, ['help', 'assistance', 'support'])) {
      return {
        action: 'help',
        intent: 'information',
        parameters: {},
        confidence: 0.8
      };
    }
    
    // Financial queries
    if (this.matchesPattern(cleanText, ['balance', 'money', 'account', 'total'])) {
      return {
        action: 'check_balance',
        intent: 'query',
        parameters: {},
        confidence: 0.7
      };
    }
    
    if (this.matchesPattern(cleanText, ['advice', 'recommend', 'suggest', 'should i'])) {
      return {
        action: 'get_advice',
        intent: 'query',
        parameters: { query: text },
        confidence: 0.7
      };
    }
    
    // Goals and planning
    if (this.matchesPattern(cleanText, ['goal', 'goals', 'target', 'plan'])) {
      return {
        action: 'goals',
        intent: 'navigation',
        parameters: { page: 'goals' },
        confidence: 0.8
      };
    }
    
    // Analytics and reports
    if (this.matchesPattern(cleanText, ['analytics', 'analysis', 'report', 'spending'])) {
      return {
        action: 'expense_analysis',
        intent: 'navigation',
        parameters: { page: 'expense-analytics' },
        confidence: 0.8
      };
    }
    
    // Health check
    if (this.matchesPattern(cleanText, ['health', 'financial health', 'score'])) {
      return {
        action: 'health',
        intent: 'navigation',
        parameters: { page: 'health' },
        confidence: 0.8
      };
    }
    
    // Default fallback
    return {
      action: 'unknown',
      intent: 'unknown',
      parameters: { original_text: text },
      confidence: 0.3
    };
  }
  
  // Check if text matches any of the patterns
  private static matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => 
      text.includes(pattern) || 
      VoiceUtils.fuzzyMatch(text, pattern, 0.7)
    );
  }
  
  // Generate response text for actions
  static generateResponse(result: LocalCommandResult): string {
    switch (result.action) {
      case 'dashboard':
        return 'Opening your dashboard with financial overview';
      case 'portfolio':
        return 'Showing your investment portfolio';
      case 'budget':
        return 'Opening budget management';
      case 'voice':
        return 'Opening voice assistant settings';
      case 'settings':
        return 'Opening application settings';
      case 'goals':
        return 'Showing your financial goals';
      case 'expense_analysis':
        return 'Opening expense analytics';
      case 'health':
        return 'Checking your financial health score';
      case 'help':
        return 'Available commands: dashboard, portfolio, budget, goals, settings, and more. Just say "Hey Creda" followed by your command.';
      case 'check_balance':
        return 'Your account balance information is available in the dashboard';
      case 'get_advice':
        return 'For personalized financial advice, please visit the advisory section or ask specific questions about investments, budgeting, or financial planning.';
      default:
        return `I heard "${result.parameters.original_text || 'your command'}" but I'm not sure what to do. Try saying "help" for available commands.`;
    }
  }
  
  // Get available command examples
  static getCommandExamples(): string[] {
    return [
      'Show my dashboard',
      'Open portfolio',
      'Check my budget',
      'Go to settings',
      'Show financial goals',
      'Open expense analytics',
      'Check financial health',
      'Get investment advice',
      'Help with commands'
    ];
  }
  
  // Format command for speech
  static formatCommandForSpeech(command: string): string {
    return `Say "Hey Creda, ${command.toLowerCase()}"`;
  }
}