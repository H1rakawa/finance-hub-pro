import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AddPlannedExpenseModal } from '@/components/modals/AddPlannedExpenseModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  Plus,
  CalendarClock,
  HandCoins,
  Pencil,
  Trash2,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PlannedExpense {
  id: string;
  name: string;
  amount: number;
  type: string;
  due_date: string | null;
  status: string;
  note: string | null;
  creditor: string | null;
  currency: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  pending: { label: 'Chưa thanh toán', variant: 'secondary', icon: Clock },
  paid: { label: 'Đã thanh toán', variant: 'default', icon: CheckCircle2 },
  overdue: { label: 'Quá hạn', variant: 'destructive', icon: AlertTriangle },
};

export default function PlannedExpenses() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PlannedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<PlannedExpense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('planned_expenses' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (filterType !== 'all') query = query.eq('type', filterType);
    if (filterStatus !== 'all') query = query.eq('status', filterStatus);

    const { data, error } = await query;
    if (error) {
      toast.error('Không thể tải dữ liệu');
    } else {
      setItems((data as any as PlannedExpense[]) || []);
    }
    setLoading(false);
  }, [filterType, filterStatus]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  useRealtimeSubscription({ table: 'planned_expenses' as any, onChange: fetchData });

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('planned_expenses' as any).delete().eq('id', deleteId);
    if (error) {
      toast.error('Không thể xóa');
      return;
    }
    toast.success('Đã xóa thành công');
    setDeleteId(null);
    fetchData();
  };

  const handleMarkPaid = async (id: string) => {
    const { error } = await supabase.from('planned_expenses' as any).update({ status: 'paid' }).eq('id', id);
    if (error) {
      toast.error('Không thể cập nhật');
      return;
    }
    toast.success('Đã đánh dấu thanh toán');
    fetchData();
  };

  const totalPending = items.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0);
  const totalDebt = items.filter(i => i.type === 'debt' && i.status !== 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalOverdue = items.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.amount), 0);

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dự chi & Nợ</h1>
            <p className="text-muted-foreground mt-1">Quản lý các khoản dự chi và nợ của bạn</p>
          </div>
          <Button onClick={() => { setEditItem(null); setShowModal(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm mới
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              <span>Chưa thanh toán</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalPending)}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <HandCoins className="h-4 w-4" />
              <span>Tổng nợ còn lại</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalDebt)}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-1">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Quá hạn</span>
            </div>
            <p className="text-xl font-bold text-destructive">{formatCurrency(totalOverdue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="planned_expense">Dự chi</SelectItem>
              <SelectItem value="debt">Nợ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chưa thanh toán</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="overdue">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Chưa có khoản dự chi hoặc nợ nào</p>
              <Button onClick={() => { setEditItem(null); setShowModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm khoản đầu tiên
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const statusInfo = statusConfig[item.status] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;
              const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status === 'pending';

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    item.type === 'debt' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                  }`}>
                    {item.type === 'debt' ? <HandCoins className="h-5 w-5" /> : <CalendarClock className="h-5 w-5" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      <Badge variant={isOverdue ? 'destructive' : statusInfo.variant} className="text-xs">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {isOverdue ? 'Quá hạn' : statusInfo.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.type === 'debt' ? 'Nợ' : 'Dự chi'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {item.creditor && <span>Chủ nợ: {item.creditor}</span>}
                      {item.due_date && <span>Hạn: {formatDate(item.due_date)}</span>}
                      {item.note && <span className="truncate max-w-[200px]">{item.note}</span>}
                    </div>
                  </div>

                  <p className={`text-lg font-bold shrink-0 ${
                    item.status === 'paid' ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}>
                    {formatCurrency(item.amount)}
                  </p>

                  <div className="flex gap-1 shrink-0">
                    {item.status !== 'paid' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleMarkPaid(item.id)} title="Đánh dấu đã thanh toán">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditItem(item); setShowModal(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddPlannedExpenseModal
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
          if (!open) setEditItem(null);
        }}
        onSuccess={fetchData}
        editItem={editItem}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
