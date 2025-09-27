import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceRecognitionProps {
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
}

export const useVoiceRecognition = ({
  language = 'en-US',
  onResult,
  onError,
  continuous = false,
  interimResults = true
}: UseVoiceRecognitionProps = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const desiredContinuousRef = useRef<boolean>(continuous);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          console.log('Speech recognition started');
        };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' ';
          } else {
            interim += transcriptPart;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          onResult?.(finalTranscript.trim(), true);
        }

        if (interim) {
          setInterimTranscript(interim);
          onResult?.(interim, false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was stopped.';
            break;
          default:
            errorMessage = `Recognition error: ${event.error}`;
        }
        
        onError?.(errorMessage);
        
        // Show user-friendly error messages
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice commands",
            variant: "destructive"
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        console.log('Speech recognition ended');
      };

    } else {
      console.warn('Speech Recognition not supported in this browser');
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults, onResult, onError, toast]);

  // Keep desiredContinuousRef in sync with latest prop
  useEffect(() => {
    desiredContinuousRef.current = continuous;
  }, [continuous]);

  const startListening = useCallback(async () => {
    if (!isSupported || !recognitionRef.current) {
      onError?.('Speech recognition not supported');
      return false;
    }

    // Request microphone permissions
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      onError?.('Microphone permission denied');
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice commands",
        variant: "destructive"
      });
      return false;
    }

    try {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError?.('Failed to start speech recognition');
      return false;
    }
  }, [isSupported, onError, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Auto-restart for continuous listening (wake word detection)
  const startContinuousListening = useCallback(async () => {
    if (!isSupported) return false;

    const recognition = recognitionRef.current;
    if (!recognition) return false;

    recognition.continuous = true;
    recognition.interimResults = true;

    // Auto-restart on end for continuous listening using desiredContinuousRef to avoid stale closures
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      if (desiredContinuousRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.warn('Failed to restart continuous recognition:', error);
          }
        }, 150);
      }
    };

    return startListening();
  }, [isSupported, isListening, startListening]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    startContinuousListening
  };
};

export default useVoiceRecognition;