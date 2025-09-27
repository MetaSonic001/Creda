import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiService, VOICE_COMMANDS } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';

interface VoiceAssistantProps {
  onVoiceCommand?: (command: string) => void;
  isCompact?: boolean;
}

type VoiceState = 'inactive' | 'wake_listening' | 'command_listening' | 'processing' | 'responding' | 'error';

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onVoiceCommand, isCompact = false }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('inactive');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showCommands, setShowCommands] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  
  const { currentLanguage, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function getLanguageCode(lang: string): string {
    const langCodes: Record<string, string> = {
      english: 'en-US',
      hindi: 'hi-IN',
      tamil: 'ta-IN',
      bengali: 'bn-IN',
      marathi: 'mr-IN',
      gujarati: 'gu-IN',
      kannada: 'kn-IN',
      malayalam: 'ml-IN',
      punjabi: 'pa-IN',
      telugu: 'te-IN',
      urdu: 'ur-PK'
    };
    return langCodes[lang] || 'en-US';
  }

  // Wake word recognition (always listening)
  const wakeWordRecognition = useVoiceRecognition({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    onResult: handleWakeWordResult,
    onError: handleWakeWordError
  });

  // Command recognition (active listening)
  const commandRecognition = useVoiceRecognition({
    language: getLanguageCode(currentLanguage),
    continuous: false,
    interimResults: true,
    onResult: handleCommandResult,
    onError: handleCommandError
  });

  // Initialize wake word detection
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  useEffect(() => {
    if (permissionGranted && voiceState === 'inactive') {
      startWakeWordListening();
    }

    return () => {
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
    };
  }, [permissionGranted, voiceState]);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
    } catch (error) {
      setPermissionGranted(false);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use Creda voice assistant",
        variant: "destructive"
      });
    }
  };

  const startWakeWordListening = async () => {
    if (!wakeWordRecognition.isSupported || voiceState !== 'inactive') return;
    
    setVoiceState('wake_listening');
    const started = await wakeWordRecognition.startContinuousListening();
    
    if (started) {
      console.log('Wake word detection started');
    } else {
      setVoiceState('error');
      setTimeout(() => setVoiceState('inactive'), 2000);
    }
  };

  function handleWakeWordResult(transcript: string, isFinal: boolean) {
    if (!isFinal) return;

    const lowerTranscript = transcript.toLowerCase();
    
    // Enhanced wake words for all Indian languages
    const wakeWords = [
      // English
      'hey creda', 'creda', 'ok creda', 'hello creda',
      // Hindi
      'हे क्रेडा', 'क्रेडा', 'हैलो क्रेडा', 'ओके क्रेडा',
      // Tamil
      'ஹே க்ரேடா', 'க்ரேடா', 'வணக்கம் க்ரேடா',
      // Bengali
      'হে ক্রেডা', 'ক্রেডা', 'হ্যালো ক্রেডা',
      // Marathi
      'हे क्रेडा', 'क्रेडा', 'नमस्कार क्रेडा',
      // Gujarati
      'હે ક્રેડા', 'ક્રેડા', 'નમસ્તે ક્રેડા',
      // Kannada
      'ಹೇ ಕ್ರೆಡಾ', 'ಕ್ರೆಡಾ', 'ನಮಸ್ಕಾರ ಕ್ರೆಡಾ',
      // Malayalam
      'ഹേ ക്രെഡ', 'ക്രെഡ', 'നമസ്കാരം ക്രെഡ',
      // Punjabi
      'ਹੇ ਕ੍ਰੇਡਾ', 'ਕ੍ਰੇਡਾ', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਕ੍ਰੇਡਾ',
      // Telugu
      'హే క్రెడా', 'క్రెడా', 'నమస్కారం క్రెడా',
      // Urdu
      'ہے کریڈا', 'کریڈا', 'آداب کریڈا'
    ];

    const isWakeWord = wakeWords.some(word => {
      const cleanWord = word.toLowerCase().trim();
      return lowerTranscript.includes(cleanWord) || 
             // Fuzzy matching for pronunciation variations
             fuzzyMatch(lowerTranscript, cleanWord, 0.75);
    });

    if (isWakeWord && voiceState === 'wake_listening') {
      console.log('Wake word detected:', transcript);
      setWakeWordDetected(true);
      activateCommandListening();
    }
  }

  // Helper function for fuzzy string matching
  function fuzzyMatch(text1: string, text2: string, threshold: number = 0.8): boolean {
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

  function handleWakeWordError(error: string) {
    console.warn('Wake word detection error:', error);
    // Auto-restart wake word detection after error
    setTimeout(() => {
      if (voiceState === 'wake_listening') {
        startWakeWordListening();
      }
    }, 1000);
  }

  const activateCommandListening = async () => {
    wakeWordRecognition.stopListening();
    setVoiceState('command_listening');
    setCurrentTranscript('');

    toast({
      title: "Voice Assistant Activated! 🎤",
      description: "Listening for your command...",
    });

    const started = await commandRecognition.startListening();
    
    if (started) {
      // Auto-timeout after 10 seconds of inactivity
      commandTimeoutRef.current = setTimeout(() => {
        if (voiceState === 'command_listening') {
          deactivateCommandListening();
        }
      }, 10000);
    } else {
      setVoiceState('error');
      setTimeout(() => {
        setVoiceState('inactive');
        startWakeWordListening();
      }, 2000);
    }
  };

  const deactivateCommandListening = () => {
    commandRecognition.stopListening();
    commandRecognition.clearTranscript();
    setCurrentTranscript('');
    setWakeWordDetected(false);
    
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    
    setVoiceState('inactive');
    setTimeout(() => startWakeWordListening(), 500);
  };

  function handleCommandResult(transcript: string, isFinal: boolean) {
    setCurrentTranscript(transcript);

    if (isFinal && transcript.trim()) {
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      processVoiceCommand(transcript.trim());
    }
  }

  function handleCommandError(error: string) {
    console.error('Command recognition error:', error);
    setVoiceState('error');
    
    toast({
      title: "Voice Recognition Error",
      description: error,
      variant: "destructive"
    });

    setTimeout(() => {
      setVoiceState('inactive');
      startWakeWordListening();
    }, 2000);
  }

  const processVoiceCommand = async (command: string) => {
    setVoiceState('processing');
    setCurrentTranscript(command);
    
    try {
      let processedCommand = command;
      
      // If the current language is not English, translate the command to English first
      if (currentLanguage !== 'english') {
        try {
          console.log(`Translating command from ${currentLanguage} to English:`, command);
          processedCommand = await ApiService.translateText(command, currentLanguage, 'english');
          console.log('Translated command:', processedCommand);
          
          // Show translation to user
          toast({
            title: "Translation",
            description: `"${command}" → "${processedCommand}"`,
            duration: 2000,
          });
        } catch (error) {
          console.warn('Translation failed, using original command:', error);
          // Continue with original command if translation fails
        }
      }
      
      const { intent, action } = await ApiService.processNaturalLanguage(processedCommand);
      await executeVoiceCommand(action, command, processedCommand);
      onVoiceCommand?.(action);
    } catch (error) {
      console.error('Voice command processing error:', error);
      setVoiceState('error');
      
      toast({
        title: "Command Processing Error",
        description: "Sorry, I couldn't understand that command. Try saying 'help' for available commands.",
        variant: "destructive"
      });
    }
    
    setTimeout(() => {
      setVoiceState('inactive');
      startWakeWordListening();
    }, 3000);
  };

  const executeVoiceCommand = async (action: string, originalCommand: string, translatedCommand?: string) => {
    setVoiceState('responding');
    
    let responseText = '';
    
    switch (action) {
      case 'dashboard':
        navigate('/dashboard');
        responseText = 'Navigating to dashboard';
        break;
        
      case 'portfolio':
        navigate('/portfolio');
        responseText = 'Opening your portfolio';
        break;
        
      case 'budget':
        navigate('/budget');
        responseText = 'Opening budget management';
        break;
        
      case 'voice':
        navigate('/voice');
        responseText = 'Opening voice assistant interface';
        break;
        
      case 'advisory':
        navigate('/advisory');
        responseText = 'Opening financial advisory';
        break;
        
      case 'optimize_portfolio':
        navigate('/portfolio?action=optimize');
        responseText = 'Starting portfolio optimization';
        break;
        
      case 'check_budget':
        navigate('/budget?action=analyze');
        responseText = 'Analyzing your budget';
        break;
        
      case 'get_advice':
        // Process the query through RAG (use translated command if available)
        const queryText = translatedCommand || originalCommand;
        const ragResponse = await ApiService.ragQuery(queryText);
        responseText = ragResponse.data?.answer || 'I can help you with financial advice. Please ask a specific question.';
        break;
        
      case 'help':
        setShowCommands(true);
        responseText = 'Here are the available voice commands';
        break;
        
      case 'change_language':
        responseText = 'You can change the language using the globe icon in the header';
        break;
        
      default:
        responseText = `I heard "${originalCommand}" but I'm not sure what to do. Try saying "help" for available commands.`;
    }
    
    // Translate response to user's language if not English
    if (currentLanguage !== 'english') {
      try {
        responseText = await ApiService.translateText(responseText, 'english', currentLanguage);
      } catch (error) {
        console.warn('Translation failed for voice response');
      }
    }
    
    // Play audio response if enabled
    if (audioEnabled) {
      try {
        const audioBlob = await ApiService.getAudioResponse(responseText, currentLanguage);
        if (audioBlob && audioRef.current) {
          const audioUrl = URL.createObjectURL(audioBlob);
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      } catch (error) {
        console.warn('Audio response failed');
      }
    }
    
    toast({
      title: "Command Executed ✅",
      description: responseText,
    });
  };

  const toggleVoiceAssistant = () => {
    if (voiceState === 'inactive' || voiceState === 'wake_listening') {
      activateCommandListening();
    } else {
      deactivateCommandListening();
    }
  };

  const getVoiceStateIcon = () => {
    switch (voiceState) {
      case 'wake_listening':
        return <Mic className="w-6 h-6 text-voice-inactive" />;
      case 'command_listening':
        return <Mic className="w-6 h-6 text-voice-listening animate-pulse" />;
      case 'processing':
        return <Loader2 className="w-6 h-6 text-voice-processing animate-spin" />;
      case 'responding':
        return <Volume2 className="w-6 h-6 text-voice-active animate-bounce" />;
      case 'error':
        return <MicOff className="w-6 h-6 text-error" />;
      default:
        return <Mic className="w-6 h-6 text-voice-inactive" />;
    }
  };

  const getVoiceStateClass = () => {
    switch (voiceState) {
      case 'command_listening':
        return 'voice-listening';
      case 'processing':
        return 'voice-processing';
      case 'responding':
        return 'voice-active';
      default:
        return '';
    }
  };

  const getStateDescription = () => {
    switch (voiceState) {
      case 'inactive':
        return t('voice.activate');
      case 'wake_listening':
        return 'Listening for "Hey Creda"...';
      case 'command_listening':
        return t('voice.listening');
      case 'processing':
        return 'Processing your request...';
      case 'responding':
        return 'Executing command...';
      case 'error':
        return 'Error - Please try again';
      default:
        return 'Voice Assistant Ready';
    }
  };

  // Permission check alert
  if (permissionGranted === false) {
    return (
      <div className={isCompact ? "fixed bottom-6 right-6 z-50" : "w-full max-w-4xl mx-auto"}>
        <Alert className="border-warning bg-warning/10">
          <MicOff className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Microphone access is required for voice commands.</p>
              <Button onClick={checkMicrophonePermission} variant="warning" size="sm">
                Grant Permission
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isCompact) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <Button
            onClick={toggleVoiceAssistant}
            size="lg"
            className={`
              w-16 h-16 rounded-full shadow-lg transition-all duration-300
              ${getVoiceStateClass()}
            `}
            variant={voiceState === 'inactive' || voiceState === 'wake_listening' ? 'secondary' : 'default'}
          >
            {getVoiceStateIcon()}
          </Button>
          
          {voiceState === 'wake_listening' && (
            <Badge 
              className="absolute -top-2 -right-2 bg-success text-white text-xs animate-pulse"
              variant="secondary"
            >
              Wake
            </Badge>
          )}
          
          {wakeWordDetected && (
            <Badge 
              className="absolute -top-2 -left-2 bg-voice-active text-white text-xs"
              variant="secondary"
            >
              Active
            </Badge>
          )}
          
          <AnimatePresence>
            {currentTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full right-0 mb-2 p-2 bg-card rounded-lg shadow-lg max-w-xs"
              >
                <p className="text-sm text-foreground">"{currentTranscript}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <audio ref={audioRef} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-6 glass-effect">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gradient">Creda Voice Assistant</h2>
              <p className="text-muted-foreground">{t('voice.activate')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('voice.supported_languages')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommands(!showCommands)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Voice Control */}
          <div className="text-center space-y-4">
            <motion.div
              animate={{ 
                scale: voiceState === 'command_listening' ? [1, 1.1, 1] : 1,
                rotateY: voiceState === 'processing' ? 360 : 0
              }}
              transition={{ 
                scale: { repeat: voiceState === 'command_listening' ? Infinity : 0, duration: 1 },
                rotateY: { repeat: voiceState === 'processing' ? Infinity : 0, duration: 1 }
              }}
            >
              <Button
                onClick={toggleVoiceAssistant}
                size="lg"
                className={`
                  w-32 h-32 rounded-full text-2xl shadow-xl transition-all duration-500
                  ${getVoiceStateClass()}
                `}
                variant={voiceState === 'inactive' || voiceState === 'wake_listening' ? 'secondary' : 'default'}
              >
                {getVoiceStateIcon()}
              </Button>
            </motion.div>

            <div className="space-y-2">
              <p className="text-lg font-medium">
                {getStateDescription()}
              </p>
              
              {currentTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-muted rounded-lg"
                >
                  <p className="text-sm italic">"{currentTranscript}"</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Voice Commands */}
          <AnimatePresence>
            {showCommands && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Available Voice Commands:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(VOICE_COMMANDS).map(([action, keywords]) => (
                    <div key={action} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium capitalize">{action.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        Try: "{keywords[0]}"
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
      
      <audio ref={audioRef} />
    </div>
  );
};

export default VoiceAssistant;