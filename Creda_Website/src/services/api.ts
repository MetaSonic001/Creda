import axios from 'axios';

// API Base URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://704fb8c1a359.ngrok-free.app';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface UserProfile {
  age: number;
  income: number;
  savings: number;
  dependents: number;
  risk_tolerance: number;
  goal_type?: string;
  time_horizon?: number;
}

export interface PortfolioAllocation {
  persona: string;
  allocation: Record<string, number>;
  allocation_amounts?: Record<string, number>;
  expected_return: number;
  risk_score: number;
}

export interface BudgetOptimization {
  adaptive_allocation: {
    needs: number;
    wants: number;
    savings: number;
  };
  bandit_state: {
    epsilon: number;
    learning_rate: number;
    total_rounds: number;
  };
  recommendations: string[];
  confidence_score: number;
}

export interface VoiceResponse {
  success: boolean;
  transcription?: string;
  translation?: string;
  intent?: string;
  response?: string;
  audio_available?: boolean;
  processing_time?: number;
}

export interface RAGResponse {
  success: boolean;
  data?: {
    answer: string;
    relevant_documents: Array<{
      content: string;
      source: string;
      relevance_score: number;
    }>;
    confidence_score: number;
  };
}

// Voice Commands Mapping - Enhanced for Indian Languages
export const VOICE_COMMANDS = {
  // Navigation Commands
  'dashboard': [
    'dashboard', 'home', 'main', 'overview', 
    'डैशबोर्ड', 'होम', 'मुख्य', 'अवलोकन',
    'கணக்குப் பலகை', 'வீடு', 'முதன்மை',
    'ড্যাশবোর্ড', 'বাড়ি', 'প্রধান',
    'डॅशबोर्ड', 'घर', 'मुख्य',
    'ડેશબોર્ડ', 'ઘર', 'મુખ્ય',
    'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ಮನೆ', 'ಮುಖ್ಯ',
    'ഡാഷ്‌ബോർഡ്', 'വീട്', 'പ്രധാന',
    'ਡੈਸ਼ਬੋਰਡ', 'ਘਰ', 'ਮੁੱਖ',
    'డ్యాష్‌బోర్డ్', 'ఇల్లు', 'ప్రధాన'
  ],
  'portfolio': [
    'portfolio', 'investments', 'assets', 'holdings', 
    'पोर्टफोलियो', 'निवेश', 'संपत्ति', 'होल्डिंग्स',
    'முதலீட்டு விவரங்கள்', 'முதலீடுகள்', 'சொத்துக்கள்',
    'পোর্টফোলিও', 'বিনিয়োগ', 'সম্পদ',
    'पोर्टफोलिओ', 'गुंतवणूक', 'मालमत्ता',
    'પોર્ટફોલિયો', 'રોકાણ', 'સંપત્તિ',
    'ಪೋರ್ಟ್‌ಫೋಲಿಯೋ', 'ಹೂಡಿಕೆಗಳು', 'ಆಸ್ತಿಗಳು',
    'പോർട്ട്‌ഫോളിയോ', 'നിക്ഷേപങ്ങൾ', 'ആസ്തികൾ',
    'ਪੋਰਟਫੋਲੀਓ', 'ਨਿਵੇਸ਼', 'ਸੰਪਤੀਆਂ',
    'పోర్ట్‌ఫోలియో', 'పెట్టుబడులు', 'ఆస్తులు'
  ],
  'budget': [
    'budget', 'expenses', 'spending', 'money management', 
    'बजट', 'खर्च', 'व्यय', 'पैसे का प्रबंधन',
    'பட்ஜெட்', 'செலவுகள்', 'செலவழிப்பு',
    'বাজেট', 'খরচ', 'ব্যয়',
    'बजेट', 'खर्च', 'व्यय',
    'બજેટ', 'ખર્ચ', 'વ્યય',
    'ಬಜೆಟ್', 'ವೆಚ್ಚಗಳು', 'ಖರ್ಚು',
    'ബഡ്ജറ്റ്', 'ചെലവുകൾ', 'ചെലവ്',
    'ਬਜਟ', 'ਖਰਚੇ', 'ਵਿਤਰਣ',
    'బడ్జెట్', 'ఖర్చులు', 'వ్యయం'
  ],
  'voice': [
    'voice assistant', 'voice help', 'speech', 'talk', 
    'वॉयस असिस्टेंट', 'आवाज़', 'बोलना', 'सहायक',
    'குரல் உதவியாளர்', 'பேச்சு', 'உதவி',
    'ভয়েস সহায়ক', 'কথা বলা', 'সাহায্য',
    'आवाज सहायक', 'बोलणे', 'मदत',
    'વૉઇસ આસિસ્ટન્ટ', 'બોલવું', 'મદદ',
    'ಧ್ವನಿ ಸಹಾಯಕ', 'ಮಾತನಾಡುವುದು', 'ಸಹಾಯ',
    'വോയിസ് അസിസ്റ്റന്റ്', 'സംസാരിക്കുക', 'സഹായം',
    'ਅਵਾਜ਼ ਸਹਾਇਕ', 'ਬੋਲਣਾ', 'ਮਦਦ',
    'వాయిస్ అసిస్టెంట్', 'మాట్లాడటం', 'సహాయం'
  ],
  'advisory': [
    'advisory', 'advice', 'consultation', 'help', 
    'सलाहकार', 'सलाह', 'परामर्श', 'मदद',
    'ஆலோசகர்', 'ஆலோசனை', 'உதவி',
    'পরামর্শদাতা', 'পরামর্শ', 'সাহায্য',
    'सल्लागार', 'सल्ला', 'मदत',
    'સલાહકાર', 'સલાહ', 'મદદ',
    'ಸಲಹೆಗಾರ', 'ಸಲಹೆ', 'ಸಹಾಯ',
    'ഉപദേശകൻ', 'ഉപദേശം', 'സഹായം',
    'ਸਲਾਹਕਾਰ', 'ਸਲਾਹ', 'ਮਦਦ',
    'సలహాదారు', 'సలహా', 'సహాయం'
  ],
  
  // Financial Actions
  'optimize_portfolio': [
    'optimize portfolio', 'rebalance portfolio', 'improve investments',
    'portfolio optimization', 'balance my portfolio',
    'पोर्टफोलियो ऑप्टिमाइज़ करें', 'निवेश संतुलन', 'पोर्टफोलियो सुधारें',
    'முதலீட்டு மேம்பாடு', 'போர்ட்ஃபோலியோ சமநிலை',
    'পোর্টফোলিও অপ্টিমাইজেশন', 'বিনিয়োগ উন্নতি',
    'पोर्टफोलिओ सुधारणा', 'गुंतवणूक संतुलन',
    'પોર્ટફોલિયો ઑપ્ટિમાઇઝેશન', 'રોકાણ સુધારણા',
    'ಪೋರ್ಟ್‌ಫೋಲಿಯೋ ಆಪ್ಟಿಮೈಸೇಶನ್', 'ಹೂಡಿಕೆ ಸುಧಾರಣೆ',
    'പോർട്ട്‌ഫോളിയോ ഒപ്റ്റിമൈസേഷൻ', 'നിക്ഷേപ മെച്ചപ്പെടുത്തൽ',
    'ਪੋਰਟਫੋਲੀਓ ਸੁਧਾਰ', 'ਨਿਵੇਸ਼ ਸੰਤੁਲਨ',
    'పోర్ట్‌ఫోలియో ఆప్టిమైజేషన్', 'పెట్టుబడి మెరుగుదల'
  ],
  'check_budget': [
    'check budget', 'budget status', 'spending analysis',
    'analyze expenses', 'budget review',
    'बजट चेक करें', 'खर्च का विश्लेषण', 'बजट की समीक्षा',
    'பட்ஜெட் சரிபார்ப்பு', 'செலவு பகுப்பாய்வு',
    'বাজেট পরীক্ষা', 'খরচ বিশ্লেষণ',
    'बजेट तपासणे', 'खर्च विश्लेषण',
    'બજેટ તપાસ', 'ખર્ચ વિશ્લેષણ',
    'ಬಜೆಟ್ ಪರಿಶೀಲನೆ', 'ವೆಚ್ಚ ವಿಶ್ಲೇಷಣೆ',
    'ബഡ്ജറ്റ് പരിശോധന', 'ചെലവ് വിശകലനം',
    'ਬਜਟ ਜਾਂਚ', 'ਖਰਚ ਵਿਸ਼ਲੇਸ਼ਣ',
    'బడ్జెట్ తనిఖీ', 'ఖర్చు విశ్లేషణ'
  ],
  'get_advice': [
    'financial advice', 'investment advice', 'money help',
    'suggest investment', 'what should i invest',
    'वित्तीय सलाह', 'निवेश की सलाह', 'पैसे की मदद',
    'நிதி ஆலோசனை', 'முதலீட்டு ஆலோசனை',
    'আর্থিক পরামর্শ', 'বিনিয়োগ পরামর্শ',
    'आर्थिक सल्ला', 'गुंतवणूक सल्ला',
    'નાણાકીય સલાહ', 'રોકાણ સલાહ',
    'ಆರ್ಥಿಕ ಸಲಹೆ', 'ಹೂಡಿಕೆ ಸಲಹೆ',
    'സാമ്പത്തിക ഉപദേശം', 'നിക്ഷേപ ഉപദേശം',
    'ਵਿਤਤੀ ਸਲਾਹ', 'ਨਿਵੇਸ਼ ਸਲਾਹ',
    'ఆర్థిక సలహా', 'పెట్టుబడి సలహా'
  ],
  
  // Language & System Commands
  'change_language': [
    'change language', 'switch language', 'language settings',
    'भाषा बदलें', 'भाषा स्विच करें', 'भाषा सेटिंग्स',
    'மொழி மாற்று', 'மொழி அமைப்புகள்',
    'ভাষা পরিবর্তন', 'ভাষা সুইচ',
    'भाषा बदला', 'भाषा स्विच करा',
    'ભાષા બદલો', 'ભાષા સ્વિચ',
    'ಭಾಷೆ ಬದಲಾಯಿಸಿ', 'ಭಾಷೆ ಸ್ವಿಚ್',
    'ഭാഷ മാറ്റുക', 'ഭാഷ സ്വിച്ച്',
    'ਭਾਸ਼ਾ ਬਦਲੋ', 'ਭਾਸ਼ਾ ਸਵਿੱਚ',
    'భాష మార్చు', 'భాష స్విచ్'
  ],
  'help': [
    'help', 'assistance', 'what can you do', 'commands', 'voice commands',
    'मदद', 'सहायता', 'आप क्या कर सकते हैं', 'कमांड्स',
    'உதவி', 'सहायता', 'நீங்கள் என்ன செய்ய முடியும்',
    'সাহায্য', 'সহায়তা', 'আপনি কি করতে পারেন',
    'मदत', 'सहाय्य', 'तुम्ही काय करू शकता',
    'મદદ', 'સહાય', 'તમે શું કરી શકો',
    'ಸಹಾಯ', 'ಸಹಾಯತೆ', 'ನೀವು ಏನು ಮಾಡಬಹುದು',
    'സഹായം', 'സഹായകം', 'നിങ്ങൾക്ക് എന്ത് ചെയ്യാൻ കഴിയും',
    'ਮਦਦ', 'ਸਹਾਇਤਾ', 'ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ',
    'సహాయం', 'సహాయత', 'మీరు ఏమి చేయగలరు'
  ]
};

