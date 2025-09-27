import React from 'react';
import { View } from 'react-native';

type ProgressBarProps = {
  progress: number; // 0-100
  color?: string;
  overColor?: string;
  isOver?: boolean;
  height?: number;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = 'bg-primary', overColor = 'bg-destructive', isOver, height = 8 }) => {
  const barClass = (isOver ?? progress > 75) ? overColor : color;
  return (
    <View className={`w-full bg-muted rounded-full`} style={{ height }}>
      <View className={`rounded-full ${barClass}`} style={{ width: `${Math.max(0, Math.min(100, progress))}%`, height }} />
    </View>
  );
};

export default ProgressBar;


