import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { formatCurrency } from '@/lib/format';
import { Plus, PiggyBank, Wallet, ChevronDown, ChevronRight } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  color: string;
  parent_id: string | null;
}

export default function Accounts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Không thể tải danh sách tài khoản');
    } else {
      setAccounts((data as Account[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user, fetchAccounts]);

  useRealtimeSubscription({
    table: 'accounts',
    onChange: fetchAccounts,
  });

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

  // Separate parent accounts (no parent_id) and child accounts
  const parentAccounts = accounts.filter(a => !a.parent_id);
  const getChildAccounts = (parentId: string) => accounts.filter(a => a.parent_id === parentId);
  const standaloneAccounts = parentAccounts.filter(a => getChildAccounts(a.id).length === 0);
  const groupAccounts = parentAccounts.filter(a => getChildAccounts(a.id).length > 0);

  // Calculate parent balance as sum of children
  const getParentBalance = (parentId: string) => {
    const children = getChildAccounts(parentId);
    return children.reduce((sum, c) => sum + parseFloat(c.balance.toString()), 0);
  };

  const totalBalance = accounts
    .filter(a => a.parent_id || getChildAccounts(a.id).length === 0)
    .reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);

  const toggleExpand = (parentId: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tài khoản</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Quản lý tất cả tài khoản của bạn</p>
          </div>
          <Button onClick={() => { setAddChildParentId(null); setShowAddAccount(true); }} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Thêm tài khoản
          </Button>
        </div>

        {/* Summary Card */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary shrink-0">
              <Wallet className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Tổng số dư tất cả tài khoản</p>
              <p className="text-xl sm:text-3xl font-bold text-foreground truncate">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </div>

        {/* Accounts */}
        {accounts.length === 0 ? (
          <div className="glass-card rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
            <PiggyBank className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Chưa có tài khoản nào</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">Bắt đầu bằng cách thêm tài khoản đầu tiên của bạn</p>
            <Button onClick={() => setShowAddAccount(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tài khoản
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group accounts (parent with children) */}
            {groupAccounts.map((parent) => {
              const children = getChildAccounts(parent.id);
              const parentBalance = getParentBalance(parent.id);
              const isExpanded = expandedParents.has(parent.id);

              return (
                <Collapsible key={parent.id} open={isExpanded} onOpenChange={() => toggleExpand(parent.id)}>
                  <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden">
                    {/* Parent header */}
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div
                            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl shrink-0"
                            style={{ backgroundColor: `${parent.color}20`, color: parent.color }}
                          >
                            <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{parent.name}</h3>
                            <p className="text-xs text-muted-foreground">{children.length} tài khoản con</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg sm:text-xl font-bold text-foreground">{formatCurrency(parentBalance, parent.currency)}</p>
                            <p className="text-xs text-muted-foreground">Tổng cộng</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddChildParentId(parent.id);
                                setShowAddAccount(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Children */}
                    <CollapsibleContent>
                      <div className="border-t border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 p-4">
                          {children.map((child, index) => (
                            <AccountCard
                              key={child.id}
                              {...child}
                              onEdit={(id) => {
                                const acc = accounts.find(a => a.id === id);
                                if (acc) {
                                  setEditAccount(acc);
                                  setShowAddAccount(true);
                                }
                              }}
                              onDelete={(id) => setDeleteAccountId(id)}
                              delay={index * 50}
                            />
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}

            {/* Standalone accounts (no children, no parent) */}
            {standaloneAccounts.length > 0 && (
              <div>
                {groupAccounts.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Tài khoản độc lập</h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {standaloneAccounts.map((account, index) => (
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddAccountModal
        open={showAddAccount}
        onOpenChange={(open) => {
          setShowAddAccount(open);
          if (!open) {
            setEditAccount(null);
            setAddChildParentId(null);
          }
        }}
        onSuccess={fetchAccounts}
        editAccount={editAccount}
        parentId={addChildParentId}
        parentAccounts={parentAccounts}
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
