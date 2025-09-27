import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Shield, 
  PiggyBank,
  Award,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HealthComponent {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  description: string;
  icon: React.ReactNode;
  recommendations: string[];
  weight: number;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  timeframe: string;
  category: string;
}

const healthComponents: HealthComponent[] = [
  {
    id: 'savings_rate',
    name: 'Savings Rate',
    score: 25,
    maxScore: 30,
    status: 'good',
    description: 'Percentage of income saved monthly',
    icon: <PiggyBank className="w-5 h-5" />,
    recommendations: [
      'Increase SIP amount by ₹5,000 monthly',
      'Set up automatic savings transfer',
      'Review and optimize recurring expenses'
    ],
    weight: 0.3
  },
  {
    id: 'emergency_fund',
    name: 'Emergency Fund',
    score: 15,
    maxScore: 25,
    status: 'needs_improvement',
    description: 'Liquid funds for 6+ months of expenses',
    icon: <Shield className="w-5 h-5" />,
    recommendations: [
      'Build emergency fund to 6 months of expenses',
      'Keep emergency funds in liquid investments',
      'Gradually increase from current 3 months coverage'
    ],
    weight: 0.25
  },
  {
    id: 'diversification',
    name: 'Portfolio Diversification',
    score: 18,
    maxScore: 20,
    status: 'excellent',
    description: 'Risk spread across asset classes',
    icon: <BarChart3 className="w-5 h-5" />,
    recommendations: [
      'Consider adding international exposure',
      'Maintain current asset allocation balance',
      'Review sector concentration quarterly'
    ],
    weight: 0.2
  },
  {
    id: 'age_allocation',
    name: 'Age-Appropriate Allocation',
    score: 14,
    maxScore: 25,
    status: 'poor',
    description: 'Asset allocation suitable for your age',
    icon: <Target className="w-5 h-5" />,
    recommendations: [
      'Increase equity allocation to 70-75%',
      'Reduce debt exposure for higher returns',
      'Follow age-based allocation strategy'
    ],
    weight: 0.25
  }
];

const mockRecommendations: Recommendation[] = [
  {
    priority: 'high',
    action: 'Build Emergency Fund',
    impact: '+12 points',
    timeframe: '3-6 months',
    category: 'Safety Net'
  },
  {
    priority: 'high',
    action: 'Increase Equity Allocation',
    impact: '+8 points',
    timeframe: '1-2 months',
    category: 'Growth'
  },
  {
    priority: 'medium',
    action: 'Optimize Tax Investments',
    impact: '+6 points',
    timeframe: '2-3 months',
    category: 'Tax Efficiency'
  },
  {
    priority: 'medium',
    action: 'Add International Funds',
    impact: '+4 points',
    timeframe: '3-4 months',
    category: 'Diversification'
  },
  {
    priority: 'low',
    action: 'Review Insurance Coverage',
    impact: '+3 points',
    timeframe: '1 month',
    category: 'Protection'
  }
];

const peerComparison = {
  yourScore: 72,
  ageGroup: {
    average: 68,
    range: '30-35 years'
  },
  incomeGroup: {
    average: 74,
    range: '₹8-12 lakhs'
  },
  topPerformers: 85,
  percentile: 65
};

