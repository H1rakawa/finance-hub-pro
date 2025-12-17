import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editAccount?: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    color: string;
  } | null;
}

const accountTypes = [
  { value: 'bank', label: 'Ngân hàng' },
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'credit_card', label: 'Thẻ tín dụng' },
  { value: 'e_wallet', label: 'Ví điện tử' },
  { value: 'investment', label: 'Đầu tư' },
];

const colors = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
];

export function AddAccountModal({ open, onOpenChange, onSuccess, editAccount }: AddAccountModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editAccount?.name || '');
  const [type, setType] = useState(editAccount?.type || 'bank');
  const [balance, setBalance] = useState(editAccount?.balance?.toString() || '0');
  const [currency, setCurrency] = useState(editAccount?.currency || 'VND');
  const [color, setColor] = useState(editAccount?.color || '#10b981');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      if (editAccount) {
        const { error } = await supabase
          .from('accounts')
          .update({
            name,
            type,
            balance: parseFloat(balance),
            currency,
            color,
          })
          .eq('id', editAccount.id);

        if (error) throw error;
        toast.success('Cập nhật tài khoản thành công!');
      } else {
        const { error } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id,
            name,
            type,
            balance: parseFloat(balance),
            currency,
            color,
          });

        if (error) throw error;
        toast.success('Thêm tài khoản thành công!');
      }

      onSuccess();
      onOpenChange(false);
      // Reset form
      setName('');
      setType('bank');
      setBalance('0');
      setCurrency('VND');
      setColor('#10b981');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editAccount ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên tài khoản</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Vietcombank, Tiền mặt..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loại tài khoản</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Số dư ban đầu</Label>
            <Input
              id="balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Đơn vị tiền tệ</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VND - Việt Nam Đồng</SelectItem>
                <SelectItem value="USD">USD - Đô la Mỹ</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Màu sắc</Label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Đang lưu...' : editAccount ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
