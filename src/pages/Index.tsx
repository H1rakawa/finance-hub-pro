import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { TrendingUp, Wallet, PieChart, Shield, ArrowRight } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FinanceApp</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link to="/auth">
              <Button>Bắt đầu miễn phí</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 opacity-0 animate-fade-up">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              Quản lý tài chính
              <span className="text-primary"> thông minh</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Theo dõi chi tiêu, quản lý nhiều tài khoản và đạt được mục tiêu tài chính của bạn với ứng dụng đơn giản và hiệu quả.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 text-base">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Tính năng nổi bật</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Mọi thứ bạn cần để kiểm soát tài chính cá nhân
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-8 text-center opacity-0 animate-fade-up animation-delay-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-6">
                <Wallet className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Nhiều tài khoản</h3>
              <p className="text-muted-foreground">
                Quản lý ngân hàng, tiền mặt, thẻ tín dụng và đầu tư trong một nơi duy nhất.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 text-center opacity-0 animate-fade-up animation-delay-200">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-6">
                <PieChart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Báo cáo chi tiết</h3>
              <p className="text-muted-foreground">
                Xem biểu đồ và thống kê để hiểu rõ thói quen chi tiêu của bạn.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 text-center opacity-0 animate-fade-up animation-delay-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-6">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Bảo mật cao</h3>
              <p className="text-muted-foreground">
                Dữ liệu của bạn được mã hóa và bảo vệ với công nghệ bảo mật tiên tiến.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Sẵn sàng kiểm soát tài chính?
            </h2>
            <p className="text-muted-foreground">
              Đăng ký miễn phí và bắt đầu quản lý tiền bạc thông minh hơn ngay hôm nay.
            </p>
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 text-base">
                Đăng ký miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 FinanceApp. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
