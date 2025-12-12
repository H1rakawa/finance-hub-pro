import { Wallet, CreditCard, PiggyBank, TrendingUp, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface AccountCardProps {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  color: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  delay?: number;
}

const iconMap: Record<string, typeof Wallet> = {
  bank: Wallet,
  cash: PiggyBank,
  credit_card: CreditCard,
  investment: TrendingUp,
};

const typeLabels: Record<string, string> = {
  bank: 'Ngân hàng',
  cash: 'Tiền mặt',
  credit_card: 'Thẻ tín dụng',
  investment: 'Đầu tư',
};

export function AccountCard({ 
  id, 
  name, 
  type, 
  balance, 
  currency, 
  color, 
  onEdit, 
  onDelete,
  delay = 0 
}: AccountCardProps) {
  const Icon = iconMap[type] || Wallet;
  
  return (
    <div 
      className="account-card group opacity-0 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{typeLabels[type]}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4">
        <p className={cn(
          'text-2xl font-bold',
          balance >= 0 ? 'text-foreground' : 'text-destructive'
        )}>
          {formatCurrency(balance, currency)}
        </p>
      </div>
    </div>
  );
}
