import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  DollarSign,
  Check,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'portfolio' | 'goal' | 'expense' | 'opportunity' | 'alert';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'celebration';
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'portfolio',
    title: 'Portfolio Rebalancing Alert',
    message: 'Your equity allocation has drifted 7.5% above target. Consider rebalancing to maintain optimal risk-return profile.',
    severity: 'high',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionLabel: 'Rebalance Now',
    actionUrl: '/portfolio'
  },
  {
    id: '2',
    type: 'goal',
    title: 'Emergency Fund Milestone! 🎉',
    message: 'Congratulations! You\'ve achieved 50% of your emergency fund target. Keep up the great work!',
    severity: 'celebration',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    actionLabel: 'View Progress',
    actionUrl: '/goals'
  },
  {
    id: '3',
    type: 'expense',
    title: 'Unusual Spending Detected',
    message: 'Your restaurant expenses are 60% higher than usual this month. Review your dining habits?',
    severity: 'medium',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    actionLabel: 'Analyze Expenses',
    actionUrl: '/budget'
  },
  {
    id: '4',
    type: 'opportunity',
    title: 'Investment Opportunity',
    message: 'Market conditions favor large-cap funds. Consider increasing your allocation for potential gains.',
    severity: 'medium',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    actionLabel: 'Explore Options',
    actionUrl: '/portfolio'
  },
  {
    id: '5',
    type: 'alert',
    title: 'SIP Due Tomorrow',
    message: 'Your monthly SIP of ₹15,000 is scheduled for tomorrow. Ensure sufficient balance in your account.',
    severity: 'low',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    actionLabel: 'Check Balance',
    actionUrl: '/portfolio'
  }
];

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'portfolio': return <TrendingUp className="w-4 h-4" />;
      case 'goal': return <Target className="w-4 h-4" />;
      case 'expense': return <DollarSign className="w-4 h-4" />;
      case 'opportunity': return <TrendingUp className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-error bg-error/5';
      case 'medium': return 'border-l-warning bg-warning/5';
      case 'celebration': return 'border-l-success bg-success/5';
      default: return 'border-l-muted bg-muted/5';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed right-0 top-0 z-50 h-full w-96 bg-background border-l shadow-xl"
          >
            <Card className="h-full rounded-none border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="p-0 h-full">
                <div className="p-4 border-b">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="w-full"
                  >
                    <Check className="mr-2 w-4 h-4" />
                    Mark All as Read
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-2 p-4">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                          p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200
                          ${getSeverityColor(notification.severity)}
                          ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'}
                          hover:bg-opacity-80
                        `}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            p-2 rounded-lg
                            ${notification.severity === 'high' ? 'bg-error text-white' :
                              notification.severity === 'medium' ? 'bg-warning text-white' :
                              notification.severity === 'celebration' ? 'bg-success text-white' :
                              'bg-muted text-foreground'}
                          `}>
                            {getIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              
                              {notification.actionLabel && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs h-6 p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = notification.actionUrl || '#';
                                  }}
                                >
                                  {notification.actionLabel}
                                  <ArrowRight className="ml-1 w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;