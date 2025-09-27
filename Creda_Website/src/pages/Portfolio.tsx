import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  PieChart, 
  RotateCcw, 
  Target,
  AlertCircle,
  RefreshCw,
  Mic,
  Download,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiService, UserProfile } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Portfolio: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [rebalanceData, setRebalanceData] = useState<any>(null);
  const [showOptimization, setShowOptimization] = useState(false);

  // Mock user profile
  const userProfile: UserProfile = {
    age: 32,
    income: 800000,
    savings: 250000,
    dependents: 1,
    risk_tolerance: 3,
    goal_type: "retirement",
    time_horizon: 25
  };

  const currentHoldings = {
    large_cap_equity: 0.35,
    mid_cap_equity: 0.20,
    government_bonds: 0.25,
    corporate_bonds: 0.15,
    gold: 0.05
  };

  useEffect(() => {
    fetchPortfolioData();
    checkRebalancing();
  }, []);

  const fetchPortfolioData = async () => {
    setIsLoading(true);
    try {
      const portfolio = await ApiService.getPortfolioAllocation(userProfile);
      setPortfolioData(portfolio);
    } catch (error) {
      toast({
        title: "Portfolio Error",
        description: "Using offline data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkRebalancing = async () => {
    try {
      const rebalance = await ApiService.checkRebalancing({
        profile: userProfile,
        current_allocation: currentHoldings,
        threshold: 0.05
      });
      setRebalanceData(rebalance);
    } catch (error) {
      console.warn('Rebalancing check failed');
    }
  };

  const handleOptimize = async () => {
    setIsLoading(true);
    setShowOptimization(true);
    
    try {
      const optimizedPortfolio = await ApiService.portfolioOptimization({
        profile: userProfile,
        goals: ["retirement", "wealth_creation"],
        time_horizon_years: userProfile.time_horizon || 25
      });
      
      setPortfolioData(optimizedPortfolio);
      
      toast({
        title: "Portfolio Optimized! 🎯",
        description: "Your portfolio has been optimized using advanced AI algorithms."
      });
    } catch (error) {
      toast({
        title: "Optimization Error",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceQuery = () => {
    toast({
      title: "Voice Assistant Activated",
      description: "Ask me anything about your portfolio!"
    });
  };

  const allocationComparison = Object.entries(portfolioData?.allocation || {}).map(([asset, recommended]) => {
    const current = currentHoldings[asset as keyof typeof currentHoldings] || 0;
    const recommendedVal = typeof recommended === 'number' ? recommended : 0;
    const difference = recommendedVal - current;
    
    return {
      asset,
      current,
      recommended: recommendedVal,
      difference,
      status: Math.abs(difference) > 0.05 ? 'rebalance' : 'good'
    };
  });

  const portfolioMetrics = [
    {
      label: "Expected Return",
      value: `${((portfolioData?.expected_return || 0.12) * 100).toFixed(1)}%`,
      trend: "up",
      description: "Annual expected return"
    },
    {
      label: "Risk Score", 
      value: `${portfolioData?.risk_score || 6.5}/10`,
      trend: "stable",
      description: "Portfolio volatility measure"
    },
    {
      label: "Diversification",
      value: "85%",
      trend: "up", 
      description: "Asset class spread"
    },
    {
      label: "Rebalancing Alert",
      value: rebalanceData?.needs_rebalancing ? "Yes" : "No",
      trend: rebalanceData?.needs_rebalancing ? "warning" : "good",
      description: "Portfolio drift analysis"
    }
  ];

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
            Smart Portfolio Manager 📊
          </motion.h1>
          <p className="text-muted-foreground mt-2">
            AI-powered investment optimization using Markowitz theory
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="voice" size="lg" onClick={handleVoiceQuery}>
            <Mic className="mr-2" /> Ask Creda
          </Button>
          <Button variant="outline" size="lg" onClick={fetchPortfolioData}>
            <RefreshCw className="mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Rebalancing Alert */}
      {rebalanceData?.needs_rebalancing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              <strong>Rebalancing Recommended:</strong> Your portfolio has drifted {rebalanceData.drift_percentage}% 
              from the target allocation. Consider rebalancing to maintain optimal risk-return profile.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-effect hover:shadow-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <Badge variant={
                  metric.trend === 'up' ? 'default' : 
                  metric.trend === 'warning' ? 'secondary' : 'outline'
                }>
                  {metric.trend === 'up' ? '↗️' : 
                   metric.trend === 'warning' ? '⚠️' : '📊'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="allocation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="allocation">Current Allocation</TabsTrigger>
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
          <TabsTrigger value="rebalancing">Rebalancing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Current Allocation */}
        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Current Portfolio
                </CardTitle>
                <CardDescription>Your actual asset allocation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(currentHoldings).map(([asset, percentage]) => (
                  <div key={asset}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="capitalize">{asset.replace('_', ' ')}</span>
                      <span>{(percentage * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage * 100} className="h-3" />
                  </div>
                ))}
                <div className="pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground">
                    Total Portfolio Value: <span className="font-semibold">₹2,50,000</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-success" />
                  Recommended Allocation
                </CardTitle>
                <CardDescription>
                  AI-optimized for your profile: {portfolioData?.persona || "Balanced Investor"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(portfolioData?.allocation || currentHoldings).map(([asset, percentage]) => (
                  <div key={asset}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="capitalize">{asset.replace('_', ' ')}</span>
                      <span>{((typeof percentage === 'number' ? percentage : 0) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(typeof percentage === 'number' ? percentage : 0) * 100} className="h-3" />
                  </div>
                ))}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Expected Return</span>
                    <span className="font-semibold text-success">
                      {((portfolioData?.expected_return || 0.12) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Risk Score</span>
                    <span className="font-semibold">{portfolioData?.risk_score || 6.5}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Optimization */}
        <TabsContent value="optimization" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Portfolio Optimization Engine
              </CardTitle>
              <CardDescription>
                Advanced AI using Markowitz Modern Portfolio Theory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-8 bg-gradient-card rounded-lg">
                  <h3 className="text-2xl font-bold text-gradient mb-2">
                    Nobel Prize-Winning Mathematics
                  </h3>
                  <p className="text-muted-foreground">
                    Our AI implements Harry Markowitz's Modern Portfolio Theory, 
                    adapted for Indian markets with real-time data from NSE, BSE, and bond markets.
                  </p>
                </div>
                
                <Button 
                  size="xl" 
                  variant="hero" 
                  onClick={handleOptimize}
                  disabled={isLoading}
                  className="w-full max-w-md"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="mr-2" />
                  )}
                  Optimize Portfolio with AI
                </Button>
              </div>

              {showOptimization && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-success/10 rounded-lg border border-success/20"
                >
                  <h4 className="font-semibold text-success mb-4">✨ Optimization Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Expected Return Improvement</p>
                      <p className="text-xl font-bold text-success">+2.3%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Risk Reduction</p>
                      <p className="text-xl font-bold text-success">-15%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Processing Time</p>
                      <p className="text-xl font-bold text-primary">0.08s</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rebalancing */}
        <TabsContent value="rebalancing" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-warning" />
                Portfolio Rebalancing Analysis
              </CardTitle>
              <CardDescription>
                Compare current vs recommended allocations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {allocationComparison.map((item) => (
                  <div key={item.asset} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="capitalize font-medium">
                        {item.asset.replace('_', ' ')}
                      </span>
                      <Badge variant={item.status === 'rebalance' ? 'secondary' : 'outline'}>
                        {item.status === 'rebalance' ? 'Needs Rebalancing' : 'On Target'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="font-semibold">{(item.current * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Recommended</p>
                        <p className="font-semibold">{(item.recommended * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Difference</p>
                        <p className={`font-semibold ${
                          Math.abs(item.difference) > 0.05 
                            ? 'text-warning' 
                            : 'text-success'
                        }`}>
                          {item.difference > 0 ? '+' : ''}{(item.difference * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-6 border-t">
                  <Button variant="hero" className="w-full">
                    <RotateCcw className="mr-2" />
                    Execute Rebalancing
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Estimated transaction cost: ₹250 | Tax impact: Minimal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Portfolio performance analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-success">+12.5%</p>
                    <p className="text-sm text-muted-foreground">YTD Return</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">+8.7%</p>
                    <p className="text-sm text-muted-foreground">3Y CAGR</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sharpe Ratio</span>
                    <span className="font-semibold">1.24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Drawdown</span>
                    <span className="font-semibold text-error">-8.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alpha</span>
                    <span className="font-semibold text-success">+2.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beta</span>
                    <span className="font-semibold">0.89</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Benchmark Comparison</CardTitle>
                <CardDescription>vs Market Indices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Your Portfolio</span>
                    <Badge variant="default">+12.5%</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Nifty 50</span>
                    <Badge variant="outline">+10.2%</Badge>
                  </div>
                  <Progress value={61} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Nifty 500</span>
                    <Badge variant="outline">+11.8%</Badge>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-success font-medium">
                    📈 Outperforming benchmark by +2.3%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio;