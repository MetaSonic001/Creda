import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReliableVoice } from '@/hooks/useReliableVoice';

interface ReliableVoiceAssistantProps {
  enableAudioResponse?: boolean;
  isCompact?: boolean;
  onWakeWordDetected?: () => void;
  onCommandProcessed?: (command: string, result: string) => void;
}

const ReliableVoiceAssistant: React.FC<ReliableVoiceAssistantProps> = ({
  enableAudioResponse = true,
  isCompact = true,
  onWakeWordDetected,
  onCommandProcessed
}) => {
  const {
    isListening,
    isProcessing,
    isActive,
    currentTranscript,
    permissionGranted,
    toggleListening
  } = useReliableVoice({
    enableAudioResponse,
    onWakeWordDetected,
    onCommandProcessed
  });

  const getStatusColor = () => {
    if (permissionGranted === false) return 'bg-destructive';
    if (isProcessing) return 'bg-orange-500';
    if (isActive) return 'bg-green-500 animate-pulse';
    if (isListening) return 'bg-blue-500';
    return 'bg-muted';
  };

  const getStatusText = () => {
    if (permissionGranted === false) return 'Microphone access required';
    if (isProcessing) return 'Processing command...';
    if (isActive) return 'Command activated! Speak now...';
    if (isListening) return 'Listening for "Hey Creda"...';
    return 'Voice assistant offline';
  };

  const getIcon = () => {
    if (permissionGranted === false) return <MicOff className="w-8 h-8" />;
    if (isProcessing || isActive) return <Volume2 className="w-8 h-8" />;
    return <Mic className="w-8 h-8" />;
  };

  if (isCompact) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-end gap-3"
        >
          {/* Status indicator */}
          <AnimatePresence>
            {(isListening || isProcessing || isActive) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Badge 
                  variant="secondary" 
                  className="bg-background/90 backdrop-blur-sm text-sm px-3 py-1 whitespace-nowrap"
                >
                  {getStatusText()}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current transcript */}
          <AnimatePresence>
            {currentTranscript && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-xs"
              >
                <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
                  <p className="text-sm text-foreground">"{currentTranscript}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main voice button */}
          <Button
            onClick={toggleListening}
            size="lg"
            className={`
              w-16 h-16 rounded-full shadow-lg transition-all duration-300
              ${getStatusColor()}
              hover:scale-105
            `}
            variant={permissionGranted === false ? 'destructive' : 'secondary'}
          >
            <motion.div
              animate={
                isActive 
                  ? { scale: [1, 1.2, 1] } 
                  : isListening 
                  ? { scale: [1, 1.05, 1] }
                  : { scale: 1 }
              }
              transition={{ 
                repeat: isActive || isListening ? Infinity : 0, 
                duration: isActive ? 0.6 : 2
              }}
            >
              {getIcon()}
            </motion.div>
          </Button>

          {/* Audio response indicator */}
          {enableAudioResponse && (
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
              <Volume2 className="w-3 h-3 text-primary" />
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Full interface for dedicated voice page
  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative"
      >
        <Button
          onClick={toggleListening}
          size="lg"
          className={`
            w-32 h-32 rounded-full shadow-xl transition-all duration-300
            ${getStatusColor()}
            hover:scale-105
          `}
          variant={permissionGranted === false ? 'destructive' : 'secondary'}
        >
          <motion.div
            animate={
              isActive 
                ? { scale: [1, 1.2, 1] } 
                : isListening 
                ? { scale: [1, 1.1, 1] }
                : { scale: 1 }
            }
            transition={{ 
              repeat: isActive || isListening ? Infinity : 0, 
              duration: isActive ? 0.6 : 2
            }}
          >
            {React.cloneElement(getIcon(), { className: 'w-16 h-16' })}
          </motion.div>
        </Button>
      </motion.div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium">{getStatusText()}</p>
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted rounded-lg p-4 max-w-md"
          >
            <p className="text-sm text-muted-foreground">You said:</p>
            <p className="font-medium">"{currentTranscript}"</p>
          </motion.div>
        )}
      </div>

      <div className="text-center space-y-2 text-sm text-muted-foreground max-w-md">
        <p>Say "Hey Creda" followed by:</p>
        <div className="grid grid-cols-2 gap-2">
          <div>"Dashboard"</div>
          <div>"Portfolio"</div>
          <div>"Budget"</div>
          <div>"Voice"</div>
          <div>"Settings"</div>
          <div>"Help"</div>
        </div>
      </div>
    </div>
  );
};

export default ReliableVoiceAssistant;