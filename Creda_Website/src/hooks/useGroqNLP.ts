import { useState } from 'react';

interface GroqResponse {
  intent: string;
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  translation?: string;
}

export const useGroqNLP = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processCommand = async (text: string, language: string = 'english'): Promise<GroqResponse> => {
    setIsProcessing(true);
    
    try {
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!groqApiKey) {
        throw new Error('Groq API key not configured');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: `You are a financial assistant AI that parses voice commands for a finance platform called CREDA. 

IMPORTANT: Respond only with valid JSON in this exact format:
{
  "intent": "one of: portfolio, budget, expense_analysis, goals, health, dashboard, investment_advice, transaction, market_update, balance_check, savings_plan",
  "action": "specific action like show_portfolio, optimize_budget, add_expense, create_goal, etc.",
  "parameters": {"key": "value"},
  "confidence": 0.0-1.0,
  "translation": "english translation if input was not in english"
}

Common voice commands and their mappings:
- "show my portfolio" → {"intent": "portfolio", "action": "show_portfolio"}
- "optimize my budget" → {"intent": "budget", "action": "optimize_budget"}
- "add expense of 500 for food" → {"intent": "expense_analysis", "action": "add_expense", "parameters": {"amount": 500, "category": "food"}}
- "set retirement goal of 1 crore" → {"intent": "goals", "action": "create_goal", "parameters": {"type": "retirement", "amount": 10000000}}
- "check my financial health" → {"intent": "health", "action": "check_health"}
- "go to dashboard" → {"intent": "dashboard", "action": "navigate"}
- "invest in mutual funds" → {"intent": "investment_advice", "action": "suggest_investment", "parameters": {"type": "mutual_funds"}}

Handle Indian languages and financial terms. Extract amounts, categories, and time periods from commands.`
            },
            {
              role: 'user',
              content: `Parse this voice command: "${text}". Language: ${language}`
            }
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from Groq API');
      }

      // Parse JSON response
      const parsedResponse = JSON.parse(content);
      
      return {
        intent: parsedResponse.intent || 'unknown',
        action: parsedResponse.action || 'unknown',
        parameters: parsedResponse.parameters || {},
        confidence: parsedResponse.confidence || 0.8,
        translation: parsedResponse.translation
      };

    } catch (error) {
      console.error('Groq NLP processing error:', error);
      
      // Fallback to basic pattern matching
      return fallbackProcessing(text, language);
    } finally {
      setIsProcessing(false);
    }
  };

  return { processCommand, isProcessing };
};

// Fallback processing using pattern matching
const fallbackProcessing = (text: string, language: string): GroqResponse => {
  const lowerText = text.toLowerCase();
  
  // Basic pattern matching for common commands
  if (lowerText.includes('portfolio') || lowerText.includes('investment')) {
    return { intent: 'portfolio', action: 'show_portfolio', parameters: {}, confidence: 0.6 };
  }
  
  if (lowerText.includes('budget') || lowerText.includes('बजट')) {
    return { intent: 'budget', action: 'show_budget', parameters: {}, confidence: 0.6 };
  }
  
  if (lowerText.includes('expense') || lowerText.includes('खर्च')) {
    return { intent: 'expense_analysis', action: 'show_expenses', parameters: {}, confidence: 0.6 };
  }
  
  if (lowerText.includes('goal') || lowerText.includes('लक्ष्य')) {
    return { intent: 'goals', action: 'show_goals', parameters: {}, confidence: 0.6 };
  }
  
  if (lowerText.includes('health') || lowerText.includes('स्वास्थ्य')) {
    return { intent: 'health', action: 'check_health', parameters: {}, confidence: 0.6 };
  }
  
  if (lowerText.includes('dashboard') || lowerText.includes('डैशबोर्ड')) {
    return { intent: 'dashboard', action: 'navigate', parameters: {}, confidence: 0.6 };
  }
  
  return { 
    intent: 'unknown', 
    action: 'clarify', 
    parameters: { original_text: text }, 
    confidence: 0.3 
  };
};