import React from 'react';
import { View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

export type DonutDatum = { label: string; value: number; color: string };

type DonutChartProps = {
  data: DonutDatum[];
  width?: number;
  height?: number;
};

export const DonutChart: React.FC<DonutChartProps> = ({ data, width = 200, height = 150 }) => {
  // Don't render if no data or all values are zero
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return null;
  }

  const pieData = data.map((d, index) => ({
    value: d.value,
    color: d.color,
    text: `${d.value}%`,
    textColor: '#000',
    textSize: 12,
  }));

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <PieChart
        data={pieData}
        radius={Math.min(width, height) / 2 - 20}
        innerRadius={Math.min(width, height) / 4}
      />
    </View>
  );
};

export default DonutChart;


