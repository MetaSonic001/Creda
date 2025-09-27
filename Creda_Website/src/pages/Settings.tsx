import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  CreditCard,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Palette,
  Volume2,
  Mic,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    portfolio: true,
    transactions: true,
    goals: false,
    market: true,
    security: true
  });
  
  const [privacy, setPrivacy] = useState({
    analytics: true,
    marketing: false,
    shareData: false
  });
  
  const [voiceSettings, setVoiceSettings] = useState({
    wakeWord: true,
    continuousListening: false,
    voiceResponse: true,
    language: 'hindi'
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Your data export will be ready shortly. You'll receive an email when it's complete.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and platform settings
        </p>
      </motion.div>

      <div className="grid gap-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how CREDA looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                </div>
                <Select value={currentLanguage} onValueChange={(value: any) => setLanguage(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">हिंदी</SelectItem>
                    <SelectItem value="tamil">தமிழ்</SelectItem>
                    <SelectItem value="bengali">বাংলা</SelectItem>
                    <SelectItem value="marathi">मराठी</SelectItem>
                    <SelectItem value="gujarati">ગુજરાતી</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Voice Assistant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Voice Assistant
              </CardTitle>
              <CardDescription>
                Configure voice commands and responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Wake Word Detection</p>
                  <p className="text-sm text-muted-foreground">Listen for "Hey CREDA"</p>
                </div>
                <Switch 
                  checked={voiceSettings.wakeWord}
                  onCheckedChange={(checked) => 
                    setVoiceSettings(prev => ({ ...prev, wakeWord: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Voice Responses</p>
                  <p className="text-sm text-muted-foreground">Respond with audio</p>
                </div>
                <Switch 
                  checked={voiceSettings.voiceResponse}
                  onCheckedChange={(checked) => 
                    setVoiceSettings(prev => ({ ...prev, voiceResponse: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Voice Language</p>
                  <p className="text-sm text-muted-foreground">Language for voice commands</p>
                </div>
                <Select 
                  value={voiceSettings.language} 
                  onValueChange={(value) => 
                    setVoiceSettings(prev => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">हिंदी</SelectItem>
                    <SelectItem value="tamil">தமிழ்</SelectItem>
                    <SelectItem value="bengali">বাংলা</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'portfolio' && 'Portfolio updates and rebalancing alerts'}
                      {key === 'transactions' && 'Transaction confirmations and receipts'}
                      {key === 'goals' && 'Goal milestones and progress updates'}
                      {key === 'market' && 'Market news and insights'}
                      {key === 'security' && 'Security alerts and login notifications'}
                    </p>
                  </div>
                  <Switch 
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {key === 'analytics' && 'Analytics'}
                      {key === 'marketing' && 'Marketing Communications'}
                      {key === 'shareData' && 'Share Anonymous Data'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'analytics' && 'Help improve CREDA with usage analytics'}
                      {key === 'marketing' && 'Receive marketing emails and promotions'}
                      {key === 'shareData' && 'Share anonymized data for research'}
                    </p>
                  </div>
                  <Switch 
                    checked={value}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export My Data
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end"
        >
          <Button onClick={handleSaveSettings} size="lg">
            Save All Settings
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;