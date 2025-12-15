import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Account {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  type: string;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  account_id: string;
}

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transaction: Transaction | null;
}

const incomeCategories = [
  { value: 'salary', label: 'Lương' },
  { value: 'investment', label: 'Đầu tư' },
  { value: 'other_income', label: 'Thu nhập khác' },
];

const expenseCategories = [
  { value: 'food', label: 'Ăn uống' },
  { value: 'transport', label: 'Di chuyển' },
  { value: 'shopping', label: 'Mua sắm' },
  { value: 'entertainment', label: 'Giải trí' },
  { value: 'bills', label: 'Hóa đơn' },
  { value: 'health', label: 'Sức khỏe' },
  { value: 'education', label: 'Giáo dục' },
  { value: 'other_expense', label: 'Chi tiêu khác' },
];

export function EditTransactionModal({ open, onOpenChange, onSuccess, transaction }: EditTransactionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (open && user) {
      fetchAccounts();
    }
  }, [open, user]);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type as 'expense' | 'income');
      setAccountId(transaction.account_id);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDescription(transaction.description || '');
      setDate(transaction.date);
    }
  }, [transaction]);

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from('accounts')
      .select('id, name')
      .order('name');
    
    if (data) {
      setAccounts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accountId || !transaction) return;

    setLoading(true);
    
    try {
      // Get original transaction to calculate balance difference
      const originalAmount = transaction.type === 'expense' 
        ? -Math.abs(transaction.amount) 
        : Math.abs(transaction.amount);
      
      const newAmount = type === 'expense' 
        ? -Math.abs(parseFloat(amount)) 
        : Math.abs(parseFloat(amount));

      // Update transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({
          type,
          amount: parseFloat(amount),
          category,
          description: description || null,
          date,
          account_id: accountId,
        })
        .eq('id', transaction.id);

      if (transactionError) throw transactionError;

      // Handle balance updates
      if (transaction.account_id === accountId) {
        // Same account - just update the difference
        const { data: account } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', accountId)
          .single();

        if (account) {
          const balanceDiff = newAmount - originalAmount;
          const newBalance = parseFloat(account.balance.toString()) + balanceDiff;
          await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', accountId);
        }
      } else {
        // Different account - revert original and apply to new
        const { data: oldAccount } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transaction.account_id)
          .single();

        if (oldAccount) {
          const revertedBalance = parseFloat(oldAccount.balance.toString()) - originalAmount;
          await supabase
            .from('accounts')
            .update({ balance: revertedBalance })
            .eq('id', transaction.account_id);
        }

        const { data: newAccount } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', accountId)
          .single();

        if (newAccount) {
          const updatedBalance = parseFloat(newAccount.balance.toString()) + newAmount;
          await supabase
            .from('accounts')
            .update({ balance: updatedBalance })
            .eq('id', accountId);
        }
      }

      toast.success('Cập nhật giao dịch thành công!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;

    setDeleting(true);
    
    try {
      const transactionAmount = transaction.type === 'expense' 
        ? -Math.abs(transaction.amount) 
        : Math.abs(transaction.amount);

      // Delete transaction
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id);

      if (error) throw error;

      // Revert account balance
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transaction.account_id)
        .single();

      if (account) {
        const revertedBalance = parseFloat(account.balance.toString()) - transactionAmount;
        await supabase
          .from('accounts')
          .update({ balance: revertedBalance })
          .eq('id', transaction.account_id);
      }

      toast.success('Xóa giao dịch thành công!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setDeleting(false);
    }
  };

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
        </DialogHeader>
        
        <Tabs value={type} onValueChange={(v) => {
          setType(v as 'expense' | 'income');
          setCategory('');
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
            <TabsTrigger value="income">Thu nhập</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account">Tài khoản</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tài khoản" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Danh mục</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Ghi chú (tùy chọn)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Ăn trưa với bạn..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Ngày</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || loading}
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={loading || !accountId || !category}
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