// Dummy Data for Fallbacks
export const DUMMY_DATA = {
  portfolioAllocation: {
    persona: "Balanced Investor",
    allocation: {
      large_cap_equity: 0.40,
      mid_cap_equity: 0.15,
      government_bonds: 0.25,
      corporate_bonds: 0.10,
      gold: 0.10
    },
    allocation_amounts: {
      large_cap_equity: 40000,
      mid_cap_equity: 15000,
      government_bonds: 25000,
      corporate_bonds: 10000,
      gold: 10000
    },
    expected_return: 0.12,
    risk_score: 6.5
  },
  budgetOptimization: {
    adaptive_allocation: {
      needs: 0.50,
      wants: 0.30,
      savings: 0.20
    },
    bandit_state: {
      epsilon: 0.1,
      learning_rate: 0.05,
      total_rounds: 1
    },
    recommendations: [
      "Your spending pattern shows good discipline in essential categories",
      "Consider increasing emergency fund allocation by 5%",
      "Entertainment expenses are within healthy limits"
    ],
    confidence_score: 0.87
  },
  financialHealth: {
    score: 78,
    grade: "B+",
    factors: {
      savings_rate: 85,
      diversification: 72,
      emergency_fund: 65,
      age_appropriate: 88
    },
    recommendations: [
      "Build emergency fund to 6 months of expenses",
      "Consider diversifying into international funds",
      "Increase SIP amount by 10% annually"
    ]
  },
  ragResponse: {
    answer: "According to RBI guidelines, an emergency fund should contain 6-12 months of your essential expenses. For someone with your income profile, this typically means maintaining ₹3-6 lakhs in liquid instruments like savings accounts, liquid funds, or short-term FDs.",
    relevant_documents: [
      {
        content: "RBI guidelines recommend maintaining adequate liquidity...",
        source: "rbi_guidelines_2024.pdf",
        relevance_score: 0.89
      }
    ],
    confidence_score: 0.92
  }
};

