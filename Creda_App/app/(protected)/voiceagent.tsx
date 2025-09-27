import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, Alert, ScrollView, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
// @ts-ignore - react-native-voice-to-text doesn't have proper TypeScript declarations
import { startSpeechToText } from 'react-native-voice-to-text';
import { Gradient } from "~/components/Gradient";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useMonthlySpend, useBillsDueCount, usePortfolioSummary, useTransactions, useBills, useGoals, useBudgets, useHoldingsWithAssets } from '~/hooks/queries';
import { P, Small, Title, H4 } from '~/components/ui/typography';
import { ArrowLeft, Mic, MicOff, BarChart3, MessageCircle, Zap, TrendingUp, Calendar, Target } from 'lucide-react-native';

// Replace with your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyA-R-6JmaswaPzCKet-wK03AZupQFbYYBA';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface IntentResponse {
  intent: 'navigation' | 'analysis' | 'general';
  screen?: string;
  analysisType?: string;
  response: string;
}

// Navigation mapping for tab screens
const NAVIGATION_MAP = {
  'home': '/(protected)/(drawer)/(tabs)',
  'dashboard': '/(protected)/(drawer)/(tabs)',
  'portfolio': '/(protected)/(drawer)/(tabs)/investments',
  'investments': '/(protected)/(drawer)/(tabs)/investments',
  'expenses': '/(protected)/(drawer)/(tabs)/expenses',
  'bills': '/(protected)/(drawer)/(tabs)/bills',
  'transactions': '/(protected)/(drawer)/(tabs)/expenses',
  'budgets': '/(protected)/(drawer)/(tabs)/expenses',
  'goals': '/(protected)/(drawer)/(tabs)',
} as const;

interface TypingIndicatorProps {
  visible: boolean;
}

const TypingIndicator = ({ visible }: TypingIndicatorProps) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]).start(() => {
          if (visible) animateDots();
        });
      };
      animateDots();
    }
  }, [visible, dot1, dot2, dot3]);

  if (!visible) return null;

  return (
    <View className="flex-row justify-start mb-4">
      <View className="bg-card border border-border rounded-2xl rounded-bl-sm py-3 px-4 ml-12 shadow-sm">
        <View className="flex-row items-center">
          <Animated.View
            style={{ opacity: dot1 }}
            className="w-2 h-2 bg-muted-foreground rounded-full mx-0.5"
          />
          <Animated.View
            style={{ opacity: dot2 }}
            className="w-2 h-2 bg-muted-foreground rounded-full mx-0.5"
          />
          <Animated.View
            style={{ opacity: dot3 }}
            className="w-2 h-2 bg-muted-foreground rounded-full mx-0.5"
          />
        </View>
      </View>
      <View className="w-8 h-8 bg-primary rounded-full items-center justify-center absolute left-0 bottom-0 shadow-sm">
        <MessageCircle size={16} color="white" />
      </View>
    </View>
  );
};

