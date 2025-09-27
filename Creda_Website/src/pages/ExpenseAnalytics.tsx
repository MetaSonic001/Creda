import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Eye,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AdvancedLineChart } from '@/components/charts/AdvancedLineChart';
import { AdvancedPieChart } from '@/components/charts/AdvancedPieChart';

interface ExpenseData {
  category: string;
  budget: number;
  spent: number;
  alert: 'normal' | 'medium' | 'high';
  transactions: number;
  avgTransaction: number;
  color: string;
}

interface AnomalyAlert {
  type: 'unusual_spend' | 'category_spike' | 'frequency_change';
  category: string;
  amount: number;
  confidence: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

const mockExpenseData: ExpenseData[] = [
  {
    category: 'Food & Dining',
    budget: 15000,
    spent: 18200,
    alert: 'high',
    transactions: 45,
    avgTransaction: 404,
    color: '#ef4444'
  },
  {
    category: 'Transportation',
    budget: 8000,
    spent: 6500,
    alert: 'normal',
    transactions: 28,
    avgTransaction: 232,
    color: '#10b981'
  },
  {
    category: 'Entertainment',
    budget: 5000,
    spent: 7800,
    alert: 'medium',
    transactions: 12,
    avgTransaction: 650,
    color: '#f59e0b'
  },
  {
    category: 'Shopping',
    budget: 12000,
    spent: 10200,
    alert: 'normal',
    transactions: 18,
    avgTransaction: 567,
    color: '#3b82f6'
  },
  {
    category: 'Healthcare',
    budget: 3000,
    spent: 4500,
    alert: 'medium',
    transactions: 6,
    avgTransaction: 750,
    color: '#8b5cf6'
  },
  {
    category: 'Utilities & Bills',
    budget: 6000,
    spent: 5800,
    alert: 'normal',
    transactions: 8,
    avgTransaction: 725,
    color: '#06b6d4'
  }
];

const mockAnomalies: AnomalyAlert[] = [
  {
    type: 'unusual_spend',
    category: 'Food & Dining',
    amount: 3200,
    confidence: 0.89,
    description: 'Restaurant spending 60% higher than usual pattern',
    severity: 'high'
  },
  {
    type: 'category_spike',
    category: 'Entertainment',
    amount: 2800,
    confidence: 0.76,
    description: 'Entertainment expenses spiked this weekend',
    severity: 'medium'
  },
  {
    type: 'frequency_change',
    category: 'Shopping',
    amount: 1500,
    confidence: 0.65,
    description: 'Shopping frequency increased by 40% this month',
    severity: 'low'
  }
];

const monthlyTrendData = [
  { name: 'Jan', value: 58400, budget: 60000, savings: 1600 },
  { name: 'Feb', value: 62100, budget: 60000, savings: -2100 },
  { name: 'Mar', value: 59200, budget: 60000, savings: 800 },
  { name: 'Apr', value: 57800, budget: 60000, savings: 2200 },  
  { name: 'May', value: 64300, budget: 60000, savings: -4300 },
  { name: 'Jun', value: 61200, budget: 60000, savings: -1200 }
];

const ExpenseAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const totalBudget = mockExpenseData.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = mockExpenseData.reduce((sum, item) => sum + item.spent, 0);
  const totalSavings = totalBudget - totalSpent;
  const budgetUtilization = (totalSpent / totalBudget) * 100;

