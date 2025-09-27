import React from 'react';
import { View, ScrollView } from 'react-native';
import { P, Small, H4 } from '~/components/ui/typography';
import DonutChart from '~/components/charts/DonutChart';
import ProgressBar from '~/components/charts/ProgressBar';

type PortfolioResultProps = {
  result: {
    success: boolean;
    data: {
      profile_summary: {
        persona: string;
        age: number;
        income: number;
        dependents: number;
        risk_tolerance: number;
      };
      optimal_allocation: Record<string, number>;
      portfolio_metrics: {
        expected_return: number;
        portfolio_risk: number;
        risk_free_rate: number;
        risk_score: number;
        sharpe_ratio: number;
      };
      performance: {
        target_met: boolean;
        target_threshold: number;
        processing_time_seconds: number;
      };
      investment_insights: any;
      recommendations: any;
      rebalancing: any;
      timestamp: string;
    };
    service: string;
    processing_time: number;
    timestamp: string;
  };
  investmentAmount?: number;
};

export default function PortfolioResult({ result, investmentAmount }: PortfolioResultProps) {
  if (!result.success) {
    return (
      <View className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
        <P className="text-destructive">Failed to generate portfolio recommendation</P>
      </View>
    );
  }

  const { data } = result;
  const totalAmount = investmentAmount || 100000; // Default to 100,000 if not provided

  // Convert optimal_allocation to chart data
  const chartData = Object.entries(data.optimal_allocation).map(([key, value], index) => {
    const colors = ['#00b386', '#2dd4bf', '#99f6e4', '#facc15', '#60a5fa', '#f87171', '#c084fc', '#fb7185'];
    return {
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: Math.round(value * 100),
      color: colors[index % colors.length],
    };
  });

  // Calculate allocation amounts
  const allocationAmounts = Object.fromEntries(
    Object.entries(data.optimal_allocation).map(([key, percentage]) => [
      key,
      totalAmount * percentage
    ])
  );

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Persona Card */}
      <View className="bg-card border border-border rounded-xl p-4 mb-4">
        <H4 className="mb-2">Investment Persona</H4>
        <P className="text-primary font-medium">{data.profile_summary.persona}</P>
        <Small className="text-muted-foreground mt-1">
          Risk Tolerance: {data.profile_summary.risk_tolerance}/10 •
          Age: {data.profile_summary.age} •
          Processed in {data.performance.processing_time_seconds}s
        </Small>
      </View>

      {/* Allocation Chart */}
      <View className="bg-card border border-border rounded-xl p-4 mb-4">
        <H4 className="mb-4">Optimal Portfolio Allocation</H4>
        <View className="items-center mb-4">
          <DonutChart data={chartData} width={250} height={200} />
        </View>
        <View className="flex-row flex-wrap justify-center">
          {chartData.map((item, index) => (
            <View key={item.label} className="flex-row items-center m-2">
              <View style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full mr-2" />
              <P className="text-sm">{item.label} {item.value}%</P>
            </View>
          ))}
        </View>
      </View>

      {/* Allocation Details */}
      <View className="bg-card border border-border rounded-xl p-4 mb-4">
        <H4 className="mb-4">Allocation Details</H4>
        {Object.entries(data.optimal_allocation).map(([key, percentage]) => {
          const amount = allocationAmounts[key];
          const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

          return (
            <View key={key} className="mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <P className="font-medium">{displayKey}</P>
                <P>₹{Math.round(amount).toLocaleString('en-IN')}</P>
              </View>
              <View className="flex-row justify-between items-center mb-1">
                <Small className="text-muted-foreground">{Math.round(percentage * 100)}%</Small>
                <Small className="text-muted-foreground">
                  {Math.round((amount / totalAmount) * 100)}% of total
                </Small>
              </View>
              <ProgressBar progress={percentage * 100} />
            </View>
          );
        })}
      </View>

      {/* Portfolio Metrics */}
      <View className="bg-card border border-border rounded-xl p-4 mb-4">
        <H4 className="mb-4">Portfolio Metrics</H4>
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <P className="font-medium">Expected Return</P>
            <P className="text-success text-lg">{(data.portfolio_metrics.expected_return * 100).toFixed(1)}%</P>
          </View>
          <View className="flex-row justify-between items-center">
            <P className="font-medium">Portfolio Risk</P>
            <P className="text-warning text-lg">{(data.portfolio_metrics.portfolio_risk * 100).toFixed(1)}%</P>
          </View>
          <View className="flex-row justify-between items-center">
            <P className="font-medium">Sharpe Ratio</P>
            <P className={data.portfolio_metrics.sharpe_ratio > 1 ? 'text-success' : 'text-warning'}>
              {data.portfolio_metrics.sharpe_ratio.toFixed(2)}
            </P>
          </View>
          <View className="flex-row justify-between items-center">
            <P className="font-medium">Risk Score</P>
            <P className="text-warning text-lg">{data.portfolio_metrics.risk_score.toFixed(1)}/10</P>
          </View>
        </View>

        {/* Risk Level Indicator */}
        <View className="mt-4">
          <View className="flex-row justify-between items-center mb-1">
            <Small className="text-muted-foreground">Risk Level</Small>
            <Small className="text-muted-foreground">
              {data.portfolio_metrics.risk_score < 4 ? 'Low' :
                data.portfolio_metrics.risk_score < 7 ? 'Medium' : 'High'}
            </Small>
          </View>
          <ProgressBar
            progress={(data.portfolio_metrics.risk_score / 10) * 100}
            isOver={data.portfolio_metrics.risk_score > 7}
          />
        </View>
      </View>

      {/* Performance */}
      <View className="bg-card border border-border rounded-xl p-4 mb-4">
        <H4 className="mb-4">Performance</H4>
        <View className="flex-row justify-between items-center">
          <P className="font-medium">Target Met</P>
          <View className={`px-3 py-1 rounded-full ${data.performance.target_met ? 'bg-success/20' : 'bg-warning/20'
            }`}>
            <P className={data.performance.target_met ? 'text-success' : 'text-warning'}>
              {data.performance.target_met ? '✓ Achieved' : '⚠ Not Met'}
            </P>
          </View>
        </View>
        {!data.performance.target_met && (
          <Small className="text-muted-foreground mt-2">
            Threshold: {(data.performance.target_threshold * 100).toFixed(1)}%
          </Small>
        )}
      </View>

      {/* Summary Stats */}
      <View className="bg-card border border-border rounded-xl p-4 mb-4">
        <H4 className="mb-4">Portfolio Summary</H4>
        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Small className="text-muted-foreground">Total Investment</Small>
            <P>₹{Math.round(totalAmount).toLocaleString('en-IN')}</P>
          </View>
          <View className="flex-row justify-between">
            <Small className="text-muted-foreground">Expected Annual Return</Small>
            <P className="text-success">₹{Math.round(totalAmount * data.portfolio_metrics.expected_return).toLocaleString('en-IN')}</P>
          </View>
          <View className="flex-row justify-between">
            <Small className="text-muted-foreground">Asset Classes</Small>
            <P>{Object.keys(data.optimal_allocation).length}</P>
          </View>
          <View className="flex-row justify-between">
            <Small className="text-muted-foreground">Risk-Free Rate</Small>
            <P>{(data.portfolio_metrics.risk_free_rate * 100).toFixed(1)}%</P>
          </View>
        </View>
      </View>

      {/* Timestamp */}
      <View className="bg-muted/10 rounded-lg p-3 mb-4">
        <Small className="text-muted-foreground text-center">
          Generated on {new Date(data.timestamp).toLocaleString('en-IN')}
        </Small>
      </View>
    </ScrollView>
  );
}

