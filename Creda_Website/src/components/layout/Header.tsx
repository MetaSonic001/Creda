import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Sun, Moon, Bell, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationPanel from '@/components/ui/notification-panel';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadNotifications = 3; // Mock unread count

  if (isLandingPage) {
    return (
      <header className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gradient">Creda</div>
          </Link>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Globe className="w-4 h-4 mr-2" />EN
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('english')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hindi')}>हिन्दी</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/dashboard">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex h-16 items-center px-6">
          <SidebarTrigger className="mr-4" />
          
          {/* Logo/Brand */}
          <Link to="/dashboard" className="flex items-center space-x-2 mr-6">
            <div className="text-xl font-bold text-gradient">Creda</div>
          </Link>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm"
              className="relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="w-4 h-4 mr-2" />
                  {currentLanguage === 'english' ? 'EN' : 'HI'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('english')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hindi')}>
                  हिन्दी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Header;