  const highAlertCategories = mockExpenseData.filter(item => item.alert === 'high');
  const mediumAlertCategories = mockExpenseData.filter(item => item.alert === 'medium');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAlertColor = (alert: string) => {
    switch (alert) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      default: return 'text-success';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'unusual_spend': return <TrendingUp className="w-4 h-4" />;
      case 'category_spike': return <BarChart3 className="w-4 h-4" />;
      case 'frequency_change': return <Zap className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const pieChartData = mockExpenseData.map(item => ({
    name: item.category,
    value: item.spent,
    color: item.color
  }));

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
            Expense Analytics 📊
          </motion.h1>
          <p className="text-muted-foreground mt-2">
            AI-powered spending analysis with anomaly detection
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Anomaly Alerts */}
      {mockAnomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-warning-foreground">
                  <strong>{mockAnomalies.length} spending anomalies detected</strong>
                </span>
                <Button variant="ghost" size="sm">
                  <Eye className="mr-2 w-4 h-4" />
                  View Details
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Budget
              </CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Allocated for {mockExpenseData.length} categories
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-error" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-error mt-1">
                {budgetUtilization.toFixed(1)}% of budget used
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining Budget
              </CardTitle>
              <TrendingDown className={`w-4 h-4 ${totalSavings >= 0 ? 'text-success' : 'text-error'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalSavings >= 0 ? 'text-success' : 'text-error'}`}>
                {formatCurrency(Math.abs(totalSavings))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalSavings >= 0 ? 'Under budget' : 'Over budget'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Alerts
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {highAlertCategories.length + mediumAlertCategories.length}
              </div>
              <p className="text-xs text-warning mt-1">
                Categories need attention
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="anomalies">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Spending Distribution
                </CardTitle>
                <CardDescription>
                  Category-wise expense breakdown for {selectedPeriod}
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="h-80">
                <AdvancedPieChart data={pieChartData} title="Spending Distribution" />
              </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-success" />
                  Budget vs Actual
                </CardTitle>
                <CardDescription>
                  Compare budgeted vs actual spending
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockExpenseData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.alert === 'high' ? 'destructive' : 
                                        item.alert === 'medium' ? 'secondary' : 'outline'}>
                            {item.alert}
                          </Badge>
                          <span className={`text-sm font-semibold ${getAlertColor(item.alert)}`}>
                            {formatCurrency(item.spent)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={(item.spent / item.budget) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Budget: {formatCurrency(item.budget)}</span>
                          <span>
                            {item.spent > item.budget ? '+' : ''}
                            {formatCurrency(item.spent - item.budget)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockExpenseData.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{category.category}</CardTitle>
                      <Badge variant={category.alert === 'high' ? 'destructive' : 
                                    category.alert === 'medium' ? 'secondary' : 'outline'}>
                        {category.alert}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Spent vs Budget</span>
                        <span className={`font-medium ${getAlertColor(category.alert)}`}>
                          {((category.spent / category.budget) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(category.spent / category.budget) * 100} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatCurrency(category.spent)}</span>
                        <span>{formatCurrency(category.budget)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-semibold">{category.transactions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Amount</p>
                        <p className="font-semibold">{formatCurrency(category.avgTransaction)}</p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Variance:</span>
                        <span className={getAlertColor(category.alert)}>
                          {category.spent > category.budget ? '+' : ''}
                          {formatCurrency(category.spent - category.budget)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Monthly Spending Trends
              </CardTitle>
              <CardDescription>
                Track your spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <AdvancedLineChart 
                  data={monthlyTrendData} 
                  title="Monthly Spending Trend"
                  description="Track your spending patterns over time"
                  valuePrefix="₹"
                  showTrend={true}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Spending Insights</CardTitle>
                <CardDescription>Key patterns in your expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-info" />
                      <span className="text-sm font-medium">Weekend Spending</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      40% of your entertainment expenses occur on weekends
                    </p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">Utility Savings</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You've reduced utility costs by 12% compared to last month
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">Month-End Pattern</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Spending typically increases by 25% in the last week of the month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Budget Optimization Tips</CardTitle>
                <CardDescription>AI-generated recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-card rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Smart Savings Tip</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Switch to meal prep on Sundays to save ₹5,200 monthly on dining
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-card rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <PieChart className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Budget Reallocation</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Move ₹2,000 from shopping to emergency fund for better balance
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-card rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Filter className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Subscription Audit</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cancel unused subscriptions to save ₹1,800 monthly
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                AI Anomaly Detection
              </CardTitle>
              <CardDescription>
                Machine learning-powered spending pattern analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {mockAnomalies.map((anomaly, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-4 rounded-lg border-l-4
                      ${anomaly.severity === 'high' ? 'border-l-error bg-error/5' :
                        anomaly.severity === 'medium' ? 'border-l-warning bg-warning/5' :
                        'border-l-info bg-info/5'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-lg
                        ${anomaly.severity === 'high' ? 'bg-error text-white' :
                          anomaly.severity === 'medium' ? 'bg-warning text-white' :
                          'bg-info text-white'}
                      `}>
                        {getAnomalyIcon(anomaly.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">
                            {anomaly.type.replace('_', ' ')} in {anomaly.category}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {(anomaly.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                            <Badge variant={anomaly.severity === 'high' ? 'destructive' : 
                                          anomaly.severity === 'medium' ? 'secondary' : 'outline'}>
                              {anomaly.severity}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {anomaly.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Amount: {formatCurrency(anomaly.amount)}
                          </span>
                          <Button variant="ghost" size="sm">
                            View Transactions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-6 border-t">
                <div className="text-center space-y-4">
                  <div className="p-6 bg-gradient-card rounded-lg">
                    <h3 className="text-lg font-semibold text-gradient mb-2">
                      Advanced AI Analysis
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our machine learning algorithms analyze your spending patterns 24/7 
                      to detect unusual activity and provide personalized insights.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">97.3%</p>
                        <p className="text-xs text-muted-foreground">Accuracy Rate</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-success">₹12,400</p>
                        <p className="text-xs text-muted-foreground">Potential Savings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-info">24/7</p>
                        <p className="text-xs text-muted-foreground">Monitoring</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="hero" className="w-full max-w-md">
                    <Zap className="mr-2" />
                    Get Personalized Insights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseAnalytics;