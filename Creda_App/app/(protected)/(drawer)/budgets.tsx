import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { H4, P, Small } from '~/components/ui/typography';
import { useBudgets, useDeleteBudget, useTransactions } from '~/hooks/queries';
import AddBudgetForm from '~/components/forms/AddBudgetForm';
import ProgressBar from '~/components/charts/ProgressBar';
import { Calendar, Target, Trash2, Plus } from 'lucide-react-native';

export default function BudgetsScreen() {
  const { data: list = [] } = useBudgets();
  const { data: transactions = [] } = useTransactions();
  const remove = useDeleteBudget();
  const [showAdd, setShowAdd] = useState(false);

  const budgetsWithSpending = useMemo(() => {
    return list.map((budget: any) => {
      // Calculate spending for this budget period
      const startDate = budget.start_date ? new Date(budget.start_date) : new Date();
      const endDate = budget.end_date ? new Date(budget.end_date) : new Date();
      
      const spent = transactions
        .filter((tx: any) => {
          const txDate = new Date(tx.date);
          return tx.type === 'expense' && 
                 txDate >= startDate && 
                 txDate <= endDate &&
                 (budget.category_id ? tx.category_id === budget.category_id : true);
        })
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = Math.max(0, budget.amount - spent);

      return {
        ...budget,
        spent,
        progress: Math.min(100, progress),
        remaining,
        isOverBudget: spent > budget.amount
      };
    });
  }, [list, transactions]);

  const totalBudgeted = list.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
  const totalSpent = budgetsWithSpending.reduce((sum: number, b: any) => sum + b.spent, 0);
  const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View className="px-4 mt-4">
          <View className="bg-card border border-border rounded-xl p-4 mb-4">
            <H4 className="mb-3">Budget Overview</H4>
            <View className="flex-row justify-between items-center mb-2">
              <Small className="text-muted-foreground">Total Budgeted</Small>
              <P>₹{totalBudgeted.toLocaleString('en-IN')}</P>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Small className="text-muted-foreground">Total Spent</Small>
              <P className={totalSpent > totalBudgeted ? 'text-destructive' : 'text-foreground'}>
                ₹{totalSpent.toLocaleString('en-IN')}
              </P>
            </View>
            <View className="mt-3">
              <ProgressBar progress={overallProgress} isOver={totalSpent > totalBudgeted} />
              <Small className="text-muted-foreground mt-1">
                {totalSpent > totalBudgeted ? 'Over budget by ' : 'Remaining: '}
                ₹{Math.abs(totalBudgeted - totalSpent).toLocaleString('en-IN')}
              </Small>
            </View>
          </View>
        </View>

        {/* Individual Budgets */}
        <View className="px-4">
          <H4 className="mb-3">Active Budgets</H4>
          {budgetsWithSpending.length === 0 ? (
            <View className="bg-card border border-border rounded-xl p-6 items-center">
              <Target size={48} className="text-muted-foreground mb-3" />
              <P className="text-muted-foreground text-center mb-2">No budgets created yet</P>
              <Small className="text-muted-foreground text-center">Create your first budget to start tracking expenses</Small>
            </View>
          ) : (
            budgetsWithSpending.map((budget: any) => (
              <View key={budget.id} className="bg-card border border-border rounded-xl p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <P className="font-medium">Budget #{budget.id}</P>
                    <Small className="text-muted-foreground">
                      {budget.start_date} → {budget.end_date ?? 'ongoing'} • {budget.recurrence}
                    </Small>
                  </View>
                  <TouchableOpacity 
                    className="bg-destructive/10 p-2 rounded-lg" 
                    onPress={() => remove.mutate(budget.id)}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row justify-between items-center mb-2">
                  <Small className="text-muted-foreground">Amount</Small>
                  <P>₹{Number(budget.amount).toLocaleString('en-IN')}</P>
                </View>
                
                <View className="flex-row justify-between items-center mb-2">
                  <Small className="text-muted-foreground">Spent</Small>
                  <P className={budget.isOverBudget ? 'text-destructive' : 'text-foreground'}>
                    ₹{budget.spent.toLocaleString('en-IN')}
                  </P>
                </View>
                
                <View className="flex-row justify-between items-center mb-3">
                  <Small className="text-muted-foreground">Remaining</Small>
                  <P className={budget.remaining < 0 ? 'text-destructive' : 'text-success'}>
                    ₹{budget.remaining.toLocaleString('en-IN')}
                  </P>
                </View>
                
                <View className="mb-2">
                  <ProgressBar progress={budget.progress} isOver={budget.isOverBudget} />
                </View>
                
                <View className="flex-row justify-between items-center">
                  <Small className="text-muted-foreground">
                    {budget.progress.toFixed(1)}% used
                  </Small>
                  {budget.isOverBudget && (
                    <Small className="text-destructive font-medium">Over Budget!</Small>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Budget Button */}
        <View className="px-4 mt-4 mb-6">
          <TouchableOpacity 
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
            onPress={() => setShowAdd(true)}
          >
            <Plus size={20} className="text-primary-foreground mr-2" />
            <P className="text-primary-foreground font-medium">Add New Budget</P>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AddBudgetForm visible={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}


