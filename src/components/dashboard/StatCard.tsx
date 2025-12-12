import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export function StatCard({ title, value, icon, trend, className, delay = 0 }: StatCardProps) {
  return (
    <div 
      className={cn(
        'stat-card opacity-0 animate-fade-up',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-foreground truncate">{value}</p>
          {trend && (
            <p className={cn(
              'mt-1 sm:mt-2 text-xs sm:text-sm font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <span className="hidden sm:inline">{trend.isPositive ? '+' : ''}{trend.value}% so với tháng trước</span>
              <span className="sm:hidden">{trend.isPositive ? '+' : ''}{trend.value}%</span>
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary shrink-0">
          <span className="[&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-6 sm:[&>svg]:w-6">{icon}</span>
        </div>
      </div>
    </div>
  );
}
