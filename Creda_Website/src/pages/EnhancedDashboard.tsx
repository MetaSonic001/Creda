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
  RefreshCw,
  Bell,
  Eye,
  MoreVertical,
  Plus,
  Filter,
  Download,
  Share,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiService, UserProfile } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import MetricCard from '@/components/charts/MetricCard';
import AdvancedLineChart from '@/components/charts/AdvancedLineChart';
import AdvancedPieChart from '@/components/charts/AdvancedPieChart';

const EnhancedDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M');

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

  // Enhanced mock data for charts
  const portfolioPerformanceData = [
    { name: 'Jan', value: 240000, target: 245000 },
    { name: 'Feb', value: 242000, target: 250000 },
    { name: 'Mar', value: 255000, target: 255000 },
    { name: 'Apr', value: 248000, target: 260000 },
    { name: 'May', value: 263000, target: 265000 },
    { name: 'Jun', value: 270000, target: 270000 },
  ];

  const allocationData = [
    { name: 'Large Cap Equity', value: 108000, percentage: 40 },
    { name: 'Government Bonds', value: 67500, percentage: 25 },
    { name: 'Mid Cap Equity', value: 40500, percentage: 15 },
    { name: 'Gold', value: 27000, percentage: 10 },
    { name: 'Corporate Bonds', value: 27000, percentage: 10 },
  ];

  const monthlyFlowData = [
    { name: 'Jan', income: 80000, expenses: 45000, savings: 35000 },
    { name: 'Feb', income: 80000, expenses: 48000, savings: 32000 },
    { name: 'Mar', income: 85000, expenses: 47000, savings: 38000 },
    { name: 'Apr', income: 80000, expenses: 44000, savings: 36000 },
    { name: 'May', income: 80000, expenses: 46000, savings: 34000 },
    { name: 'Jun', income: 90000, expenses: 45000, savings: 45000 },
  ];

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

  const topMetrics = [
    {
      title: "Total Wealth",
      value: 270000,
      change: 8.2,
      trend: 'up' as const,
      icon: <TrendingUp className="w-5 h-5" />,
      prefix: "₹",
      description: "Portfolio + Cash + FD"
    },
    {
      title: "Monthly Returns",
      value: "12.5",
      change: 2.1,
      trend: 'up' as const,
      icon: <DollarSign className="w-5 h-5" />,
      suffix: "%",
      description: "Annualized returns"
    },
    {
      title: "Emergency Fund",
      value: 4.2,
      change: 0.3,
      trend: 'up' as const,
      icon: <PiggyBank className="w-5 h-5" />,
      suffix: " months",
      description: "Expense coverage"
    },
    {
      title: "Goal Progress",
      value: "68",
      change: 5.0,
      trend: 'up' as const,
      icon: <Target className="w-5 h-5" />,
      suffix: "%",
      description: "Retirement readiness"
    }
  ];

  const recentAlerts = [
    {
      type: "opportunity",
      title: "Rebalancing Opportunity",
      description: "Your portfolio has drifted 6% from target allocation",
      action: "Rebalance Now",
      priority: "medium",
      timestamp: "2 hours ago"
    },
    {
      type: "achievement",
      title: "Goal Milestone Reached",
      description: "Emergency fund target of ₹75,000 achieved!",
      action: "View Goals",
      priority: "low",
      timestamp: "1 day ago"
    },
    {
      type: "market",
      title: "Market Update",
      description: "Large cap funds showing strong performance this quarter",
      action: "Learn More",
      priority: "low",
      timestamp: "3 days ago"
    }
  ];

  const quickActions = [
    { label: "Add Money", icon: Plus, action: () => {} },
    { label: "SIP Setup", icon: Calendar, action: () => {} },
    { label: "Tax Planning", icon: AlertTriangle, action: () => {} },
    { label: "Goals Review", icon: Target, action: () => {} },
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
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-gradient"
          >
            Good morning! 👋
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
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe(period as any)}
                className="h-8 px-3"
              >
                {period}
              </Button>
            ))}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Customize
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              icon={metric.icon}
              prefix={metric.prefix}
              suffix={metric.suffix}
              description={metric.description}
              size="md"
            />
          </motion.div>
        ))}
      </div>

      {/* Alerts Section */}
      {recentAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Alert className="border-l-4 border-l-warning bg-warning/5">
            <Bell className="h-4 w-4 text-warning" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>{recentAlerts[0].title}:</strong> {recentAlerts[0].description}
                </div>
                <Button variant="outline" size="sm">
                  {recentAlerts[0].action}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Performance */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AdvancedLineChart
            data={portfolioPerformanceData}
            title="Portfolio Performance"
            description="Track your investment growth over time"
            valuePrefix="₹"
            showTarget={true}
            showTrend={true}
            height={350}
          />
        </motion.div>

        {/* Portfolio Allocation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AdvancedPieChart
            data={allocationData}
            title="Asset Allocation"
            description="Current portfolio distribution"
            valuePrefix="₹"
            showPercentages={true}
            showLegend={true}
            height={350}
          />
        </motion.div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Cash Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AdvancedLineChart
            data={monthlyFlowData.map(item => ({ 
              name: item.name, 
              value: item.savings,
              target: 40000 
            }))}
            title="Monthly Savings Trend"
            description="Your monthly savings pattern"
            valuePrefix="₹"
            showTarget={true}
            color="hsl(var(--chart-2))"
          />
        </motion.div>

        {/* Quick Actions & Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-effect h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Quick Actions & Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Actions */}
              <div>
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="h-auto p-3 flex-col gap-2"
                    >
                      <action.icon className="h-4 w-4" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div>
                <h4 className="font-medium mb-3">AI Insights</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-sm font-medium text-success">Great Progress! 🎉</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your savings rate has increased by 15% this quarter
                    </p>
                  </div>
                  <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                    <p className="text-sm font-medium text-info">Recommendation 💡</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Consider increasing SIP by ₹2,000 to reach retirement goal faster
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity & Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({recentAlerts.length})</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'SIP', desc: 'Large Cap Fund Investment', amount: '+₹5,000', time: '2 hours ago', status: 'success' },
                    { type: 'Expense', desc: 'Grocery Shopping', amount: '-₹1,200', time: '1 day ago', status: 'expense' },
                    { type: 'Dividend', desc: 'HDFC Equity Fund Dividend', amount: '+₹850', time: '3 days ago', status: 'income' },
                    { type: 'Goal', desc: 'Emergency Fund Milestone', amount: '₹75,000', time: '1 week ago', status: 'milestone' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`
                          p-2 rounded-lg text-white text-xs font-medium
                          ${activity.status === 'success' ? 'bg-success' :
                            activity.status === 'expense' ? 'bg-error' :
                            activity.status === 'income' ? 'bg-chart-2' : 'bg-warning'}
                        `}>
                          {activity.type}
                        </div>
                        <div>
                          <p className="font-medium">{activity.desc}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        activity.amount.includes('+') ? 'text-success' :
                        activity.amount.includes('-') ? 'text-error' : 'text-foreground'
                      }`}>
                        {activity.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Important notifications and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert, index) => (
                    <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={alert.priority === 'high' ? 'destructive' : 'outline'}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        {alert.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Personalized recommendations based on your financial data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-card rounded-lg">
                    <h4 className="font-medium mb-2">Investment Opportunity</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Based on your risk profile, consider allocating 5% more to mid-cap funds for better returns.
                    </p>
                    <Button size="sm" variant="outline">Learn More</Button>
                  </div>
                  <div className="p-4 bg-gradient-card rounded-lg">
                    <h4 className="font-medium mb-2">Tax Optimization</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You can save up to ₹46,800 in taxes by investing ₹1.5L in ELSS funds before March.
                    </p>
                    <Button size="sm" variant="outline">Calculate Savings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;