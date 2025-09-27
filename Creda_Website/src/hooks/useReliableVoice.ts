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

  // Wake words for activation - expanded for better detection
  const wakeWords = [
    'hey creda', 'creda', 'ok creda', 'hello creda',
    'hey creda', 'creda', 'ok creda', 'hello creda',
    'हे क्रेडा', 'क्रेडा', 'हैलो क्रेडा', 'ओके क्रेडा',
    'wake up creda', 'activate creda', 'start creda',
    'listen creda', 'attention creda', 'creda listen'
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = VoiceUtils.getSpeechRecognition();
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;
        // Optimize for faster response
        if ('grammars' in recognitionRef.current) {
          recognitionRef.current.grammars = new webkitSpeechGrammarList();
        }
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

  const detectWakeWord = useCallback((text: string, confidence: number = 0): boolean => {
    // Only process if confidence is reasonable (Web Speech API confidence is often low)
    if (confidence > 0 && confidence < 0.3) return false;

    const cleanText = VoiceUtils.cleanTranscript(text).toLowerCase();

    // Check for exact wake word matches first (fastest)
    for (const word of wakeWords) {
      if (cleanText.includes(word.toLowerCase())) {
        return true;
      }
    }

    // Fuzzy matching for partial matches
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
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence || 0;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      // Update current transcript for display
      setCurrentTranscript(interimTranscript || finalTranscript);

      // Check for wake word in final transcript with confidence check
      if (finalTranscript && detectWakeWord(finalTranscript, maxConfidence)) {
        handleWakeWordDetected(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Recognition error:', event.error);

      if (event.error === 'not-allowed') {
        setPermissionGranted(false);
        return;
      }

      // More aggressive restart on errors
      if (!isProcessing) {
        setIsListening(false);
        restartTimeoutRef.current = setTimeout(() => {
          restartListening();
        }, 300); // Faster restart
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!isProcessing && permissionGranted) {
        // Immediate restart for continuous listening
        restartTimeoutRef.current = setTimeout(() => {
          restartListening();
        }, 100); // Much faster restart
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
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence || 0;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(interimTranscript || finalTranscript);

      // Only process if we have a final transcript with reasonable confidence
      if (finalTranscript.trim() && maxConfidence >= 0.1) {
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
      // Try local processing first for speed
      const localResult = LocalVoiceService.processCommand(command);

      // If local processing gives a good result, use it immediately
      if (localResult.confidence > 0.5) {
        const responseText = LocalVoiceService.generateResponse(localResult);
        await executeCommand(localResult.action, command, responseText);
        options.onCommandProcessed?.(command, responseText);
        finishProcessing();
        return;
      }

      // Fallback to Groq NLP for complex commands
      try {
        const groqResult = await processCommand(command);
        if (groqResult.confidence > localResult.confidence) {
          const responseText = LocalVoiceService.generateResponse({
            action: groqResult.action,
            intent: groqResult.intent,
            parameters: groqResult.parameters,
            confidence: groqResult.confidence
          });
          await executeCommand(groqResult.action, command, responseText);
          options.onCommandProcessed?.(command, responseText);
        } else {
          // Use local result if better
          const responseText = LocalVoiceService.generateResponse(localResult);
          await executeCommand(localResult.action, command, responseText);
          options.onCommandProcessed?.(command, responseText);
        }
      } catch (groqError) {
        console.warn('Groq processing failed, using local fallback:', groqError);
        // Use local result
        const responseText = LocalVoiceService.generateResponse(localResult);
        await executeCommand(localResult.action, command, responseText);
        options.onCommandProcessed?.(command, responseText);
      }

      finishProcessing();
    } catch (error) {
      console.error('Voice command processing error:', error);
      const fallbackResult = LocalVoiceService.processCommand(command);
      const responseText = LocalVoiceService.generateResponse(fallbackResult);
      await executeCommand(fallbackResult.action, command, responseText);
      options.onCommandProcessed?.(command, responseText);
      finishProcessing();
    }
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
    // Navigate based on action first (immediate feedback)
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

    // Show toast immediately for visual feedback
    toast({
      title: "Command Executed ✅",
      description: finalResponseText,
    });

    // Delay speech synthesis to avoid interference with recognition
    if (options.enableAudioResponse && VoiceUtils.isSpeechSynthesisSupported()) {
      setTimeout(async () => {
        try {
          await VoiceUtils.speakText(finalResponseText, {
            rate: 1.0, // Slightly faster
            pitch: 1,
            volume: 0.7, // Slightly quieter to avoid feedback
            lang: 'en-US'
          });
        } catch (error) {
          console.warn('Speech synthesis failed:', error);
        }
      }, 500); // Delay speech by 500ms
    }
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