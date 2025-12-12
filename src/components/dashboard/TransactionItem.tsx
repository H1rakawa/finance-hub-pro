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
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-4">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          isTransfer 
            ? 'bg-warning/10 text-warning'
            : isIncome 
              ? 'bg-success/10 text-success' 
              : 'bg-destructive/10 text-destructive'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-foreground">
            {categoryLabels[category] || category}
          </p>
          <p className="text-sm text-muted-foreground">
            {description || accountName} • {formatRelativeDate(date)}
          </p>
        </div>
      </div>
      <p className={cn(
        'font-semibold',
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
