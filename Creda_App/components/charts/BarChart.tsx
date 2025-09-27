import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';

type ExpenseBarChartProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showValues?: boolean;
  barWidth?: number;
};

export const ExpenseBarChart: React.FC<ExpenseBarChartProps> = ({
  data,
  width = 340,
  height = 200,
  color = '#e53e3e', // Red color for expenses
  showValues = false,
  barWidth = 20
}) => {
  const { isDarkColorScheme } = useColorScheme()
  // Don't render if no data or all values are 0
  if (!data || data.length === 0 || data.every(val => val === 0)) {
    return null;
  }

  const maxValue = Math.max(...data);

  const barData = data.map((value, index) => ({
    value: value || 0.1, // Ensure minimum value for visibility
    frontColor: color,
    topLabelComponent: showValues ? () => (
      <View style={{ marginBottom: 6 }}>
        <Text style={{ color: color, fontSize: 12, fontWeight: 'bold' }}>
          ₹{value.toFixed(0)}
        </Text>
      </View>
    ) : undefined,
  }));

  return (
    <View style={{ height, width }}>
      <BarChart

        data={barData}
        width={width}
        height={height}
        barWidth={barWidth}
        spacing={8}
        frontColor={color}
        backgroundColor={isDarkColorScheme ? NAV_THEME.dark.background : NAV_THEME.light.background}
        hideAxesAndRules={false}
        hideYAxisText={true}
        hideXAxisText={true}
        yAxisColor="transparent"
        xAxisColor="transparent"
        hideRules={true}
        noOfSections={3}
        maxValue={maxValue > 0 ? maxValue * 1.2 : 100}
        isAnimated={true}
        animationDuration={800}
        borderRadius={2}
        initialSpacing={10}
        endSpacing={10}
      />
    </View>
  );
};

export default ExpenseBarChart;

