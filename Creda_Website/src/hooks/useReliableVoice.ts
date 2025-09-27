import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [isActive, setIsActive] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { processCommand } = useGroqNLP();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wakeWordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized wake words
  const wakeWords = [
    'hey creda', 'creda', 'ok creda', 'hello creda',
    'wake up creda', 'activate creda', 'start creda',
    'listen creda', 'attention creda', 'creda listen'
  ];

  // Initialize speech recognition with modern approach
  useEffect(() => {
    if (VoiceUtils.isSpeechRecognitionSupported()) {
      const SpeechRecognition = VoiceUtils.getSpeechRecognition();
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();

        // Modern configuration for better performance
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        // Set up event handlers
        recognitionRef.current.onstart = () => {
          setIsListening(true);
          console.log('Speech recognition started');
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          console.log('Speech recognition ended');

          // Auto-restart if not processing and permission granted
          if (!isProcessing && permissionGranted && !isActive) {
            restartTimeoutRef.current = setTimeout(() => {
              startWakeWordListening();
            }, 200);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);

          if (event.error === 'not-allowed') {
            setPermissionGranted(false);
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access for voice commands",
              variant: "destructive"
            });
          } else if (!isProcessing && permissionGranted) {
            // Restart on other errors
            restartTimeoutRef.current = setTimeout(() => {
              startWakeWordListening();
            }, 1000);
          }
        };

        recognitionRef.current.onresult = (event) => {
          const results = event.results;
          const lastResult = results[results.length - 1];

          if (lastResult && lastResult[0]) {
            const transcript = lastResult[0].transcript;
            const confidence = lastResult[0].confidence || 0;

            setCurrentTranscript(transcript);

            if (lastResult.isFinal) {
              handleSpeechResult(transcript, confidence);
            }
          }
        };
      }
    }

    checkMicrophonePermission();

    return () => {
      cleanup();
    };
  }, []);

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

  const startWakeWordListening = useCallback(() => {
    if (!recognitionRef.current || !permissionGranted || isProcessing || isActive) return;

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start wake word listening:', error);
      // Try again after a short delay
      restartTimeoutRef.current = setTimeout(() => {
        startWakeWordListening();
      }, 500);
    }
  }, [permissionGranted, isProcessing, isActive]);

  const handleSpeechResult = useCallback((transcript: string, confidence: number) => {
    if (isProcessing) return;

    const cleanTranscript = VoiceUtils.cleanTranscript(transcript);

    if (!isActive) {
      // Wake word detection mode
      if (VoiceUtils.detectWakeWord(cleanTranscript, wakeWords)) {
        handleWakeWordDetected(cleanTranscript);
      }
    } else {
      // Command processing mode
      if (cleanTranscript.trim()) {
        processVoiceCommand(cleanTranscript.trim());
      }
    }
  }, [isProcessing, isActive]);

  const handleWakeWordDetected = useCallback((transcript: string) => {
    if (isProcessing) return;

    console.log('Wake word detected:', transcript);
    setIsProcessing(true);
    setIsActive(true);
    setCurrentTranscript('');

    // Stop wake word listening
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    options.onWakeWordDetected?.();

    toast({
      title: "🎤 Voice Assistant Active",
      description: "Say your command now...",
    });

    // Start command listening after a brief pause
    commandTimeoutRef.current = setTimeout(() => {
      startCommandListening();
    }, 300);
  }, [isProcessing, options]);

  const processVoiceCommand = useCallback(async (command: string) => {
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
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

   const startCommandListening = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    /* 1.  stay continuous so the user can finish the sentence */
    recognition.continuous = true;
    recognition.interimResults = true;

    /* 2.  collect until we see a FINAL result */
    const onResult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript;

      setCurrentTranscript(transcript);          // let UI show it live

      if (last.isFinal && transcript.trim()) {   // <-- user finished
        recognition.stop();                      // we are done
      }
    };

    recognition.onresult = onResult;

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(true);                     // now process
      processVoiceCommand(currentTranscript);    // <-- your navigation
    };

    recognition.start();
  }, [currentTranscript, processVoiceCommand]);

  const executeCommand = useCallback(async (action: string, command: string, responseText?: string): Promise<void> => {
    // Navigate based on action - ensure navigation works
    const navigateToPage = (path: string) => {
      if (location.pathname !== path) {
        navigate(path, { replace: false });
      }
    };

    switch (action) {
      case 'dashboard':
        navigateToPage('/dashboard');
        break;
      case 'portfolio':
        navigateToPage('/portfolio');
        break;
      case 'budget':
        navigateToPage('/budget');
        break;
      case 'voice':
        navigateToPage('/voice');
        break;
      case 'settings':
        navigateToPage('/settings');
        break;
      case 'goals':
        navigateToPage('/goals');
        break;
      case 'expense_analysis':
        navigateToPage('/expense-analytics');
        break;
      case 'health':
        navigateToPage('/health');
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
      title: "✅ Command Executed",
      description: finalResponseText,
    });

    // Delay speech synthesis to avoid interference with recognition
    if (options.enableAudioResponse && VoiceUtils.isSpeechSynthesisSupported()) {
      // only speak if user clicked / tapped recently
      if (navigator.userActivation?.hasBeenActive) {
        setTimeout(async () => {
          try {
            await VoiceUtils.speakText(finalResponseText, {
              rate: 1.1,
              volume: 0.6,
              lang: 'en-US',
            });
          } catch {}
        }, 800);
      }
    }
  }, [navigate, location.pathname, options.enableAudioResponse, toast]);

  const finishProcessing = useCallback(() => {
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }

    setCurrentTranscript('');
    setIsProcessing(false);
    setIsActive(false);

    // Restart wake word listening after processing
    wakeWordTimeoutRef.current = setTimeout(() => {
      startWakeWordListening();
    }, 500);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      startWakeWordListening();
    }
  }, [isListening]);

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (wakeWordTimeoutRef.current) {
      clearTimeout(wakeWordTimeoutRef.current);
    }
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
  }, []);

  // Auto-start listening when permission is granted
  useEffect(() => {
    if (permissionGranted && !isListening && !isProcessing) {
      startWakeWordListening();
    }
  }, [permissionGranted, startWakeWordListening]);

  return {
    isListening,
    isProcessing,
    isActive,
    currentTranscript,
    permissionGranted,
    toggleListening
  };
};