import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { formatCurrency, formatRelativeDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  type: string;
  category: string;
  description?: string;
  amount: number;
  currency: string;
  date: string;
  accountName: string;
}

const categoryLabels: Record<string, string> = {
  salary: 'Lương',
  food: 'Ăn uống',
  transport: 'Di chuyển',
  shopping: 'Mua sắm',
  entertainment: 'Giải trí',
  bills: 'Hóa đơn',
  health: 'Sức khỏe',
  education: 'Giáo dục',
  investment: 'Đầu tư',
  other_income: 'Thu nhập khác',
  other_expense: 'Chi tiêu khác',
  transfer: 'Chuyển khoản',
};

export function TransactionItem({ 
  type, 
  category, 
  description, 
  amount, 
  currency, 
  date,
  accountName 
}: TransactionItemProps) {
  const isIncome = type === 'income';
  const isTransfer = type === 'transfer';
  
  const Icon = isTransfer ? ArrowLeftRight : isIncome ? ArrowDownLeft : ArrowUpRight;
  
  return (
    <div className="flex items-center justify-between py-3 sm:py-4 border-b border-border last:border-0 gap-3">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className={cn(
          'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl shrink-0',
          isTransfer 
            ? 'bg-warning/10 text-warning'
            : isIncome 
              ? 'bg-success/10 text-success' 
              : 'bg-destructive/10 text-destructive'
        )}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm sm:text-base truncate">
            {categoryLabels[category] || category}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            <span className="hidden sm:inline">{description || accountName} • </span>
            {formatRelativeDate(date)}
          </p>
        </div>
      </div>
      <p className={cn(
        'font-semibold text-sm sm:text-base shrink-0',
        isTransfer 
          ? 'text-foreground'
          : isIncome 
            ? 'text-success' 
            : 'text-destructive'
      )}>
        {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(Math.abs(amount), currency)}
      </p>
    </div>
  );
}
