import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Globe, 
  Sun, 
  Moon, 
  Smartphone,
  ChevronDown,
  Mic,
  Star,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LandingNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { currentLanguage, setLanguage, availableLanguages, t } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Voice Demo', href: '#voice-demo' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' }
  ];

  const features = [
    { icon: <Mic className="w-4 h-4" />, title: 'Voice AI', href: '/voice' },
    { icon: <Shield className="w-4 h-4" />, title: 'Security', href: '/security' },
    { icon: <Zap className="w-4 h-4" />, title: 'Analytics', href: '/analytics' }
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  const themeIcon = theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />;
  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">CREDA</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => scrollToSection(item.href)}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.label}
              </motion.button>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                    Product <ChevronDown className="ml-1 w-4 h-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {features.map((feature) => (
                  <DropdownMenuItem key={feature.title} onClick={() => scrollToSection(feature.href)}>
                    <div className="flex items-center gap-2">
                      {feature.icon}
                      {feature.title}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Controls & CTA */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Globe className="w-4 h-4 mr-1" />
                    {currentLang?.nativeName}
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {availableLanguages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code} 
                    onClick={() => setLanguage(lang.code)}
                    className={currentLanguage === lang.code ? 'bg-muted' : ''}
                  >
                    {lang.nativeName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    {themeIcon}
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Smartphone className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="hidden lg:flex items-center space-x-3"
            >
              <Button variant="ghost" asChild>
                <Link to="/auth/sign-in">Sign In</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/dashboard">{t('action.getStarted')}</Link>
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden border-t border-border/50"
        >
          <div className="py-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="block w-full text-left py-2 text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                  {themeIcon}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Globe className="w-4 h-4 mr-1" />
                      {currentLang?.nativeName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {availableLanguages.slice(0, 6).map((lang) => (
                      <DropdownMenuItem 
                        key={lang.code} 
                        onClick={() => setLanguage(lang.code)}
                        className={currentLanguage === lang.code ? 'bg-muted' : ''}
                      >
                        {lang.nativeName}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="pt-3 flex flex-col space-y-3">
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/auth/sign-in" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    {t('action.getStarted')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default LandingNavbar;