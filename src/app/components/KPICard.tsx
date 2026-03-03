import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './ui/card';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  sparklineData?: number[];
  icon?: React.ReactNode;
}

export function KPICard({ title, value, unit, trend, sparklineData, icon }: KPICardProps) {
  const isPositive = trend && trend > 0;
  const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
  
  // Generate simple sparkline data if not provided
  const chartData = sparklineData 
    ? sparklineData.map((value, index) => ({ value, index }))
    : Array.from({ length: 7 }, (_, i) => ({ value: Math.random() * 100, index: i }));

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm text-slate-600">{title}</div>
        {icon && <div className="text-blue-600">{icon}</div>}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-semibold text-slate-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {unit && <div className="text-sm text-slate-500">{unit}</div>}
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      {sparklineData && (
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height={48}>
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}