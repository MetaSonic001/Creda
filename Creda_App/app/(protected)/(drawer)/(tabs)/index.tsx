import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, AlertTriangle, CheckCircle, Info, ChevronRight, Goal, TrendingUp, TrendingDown } from 'lucide-react-native';
import Sparkline from '~/components/charts/Sparkline';
import DonutChart from '~/components/charts/DonutChart';
import ProgressBar from '~/components/charts/ProgressBar';
import { P, Small, Title, H4 } from '~/components/ui/typography';
import { useMonthlySpend, useBillsDueCount, usePortfolioSummary, useTransactions, useBills, useGoals, useBudgets } from '~/hooks/queries';

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const { data: spend = 0 } = useMonthlySpend();
  const { data: billsDue = 0 } = useBillsDueCount();
  const { data: summary } = usePortfolioSummary();
  const { data: transactions = [] } = useTransactions();
  const { data: bills = [] } = useBills();
  const { data: goals = [] } = useGoals();
  const { data: budgets = [] } = useBudgets();

  // Dynamic calculations
  const portfolioChange = `${(summary?.pct ?? 0).toFixed(1)}%`;
  const isPortfolioPositive = (summary?.pct ?? 0) >= 0;

  // Calculate budget data dynamically
  const budgetData = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyTransactions = transactions.filter((tx: any) =>
      tx.type === 'expense' && tx.date.startsWith(currentMonth)
    );

    const categorySpending = new Map();
    monthlyTransactions.forEach((tx: any) => {
      const category = tx.category_id ? `Category ${tx.category_id}` : 'Other';
      categorySpending.set(category, (categorySpending.get(category) || 0) + Math.abs(Number(tx.amount)));
    });

    const totalSpent = Array.from(categorySpending.values()).reduce((sum, amount) => sum + amount, 0);
    const totalBudgeted = budgets.reduce((sum, b: any) => sum + Number(b.amount), 0);

    return {
      categories: Array.from(categorySpending.entries()).map(([category, amount]) => ({
        category,
        spent: totalBudgeted > 0 ? (amount / totalBudgeted) * 100 : 0,
        isOver: totalBudgeted > 0 && amount > totalBudgeted
      })),
      totalSpent,
      totalBudgeted,
      overallProgress: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
    };
  }, [transactions, budgets]);

  // Calculate upcoming bills
  const upcomingBills = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return bills
      .filter((bill: any) => bill.status === 'pending')
      .map((bill: any) => {
        const dueDate = new Date(bill.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...bill,
          daysUntilDue,
          isUrgent: daysUntilDue <= 3
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 3);
  }, [bills]);

  // Calculate goals progress
  const goalsData = useMemo(() => {
    const activeGoals = goals.filter((g: any) => g.status === 'active');
    const totalIncome = transactions
      .filter((tx: any) => tx.type === 'income')
      .reduce((sum, tx: any) => sum + Math.abs(Number(tx.amount)), 0);

    return activeGoals.map((goal: any) => {
      const contributionPerGoal = activeGoals.length > 0 ? totalIncome / activeGoals.length : 0;
      const progress = goal.target_amount > 0 ? (contributionPerGoal / goal.target_amount) * 100 : 0;
      return {
        ...goal,
        progress: Math.min(100, progress)
      };
    }).slice(0, 3);
  }, [goals, transactions]);

  // Generate sparkline data from recent transactions
  const sparklineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().slice(0, 10);
    }).reverse();

    // For demo purposes, let's use the actual transaction dates from the data
    const transactionDates = [...new Set(transactions.map((tx: any) => tx.date.slice(0, 10)))].sort();
    const last7TransactionDates = transactionDates.slice(-7);

    return last7TransactionDates.map(date => {
      return transactions
        .filter((tx: any) => tx.date.slice(0, 10) === date && tx.type === 'expense')
        .reduce((sum, tx: any) => sum + Math.abs(Number(tx.amount)), 0);
    });
  }, [transactions]);
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Balance Overview Card */}
      <View className="px-4">
        <View className="bg-card border border-border rounded-xl overflow-hidden">
          <View className="p-4">
            <Small className="text-muted-foreground">Total Balance / Net Worth</Small>
            <H4 className="mt-1">₹{Number(summary?.value ?? 0).toLocaleString('en-IN')}</H4>
            <Small className="text-muted-foreground mt-1">Across accounts & investments.</Small>
          </View>
          {sparklineData.length > 0 && (
            <View className='bg-background'>
              <Sparkline data={sparklineData} width={500} height={70} color={'#00b386'} />
            </View>
          )}
        </View>
      </View>

      {/* Quick Summary Tiles */}
      <View className="flex-row justify-between gap-2 p-4 space-x-2">
        <View className="flex-1 border border-border bg-card rounded-lg p-3 shadow-sm">
          <Small className="text-muted-foreground">This Month Spend</Small>
          <P className="my-1">₹{Number(spend).toLocaleString('en-IN')}</P>
          <ProgressBar progress={70} isOver={budgetData.overallProgress > 100} />
        </View>
        <View className="flex-1 border border-border bg-card rounded-lg p-3 items-center justify-center shadow-sm">
          <Small className="text-muted-foreground">Portfolio</Small>
          <View className="flex-row items-center">
            <P className={`${isPortfolioPositive ? 'text-success' : 'text-destructive'}`}>{portfolioChange}</P>
            {isPortfolioPositive ? <TrendingUp size={16} className="text-success ml-1" /> : <TrendingDown size={16} className="text-destructive ml-1" />}
          </View>
          <Small className="text-muted-foreground">this month</Small>
        </View>
        <View className="flex-1 border border-border bg-card rounded-lg p-3 items-center justify-center shadow-sm">
          <Small className="text-muted-foreground">Upcoming Bills</Small>
          <View className="flex-row items-center">
            <P className="text-destructive">{billsDue} due</P>
            {billsDue > 0 && <View className="w-2 h-2 bg-destructive rounded-full ml-1" />}
          </View>
          <Small className="text-muted-foreground">in 3 days</Small>
        </View>
      </View>

      {/* Budgets Snapshot */}
      <View className="px-4 mt-2">
        <View className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <H4 className="mb-3">Budgets Snapshot</H4>
          {budgetData.categories.length === 0 ? (
            <View className="py-4 items-center">
              <P className="text-muted-foreground text-center">No budget data available</P>
              <Small className="text-muted-foreground text-center">Create budgets to track spending</Small>
            </View>
          ) : (
            <>
              {budgetData.categories.map((budget, index) => (
                <View key={budget.category} className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <P>{budget.category}</P>
                    <P className={`${budget.isOver ? 'text-destructive' : 'text-muted-foreground'}`}>{budget.spent.toFixed(1)}%</P>
                  </View>
                  <ProgressBar progress={budget.spent} isOver={budget.isOver} />
                </View>
              ))}
              <TouchableOpacity className="mt-2">
                <P className="text-primary text-center">View All Budgets →</P>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Portfolio Snapshot */}
      <View className="px-4 mt-4">
        <View className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <H4 className="mb-3">Portfolio Snapshot</H4>
          {summary && summary.value > 0 ? (
            <>
              <View className="flex-row items-center">
                <DonutChart data={[
                  { label: 'Equity', value: 60, color: '#00b386' },
                  { label: 'Debt', value: 25, color: '#2dd4bf' },
                  { label: 'MF', value: 15, color: '#99f6e4' },
                ]} />
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center mb-1">
                    <View style={{ backgroundColor: '#00b386' }} className="w-3 h-3 rounded-full mr-2" />
                    <P>Equity (60%)</P>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <View style={{ backgroundColor: '#2dd4bf' }} className="w-3 h-3 rounded-full mr-2" />
                    <P>Debt (25%)</P>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <View style={{ backgroundColor: '#99f6e4' }} className="w-3 h-3 rounded-full mr-2" />
                    <P>MF (15%)</P>
                  </View>
                </View>
              </View>
              <View className="mt-4 text-center">
                <Small className="text-muted-foreground">Total Value: ₹{Number(summary.value).toLocaleString('en-IN')}</Small>
                <Small className={isPortfolioPositive ? 'text-success' : 'text-destructive'}>
                  P&L: {isPortfolioPositive ? '+' : ''}₹{Number(summary.pnl).toLocaleString('en-IN')} ({portfolioChange})
                </Small>
              </View>
            </>
          ) : (
            <View className="py-4 items-center">
              <P className="text-muted-foreground text-center">No portfolio data available</P>
              <Small className="text-muted-foreground text-center">Add holdings to see portfolio overview</Small>
            </View>
          )}
          <TouchableOpacity className="mt-3">
            <P className="text-primary text-center">Go to Investments →</P>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Bills */}
      <View className="px-4 mt-4">
        <View className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <H4 className="mb-3">Upcoming Bills & Reminders</H4>
          {upcomingBills.length === 0 ? (
            <View className="py-4 items-center">
              <P className="text-muted-foreground text-center">No upcoming bills</P>
              <Small className="text-muted-foreground text-center">Add bills to track payments</Small>
            </View>
          ) : (
            upcomingBills.map(bill => (
              <View key={bill.id} className="flex-row items-center mb-3">
                <View className="flex-1">
                  <P>{bill.name}</P>
                  <Small className={`${bill.isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                    Due in {bill.daysUntilDue} days • ₹{Number(bill.amount).toLocaleString('en-IN')}
                  </Small>
                </View>
                <TouchableOpacity className="bg-primary py-2 px-4 rounded-lg">
                  <Small className="text-primary-foreground">Pay Now</Small>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Goals & Planning */}
      <View className="mt-4">
        <H4 className="px-4 mb-3">Goals & Planning</H4>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {goalsData.length === 0 ? (
            <View className="bg-card border border-border rounded-xl p-6 w-40 items-center">
              <Goal size={24} className="text-muted-foreground mb-2" />
              <P className="text-muted-foreground text-center text-sm">No active goals</P>
            </View>
          ) : (
            goalsData.map(goal => (
              <View key={goal.id} className="bg-card border border-border rounded-xl p-4 w-40 mr-3 shadow-sm">
                <Goal size={24} color="hsl(var(--primary))" />
                <P className="mt-2 text-sm" numberOfLines={2}>{goal.title}</P>
                <Small className="text-muted-foreground mt-1">{goal.progress.toFixed(1)}% complete</Small>
                <View className="mt-2">
                  <ProgressBar progress={goal.progress} />
                </View>
              </View>
            ))
          )}
          <TouchableOpacity className="bg-card rounded-xl p-4 w-40 justify-center items-center shadow-sm">
            <ChevronRight size={24} color="hsl(var(--primary))" />
            <P className="text-primary mt-2 text-center">View All Goals</P>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Alerts & Insights */}
      <View className="px-4 mt-4">
        <H4 className="mb-3">Alerts & Insights</H4>
        <View className="bg-amber-100/60 border border-amber-300 rounded-xl p-3 flex-row items-start mb-3">
          <AlertTriangle size={20} color="hsl(var(--warning))" className="mr-3 mt-1" />
          <View className="flex-1">
            <P className="text-amber-900">You’re overspending on dining.</P>
            <TouchableOpacity className="bg-amber-400 py-1 px-3 rounded-md self-start mt-2">
              <Small className="text-amber-950">Set Weekly Cap</Small>
            </TouchableOpacity>
          </View>
        </View>
        <View className="bg-emerald-100/60 border border-emerald-300 rounded-xl p-3 flex-row items-start mb-3">
          <CheckCircle size={20} color="hsl(var(--success))" className="mr-3 mt-1" />
          <View className="flex-1">
            <P className="text-emerald-900">Your SIP in XYZ Fund has gained 8% in 6 months.</P>
          </View>
        </View>
        <View className="bg-sky-100/60 border border-sky-300 rounded-xl p-3 flex-row items-start mb-3">
          <Info size={20} color="hsl(var(--accent))" className="mr-3 mt-1" />
          <View className="flex-1">
            <P className="text-sky-900">You may save tax by investing in ELSS.</P>
            <TouchableOpacity className="bg-sky-300 py-1 px-3 rounded-md self-start mt-2">
              <Small className="text-sky-950">Learn More</Small>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Fraud / Security Alerts */}
      <View className="px-4 mt-2 mb-8">
        <View className="bg-destructive/10 border border-destructive rounded-xl p-3 flex-row items-start">
          <AlertTriangle size={20} color="hsl(var(--destructive))" className="mr-3 mt-1" />
          <View className="flex-1">
            <P className="text-destructive">Unusual ₹50,000 UPI attempt detected.</P>
            <TouchableOpacity className="bg-destructive py-1 px-3 rounded-md self-start mt-2">
              <Small className="text-destructive-foreground">Review Transaction</Small>
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}
