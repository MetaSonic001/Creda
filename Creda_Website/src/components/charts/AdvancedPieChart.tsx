import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}
// sahi
interface AdvancedPieChartProps {
  data: PieDataPoint[];
  title: string;
  description?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showPercentages?: boolean;
  showLegend?: boolean;
  height?: number;
  className?: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const AdvancedPieChart: React.FC<AdvancedPieChartProps> = ({
  data,
  title,
  description,
  valuePrefix = '',
  valueSuffix = '',
  showPercentages = true,
  showLegend = true,
  height = 300,
  className = ''
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const dataWithPercentages = data.map((item, index) => ({
    ...item,
    percentage: (item.value / total) * 100,
    color: item.color || COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-primary">
            Value: {valuePrefix}{data.value.toLocaleString()}{valueSuffix}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className={`glass-effect hover:shadow-card transition-all duration-300 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
        <div className="text-2xl font-bold">
          {valuePrefix}{total.toLocaleString()}{valueSuffix}
        </div>
      </CardHeader>
      <CardContent>
        <div className={showLegend ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : ""}>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={dataWithPercentages}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showPercentages ? CustomLabel : false}
                outerRadius={height / 3}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {showLegend && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Breakdown</h4>
              <div className="space-y-2">
                {dataWithPercentages.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedPieChart;