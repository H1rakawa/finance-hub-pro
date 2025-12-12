import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { TransactionItem } from '@/components/dashboard/TransactionItem';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/format';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  Plus,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  color: string;
}

interface Transaction {
  id: string;
  type: string;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  accounts: {
    name: string;
    currency: string;
  };
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAccounts(), fetchTransactions()]);
    setLoading(false);
  };

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Không thể tải danh sách tài khoản');
      return;
    }

    setAccounts(data || []);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        type,
        category,
        description,
        amount,
        date,
        accounts (
          name,
          currency
        )
      `)
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      toast.error('Không thể tải danh sách giao dịch');
      return;
    }

    setTransactions(data || []);
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', deleteAccountId);

    if (error) {
      toast.error('Không thể xóa tài khoản');
      return;
    }

    toast.success('Đã xóa tài khoản');
    setDeleteAccountId(null);
    fetchData();
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);
  
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  const monthlyIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const monthlyExpense = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tổng quan</h1>
            <p className="text-muted-foreground mt-1">Chào mừng bạn trở lại!</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAddAccount(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tài khoản
            </Button>
            <Button onClick={() => setShowAddTransaction(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm giao dịch
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng số dư"
            value={formatCurrency(totalBalance)}
            icon={<Wallet className="h-6 w-6" />}
            delay={0}
          />
          <StatCard
            title="Thu nhập tháng này"
            value={formatCurrency(monthlyIncome)}
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
            delay={100}
          />
          <StatCard
            title="Chi tiêu tháng này"
            value={formatCurrency(monthlyExpense)}
            icon={<TrendingDown className="h-6 w-6" />}
            trend={{ value: 5, isPositive: false }}
            delay={200}
          />
          <StatCard
            title="Số tài khoản"
            value={accounts.length.toString()}
            icon={<PiggyBank className="h-6 w-6" />}
            delay={300}
          />
        </div>

        {/* Accounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Tài khoản của bạn</h2>
            <Button variant="ghost" onClick={() => navigate('/accounts')}>
              Xem tất cả
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {accounts.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Bạn chưa có tài khoản nào</p>
              <Button onClick={() => setShowAddAccount(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm tài khoản đầu tiên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.slice(0, 3).map((account, index) => (
                <AccountCard
                  key={account.id}
                  {...account}
                  onEdit={(id) => {
                    const acc = accounts.find(a => a.id === id);
                    if (acc) {
                      setEditAccount(acc);
                      setShowAddAccount(true);
                    }
                  }}
                  onDelete={(id) => setDeleteAccountId(id)}
                  delay={index * 100}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Giao dịch gần đây</h2>
            <Button variant="ghost" onClick={() => navigate('/transactions')}>
              Xem tất cả
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="glass-card rounded-2xl p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.slice(0, 5).map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    type={transaction.type}
                    category={transaction.category}
                    description={transaction.description || undefined}
                    amount={transaction.amount}
                    currency={transaction.accounts?.currency || 'VND'}
                    date={transaction.date}
                    accountName={transaction.accounts?.name || ''}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddAccountModal
        open={showAddAccount}
        onOpenChange={(open) => {
          setShowAddAccount(open);
          if (!open) setEditAccount(null);
        }}
        onSuccess={fetchData}
        editAccount={editAccount}
      />

      <AddTransactionModal
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        onSuccess={fetchData}
      />

      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tất cả giao dịch liên quan đến tài khoản này cũng sẽ bị xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
