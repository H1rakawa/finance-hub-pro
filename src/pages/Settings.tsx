import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, Bell } from 'lucide-react';

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
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
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">Quản lý tài khoản và tùy chọn</p>
        </div>

        {/* Profile Section */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Thông tin tài khoản</h2>
              <p className="text-sm text-muted-foreground">Quản lý thông tin cá nhân</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{user?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">ID người dùng</Label>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground font-mono text-sm">{user?.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Thông báo</h2>
              <p className="text-sm text-muted-foreground">Quản lý cài đặt thông báo</p>
            </div>
          </div>

          <p className="text-muted-foreground">Tính năng thông báo sẽ được cập nhật trong phiên bản tiếp theo.</p>
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-2xl p-6 space-y-6 border-destructive/20">
          <div>
            <h2 className="text-lg font-semibold text-destructive">Vùng nguy hiểm</h2>
            <p className="text-sm text-muted-foreground">Các hành động không thể hoàn tác</p>
          </div>

          <Button 
            variant="outline" 
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={signOut}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