export default function AgentScreen() {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGeminiTyping, setIsGeminiTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Data hooks for analysis
  const { data: spend = 0 } = useMonthlySpend();
  const { data: billsDue = 0 } = useBillsDueCount();
  const { data: summary } = usePortfolioSummary();
  const { data: transactions = [] } = useTransactions();
  const { data: bills = [] } = useBills();
  const { data: goals = [] } = useGoals();
  const { data: budgets = [] } = useBudgets();
  const { data: holdings = [] } = useHoldingsWithAssets();

  // System prompt for intent classification
  const SYSTEM_PROMPT = `You are a financial voice assistant. Analyze user input and respond with JSON in this exact format:
{
  "intent": "navigation" | "analysis" | "general",
  "screen": "screen_name" (only if intent is navigation),
  "analysisType": "type" (only if intent is analysis),
  "response": "Your response text"
}

NAVIGATION INTENT: User wants to navigate to a screen. Map these keywords to screens:
- "home", "dashboard", "main" → "home"
- "portfolio", "investments", "stocks", "mutual funds" → "portfolio"
- "expenses", "transactions", "spending", "budgets" → "expenses"
- "bills", "payments", "due" → "bills"

ANALYSIS INTENT: User wants financial analysis. Types include:
- "spending", "expenses", "budget" → "spending"
- "portfolio", "investments", "returns" → "portfolio"
- "bills", "payments" → "bills"
- "goals", "savings" → "goals"
- "overview", "summary" → "overview"

GENERAL INTENT: General conversation or questions not related to navigation or analysis.

Always respond with valid JSON.
`;

  // Initialize conversation
  useEffect(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "Hello! I'm your AI financial assistant. I can help you navigate the app or analyze your financial data. Try saying 'Show me my portfolio' or 'Analyze my spending'.",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Data fetching functions for analysis
  const getFinancialData = (analysisType: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTransactions = transactions.filter((tx: any) =>
      tx.type === 'expense' && tx.date.startsWith(currentMonth)
    );

    switch (analysisType) {
      case 'spending':
        return {
          monthlySpend: spend,
          transactions: monthlyTransactions,
          budgets: budgets,
          categorySpending: calculateCategorySpending(monthlyTransactions, budgets)
        };
      case 'portfolio':
        return {
          summary: summary,
          holdings: holdings,
          totalValue: summary?.value || 0,
          totalInvested: summary?.invested || 0,
          pnl: summary?.pnl || 0,
          pct: summary?.pct || 0
        };
      case 'bills':
        return {
          totalBills: bills.length,
          pendingBills: bills.filter((b: any) => b.status === 'pending'),
          overdueBills: bills.filter((b: any) => b.status === 'overdue'),
          totalAmount: bills.reduce((sum: number, b: any) => sum + b.amount, 0)
        };
      case 'goals':
        return {
          goals: goals,
          activeGoals: goals.filter((g: any) => g.status === 'active'),
          completedGoals: goals.filter((g: any) => g.status === 'completed')
        };
      case 'overview':
        return {
          monthlySpend: spend,
          portfolioValue: summary?.value || 0,
          pendingBills: billsDue,
          activeGoals: goals.filter((g: any) => g.status === 'active').length,
          recentTransactions: transactions.slice(-5)
        };
      default:
        return {};
    }
  };

  const calculateCategorySpending = (transactions: any[], budgets: any[]) => {
    const categorySpending = new Map();
    transactions.forEach((tx: any) => {
      const category = tx.category_id ? `Category ${tx.category_id}` : 'Other';
      categorySpending.set(category, (categorySpending.get(category) || 0) + Math.abs(Number(tx.amount)));
    });
    return Object.fromEntries(categorySpending);
  };

  // Send message to Gemini with intent classification
  const sendToGemini = async (text: string) => {
    try {
      setIsGeminiTyping(true);

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      // First, get intent classification
      const intentPrompt = `${SYSTEM_PROMPT}\n\nUser input: "${text}"`;
      const intentResult = await model.generateContent(intentPrompt);
      const intentResponse = await intentResult.response;
      const intentText = intentResponse.text();

      let intentData: IntentResponse;
      try {
        // Try to parse JSON response
        const jsonMatch = intentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          intentData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse intent JSON:', parseError);
        // Fallback to general response
        intentData = {
          intent: 'general',
          response: intentText
        };
      }

      // Handle based on intent
      if (intentData.intent === 'navigation' && intentData.screen) {
        // Navigate to the specified screen
        const screenPath = NAVIGATION_MAP[intentData.screen as keyof typeof NAVIGATION_MAP];
        if (screenPath) {
          router.push(screenPath);
          const navMessage: Message = {
            id: Date.now().toString(),
            text: `Navigating to ${intentData.screen}...`,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, navMessage]);
          Speech.speak(`Navigating to ${intentData.screen}`, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.8
          });
          return;
        }
      } else if (intentData.intent === 'analysis' && intentData.analysisType) {
        // Get financial data and send to Gemini for analysis
        const financialData = getFinancialData(intentData.analysisType);
        const analysisPrompt = `Analyze this financial data and provide insights in a conversational tone:

Data: ${JSON.stringify(financialData, null, 2)}

Analysis Type: ${intentData.analysisType}

Provide actionable insights and recommendations based on the data in short  bullet points without markdown. user is based in india.`;

        const analysisResult = await model.generateContent(analysisPrompt);
        const analysisResponse = await analysisResult.response;
        const analysisText = analysisResponse.text();

        const analysisMessage: Message = {
          id: Date.now().toString(),
          text: analysisText,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, analysisMessage]);

        Speech.speak(analysisText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.8
        });
        return;
      }

      // Default general response
      const geminiMessage: Message = {
        id: Date.now().toString(),
        text: intentData.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, geminiMessage]);

      // Optional: Speak the response
      Speech.speak(intentData.response, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8
      });

    } catch (error) {
      console.error('Error with Gemini:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGeminiTyping(false);
    }
  };

  // Start speech recognition
  const startListening = async () => {
    try {
      setIsListening(true);
      const audioText = await startSpeechToText();
      console.log('Speech recognition result:', audioText);

      setIsListening(false);

      if (audioText && audioText.trim()) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          text: audioText,
          isUser: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Send to Gemini
        await sendToGemini(audioText);
      }
    } catch (error) {
      console.error('Error with speech recognition:', error);
      setIsListening(false);
      Alert.alert('Error', 'Speech recognition failed. Please try again.');
    }
  };

  // Manual text input (for testing)
  const sendTestMessage = async () => {
    const testMessage = "Show me my portfolio analysis";
    const userMessage: Message = {
      id: Date.now().toString(),
      text: testMessage,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    await sendToGemini(testMessage);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}>
      <View className={`flex-row ${message.isUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[85%]`}>
        {!message.isUser && (
          <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3 shadow-sm">
            <MessageCircle size={16} color="white" />
          </View>
        )}
        <View className={`${message.isUser ? 'bg-primary' : 'bg-card border border-border'} ${message.isUser ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'
          } px-4 py-3 shadow-sm`}>
          <P className={`${message.isUser ? 'text-primary-foreground' : 'text-foreground'} leading-relaxed`}>
            {message.text}
          </P>
          <Small className={`${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
            } mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </Small>
        </View>
        {message.isUser && (
          <View className="w-8 h-8 bg-muted rounded-full items-center justify-center ml-3">
            <Small className="text-muted-foreground font-medium">You</Small>
          </View>
        )}
      </View>
    </View>
  );

  const quickActions = [
    { icon: TrendingUp, label: "Portfolio", action: () => sendToGemini("Show me my portfolio analysis") },
    { icon: BarChart3, label: "Spending", action: () => sendToGemini("Analyze my spending") },
    { icon: Calendar, label: "Bills", action: () => sendToGemini("Check my upcoming bills") },
    { icon: Target, label: "Goals", action: () => sendToGemini("Show my financial goals") }
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Gradient key={`${isGeminiTyping}`} position="top" isSpeaking={isListening} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border/20">
        <View className="flex-1 mx-4">
          <H4 className="text-start">AI Assistant</H4>
        </View>

        <View className="flex-row items-center">
          <View className={`w-2 h-2 rounded-full mr-2 ${isListening ? 'bg-destructive' : isGeminiTyping ? 'bg-warning' : 'bg-success'
            }`} />
          <Small className="text-muted-foreground text-xs">
            {isListening ? 'REC' : isGeminiTyping ? 'AI' : 'READY'}
          </Small>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        <TypingIndicator visible={isGeminiTyping} />
      </ScrollView>

      {/* Quick Actions */}
      <View className="px-4 py-3 bg-card/30 backdrop-blur border-t border-border/20">
        <Small className="text-muted-foreground mb-3">Quick Actions:</Small>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row space-x-3">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.action}
                className="bg-muted/50 mr-2 rounded-full px-4 py-2 flex-row items-center border border-border/30"
              >
                <Small className="text-muted-foreground">{action.label}</Small>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Voice Input Controls */}
      <View className="px-4 pb-6 pt-3 bg-background border-t border-border/20">
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity
            onPress={isListening ? undefined : startListening}
            className={`flex-1 h-14 rounded-2xl ${isListening ? 'bg-destructive' : 'bg-primary'
              } flex-row items-center justify-center space-x-3 shadow-lg`}
            activeOpacity={0.8}
            disabled={isListening}
          >
            {isListening ? (
              <MicOff size={24} color="white" />
            ) : (
              <Mic size={24} color="white" />
            )}
            <P className="text-primary-foreground font-medium">
              {isListening ? 'Listening...' : 'Tap to speak'}
            </P>
          </TouchableOpacity>
        </View>

        <View className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <View className="flex-row items-center mb-1">
            <Zap size={16} className="text-amber-600 mr-2" />
            <Small className="text-amber-800 font-medium">Try saying:</Small>
          </View>
          <Small className="text-amber-700 leading-relaxed">
            "Show me my portfolio" • "Analyze spending" • "Check bills" • "Go to investments"
          </Small>
        </View>
      </View>
    </SafeAreaView>
  );
}

