import React from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
};

export const Sparkline: React.FC<SparklineProps> = ({ data, width = 340, height = 70, color = '#00b386' }) => {
  // Don't render if no data or insufficient data points
  console.log('Sparkline data:', data);
  if (!data || data.length < 2) {
    return null;
  }

  const lineData = data.map((value, index) => ({
    value,
    dataPointText: '',
    hideDataPoint: true,
  }));

  return (
    <View style={{ height, width, backgroundColor: 'transparent' }}>
      <LineChart
        data={lineData}
        width={width}
        height={height}
        color={color}
        thickness={2}
        hideDataPoints={true}
        hideAxesAndRules={true}
        hideYAxisText={true}
        hideXAxisText={true}
        curved
        startFillColor={color}
        endFillColor={color}
        startOpacity={0.1}
        endOpacity={0.1}
        areaChart
        hideRules
        hideAxes
        hideDataPoints1
        hideDataPoints2
        hideDataPoints3
        hideDataPoints4
        hideDataPoints5
      />
    </View>
  );
};

export default Sparkline;


