import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
}

interface AddPlannedExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editItem?: PlannedExpense | null;
}

export function AddPlannedExpenseModal({ open, onOpenChange, onSuccess, editItem }: AddPlannedExpenseModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('planned_expense');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [note, setNote] = useState('');
  const [creditor, setCreditor] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setAmount(editItem.amount.toString());
      setType(editItem.type);
      setDueDate(editItem.due_date || '');
      setStatus(editItem.status);
      setNote(editItem.note || '');
      setCreditor(editItem.creditor || '');
    } else {
      setName('');
      setAmount('');
      setType('planned_expense');
      setDueDate('');
      setStatus('pending');
      setNote('');
      setCreditor('');
    }
  }, [editItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || !amount) {
      toast.error('Vui lòng nhập tên và số tiền');
      return;
    }

    setLoading(true);

    const data = {
      user_id: user.id,
      name: name.trim(),
      amount: parseFloat(amount.replace(/[,.]/g, '')),
      type,
      due_date: dueDate || null,
      status,
      note: note.trim() || null,
      creditor: creditor.trim() || null,
    };

    let error;
    if (editItem) {
      ({ error } = await supabase
        .from('planned_expenses' as any)
        .update(data)
        .eq('id', editItem.id));
    } else {
      ({ error } = await supabase
        .from('planned_expenses' as any)
        .insert(data));
    }

    setLoading(false);

    if (error) {
      toast.error(editItem ? 'Không thể cập nhật' : 'Không thể thêm mới');
      return;
    }

    toast.success(editItem ? 'Đã cập nhật thành công' : 'Đã thêm thành công');
    onOpenChange(false);
    onSuccess();
  };

  const formatAmountInput = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) {
      setAmount('');
      return;
    }
    const formatted = new Intl.NumberFormat('vi-VN').format(parseInt(numericValue));
    setAmount(formatted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm dự chi / nợ'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Loại</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned_expense">Dự chi</SelectItem>
                <SelectItem value="debt">Nợ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tên</Label>
            <Input
              placeholder="VD: Tiền nhà tháng 3, Nợ anh A..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Số tiền (VND)</Label>
            <Input
              placeholder="0"
              value={amount}
              onChange={(e) => formatAmountInput(e.target.value)}
              inputMode="numeric"
            />
          </div>

          {type === 'debt' && (
            <div className="space-y-2">
              <Label>Chủ nợ</Label>
              <Input
                placeholder="Tên người/tổ chức cho vay"
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Ngày đến hạn</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Chưa thanh toán</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              placeholder="Ghi chú thêm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Đang lưu...' : editItem ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
