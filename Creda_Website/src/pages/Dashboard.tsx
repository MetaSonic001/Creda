import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  Target, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Mic,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiService, UserProfile } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);

  // Mock user profile - in real app this would come from auth
  const userProfile: UserProfile = {
    age: 32,
    income: 800000,
    savings: 250000,
    dependents: 1,
    risk_tolerance: 3,
    goal_type: "retirement",
    time_horizon: 25
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [portfolio, budget, health] = await Promise.all([
        ApiService.getPortfolioAllocation(userProfile),
        ApiService.optimizeBudget(userProfile, []),
        ApiService.calculateHealthScore(userProfile)
      ]);
      
      setPortfolioData(portfolio);
      setBudgetData(budget);
      setHealthScore(health);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Data Loading Error",
        description: "Using offline data. Some features may be limited.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickStats = [
    {
      title: "Portfolio Value",
      value: "₹2,50,000",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      title: "Monthly SIP",
      value: "₹15,000",
      change: "+5.2%",
      changeType: "positive" as const,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      title: "Emergency Fund",
      value: "₹75,000",
      change: "3 months",
      changeType: "neutral" as const,
      icon: <PiggyBank className="w-5 h-5" />
    },
    {
      title: "Goals Progress",
      value: "65%",
      change: "On Track",
      changeType: "positive" as const,
      icon: <Target className="w-5 h-5" />
    }
  ];

  const recentActivities = [
    {
      type: "investment",
      description: "SIP investment in Large Cap Fund",
      amount: "₹5,000",
      time: "2 hours ago",
      status: "completed"
    },
    {
      type: "expense",
      description: "Grocery shopping - BigBasket",
      amount: "₹1,200",
      time: "1 day ago", 
      status: "normal"
    },
    {
      type: "goal",
      description: "Emergency Fund target achieved 50%",
      amount: "₹50,000",
      time: "3 days ago",
      status: "milestone"
    },
    {
      type: "alert",
      description: "Portfolio rebalancing recommended",
      amount: "",
      time: "1 week ago",
      status: "pending"
    }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-lg text-muted-foreground">Loading your financial dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-gradient"
          >
            Welcome Back! 👋
          </motion.h1>
          <p className="text-muted-foreground mt-2">
            Here's your financial overview for {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="voice" size="lg" onClick={() => window.location.href = '/voice'}>
            <Mic className="mr-2" /> Ask Creda
          </Button>
          <Button variant="outline" size="lg" onClick={fetchDashboardData}>
            <RefreshCw className="mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-effect hover:shadow-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 bg-gradient-primary rounded-lg text-white">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-sm mt-1">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : stat.changeType === 'neutral' ? null : (
                    <ArrowDownRight className="w-4 h-4 text-error" />
                  )}
                  <span className={`
                    ${stat.changeType === 'positive' ? 'text-success' : 
                      stat.changeType === 'neutral' ? 'text-muted-foreground' : 
                      'text-error'}
                  `}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Health Score */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-secondary rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Financial Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient mb-2">
                  {healthScore?.score || 78}
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  Grade: {healthScore?.grade || "B+"}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {Object.entries(healthScore?.factors || {
                  savings_rate: 85,
                  diversification: 72,
                  emergency_fund: 65,
                  age_appropriate: 88
                }).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                      <span>{typeof value === 'number' ? value : 0}%</span>
                    </div>
                    <Progress value={typeof value === 'number' ? value : 0} className="h-2" />
                  </div>
                ))}
              </div>

              <Button variant="hero" className="w-full" onClick={() => window.location.href = '/advisory'}>
                Get Improvement Tips
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Portfolio Allocation
              </CardTitle>
              <CardDescription>
                Persona: {portfolioData?.persona || "Balanced Investor"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(portfolioData?.allocation || {
                large_cap_equity: 0.40,
                government_bonds: 0.25,
                mid_cap_equity: 0.15,
                gold: 0.10,
                corporate_bonds: 0.10
              }).map(([asset, percentage]) => (
                <div key={asset}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="capitalize">{asset.replace('_', ' ')}</span>
                    <span>{((typeof percentage === 'number' ? percentage : 0) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(typeof percentage === 'number' ? percentage : 0) * 100} className="h-2" />
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span>Expected Return</span>
                  <span className="font-semibold text-success">
                    {((portfolioData?.expected_return || 0.12) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span>Risk Score</span>
                  <span className="font-semibold">
                    {portfolioData?.risk_score || 6.5}/10
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/portfolio'}>
                Optimize Portfolio
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-card rounded-lg">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
                Smart Budget
              </CardTitle>
              <CardDescription>
                AI-optimized allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(budgetData?.adaptive_allocation || {
                needs: 0.50,
                wants: 0.30,
                savings: 0.20
              }).map(([category, percentage]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="capitalize">{category}</span>
                    <span>{((typeof percentage === 'number' ? percentage : 0) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(typeof percentage === 'number' ? percentage : 0) * 100} className="h-2" />
                </div>
              ))}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  AI Confidence: {((budgetData?.confidence_score || 0.87) * 100).toFixed(0)}%
                </p>
                {budgetData?.recommendations?.slice(0, 2).map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/budget'}>
                Manage Budget
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest financial transactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${activity.status === 'completed' ? 'bg-success text-white' :
                        activity.status === 'milestone' ? 'bg-warning text-white' :
                        activity.status === 'pending' ? 'bg-error text-white' :
                        'bg-muted text-foreground'}
                    `}>
                      {activity.type === 'investment' ? <TrendingUp className="w-4 h-4" /> :
                       activity.type === 'expense' ? <DollarSign className="w-4 h-4" /> :
                       activity.type === 'goal' ? <Target className="w-4 h-4" /> :
                       <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className="font-medium">{activity.amount}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;