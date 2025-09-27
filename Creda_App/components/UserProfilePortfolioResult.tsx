import React from 'react';
import { View, ScrollView } from 'react-native';
import { H4, P, Small } from '~/components/ui/typography';
import { Card } from '~/components/ui/card';
import DonutChart from '~/components/charts/DonutChart';
import ProgressBar from '~/components/charts/ProgressBar';
import { ShieldCheck, TrendingUp, Target, AlertTriangle, User, BarChart3 } from 'lucide-react-native';

type UserProfilePortfolioResultProps = {
  result: {
    success: boolean;
    data: {
      success: boolean;
      allocation: {
        persona: string;
        persona_id: number;
        persona_description: string;
        allocation: {
          large_cap_equity: number;
          mid_small_cap_equity: number;
          international_equity: number;
          government_bonds: number;
          corporate_bonds: number;
          gold: number;
          cash_equivalents: number;
        };
        portfolio_metrics: {
          expected_return: number;
          portfolio_risk: number;
          risk_score: number;
          sharpe_ratio: number;
          risk_free_rate: number;
        };
        glidepath_equity: number;
        risk_factors: {
          age_factor: number;
          risk_factor: number;
          income_factor: number;
          dependents_factor: number;
        };
        reasoning: string;
        rebalancing_needed: boolean;
      };
      rag_insights: {
        answer: string;
        confidence: number;
        sources: string[];
      };
      performance: {
        processing_time_seconds: number;
        target_met: boolean;
      };
      timestamp: string;
    };
    service: string;
    timestamp: string;
    processing_time: number;
  };
};

