import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/format';
import { Plus, PiggyBank, Wallet } from 'lucide-react';
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

export default function Accounts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Không thể tải danh sách tài khoản');
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
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
    fetchAccounts();
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);

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
            <h1 className="text-3xl font-bold text-foreground">Tài khoản</h1>
            <p className="text-muted-foreground mt-1">Quản lý tất cả tài khoản của bạn</p>
          </div>
          <Button onClick={() => setShowAddAccount(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm tài khoản
          </Button>
        </div>

        {/* Summary Card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng số dư tất cả tài khoản</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <PiggyBank className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Chưa có tài khoản nào</h3>
            <p className="text-muted-foreground mb-6">Bắt đầu bằng cách thêm tài khoản đầu tiên của bạn</p>
            <Button onClick={() => setShowAddAccount(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tài khoản
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account, index) => (
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

      {/* Modals */}
      <AddAccountModal
        open={showAddAccount}
        onOpenChange={(open) => {
          setShowAddAccount(open);
          if (!open) setEditAccount(null);
        }}
        onSuccess={fetchAccounts}
        editAccount={editAccount}
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