// API Service Functions

export class ApiService {
  // Health Check
  static async healthCheck(): Promise<any> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.warn('API health check failed, using dummy data');
      return { status: 'offline', services: ['dummy_mode'] };
    }
  }

  // Voice Processing
  static async processVoice(audioFile: File, language: string = 'english'): Promise<VoiceResponse> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('language', language);

      const response = await apiClient.post('/process_voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.warn('Voice processing failed, using dummy response');
      return {
        success: true,
        transcription: "मुझे निवेश की सलाह चाहिए",
        translation: "I need investment advice",
        intent: "investment_advice",
        response: "Based on your profile, I recommend a balanced portfolio with 60% equity and 40% debt instruments.",
        processing_time: 2.1
      };
    }
  }

  // Portfolio Optimization
  static async getPortfolioAllocation(profile: UserProfile): Promise<PortfolioAllocation> {
    try {
      const response = await apiClient.post('/get_portfolio_allocation', profile);
      return response.data.data || response.data;
    } catch (error) {
      console.warn('Portfolio API failed, using dummy data');
      return DUMMY_DATA.portfolioAllocation;
    }
  }

  // Portfolio Rebalancing Check
  static async checkRebalancing(payload: any): Promise<any> {
    try {
      const response = await apiClient.post('/check_rebalancing', payload);
      return response.data.data || response.data;
    } catch (error) {
      console.warn('Rebalancing check failed, using dummy data');
      return { needs_rebalancing: true, drift_percentage: "7.5%" };
    }
  }

  // Portfolio Optimization Advanced
  static async portfolioOptimization(payload: any): Promise<any> {
    try {
      const response = await apiClient.post('/portfolio_optimization', payload);
      return response.data.data || response.data;
    } catch (error) {
      console.warn('Portfolio optimization failed, using dummy data');
      return DUMMY_DATA.portfolioAllocation;
    }
  }

  // Budget Optimization
  static async optimizeBudget(profile: UserProfile, spendingData: any[]): Promise<BudgetOptimization> {
    try {
      const payload = {
        profile,
        spending_data: spendingData,
        feedback: { needs_satisfaction: 0.8, wants_satisfaction: 0.6, savings_satisfaction: 0.7 },
        preferences: { aggressive_savings: false, lifestyle_priority: "balanced" }
      };

      const response = await apiClient.post('/optimize_budget', payload);
      return response.data.data || response.data;
    } catch (error) {
      console.warn('Budget optimization failed, using dummy data');
      return DUMMY_DATA.budgetOptimization;
    }
  }

  // RAG Query
  static async ragQuery(query: string): Promise<RAGResponse> {
    try {
      const response = await apiClient.post('/rag_query', { query });
      return response.data;
    } catch (error) {
      console.warn('RAG query failed, using dummy response');
      return {
        success: true,
        data: DUMMY_DATA.ragResponse
      };
    }
  }

  // Translation
  static async translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
      const response = await apiClient.post('/translate', {
        text,
        source_language: sourceLang,
        target_language: targetLang
      });
      return response.data.translated_text;
    } catch (error) {
      console.warn('Translation failed, returning original text');
      return text;
    }
  }

  // Natural Language Processing with Enhanced Multilingual Support
  static async processNaturalLanguage(text: string): Promise<{ intent: string; action: string }> {
    try {
      // First try direct keyword matching for speed (enhanced for all languages)
      const lowerText = text.toLowerCase();
      
      // Enhanced multilingual command matching
      for (const [action, keywords] of Object.entries(VOICE_COMMANDS)) {
        const isMatch = keywords.some(keyword => 
          lowerText.includes(keyword.toLowerCase()) ||
          // Handle phonetic variations
          this.fuzzyMatch(lowerText, keyword.toLowerCase())
        );
        
        if (isMatch) {
          // Determine intent based on action type
          let intent = 'navigation';
          if (['optimize_portfolio', 'check_budget', 'get_advice'].includes(action)) {
            intent = 'financial_action';
          } else if (action === 'get_advice' || lowerText.includes('?')) {
            intent = 'financial_query';
          } else if (['change_language', 'help'].includes(action)) {
            intent = 'system';
          }
          
          return { intent, action };
        }
      }

      // Enhanced pattern matching for questions and queries
      const questionPatterns = [
        '?', 'should i', 'how much', 'what is', 'tell me', 'explain',
        'क्या', 'कैसे', 'कितना', 'बताएं', 'समझाएं',
        'என்ன', 'எப்படி', 'எவ்வளவு', 'சொல்லுங்கள்',
        'কি', 'কিভাবে', 'কত', 'বলুন',
        'काय', 'कसे', 'किती', 'सांगा',
        'શું', 'કેવી રીતે', 'કેટલું', 'કહો',
        'ಏನು', 'ಹೇಗೆ', 'ಎಷ್ಟು', 'ಹೇಳಿ',
        'എന്ത്', 'എങ്ങനെ', 'എത്ര', 'പറയൂ',
        'ਕੀ', 'ਕਿਵੇਂ', 'ਕਿੰਨਾ', 'ਦੱਸੋ',
        'ఏమిటి', 'ఎలా', 'ఎంత', 'చెప్పండి'
      ];

      const isQuestion = questionPatterns.some(pattern => lowerText.includes(pattern));
      if (isQuestion) {
        return { intent: 'financial_query', action: 'get_advice' };
      }

      // Try Groq API if available (fallback to avoid errors)
      if (process.env.REACT_APP_GROQ_API_KEY) {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [
              {
                role: 'system',
                content: `You are a multilingual financial voice assistant command interpreter supporting all Indian languages. Analyze the user's request and return ONLY a JSON object with "intent" and "action" fields. 
                
                Available actions: ${Object.keys(VOICE_COMMANDS).join(', ')}
                
                Examples:
                "Show my portfolio" / "पोर्टफोलियो दिखाएं" -> {"intent": "navigation", "action": "portfolio"}
                "I want investment advice" / "मुझे निवेश की सलाह चाहिए" -> {"intent": "financial_query", "action": "get_advice"}
                "Optimize my investments" / "मेरे निवेश को ऑप्टिमाइज़ करें" -> {"intent": "financial_action", "action": "optimize_portfolio"}
                
                If unclear, use action: "get_advice"`
              },
              {
                role: 'user',
                content: text
              }
            ],
            temperature: 0.1,
            max_tokens: 100
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0]?.message?.content;
          const parsed = JSON.parse(content);
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Enhanced NLP failed, using fallback parsing:', error);
    }

    // Ultimate fallback
    return { intent: 'financial_query', action: 'get_advice' };
  }

  // Fuzzy matching helper for phonetic variations
  static fuzzyMatch(text1: string, text2: string, threshold: number = 0.8): boolean {
    if (text1.length === 0) return text2.length === 0;
    if (text2.length === 0) return false;

    const matrix = [];
    for (let i = 0; i <= text2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= text1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= text2.length; i++) {
      for (let j = 1; j <= text1.length; j++) {
        if (text2.charAt(i - 1) === text1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLen = Math.max(text1.length, text2.length);
    const similarity = (maxLen - matrix[text2.length][text1.length]) / maxLen;
    return similarity >= threshold;
  }

  // Get Audio Response
  static async getAudioResponse(text: string, language: string = 'english'): Promise<Blob | null> {
    try {
      const response = await apiClient.post('/get_audio_response', {
        text,
        language
      }, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      console.warn('Audio response failed');
      return null;
    }
  }

  // Financial Health Score
  static async calculateHealthScore(profile: UserProfile): Promise<any> {
    try {
      const response = await apiClient.post('/calculate_health_score', profile);
      return response.data.data || response.data;
    } catch (error) {
      console.warn('Health score calculation failed, using dummy data');
      return DUMMY_DATA.financialHealth;
    }
  }

  // Expense Anomaly Detection
  static async detectAnomalies(expenses: any[]): Promise<any> {
    try {
      const response = await apiClient.post('/detect_anomalies', expenses);
      return response.data;
    } catch (error) {
      console.warn('Anomaly detection failed');
      return { anomalies: [], normal_count: expenses.length };
    }
  }
}