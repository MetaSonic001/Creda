import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Home, 
  Car, 
  GraduationCap, 
  PiggyBank,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Calculator,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: Date;
  category: 'home' | 'vehicle' | 'education' | 'retirement' | 'vacation' | 'emergency';
  priority: 'high' | 'medium' | 'low';
  monthlyRequired: number;
  probability: number;
  status: 'on_track' | 'ahead' | 'behind' | 'completed';
}

const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'House Down Payment',
    target: 2500000,
    current: 850000,
    deadline: new Date('2026-12-31'),
    category: 'home',
    priority: 'high',
    monthlyRequired: 42000,
    probability: 78,
    status: 'on_track'
  },
  {
    id: '2',
    name: 'Emergency Fund',
    target: 600000,
    current: 450000,
    deadline: new Date('2024-06-30'),
    category: 'emergency',
    priority: 'high',
    monthlyRequired: 25000,
    probability: 92,
    status: 'ahead'
  },
  {
    id: '3',
    name: 'New Car',
    target: 800000,
    current: 120000,
    deadline: new Date('2025-12-31'),
    category: 'vehicle',
    priority: 'medium',
    monthlyRequired: 28000,
    probability: 65,
    status: 'behind'
  },
  {
    id: '4',
    name: "Child's Education",
    target: 1500000,
    current: 200000,
    deadline: new Date('2030-12-31'),
    category: 'education',
    priority: 'high',
    monthlyRequired: 18000,
    probability: 85,
    status: 'on_track'
  },
  {
    id: '5',
    name: 'Retirement Fund',
    target: 10000000,
    current: 2500000,
    deadline: new Date('2055-12-31'),
    category: 'retirement',
    priority: 'medium',
    monthlyRequired: 20000,
    probability: 88,
    status: 'on_track'
  }
];

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const getIcon = (category: string) => {
    switch (category) {
      case 'home': return <Home className="w-5 h-5" />;
      case 'vehicle': return <Car className="w-5 h-5" />;
      case 'education': return <GraduationCap className="w-5 h-5" />;
      case 'retirement': return <PiggyBank className="w-5 h-5" />;
      case 'emergency': return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'ahead': return 'text-success';
      case 'on_track': return 'text-primary';
      case 'behind': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-success text-white">Completed</Badge>;
      case 'ahead': return <Badge className="bg-success text-white">Ahead</Badge>;
      case 'on_track': return <Badge variant="outline">On Track</Badge>;
      case 'behind': return <Badge className="bg-warning text-white">Behind</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.ceil(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ${diffMonths % 12} month${diffMonths % 12 !== 1 ? 's' : ''}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else {
      return 'Overdue';
    }
  };

  const totalGoalsValue = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalProgress = (totalCurrentValue / totalGoalsValue) * 100;
  const completedGoals = goals.filter(g => g.status === 'completed').length;

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
            Financial Goal Planner 🎯
          </motion.h1>
          <p className="text-muted-foreground mt-2">
            AI-powered goal tracking with Monte Carlo probability analysis
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg">
              <Plus className="mr-2" /> Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Financial Goal</DialogTitle>
              <DialogDescription>
                Set up a new goal with AI-powered recommendations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input id="goal-name" placeholder="e.g., Dream Vacation" />
              </div>
              <div>
                <Label htmlFor="goal-amount">Target Amount</Label>
                <Input id="goal-amount" type="number" placeholder="500000" />
              </div>
              <div>
                <Label htmlFor="goal-category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="goal-deadline">Target Date</Label>
                <Input id="goal-deadline" type="date" />
              </div>
              <Button className="w-full" onClick={() => setShowAddDialog(false)}>
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Goals Value
              </CardTitle>
              <Target className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalGoalsValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {goals.length} goals
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Saved
              </CardTitle>
              <DollarSign className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
              <p className="text-xs text-success mt-1">
                {totalProgress.toFixed(1)}% of total goals
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Goals Completed
              </CardTitle>
              <Award className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of {goals.length} goals
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Success Rate
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(goals.reduce((sum, g) => sum + g.probability, 0) / goals.length).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Monte Carlo analysis
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Goal Overview</TabsTrigger>
          <TabsTrigger value="planning">AI Planning</TabsTrigger>
          <TabsTrigger value="tracking">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect hover:shadow-glow transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedGoal(goal)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-primary rounded-lg text-white">
                          {getIcon(goal.category)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{goal.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Due: {formatDate(goal.deadline)}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(goal.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">
                          {calculateProgress(goal.current, goal.target).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={calculateProgress(goal.current, goal.target)} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatCurrency(goal.current)}</span>
                        <span>{formatCurrency(goal.target)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Monthly Required</p>
                        <p className="font-semibold">{formatCurrency(goal.monthlyRequired)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Probability</p>
                        <p className={`font-semibold ${getStatusColor(goal.status)}`}>
                          {goal.probability}%
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getTimeRemaining(goal.deadline)} remaining
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                AI Goal Planning Assistant
              </CardTitle>
              <CardDescription>
                Advanced Monte Carlo simulation for goal achievement probability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold">Smart Recommendations</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <span className="text-sm font-medium">Increase Emergency Fund SIP</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Boost monthly allocation by ₹5,000 to reach target 2 months earlier
                      </p>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-warning rounded-full" />
                        <span className="text-sm font-medium">Optimize Car Goal Timeline</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Consider extending timeline by 6 months to reduce monthly burden
                      </p>
                    </div>
                    <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-info rounded-full" />
                        <span className="text-sm font-medium">Tax-Efficient Investments</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use ELSS funds for home down payment to save ₹46,800 in taxes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Goal Prioritization Matrix</h4>
                  <div className="space-y-3">
                    {goals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gradient-primary rounded text-white">
                            {getIcon(goal.category)}
                          </div>
                          <span className="text-sm font-medium">{goal.name}</span>
                        </div>
                        <Badge variant={goal.priority === 'high' ? 'default' : 'outline'}>
                          {goal.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button variant="hero" className="w-full">
                  <Zap className="mr-2" />
                  Generate AI Optimization Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Monthly Progress Tracker</CardTitle>
                <CardDescription>Track your goal contributions this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.slice(0, 4).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{goal.name}</span>
                        <Badge variant="outline">₹{goal.monthlyRequired.toLocaleString()}</Badge>
                      </div>
                      <Progress 
                        value={Math.random() * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        ₹{Math.floor(goal.monthlyRequired * 0.7).toLocaleString()} contributed this month
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Achievement Milestones</CardTitle>
                <CardDescription>Celebrate your financial wins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                    <Award className="w-8 h-8 text-warning" />
                    <div>
                      <p className="font-medium">Emergency Fund 50% Complete! 🎉</p>
                      <p className="text-xs text-muted-foreground">Achieved 3 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <Target className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">House Fund 25% Milestone</p>
                      <p className="text-xs text-muted-foreground">₹1,25,000 more to next milestone</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Perfect Month Streak</p>
                      <p className="text-xs text-muted-foreground">3 months of on-time contributions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Goals;