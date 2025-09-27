import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useGroqNLP } from './useGroqNLP';
import { VoiceUtils } from '@/utils/voiceUtils';
import { LocalVoiceService } from '@/services/localVoiceService';

interface VoiceOptions {
  onWakeWordDetected?: () => void;
  onCommandProcessed?: (command: string, result: string) => void;
  enableAudioResponse?: boolean;
}

export const useReliableVoice = (options: VoiceOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isActive, setIsActive] = useState(false); // New state to differentiate from basic listening

  const { toast } = useToast();
  const navigate = useNavigate();
  const { processCommand } = useGroqNLP();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Wake words for activation
  const wakeWords = [
    'hey creda', 'creda', 'ok creda', 'hello creda',
    'हे क्रेडा', 'क्रेडा', 'हैलो क्रेडा', 'ओके क्रेडा'
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (VoiceUtils.isSpeechRecognitionSupported()) {
      const SpeechRecognition = VoiceUtils.getSpeechRecognition();
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
      }
    }

    checkMicrophonePermission();
    
    return () => {
      cleanup();
    };
  }, []);

  // Auto-start listening when permission is granted
  useEffect(() => {
    if (permissionGranted && !isListening && !isProcessing) {
      startListening();
    }
  }, [permissionGranted]);

  const checkMicrophonePermission = async () => {
    const granted = await VoiceUtils.requestMicrophonePermission();
    setPermissionGranted(granted);
    
    if (!granted) {
      toast({
        title: "Microphone Required",
        description: "Please allow microphone access for voice commands",
        variant: "destructive"
      });
    }
  };

  const detectWakeWord = useCallback((text: string): boolean => {
    return VoiceUtils.detectWakeWord(text, wakeWords);
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !permissionGranted || isListening || isProcessing) return;

    const recognition = recognitionRef.current;
    
    // Ensure recognition is stopped before starting
    try {
      recognition.stop();
    } catch (error) {
      // Ignore errors when stopping
    }
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update current transcript for display
      setCurrentTranscript(interimTranscript || finalTranscript);

      // Check for wake word in final transcript
      if (finalTranscript && detectWakeWord(finalTranscript)) {
        handleWakeWordDetected(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        setPermissionGranted(false);
        return;
      }
      
      // Auto-restart on other errors
      if (!isProcessing) {
        restartTimeoutRef.current = setTimeout(() => {
          restartListening();
        }, 1000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!isProcessing && permissionGranted) {
        restartTimeoutRef.current = setTimeout(() => {
          restartListening();
        }, 500);
      }
    };

    // Small delay to ensure cleanup
    setTimeout(() => {
      try {
        recognition.start();
        setIsListening(true);
        console.log('Voice recognition started');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        // Try again after a short delay
        setTimeout(() => {
          if (!isListening && !isProcessing && permissionGranted) {
            startListening();
          }
        }, 1000);
      }
    }, 100);
  }, [permissionGranted, isListening, isProcessing, detectWakeWord]);

  const restartListening = useCallback(() => {
    if (recognitionRef.current && !isProcessing && !isListening) {
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('Error stopping recognition:', error);
      }
      
      setTimeout(() => {
        if (permissionGranted && !isProcessing && !isListening) {
          startListening();
        }
      }, 200);
    }
  }, [startListening, isProcessing, isListening, permissionGranted]);

  const handleWakeWordDetected = useCallback(async (transcript: string) => {
    if (isProcessing) return;
    
    console.log('Wake word detected:', transcript);
    setIsProcessing(true);
    setIsActive(true);
    setCurrentTranscript('');
    
    // Stop continuous listening
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    options.onWakeWordDetected?.();
    
    toast({
      title: "Voice Assistant Activated! 🎤",
      description: "Listening for your command...",
    });

    // Start command listening
    startCommandListening();
  }, [isProcessing, options]);

  const startCommandListening = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    recognition.continuous = false; // Single command mode
    recognition.lang = 'en-US'; // Can be made dynamic later

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(interimTranscript || finalTranscript);

      if (finalTranscript.trim()) {
        processVoiceCommand(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Command recognition error:', event.error);
      if (event.error !== 'aborted') {
        toast({
          title: "Voice Error",
          description: "Please try again",
          variant: "destructive"
        });
      }
      finishProcessing();
    };

    recognition.onend = () => {
      if (!currentTranscript.trim() && isProcessing) {
        finishProcessing();
      }
    };

    try {
      recognition.start();
      
      // Timeout after 8 seconds
      processingTimeoutRef.current = setTimeout(() => {
        finishProcessing();
      }, 8000);
    } catch (error) {
      console.error('Failed to start command recognition:', error);
      finishProcessing();
    }
  }, [currentTranscript, isProcessing]);

  const processVoiceCommand = useCallback(async (command: string) => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    try {
      // Try Groq NLP first
      const groqResult = await processCommand(command);
      const responseText = LocalVoiceService.generateResponse({
        action: groqResult.action,
        intent: groqResult.intent,
        parameters: groqResult.parameters,
        confidence: groqResult.confidence
      });
      
      await executeCommand(groqResult.action, command, responseText);
      options.onCommandProcessed?.(command, responseText);
    } catch (error) {
      console.warn('Groq processing failed, using local fallback:', error);
      
      // Fallback to local processing
      const localResult = LocalVoiceService.processCommand(command);
      const responseText = LocalVoiceService.generateResponse(localResult);
      
      await executeCommand(localResult.action, command, responseText);
      options.onCommandProcessed?.(command, responseText);
    }
    
    finishProcessing();
  }, [options, processCommand]);

  const parseSimpleCommand = useCallback((command: string): string => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('dashboard')) return 'dashboard';
    if (lowerCommand.includes('portfolio')) return 'portfolio';
    if (lowerCommand.includes('budget')) return 'budget';
    if (lowerCommand.includes('voice')) return 'voice';
    if (lowerCommand.includes('help')) return 'help';
    if (lowerCommand.includes('settings')) return 'settings';
    
    return 'unknown';
  }, []);

  const executeCommand = useCallback(async (action: string, command: string, responseText?: string): Promise<void> => {
    // Navigate based on action
    switch (action) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'portfolio':
        navigate('/portfolio');
        break;
      case 'budget':
        navigate('/budget');
        break;
      case 'voice':
        navigate('/voice');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'goals':
        navigate('/goals');
        break;
      case 'expense_analysis':
        navigate('/expense-analytics');
        break;
      case 'health':
        navigate('/health');
        break;
      case 'help':
      case 'check_balance':
      case 'get_advice':
      case 'unknown':
        // These don't require navigation
        break;
    }
    
    // Use provided response text or generate a default
    const finalResponseText = responseText || `Executed command: ${action}`;

    // Speak response using Web Speech API
    if (options.enableAudioResponse && VoiceUtils.isSpeechSynthesisSupported()) {
      try {
        await VoiceUtils.speakText(finalResponseText, {
          rate: 0.9,
          pitch: 1,
          volume: 0.8,
          lang: 'en-US'
        });
      } catch (error) {
        console.warn('Speech synthesis failed:', error);
      }
    }

    toast({
      title: "Command Executed ✅",
      description: finalResponseText,
    });
  }, [navigate, options.enableAudioResponse, toast]);

  const finishProcessing = useCallback(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    setCurrentTranscript('');
    setIsProcessing(false);
    setIsActive(false);
    
    // Restart listening after a short delay
    setTimeout(() => {
      if (permissionGranted) {
        startListening();
      }
    }, 500);
  }, [permissionGranted, startListening]);

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    setIsListening(false);
    setIsProcessing(false);
    setIsActive(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (permissionGranted === false) {
      checkMicrophonePermission();
      return;
    }

    if (isListening) {
      cleanup();
    } else {
      startListening();
    }
  }, [permissionGranted, isListening, cleanup, startListening, checkMicrophonePermission]);

  return {
    isListening,
    isProcessing,
    isActive,
    currentTranscript,
    permissionGranted,
    toggleListening,
    cleanup
  };
};