import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  prefix?: string;
  suffix?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  change,
  changeLabel,
  trend = 'neutral',
  icon,
  description,
  actionLabel,
  onAction,
  prefix = '',
  suffix = '',
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return null;
    }
  };

  const getVariantStyles = () => {
    const baseStyles = 'glass-effect hover:shadow-card transition-all duration-300';
    switch (variant) {
      case 'success': return `${baseStyles} border-success/20 bg-success/5`;
      case 'warning': return `${baseStyles} border-warning/20 bg-warning/5`;
      case 'error': return `${baseStyles} border-error/20 bg-error/5`;
      case 'info': return `${baseStyles} border-info/20 bg-info/5`;
      default: return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { titleSize: 'text-sm', valueSize: 'text-xl', padding: 'p-4' };
      case 'lg': return { titleSize: 'text-lg', valueSize: 'text-4xl', padding: 'p-6' };
      default: return { titleSize: 'text-base', valueSize: 'text-2xl', padding: 'p-5' };
    }
  };

  const { titleSize, valueSize, padding } = getSizeStyles();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`${getVariantStyles()} ${className}`}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${padding}`}>
          <CardTitle className={`${titleSize} font-medium text-muted-foreground`}>
            {title}
          </CardTitle>
          {icon && (
            <div className={`p-2 rounded-lg bg-gradient-primary text-white`}>
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent className={`${padding} pt-0`}>
          <div className="space-y-2">
            <div className={`${valueSize} font-bold`}>
              {prefix}{formatValue(value)}{suffix}
            </div>
            
            {(change !== undefined || changeLabel || previousValue) && (
              <div className="flex items-center gap-2">
                {change !== undefined && (
                  <Badge 
                    variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'outline'}
                    className={`gap-1 ${getTrendColor()}`}
                  >
                    {getTrendIcon()}
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </Badge>
                )}
                {changeLabel && (
                  <span className="text-sm text-muted-foreground">{changeLabel}</span>
                )}
                {previousValue && (
                  <span className="text-sm text-muted-foreground">
                    vs {prefix}{formatValue(previousValue)}{suffix}
                  </span>
                )}
              </div>
            )}

            {description && (
              <p className="text-sm text-muted-foreground mt-2">
                {description}
              </p>
            )}

            {actionLabel && onAction && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onAction}
                className="mt-3 w-full justify-between h-8 px-3"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricCard;