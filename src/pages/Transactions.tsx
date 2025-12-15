import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionItem } from '@/components/dashboard/TransactionItem';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: string;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  account_id: string;
  accounts: {
    name: string;
    currency: string;
  };
}

export default function Transactions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<{
    id: string;
    type: string;
    category: string;
    description: string | null;
    amount: number;
    date: string;
    account_id: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        type,
        category,
        description,
        amount,
        date,
        account_id,
        accounts (
          name,
          currency
        )
      `)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Không thể tải danh sách giao dịch');
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.accounts?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || t.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 md:pt-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Giao dịch</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Xem và quản lý tất cả giao dịch</p>
          </div>
          <Button onClick={() => setShowAddTransaction(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Thêm giao dịch
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm giao dịch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="income">Thu nhập</SelectItem>
              <SelectItem value="expense">Chi tiêu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="glass-card rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
            <ArrowLeftRight className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              {transactions.length === 0 ? 'Chưa có giao dịch nào' : 'Không tìm thấy giao dịch'}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              {transactions.length === 0 
                ? 'Bắt đầu bằng cách thêm giao dịch đầu tiên' 
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'}
            </p>
            {transactions.length === 0 && (
              <Button onClick={() => setShowAddTransaction(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm giao dịch
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date} className="glass-card rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="bg-muted/50 px-4 sm:px-6 py-2 sm:py-3 border-b border-border">
                  <p className="font-medium text-foreground text-sm sm:text-base">
                    {new Date(date).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="p-3 sm:p-6">
                  {dayTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      id={transaction.id}
                      type={transaction.type}
                      category={transaction.category}
                      description={transaction.description || undefined}
                      amount={transaction.amount}
                      currency={transaction.accounts?.currency || 'VND'}
                      date={transaction.date}
                      accountName={transaction.accounts?.name || ''}
                      accountId={transaction.account_id}
                      onEdit={(t) => setEditingTransaction(t)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTransactionModal
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        onSuccess={fetchTransactions}
      />
      <EditTransactionModal
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onSuccess={fetchTransactions}
        transaction={editingTransaction}
      />
    </DashboardLayout>
  );
}