const FinancialHealth: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const totalScore = healthComponents.reduce((sum, comp) => sum + comp.score, 0);
  const maxTotalScore = healthComponents.reduce((sum, comp) => sum + comp.maxScore, 0);
  const healthPercentage = (totalScore / maxTotalScore) * 100;

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    return 'C';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-info';
      case 'needs_improvement': return 'text-warning';
      case 'poor': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return <Badge className="bg-success text-white">Excellent</Badge>;
      case 'good': return <Badge className="bg-info text-white">Good</Badge>;
      case 'needs_improvement': return <Badge className="bg-warning text-white">Needs Work</Badge>;
      case 'poor': return <Badge className="bg-error text-white">Poor</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-error bg-error/5';
      case 'medium': return 'border-l-warning bg-warning/5';
      case 'low': return 'border-l-info bg-info/5';
      default: return 'border-l-muted bg-muted/5';
    }
  };

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
            Financial Health Dashboard 🏥
          </motion.h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive analysis of your financial wellness with AI insights
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Zap className="mr-2" />
          Get Health Report
        </Button>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1"
        >
          <Card className="glass-effect text-center">
            <CardHeader>
              <CardTitle className="text-xl">Your Financial Health Score</CardTitle>
              <CardDescription>Based on 4 key financial factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <div className="w-32 h-32 mx-auto relative">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - healthPercentage / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{totalScore}</div>
                      <div className="text-sm text-muted-foreground">/ {maxTotalScore}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Grade: {getGrade(healthPercentage)}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {healthPercentage.toFixed(1)}% Health Score
                </p>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Compared to peers:</span>
                  <span className="font-semibold text-success">+4 points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Percentile rank:</span>
                  <span className="font-semibold">{peerComparison.percentile}th</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                Health Components Breakdown
              </CardTitle>
              <CardDescription>
                Detailed analysis of each financial health factor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {healthComponents.map((component, index) => (
                <motion.div
                  key={component.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedComponent(selectedComponent === component.id ? null : component.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-primary rounded-lg text-white">
                        {component.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{component.name}</h4>
                        <p className="text-sm text-muted-foreground">{component.description}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(component.status)}
                      <p className="text-sm font-semibold">
                        {component.score}/{component.maxScore} points
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress 
                      value={(component.score / component.maxScore) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Score: {((component.score / component.maxScore) * 100).toFixed(1)}%</span>
                      <span>Weight: {(component.weight * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {selectedComponent === component.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t space-y-2"
                    >
                      <h5 className="font-medium text-sm">Recommendations:</h5>
                      {component.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{rec}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
          <TabsTrigger value="peer-comparison">Peer Analysis</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Personalized Action Plan
              </CardTitle>
              <CardDescription>
                AI-generated recommendations to improve your financial health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 
                                        rec.priority === 'medium' ? 'secondary' : 'outline'}>
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        
                        <h4 className="font-semibold mb-1">{rec.action}</h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Impact:</span> {rec.impact}
                          </div>
                          <div>
                            <span className="font-medium">Timeframe:</span> {rec.timeframe}
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-card rounded-lg text-center">
                <h3 className="text-lg font-semibold text-gradient mb-2">
                  Potential Health Score Improvement
                </h3>
                <p className="text-3xl font-bold text-success mb-2">+33 points</p>
                <p className="text-sm text-muted-foreground mb-4">
                  By following our AI recommendations, you could achieve a health score of 105/100
                </p>
                <Button variant="hero" className="w-full max-w-md">
                  Start Improvement Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peer-comparison" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-info" />
                  Peer Comparison
                </CardTitle>
                <CardDescription>
                  How you stack up against similar profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Your Score</p>
                      <p className="text-sm text-muted-foreground">Current health score</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{peerComparison.yourScore}</p>
                      <Badge variant="secondary">You</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Age Group Average</p>
                      <p className="text-sm text-muted-foreground">{peerComparison.ageGroup.range}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{peerComparison.ageGroup.average}</p>
                      <Badge variant="outline">
                        {peerComparison.yourScore > peerComparison.ageGroup.average ? '+' : ''}
                        {peerComparison.yourScore - peerComparison.ageGroup.average}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Income Group Average</p>
                      <p className="text-sm text-muted-foreground">{peerComparison.incomeGroup.range}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{peerComparison.incomeGroup.average}</p>
                      <Badge variant="outline">
                        {peerComparison.yourScore > peerComparison.incomeGroup.average ? '+' : ''}
                        {peerComparison.yourScore - peerComparison.incomeGroup.average}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                    <div>
                      <p className="font-medium">Top Performers</p>
                      <p className="text-sm text-muted-foreground">95th percentile</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-success">{peerComparison.topPerformers}</p>
                      <Badge className="bg-success text-white">Goal</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t text-center">
                  <p className="text-lg font-semibold">
                    You're in the {peerComparison.percentile}th percentile
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Better than {peerComparison.percentile}% of similar profiles
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Benchmarking Insights</CardTitle>
                <CardDescription>Key areas where you excel or lag</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">Diversification Excellence</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your portfolio diversification is 15% better than age group average
                    </p>
                  </div>
                  
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">Savings Rate Champion</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You save 8% more than peers in your income bracket
                    </p>
                  </div>
                  
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">Emergency Fund Gap</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Emergency fund is 25% below recommended level for your profile
                    </p>
                  </div>
                  
                  <div className="p-3 bg-error/10 rounded-lg border border-error/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-error" />
                      <span className="text-sm font-medium">Asset Allocation Needs Work</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Age-appropriate allocation lags 18% behind best practices
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Health Score Progress
              </CardTitle>
              <CardDescription>
                Track your financial health improvements over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-card rounded-lg">
                    <p className="text-2xl font-bold text-success">+8</p>
                    <p className="text-sm text-muted-foreground">Points this month</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-card rounded-lg">
                    <p className="text-2xl font-bold text-info">+15</p>
                    <p className="text-sm text-muted-foreground">Points this quarter</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-card rounded-lg">
                    <p className="text-2xl font-bold text-primary">+28</p>
                    <p className="text-sm text-muted-foreground">Points this year</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Improvements</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div className="flex-1">
                        <p className="font-medium">Emergency Fund Milestone</p>
                        <p className="text-sm text-muted-foreground">Reached 3 months coverage (+5 points)</p>
                      </div>
                      <Badge className="bg-success text-white">+5</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-info/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-info" />
                      <div className="flex-1">
                        <p className="font-medium">Increased SIP Allocation</p>
                        <p className="text-sm text-muted-foreground">Boosted monthly SIP by ₹5,000 (+3 points)</p>
                      </div>
                      <Badge className="bg-info text-white">+3</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button variant="hero" className="w-full">
                    <BarChart3 className="mr-2" />
                    View Detailed Progress Report
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

export default FinancialHealth;