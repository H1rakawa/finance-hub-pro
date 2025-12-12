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
      <div className="space-y-6 sm:space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Quản lý tài khoản và tùy chọn</p>
        </div>

        {/* Profile Section */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Thông tin tài khoản</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Quản lý thông tin cá nhân</p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-muted-foreground text-xs sm:text-sm">Email</Label>
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg sm:rounded-xl">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                <span className="text-foreground text-sm truncate">{user?.email}</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-muted-foreground text-xs sm:text-sm">ID người dùng</Label>
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg sm:rounded-xl">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                <span className="text-foreground font-mono text-xs sm:text-sm truncate">{user?.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary shrink-0">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Thông báo</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Quản lý cài đặt thông báo</p>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">Tính năng thông báo sẽ được cập nhật trong phiên bản tiếp theo.</p>
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 border-destructive/20">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-destructive">Vùng nguy hiểm</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Các hành động không thể hoàn tác</p>
          </div>

          <Button 
            variant="outline" 
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto"
            onClick={signOut}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
