import React, { useMemo, useState, useRef } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ArrowUpRight, AlertTriangle, Lightbulb, ShieldCheck, Target, User } from 'lucide-react-native';
import Sparkline from '~/components/charts/Sparkline';
import DonutChart from '~/components/charts/DonutChart';
import ProgressBar from '~/components/charts/ProgressBar';
import { H4, P, Small } from '~/components/ui/typography';
import { useHoldingsWithAssets, usePortfolioSummary, useTransactions } from '~/hooks/queries';
import AddHoldingForm from '~/components/forms/AddHoldingForm';
import PortfolioOptimizationForm from '~/components/forms/PortfolioOptimizationForm';
import UserProfilePortfolioForm from '~/components/forms/UserProfilePortfolioForm';
import PortfolioResult from '~/components/PortfolioResult';
import UserProfilePortfolioResult from '~/components/UserProfilePortfolioResult';

const Tab = createMaterialTopTabNavigator();

// --- PORTFOLIO OPTIMIZATION TAB ---
function PortfolioOptimizationTab() {
  const [showAdd, setShowAdd] = useState(false);
  const [portfolioResult, setPortfolioResult] = useState<any>(null);
  const optimizationRef = useRef<BottomSheetModal>(null);

  const handleOptimizationResult = (result: any) => {
    setPortfolioResult(result);
  };

  // Static example data for preview
  const staticExample = {
    success: true,
    data: {
      profile_summary: {
        persona: 'Balanced Growth',
        age: 32,
        income: 800000,
        dependents: 1,
        risk_tolerance: 3
      },
      optimal_allocation: {
        large_cap_equity: 0.45,
        mid_small_cap_equity: 0.15,
        government_bonds: 0.25,
        corporate_bonds: 0.10,
        gold: 0.03,
        cash_equivalents: 0.02,
      },
      portfolio_metrics: {
        expected_return: 0.095,
        portfolio_risk: 0.065,
        risk_free_rate: 0.065,
        risk_score: 3.2,
        sharpe_ratio: 1.15
      },
      performance: {
        target_met: true,
        target_threshold: 0.08,
        processing_time_seconds: 0.12
      },
      investment_insights: {
        key_points: [
          "Diversified portfolio with balanced risk-return profile",
          "Suitable for medium-term investment goals",
          "Regular rebalancing recommended"
        ]
      },
      recommendations: {
        immediate_actions: [
          "Start with large cap equity for stability",
          "Consider systematic investment plan",
          "Rebalance quarterly"
        ]
      },
      rebalancing: {
        needed: false,
        next_review: "3 months"
      },
      timestamp: new Date().toISOString()
    },
    service: 'finance',
    processing_time: 0.15,
    timestamp: new Date().toISOString()
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 mt-4">
          <View className="bg-card border border-border rounded-xl p-4 mb-4">
            <H4 className="mb-3">Portfolio Optimization</H4>
            <P className="text-muted-foreground mb-4">
              Get personalized investment recommendations based on your risk tolerance and investment goals.
            </P>
            <TouchableOpacity
              className="bg-primary py-3 rounded-lg items-center"
              onPress={() => optimizationRef.current?.present()}
            >
              <P className="text-primary-foreground">Optimize Portfolio</P>
            </TouchableOpacity>
          </View>

          {/* Static Example */}
          {!portfolioResult && (
            <View className="mb-4">
              <H4 className="mb-3 text-muted-foreground">Example Result</H4>
              <PortfolioResult result={staticExample} />
            </View>
          )}
          {portfolioResult && (
            <View className="mb-4">
              <H4 className="mb-3">Your Result</H4>
              <PortfolioResult result={portfolioResult} />
            </View>
          )}
        </View>
      </ScrollView>

      <PortfolioOptimizationForm
        bottomSheetRef={optimizationRef}
        onResult={handleOptimizationResult}
      />
    </View>
  );
}

