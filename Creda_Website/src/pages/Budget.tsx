import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, TrendingUp, AlertTriangle, Mic, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiService, UserProfile } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Budget: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [budgetData, setBudgetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userProfile: UserProfile = {
    age: 32, income: 800000, savings: 250000, dependents: 1, risk_tolerance: 3
  };

  const mockExpenses = [
    { category: "food", amount: 15000, description: "Monthly groceries" },
    { category: "transport", amount: 8000, description: "Fuel and maintenance" },
    { category: "entertainment", amount: 5000, description: "Movies and dining" }
  ];

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    setIsLoading(true);
    try {
      const budget = await ApiService.optimizeBudget(userProfile, mockExpenses);
      setBudgetData(budget);
    } catch (error) {
      toast({ title: "Budget Error", description: "Using offline data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                   className="text-3xl font-bold text-gradient">
          Smart Budget Manager 💰
        </motion.h1>
        <div className="flex gap-3">
          <Button variant="voice" onClick={() => toast({ title: "Creda Activated" })}>
            <Mic className="mr-2" /> Ask Creda
          </Button>
          <Button variant="outline" onClick={fetchBudgetData}>
            <RefreshCw className="mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-primary" />
              AI Budget Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(budgetData?.adaptive_allocation || {needs: 0.50, wants: 0.30, savings: 0.20})
              .map(([category, percentage]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="capitalize">{category}</span>
                  <span>{((typeof percentage === 'number' ? percentage : 0) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(typeof percentage === 'number' ? percentage : 0) * 100} className="h-3" />
              </div>
            ))}
            <div className="pt-4 border-t">
              <Badge variant="secondary">AI Confidence: {((budgetData?.confidence_score || 0.87) * 100).toFixed(0)}%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockExpenses.map((expense, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{expense.category}</p>
                    <p className="text-sm text-muted-foreground">{expense.description}</p>
                  </div>
                  <span className="font-semibold">₹{expense.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Budget;