import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DataPoint {
  name: string;
  value: number;
  target?: number;
  previous?: number;
}

interface AdvancedLineChartProps {
  data: DataPoint[];
  title: string;
  description?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showTarget?: boolean;
  showTrend?: boolean;
  height?: number;
  color?: string;
  className?: string;
}

export const AdvancedLineChart: React.FC<AdvancedLineChartProps> = ({
  data,
  title,
  description,
  valuePrefix = '',
  valueSuffix = '',
  showTarget = false,
  showTrend = true,
  height = 300,
  color = 'hsl(var(--chart-1))',
  className = ''
}) => {
  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const trend = latestValue - previousValue;
  const trendPercentage = previousValue ? ((trend / previousValue) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            Value: {valuePrefix}{payload[0].value.toLocaleString()}{valueSuffix}
          </p>
          {showTarget && payload[1] && (
            <p className="text-sm text-muted-foreground">
              Target: {valuePrefix}{payload[1].value.toLocaleString()}{valueSuffix}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`glass-effect hover:shadow-card transition-all duration-300 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && <CardDescription className="text-sm">{description}</CardDescription>}
          </div>
          {showTrend && (
            <Badge variant={trend >= 0 ? "default" : "destructive"} className="gap-1">
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trendPercentage).toFixed(1)}%
            </Badge>
          )}
        </div>
        <div className="text-2xl font-bold">
          {valuePrefix}{latestValue.toLocaleString()}{valueSuffix}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${valuePrefix}${value.toLocaleString()}${valueSuffix}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill="url(#colorGradient)"
            />
            {showTarget && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AdvancedLineChart;