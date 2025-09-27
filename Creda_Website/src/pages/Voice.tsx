import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Globe, Volume2, Settings } from 'lucide-react';
import ReliableVoiceAssistant from '@/components/ReliableVoiceAssistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const Voice: React.FC = () => {
  const { t } = useLanguage();

  const voiceFeatures = [
    {
      icon: <Mic className="w-6 h-6 text-voice-active" />,
      title: "Always Listening",
      description: "Say \"Hey Creda\" in any supported language to activate voice commands instantly."
    },
    {
      icon: <Globe className="w-6 h-6 text-primary" />,
      title: "11+ Languages",
      description: "Supports Hindi, Tamil, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Telugu, Urdu, and English."
    },
    {
      icon: <Volume2 className="w-6 h-6 text-secondary" />,
      title: "Voice Responses", 
      description: "Get audio responses in your preferred language with natural-sounding AI voices."
    },
    {
      icon: <Settings className="w-6 h-6 text-accent" />,
      title: "Smart Commands",
      description: "Navigate to any section, ask financial questions, or manage your portfolio with voice commands."
    }
  ];

  const sampleCommands = [
    { english: "Show my portfolio", hindi: "मेरा पोर्टफोलियो दिखाओ" },
    { english: "Open dashboard", hindi: "डैशबोर्ड खोलो" },
    { english: "What's my budget status?", hindi: "मेरा बजट कैसा है?" },
    { english: "Give me investment advice", hindi: "मुझे निवेश की सलाह दो" },
    { english: "Navigate to settings", hindi: "सेटिंग्स पर जाओ" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient flex items-center justify-center gap-3">
          <Mic className="w-10 h-10" />
          Voice Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Control CREDA with your voice in your preferred language. Just say "Hey Creda" and start speaking naturally.
        </p>
      </motion.div>

      {/* Voice Assistant Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <Card className="glass-effect p-8 text-center">
          <ReliableVoiceAssistant 
            isCompact={false} 
            enableAudioResponse={true}
          />
        </Card>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">Voice Assistant Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {voiceFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="glass-effect h-full hover:shadow-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-gradient-primary rounded-lg w-fit mb-2">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sample Commands */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Try These Sample Commands</CardTitle>
            <CardDescription className="text-center">
              Say "Hey Creda" followed by any of these commands in English or Hindi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sampleCommands.map((command, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="p-4 bg-muted/50 rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-success rounded-full"></span>
                    <span className="font-medium">"{command.english}"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    <span className="font-medium">"{command.hindi}"</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="glass-effect bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-xl text-center">How to Use Voice Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold">Activate</h3>
                <p className="text-sm text-muted-foreground">Say "Hey Creda" to wake up the voice assistant</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold">Speak</h3>
                <p className="text-sm text-muted-foreground">Give your command in any supported language</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold">Execute</h3>
                <p className="text-sm text-muted-foreground">Watch as CREDA executes your command instantly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Voice;