// --- USER PROFILE TAB ---
function UserProfileTab() {
  const [showAdd, setShowAdd] = useState(false);
  const [profileResult, setProfileResult] = useState<any>(null);
  const profileRef = useRef<BottomSheetModal>(null);

  const handleProfileResult = (result: any) => {
    setProfileResult(result.data);
    console.log('User profile portfolio result:', result);
  };

  // Static example data for user profile portfolio
  const staticProfileExample = {
    "success": true,
    "data": {
      "success": true,
      "allocation": {
        "persona": "Pre-retirement Conservative",
        "persona_id": 3,
        "persona_description": "Nearing retirement with focus on preservation",
        "allocation": {
          "large_cap_equity": 0.292,
          "mid_small_cap_equity": 0.09,
          "international_equity": 0.068,
          "government_bonds": 0.319,
          "corporate_bonds": 0.132,
          "gold": 0.079,
          "cash_equivalents": 0.02
        },
        "portfolio_metrics": {
          "expected_return": 0.097,
          "portfolio_risk": 0.058,
          "risk_score": 0.29,
          "sharpe_ratio": 0.55,
          "risk_free_rate": 0.065
        },
        "glidepath_equity": 0.85,
        "risk_factors": {
          "age_factor": 0.9,
          "risk_factor": 1,
          "income_factor": 0.9,
          "dependents_factor": 1
        },
        "reasoning": "Age 20, Risk 5/5, Income ₹8,000",
        "rebalancing_needed": false
      },
      "rag_insights": {
        "answer": "According to SEBI, PFRDA, Financial Planning Standards Board, Securities and Exchange Board of India (SEBI) investor education guidelines suggest age-based asset allocation strategy. This strategy balances growth potential with risk management based on your investment horizon.",
        "confidence": 0.98,
        "sources": [
          "Personal Finance Best Practices India",
          "SEBI Investor Education and Protection Fund Guidelines",
          "Pension Fund Regulatory Authority Guidelines"
        ]
      },
      "performance": {
        "processing_time_seconds": 0.1106,
        "target_met": false
      },
      "timestamp": "2025-09-27T10:21:47.754222"
    },
    "service": "finance",
    "timestamp": "2025-09-27T15:51:47.760343",
    "processing_time": 0.15946531295776367
  }
  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 mt-4">
          <View className="bg-card border border-border rounded-xl p-4 mb-4">
            <H4 className="mb-3">Profile-Based Portfolio</H4>
            <P className="text-muted-foreground mb-4">
              Generate investment recommendations tailored to your personal profile, age, income, and financial goals.
            </P>
            <TouchableOpacity
              className="bg-primary py-3 rounded-lg items-center"
              onPress={() => profileRef.current?.present()}
            >
              <P className="text-primary-foreground">Generate Portfolio</P>
            </TouchableOpacity>
          </View>

          {/* Static Example */}
          {!profileResult && (
            <View className="mb-4">
              <H4 className="mb-3 text-muted-foreground">Example Result</H4>
              <UserProfilePortfolioResult result={staticProfileExample} />
            </View>
          )}
          {profileResult && (
            <View className="mb-4">
              <H4 className="mb-3">Your Result</H4>
              <UserProfilePortfolioResult result={profileResult} />
            </View>
          )}
        </View>
      </ScrollView>

      <UserProfilePortfolioForm
        bottomSheetRef={profileRef}
        onResult={handleProfileResult}
      />
    </View>
  );
}

// --- MAIN INVESTMENTS COMPONENT ---
export default function InvestmentsScreen() {
  const { data: summary } = usePortfolioSummary();
  const { data: items = [] } = useHoldingsWithAssets();
  const { data: transactions = [] } = useTransactions();
  const [showAdd, setShowAdd] = useState(false);

  // Generate dynamic sparkline data from recent transactions
  const sparklineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().slice(0, 10);
    }).reverse();

    return last7Days.map(date => {
      return transactions
        .filter((tx: any) => tx.date === date && tx.type === 'expense')
        .reduce((sum, tx: any) => sum + Number(tx.amount), 0);
    });
  }, [transactions]);

  const allocationData = useMemo(() => {
    if (items.length === 0) return [];

    const total = items.reduce((s: number, h: any) => s + Number(h.quantity) * Number(h.avg_price), 0) || 1;
    const map = new Map<string, number>();

    for (const h of items) {
      const key = h.asset_type || 'Other';
      map.set(key, (map.get(key) ?? 0) + Number(h.quantity) * Number(h.avg_price));
    }

    const palette = ['#00b386', '#2dd4bf', '#99f6e4', '#facc15', '#60a5fa', '#f87171'];
    return Array.from(map.entries()).map(([label, value], i) => ({
      label,
      value: Math.round((value / total) * 100),
      color: palette[i % palette.length]
    }));
  }, [items]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
        tabBarStyle: { backgroundColor: '#ffff' }
      }}
    >
      <Tab.Screen
        name="PortfolioOptimization"
        component={PortfolioOptimizationTab}
        options={{
          tabBarLabel: 'Portfolio Optimization',
        }}
      />
      <Tab.Screen
        name="UserProfile"
        component={UserProfileTab}
        options={{
          tabBarLabel: 'User Profile',
        }}
      />
    </Tab.Navigator>
  );
}
