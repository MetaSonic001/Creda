import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Key, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle,
  Lock,
  Unlock,
  Eye,
  Clock,
  MapPin,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const Security: React.FC = () => {
  const { toast } = useToast();
  
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  const securityScore = 85; // Example security score
  
  const recentSessions = [
    {
      device: 'Chrome on Windows',
      location: 'Mumbai, India',
      timestamp: '2 hours ago',
      current: true,
      ip: '192.168.1.1'
    },
    {
      device: 'CREDA Mobile App',
      location: 'Mumbai, India', 
      timestamp: '1 day ago',
      current: false,
      ip: '192.168.1.2'
    },
    {
      device: 'Safari on macOS',
      location: 'Pune, India',
      timestamp: '3 days ago',
      current: false,
      ip: '192.168.1.3'
    }
  ];

  const handleChangePassword = () => {
    toast({
      title: "Password Change",
      description: "You'll receive an email with instructions to change your password.",
    });
  };

  const handleEnable2FA = () => {
    setTwoFactor(!twoFactor);
    toast({
      title: twoFactor ? "2FA Disabled" : "2FA Enabled",
      description: twoFactor 
        ? "Two-factor authentication has been disabled." 
        : "Two-factor authentication has been enabled for better security.",
    });
  };

  const handleRevokeSession = (sessionIndex: number) => {
    toast({
      title: "Session Revoked",
      description: "The selected session has been terminated.",
    });
  };

  const handleRevokeAllSessions = () => {
    toast({
      title: "All Sessions Revoked",
      description: "All other sessions have been terminated. You'll need to log in again on other devices.",
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
          <Shield className="w-8 h-8" />
          Security
        </h1>
        <p className="text-muted-foreground">
          Manage your account security and privacy settings
        </p>
      </motion.div>

      {/* Security Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Security Score
            </CardTitle>
            <CardDescription>
              Your account security strength
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Security Level</span>
                  <span className="text-sm text-muted-foreground">{securityScore}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${securityScore}%` }}
                  />
                </div>
              </div>
              <Badge variant={securityScore >= 80 ? "default" : "secondary"}>
                {securityScore >= 80 ? "Strong" : "Moderate"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {securityScore >= 80 
                ? "Your account has strong security. Keep up the good work!"
                : "Consider enabling two-factor authentication to improve your security score."
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Authentication Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Authentication
            </CardTitle>
            <CardDescription>
              Manage your login credentials and security methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
              <Button variant="outline" onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security with SMS or authenticator app
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={twoFactor ? "default" : "secondary"}>
                  {twoFactor ? "Enabled" : "Disabled"}
                </Badge>
                <Switch checked={twoFactor} onCheckedChange={handleEnable2FA} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Biometric Login</p>
                <p className="text-sm text-muted-foreground">
                  Use fingerprint or face recognition on mobile devices
                </p>
              </div>
              <Switch 
                checked={biometric} 
                onCheckedChange={setBiometric}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after 30 minutes of inactivity
                </p>
              </div>
              <Switch 
                checked={sessionTimeout} 
                onCheckedChange={setSessionTimeout}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage devices that are currently logged into your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground mt-1" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </span>
                      <span>{session.timestamp}</span>
                      <span>IP: {session.ip}</span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRevokeSession(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button variant="outline" onClick={handleRevokeAllSessions}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Revoke All Other Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Security Recommendations
            </CardTitle>
            <CardDescription>
              Follow these tips to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Enable 2FA:</strong> Add two-factor authentication for maximum security.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Strong Password:</strong> Use a unique password with at least 12 characters.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <strong>Regular Review:</strong> Check your active sessions and recent activity monthly.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Security;