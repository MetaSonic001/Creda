import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SlidersHorizontal, ArrowUpRight, AlertTriangle, Lightbulb, Plus, Utensils, Car, Plane, Receipt } from 'lucide-react-native';
import Sparkline from '~/components/charts/Sparkline';
import DonutChart from '~/components/charts/DonutChart';
import ProgressBar from '~/components/charts/ProgressBar';
import { useTransactions } from '~/hooks/queries';
import AddExpenseForm from '~/components/forms/AddExpenseForm';
import { H4, P, Small } from '~/components/ui/typography';
import ExpenseBarChart from '~/components/charts/BarChart';

// dynamic data computed from SQLite

// --- HELPER COMPONENTS ---
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food': return <Utensils size={18} className="text-foreground" />;
    case 'Travel': return <Plane size={18} className="text-foreground" />;
    case 'Bills': return <Receipt size={18} className="text-foreground" />;
    case 'Entertainment': return <Utensils size={18} className="text-foreground" />; // Placeholder
    default: return <Receipt size={18} className="text-foreground" />;
  }
}

// --- MAIN EXPENSES COMPONENT ---
export default function ExpensesScreen() {
  const { data: txs = [] } = useTransactions();
  const [showAdd, setShowAdd] = useState(false);

  const totalSpent = useMemo(() => txs.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + Math.abs(Number(t.amount)), 0), [txs]);
  const budget = 0;
  const comparison = 0;
  const spentPercentage = budget ? (totalSpent / budget) * 100 : 0;

  // Generate dynamic sparkline data from recent transactions
  const sparklineData = useMemo(() => {
    // For demo purposes, let's use the actual transaction dates from the data
    const transactionDates = [...new Set(txs.map((tx: any) => tx.date.slice(0, 10)))].sort();
    const last7TransactionDates = transactionDates.slice(-7);

    return last7TransactionDates.map(date => {
      return txs
        .filter((tx: any) => tx.date.slice(0, 10) === date && tx.type === 'expense')
        .reduce((sum, tx: any) => sum + Math.abs(Number(tx.amount)), 0);
    });
  }, [txs]);

  const categoryAgg = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of txs) {
      if (t.type !== 'expense') continue;
      const key = String(t.category_id ?? 'Other');
      map.set(key, (map.get(key) ?? 0) + Math.abs(Number(t.amount)));
    }
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0) || 1;
    const palette = ['#00b386', '#2dd4bf', '#99f6e4', '#facc15', '#60a5fa'];
    return Array.from(map.entries()).map(([label, amount], i) => ({ label, amount, value: Math.round((amount / total) * 100), color: palette[i % palette.length] }));
  }, [txs]);

  return (
    <>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Monthly Expense Summary */}
        <View className="px-4">
          <View className="bg-card rounded-xl overflow-hidden border border-border">
            <View className="p-4">
              <Small className="text-muted-foreground">Total Spent this Month</Small>
              <H4 className="mt-1">₹{totalSpent.toLocaleString('en-IN')}</H4>
              <View className="flex-row items-center mt-2">
                <ArrowUpRight size={16} className="text-muted-foreground" />
                <Small className="text-muted-foreground ml-1">+{comparison}% compared to last month</Small>
              </View>
            </View>
            {sparklineData.length > 0 && (
              <View className='bg-background'>
                <ExpenseBarChart data={sparklineData} width={400} height={70} color={'#e53e3e'} />
              </View>
            )}
          </View>
        </View>

        {/* Category Breakdown */}
        <View className="px-4 mt-6">
          <View className="bg-card rounded-xl p-4 border border-border">
            <H4 className="mb-4">Category Breakdown</H4>
            {categoryAgg.length === 0 ? (
              <View className="py-8 items-center">
                <P className="text-muted-foreground text-center">No expense data available</P>
                <Small className="text-muted-foreground text-center">Add expenses to see category breakdown</Small>
              </View>
            ) : (
              <View className="flex-row items-center">
                <DonutChart data={categoryAgg as any} />
                <View className="flex-1 ml-6">
                  {(categoryAgg as any).map((item: any) => (
                    <View key={item.label} className="flex-row items-center mb-2 justify-between">
                      <View className="flex-row items-center">
                        <View style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full mr-2" />
                        <P>{item.label}</P>
                      </View>
                      <P>{item.value}%</P>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Transactions List */}
        <View className="px-4 mt-6">
          <H4 className="mb-3">Transactions</H4>
          <View className="bg-card rounded-xl border border-border">
            {txs.length === 0 ? (
              <View className="py-8 items-center">
                <P className="text-muted-foreground text-center">No transactions yet</P>
                <Small className="text-muted-foreground text-center">Add your first expense to get started</Small>
              </View>
            ) : (
              txs.map((tx: any, index: number) => (
                <TouchableOpacity key={tx.id} className={`p-4 flex-row items-center ${index < txs.length - 1 ? 'border-b border-border' : ''}`}>
                  <View className="w-10 h-10 bg-muted rounded-full items-center justify-center mr-3">
                    {getCategoryIcon('Bills')}
                  </View>
                  <View className="flex-1">
                    <P>{tx.notes ?? tx.type}</P>
                    <Small className="text-muted-foreground">{tx.date}</Small>
                  </View>
                  <P className={tx.type === 'expense' ? 'text-destructive' : 'text-success'}>{tx.type === 'expense' ? '-' : '+'}₹{Number(tx.amount).toLocaleString('en-IN')}</P>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Add Expense Button */}
        <View className="px-4 mt-6 mb-24">
          <TouchableOpacity className="bg-primary py-3 rounded-lg items-center" onPress={() => setShowAdd(true)}>
            <P className="text-primary-foreground">Add Expense</P>
          </TouchableOpacity>
        </View>

        {/* AI Insights / Nudges */}
        <View className="px-4 mt-6 mb-24">
          <H4 className="mb-3">Insights</H4>
          <View className="bg-amber-100/60 border border-amber-300 rounded-xl p-3 flex-row items-start mb-3">
            <AlertTriangle size={20} color="hsl(var(--warning))" className="mr-3 mt-1" />
            <View className="flex-1">
              <P className="text-amber-900">You’ve spent 80% of your Food budget in 20 days.</P>
              <TouchableOpacity className="bg-amber-400 py-1 px-3 rounded-md self-start mt-2">
                <Small className="text-amber-950">Adjust Budget</Small>
              </TouchableOpacity>
            </View>
          </View>
          <View className="bg-sky-100/60 border border-sky-300 rounded-xl p-3 flex-row items-start">
            <Lightbulb size={20} color="hsl(var(--accent))" className="mr-3 mt-1" />
            <View className="flex-1">
              <P className="text-sky-900">Consider setting a transport budget — avg spend is ₹2,500/month.</P>
              <TouchableOpacity className="bg-sky-300 py-1 px-3 rounded-md self-start mt-2">
                <Small className="text-sky-950">Create Budget</Small>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <AddExpenseForm visible={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}
