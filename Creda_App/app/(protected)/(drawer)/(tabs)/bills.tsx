import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SlidersHorizontal, AlertTriangle, Lightbulb, Plus, Zap, Wifi, Home, CreditCard, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { H4, P, Small } from '~/components/ui/typography';
import { useBills, useUpdateBillStatus } from '~/hooks/queries';
import AddBillForm from '~/components/forms/AddBillForm';

// dynamic data from SQLite

// --- HELPER COMPONENTS ---
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Electricity': return <Zap size={20} className="text-foreground" />;
    case 'Internet': return <Wifi size={20} className="text-foreground" />;
    case 'Rent': return <Home size={20} className="text-foreground" />;
    case 'Credit Card': return <CreditCard size={20} className="text-foreground" />;
    default: return <CreditCard size={20} className="text-foreground" />;
  }
}

const ProgressBar = ({ progress, isOver = false }: { progress: number; isOver?: boolean }) => (
  <View className="h-1.5 w-full bg-muted rounded-full">
    <View style={{ width: `${progress}%` }} className={`h-1.5 rounded-full ${isOver ? 'bg-destructive' : 'bg-primary'}`} />
  </View>
);

const PaidBillsSection = ({ bills }: { bills: any[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="bg-card rounded-xl border border-border">
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} className="p-4 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <CheckCircle size={20} className="text-success mr-2" />
          <H4>Paid Bills</H4>
        </View>
        {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
      </TouchableOpacity>
      {isExpanded && (
        <View className="px-4 pb-4">
          {bills.map((bill, index) => (
            <View key={bill.id} className={`py-3 flex-row items-center justify-between ${index < bills.length - 1 ? 'border-b border-border' : ''}`}>
              <View>
                <P>{bill.name}</P>
                <Small className="text-muted-foreground">Paid</Small>
              </View>
              <P className="text-success">₹{Number(bill.amount).toLocaleString('en-IN')}</P>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};


// --- MAIN BILLS COMPONENT ---
export default function BillsScreen() {
  const { data: all = [] } = useBills();
  const update = useUpdateBillStatus();
  const [showAdd, setShowAdd] = useState(false);

  const upcomingBills = useMemo(() => all.filter((b: any) => b.status === 'pending'), [all]);
  const overdueBills = useMemo(() => all.filter((b: any) => b.status === 'overdue'), [all]);
  const paidBills = useMemo(() => all.filter((b: any) => b.status === 'paid'), [all]);
  const totalDue = useMemo(() => upcomingBills.reduce((s: number, b: any) => s + Number(b.amount), 0), [upcomingBills]);
  const paidPercentage = (paidBills.length / Math.max(1, all.length)) * 100;

  return (
    <>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Bills Summary Card */}
        <View className="px-4">
          <View className="bg-card rounded-xl p-4 border border-border">
            <Small className="text-muted-foreground">Total Bills Due This Month</Small>
            <H4 className="mt-1">₹{totalDue.toLocaleString('en-IN')}</H4>
            <View className="flex-row mt-2 space-x-4">
              <P><P>{upcomingBills.length}</P> Upcoming</P>
              <P className="text-destructive"><P>{overdueBills.length}</P> Overdue</P>
            </View>
            <View className="mt-3">
              <ProgressBar progress={paidPercentage} />
              <Small className="text-muted-foreground mt-1">{paidBills.length} of {all.length} bills paid</Small>
            </View>
          </View>
        </View>

        {/* Upcoming Bills */}
        <View className="px-4 mt-6">
          <H4 className="mb-3">Upcoming</H4>
          <View className="bg-card border border-border rounded-xl">
            {upcomingBills.map((bill: any, index: number) => (
              <View key={bill.id} className={`p-4 flex-row items-center ${index < upcomingBills.length - 1 ? 'border-b border-border' : ''} ${bill.isUrgent ? '' : ''}`}>
                <View className="w-10 h-10 bg-muted rounded-full items-center justify-center mr-3">
                  {getCategoryIcon('Bills')}
                </View>
                <View className="flex-1">
                  <P>{bill.name}</P>
                  <Small className="text-muted-foreground">Due {bill.due_date}</Small>
                  <P className="mt-1">₹{Number(bill.amount).toLocaleString('en-IN')}</P>
                </View>
                <TouchableOpacity className="bg-primary py-2 px-4 rounded-lg" onPress={() => update.mutate({ id: bill.id, status: 'paid' })}>
                  <Small className="text-primary-foreground">Pay Now</Small>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Overdue Bills */}
        <View className="px-4 mt-6">
          <View className="bg-destructive/10 border border-destructive/20 rounded-xl shadow-sm p-4">
            <H4 className="text-destructive mb-3">Overdue</H4>
            {overdueBills.map((bill: any) => (
              <View key={bill.id} className="flex-row items-center">
                <View className="w-10 h-10 bg-destructive/20 rounded-full items-center justify-center mr-3">
                  {getCategoryIcon('Bills')}
                </View>
                <View className="flex-1">
                  <P>{bill.name}</P>
                  <Small className="text-destructive">Was due on {bill.due_date}</Small>
                  <P className="mt-1">₹{Number(bill.amount).toLocaleString('en-IN')}</P>
                </View>
                <TouchableOpacity className="bg-destructive py-2 px-4 rounded-lg" onPress={() => update.mutate({ id: bill.id, status: 'paid' })}>
                  <Small className="text-destructive-foreground">Clear Now</Small>
                </TouchableOpacity>
              </View>
            ))}
            <Small className="text-destructive/80 mt-3 text-center">⚠ Overdue bills may incur late fees. Source: RBI Guidelines.</Small>
          </View>
        </View>

        {/* Paid Bills */}
        <View className="px-4 mt-6">
          <PaidBillsSection bills={paidBills} />
        </View>

        {/* Add Bill Button */}
        <View className="px-4 mt-6 mb-24">
          <TouchableOpacity className="bg-primary py-3 rounded-lg items-center" onPress={() => setShowAdd(true)}>
            <P className="text-primary-foreground">Add Bill</P>
          </TouchableOpacity>
        </View>

        {/* AI Insights / Nudges */}
        <View className="px-4 mt-6 mb-24">
          <H4 className="mb-3">Insights</H4>
          <View className="bg-sky-100/60 border border-sky-300 rounded-xl p-3 flex-row items-start mb-3">
            <Lightbulb size={20} color="hsl(var(--accent))" className="mr-3 mt-1" />
            <View className="flex-1">
              <P className="text-sky-900">Set auto-debit for your electricity bill to avoid late fees.</P>
              <TouchableOpacity className="bg-sky-300 py-1 px-3 rounded-md self-start mt-2">
                <Small className="text-sky-950">Enable Auto-Pay</Small>
              </TouchableOpacity>
            </View>
          </View>
          <View className="bg-amber-100/60 border border-amber-300 rounded-xl p-3 flex-row items-start">
            <AlertTriangle size={20} color="hsl(var(--warning))" className="mr-3 mt-1" />
            <View className="flex-1">
              <P className="text-amber-900">Your credit card bill is overdue by 2 days.</P>
              <TouchableOpacity className="bg-amber-400 py-1 px-3 rounded-md self-start mt-2">
                <Small className="text-amber-950">Pay Now</Small>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <AddBillForm visible={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}