export default function UserProfilePortfolioResult({ result }: UserProfilePortfolioResultProps) {
  const { data } = result;
  const { allocation, rag_insights, performance } = data;

  // Convert allocation to donut chart format
  const allocationData = [
    { label: 'Large Cap Equity', value: Math.round(allocation.allocation.large_cap_equity * 100), color: '#00b386' },
    { label: 'Mid/Small Cap', value: Math.round(allocation.allocation.mid_small_cap_equity * 100), color: '#2dd4bf' },
    { label: 'International', value: Math.round(allocation.allocation.international_equity * 100), color: '#99f6e4' },
    { label: 'Govt Bonds', value: Math.round(allocation.allocation.government_bonds * 100), color: '#facc15' },
    { label: 'Corporate Bonds', value: Math.round(allocation.allocation.corporate_bonds * 100), color: '#60a5fa' },
    { label: 'Gold', value: Math.round(allocation.allocation.gold * 100), color: '#f87171' },
    { label: 'Cash', value: Math.round(allocation.allocation.cash_equivalents * 100), color: '#a78bfa' },
  ].filter(item => item.value > 0);

  const getPersonaColor = (persona: string) => {
    if (persona.includes('Conservative')) return '#f87171';
    if (persona.includes('Balanced')) return '#facc15';
    if (persona.includes('Aggressive')) return '#00b386';
    return '#60a5fa';
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore < 0.3) return 'Low Risk';
    if (riskScore < 0.6) return 'Medium Risk';
    return 'High Risk';
  };

  const total = 1;

  const allocationRisk = Object.fromEntries(
    Object.entries(allocation.risk_factors).map(([key, percentage]) => [
      key,
      total * percentage
    ])
  );
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="flex gap-4">
        {/* Persona Card */}
        <Card className="p-4">
          <View className="flex-row items-center mb-3">
            <H4 className="ml-2">{allocation.persona}</H4>
          </View>
          <P className="text-muted-foreground mb-2">{allocation.persona_description}</P>
          <Small className="text-muted-foreground">{allocation.reasoning}</Small>
        </Card>

        {/* Portfolio Allocation */}
        <Card className="p-4">
          <View className="flex-row items-center mb-4">
            <H4 className="ml-2">Portfolio Allocation</H4>
          </View>
          <View className="items-center mb-4">
            <DonutChart data={allocationData} width={250} height={200} />
          </View>
          <View className="flex-row flex-wrap justify-center">
            {allocationData.map((item, index) => (
              <View key={item.label} className="flex-row items-center m-2">
                <View style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full mr-2" />
                <P className="text-sm">{item.label} {item.value}%</P>
              </View>
            ))}
          </View>
        </Card>

        {/* Portfolio Metrics */}
        <Card className="p-4">
          <View className="flex-row items-center mb-4">
            <H4 className="ml-2">Portfolio Metrics</H4>
          </View>
          <View className="flex gap-2">
            <View className="flex-row justify-between items-center">
              <Small>Expected Return</Small>
              <Small className="font-semibold text-green-600">
                {(allocation.portfolio_metrics.expected_return * 100).toFixed(1)}%
              </Small>
            </View>
            <View className="flex-row justify-between items-center">
              <Small>Portfolio Risk</Small>
              <Small className="font-semibold text-orange-600">
                {(allocation.portfolio_metrics.portfolio_risk * 100).toFixed(1)}%
              </Small>
            </View>
            <View className="flex-row justify-between items-center">
              <Small>Risk Score</Small>
              <Small className="font-semibold">
                {getRiskLevel(allocation.portfolio_metrics.risk_score)}
              </Small>
            </View>
            <View className="flex-row justify-between items-center">
              <Small>Sharpe Ratio</Small>
              <Small className="font-semibold">
                {allocation.portfolio_metrics.sharpe_ratio.toFixed(2)}
              </Small>
            </View>
            <View className="flex-row justify-between items-center">
              <Small>Risk-Free Rate</Small>
              <Small className="font-semibold">
                {(allocation.portfolio_metrics.risk_free_rate * 100).toFixed(1)}%
              </Small>
            </View>
          </View>
        </Card>

        {/* Risk Factors */}

        <View className="bg-card border border-border rounded-xl p-4 mb-4">
          <H4 className="ml-2">Risk Factors</H4>
          {Object.entries(allocation.risk_factors).map(([key, percentage]) => {
            const amount = allocationRisk[key];
            const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            return (
              <View key={key} className="mb-3">
                <View className="flex-row justify-between items-center mb-1">
                  <P className="font-medium">{displayKey}</P>
                </View>
                <View className="flex-row justify-between items-center mb-1">
                  <Small className="text-muted-foreground">{Math.round(percentage * 100)}%</Small>
                  <Small className="text-muted-foreground">
                    {Math.round((amount / total) * 100)}% of total
                  </Small>
                </View>
                <ProgressBar progress={percentage * 100} />
              </View>
            );
          })}
        </View>

        {/* RAG Insights */}
        <Card className="p-4">
          <View className="flex-row items-center mb-4">
            <H4 className="ml-2">AI Insights</H4>
          </View>
          <P className="text-muted-foreground mb-3">{rag_insights.answer}</P>
          <View className="flex-row items-center justify-between mb-3">
            <Small>Confidence</Small>
            <Small className="font-semibold">
              {(rag_insights.confidence * 100).toFixed(1)}%
            </Small>
          </View>
          <View>
            <Small className="font-semibold mb-2">Sources:</Small>
            {rag_insights.sources.slice(0, 3).map((source, index) => (
              <Small key={index} className="text-muted-foreground pb-2">
                • {source}
              </Small>
            ))}
          </View>
        </Card>

        {/* Performance & Status */}
        <Card className="p-4">
          <View className="flex-row items-center mb-4">
            <AlertTriangle size={20} color={performance.target_met ? "#00b386" : "#f87171"} />
            <H4 className="ml-2">Performance</H4>
          </View>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Small>Target Met</Small>
              <Small className={`font-semibold ${performance.target_met ? 'text-green-600' : 'text-red-600'}`}>
                {performance.target_met ? 'Yes' : 'No'}
              </Small>
            </View>
            <View className="flex-row justify-between">
              <Small>Processing Time</Small>
              <Small className="font-semibold">
                {performance.processing_time_seconds.toFixed(2)}s
              </Small>
            </View>
            <View className="flex-row justify-between">
              <Small>Rebalancing Needed</Small>
              <Small className={`font-semibold ${allocation.rebalancing_needed ? 'text-orange-600' : 'text-green-600'}`}>
                {allocation.rebalancing_needed ? 'Yes' : 'No'}
              </Small>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
