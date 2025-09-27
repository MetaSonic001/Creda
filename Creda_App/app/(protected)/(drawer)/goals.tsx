import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { H4, P, Small } from '~/components/ui/typography';
import { useDeleteGoal, useGoals, useUpdateGoalStatus, useTransactions } from '~/hooks/queries';
import AddGoalForm from '~/components/forms/AddGoalForm';
import ProgressBar from '~/components/charts/ProgressBar';
import { Target, CheckCircle, Clock, XCircle, Trash2, Plus, Calendar } from 'lucide-react-native';

export default function GoalsScreen() {
  const { data: goals = [] } = useGoals();
  const { data: transactions = [] } = useTransactions();
  const update = useUpdateGoalStatus();
  const remove = useDeleteGoal();
  const [showAdd, setShowAdd] = useState(false);

  const goalsWithProgress = useMemo(() => {
    return goals.map((goal: any) => {
      // Calculate contributions to this goal (assuming income transactions contribute to goals)
      const contributions = transactions
        .filter((tx: any) => tx.type === 'income')
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

      // For simplicity, distribute all income equally across active goals
      const activeGoals = goals.filter((g: any) => g.status === 'active');
      const contributionPerGoal = activeGoals.length > 0 ? contributions / activeGoals.length : 0;
      
      const progress = goal.target_amount > 0 ? (contributionPerGoal / goal.target_amount) * 100 : 0;
      const remaining = Math.max(0, goal.target_amount - contributionPerGoal);
      const isCompleted = progress >= 100 || goal.status === 'completed';

      return {
        ...goal,
        contributed: contributionPerGoal,
        progress: Math.min(100, progress),
        remaining,
        isCompleted,
        daysLeft: goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
      };
    });
  }, [goals, transactions]);

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted || status === 'completed') return <CheckCircle size={20} className="text-success" />;
    if (status === 'failed') return <XCircle size={20} className="text-destructive" />;
    return <Clock size={20} className="text-warning" />;
  };

  const getStatusColor = (status: string, isCompleted: boolean) => {
    if (isCompleted || status === 'completed') return 'text-success';
    if (status === 'failed') return 'text-destructive';
    return 'text-warning';
  };

  const activeGoals = goalsWithProgress.filter(g => g.status === 'active');
  const completedGoals = goalsWithProgress.filter(g => g.status === 'completed' || g.isCompleted);
  const totalTarget = activeGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalContributed = activeGoals.reduce((sum, g) => sum + g.contributed, 0);

  return (
    <>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View className="px-4 mt-4">
          <View className="bg-card border border-border rounded-xl p-4 mb-4">
            <H4 className="mb-3">Goals Overview</H4>
            <View className="flex-row justify-between items-center mb-2">
              <Small className="text-muted-foreground">Active Goals</Small>
              <P>{activeGoals.length}</P>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Small className="text-muted-foreground">Completed</Small>
              <P className="text-success">{completedGoals.length}</P>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Small className="text-muted-foreground">Total Target</Small>
              <P>₹{totalTarget.toLocaleString('en-IN')}</P>
            </View>
            {totalTarget > 0 && (
              <View className="mt-3">
                <ProgressBar progress={(totalContributed / totalTarget) * 100} />
                <Small className="text-muted-foreground mt-1">
                  ₹{totalContributed.toLocaleString('en-IN')} of ₹{totalTarget.toLocaleString('en-IN')} contributed
                </Small>
              </View>
            )}
          </View>
        </View>

        {/* Goals List */}
        <View className="px-4">
          <H4 className="mb-3">Your Goals</H4>
          {goalsWithProgress.length === 0 ? (
            <View className="bg-card border border-border rounded-xl p-6 items-center">
              <Target size={48} className="text-muted-foreground mb-3" />
              <P className="text-muted-foreground text-center mb-2">No goals created yet</P>
              <Small className="text-muted-foreground text-center">Set your first financial goal to start tracking progress</Small>
            </View>
          ) : (
            goalsWithProgress.map((goal: any) => (
              <View key={goal.id} className="bg-card border border-border rounded-xl p-4 mb-3">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      {getStatusIcon(goal.status, goal.isCompleted)}
                      <P className="ml-2 font-medium">{goal.title}</P>
                    </View>
                    <Small className={`${getStatusColor(goal.status, goal.isCompleted)} capitalize`}>
                      {goal.isCompleted ? 'Completed' : goal.status}
                    </Small>
                  </View>
                  <TouchableOpacity 
                    className="bg-destructive/10 p-2 rounded-lg" 
                    onPress={() => remove.mutate(goal.id)}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                  <Small className="text-muted-foreground">Target Amount</Small>
                  <P>₹{Number(goal.target_amount).toLocaleString('en-IN')}</P>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                  <Small className="text-muted-foreground">Contributed</Small>
                  <P className={goal.contributed > 0 ? 'text-success' : 'text-muted-foreground'}>
                    ₹{goal.contributed.toLocaleString('en-IN')}
                  </P>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <Small className="text-muted-foreground">Remaining</Small>
                  <P className={goal.remaining <= 0 ? 'text-success' : 'text-foreground'}>
                    ₹{goal.remaining.toLocaleString('en-IN')}
                  </P>
                </View>

                {goal.deadline && (
                  <View className="flex-row items-center mb-3">
                    <Calendar size={16} className="text-muted-foreground mr-2" />
                    <Small className="text-muted-foreground">
                      Due: {new Date(goal.deadline).toLocaleDateString('en-IN')}
                      {goal.daysLeft !== null && (
                        <Small className={goal.daysLeft < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                          {' '}({goal.daysLeft < 0 ? 'Overdue' : `${goal.daysLeft} days left`})
                        </Small>
                      )}
                    </Small>
                  </View>
                )}

                <View className="mb-3">
                  <ProgressBar progress={goal.progress} />
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <Small className="text-muted-foreground">
                    {goal.progress.toFixed(1)}% complete
                  </Small>
                  {goal.isCompleted && (
                    <Small className="text-success font-medium">Achieved!</Small>
                  )}
                </View>

                {goal.status !== 'completed' && (
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className="bg-primary px-4 py-2 rounded-lg flex-1" 
                      onPress={() => update.mutate({ id: goal.id, status: 'completed' })}
                    >
                      <P className="text-primary-foreground text-center font-medium">Mark Complete</P>
                    </TouchableOpacity>
                    {goal.status === 'active' && (
                      <TouchableOpacity 
                        className="bg-destructive px-4 py-2 rounded-lg flex-1" 
                        onPress={() => update.mutate({ id: goal.id, status: 'failed' })}
                      >
                        <P className="text-destructive-foreground text-center font-medium">Mark Failed</P>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Add Goal Button */}
        <View className="px-4 mt-4 mb-6">
          <TouchableOpacity 
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
            onPress={() => setShowAdd(true)}
          >
            <Plus size={20} className="text-primary-foreground mr-2" />
            <P className="text-primary-foreground font-medium">Add New Goal</P>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AddGoalForm visible={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}


