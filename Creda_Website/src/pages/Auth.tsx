import React from 'react';
import { motion } from 'framer-motion';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Shield, Zap, Globe, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AuthProps {
  mode: 'sign-in' | 'sign-up';
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Bank-level security with end-to-end encryption"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered",
      description: "Smart financial insights and personalized recommendations"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multilingual",
      description: "Supports 11+ Indian languages for voice and text"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Smart Optimization",
      description: "Automated portfolio and budget optimization"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-bold text-gradient mb-4"
            >
              Welcome to CREDA
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Your AI-powered multilingual financial assistant for smarter money management
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="glass-effect p-4 hover:shadow-glow transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-card rounded-lg p-6 border"
          >
            <h3 className="font-semibold mb-3">🎙️ Try Voice Commands:</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>"Hey CREDA, show my portfolio"</p>
              <p>"मेरा बजट ऑप्टिमाइज़ करो" (Optimize my budget)</p>
              <p>"Check my financial health"</p>
              <p>"Set retirement goal of 1 crore"</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="glass-effect p-8 w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2">
                {mode === 'sign-in' ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-muted-foreground">
                {mode === 'sign-in' 
                  ? 'Sign in to access your financial dashboard'
                  : 'Create your account to start your financial journey'
                }
              </p>
            </div>

            <div className="clerk-auth-wrapper">
              {mode === 'sign-in' ? (
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-transparent shadow-none border-none",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "bg-background border-border hover:bg-muted",
                      formButtonPrimary: "bg-gradient-primary hover:opacity-90",
                      footerActionLink: "text-primary hover:text-primary-glow"
                    }
                  }}
                  redirectUrl="/dashboard"
                  signUpUrl="/auth/sign-up"
                />
              ) : (
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-transparent shadow-none border-none",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "bg-background border-border hover:bg-muted",
                      formButtonPrimary: "bg-gradient-primary hover:opacity-90",
                      footerActionLink: "text-primary hover:text-primary-glow"
                    }
                  }}
                  redirectUrl="/dashboard"
                  signInUrl="/auth/sign-in"
                />
              )}
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>
                By continuing, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;