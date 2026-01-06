import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if coming from password reset email
    const modeParam = searchParams.get('mode');
    if (modeParam === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && mode !== 'reset') {
      navigate('/dashboard');
    }
  }, [user, navigate, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email hoặc mật khẩu không đúng');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Đăng nhập thành công!');
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Email này đã được đăng ký');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Đăng ký thành công!');
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.');
        setMode('login');
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp');
          return;
        }
        if (password.length < 6) {
          toast.error('Mật khẩu phải có ít nhất 6 ký tự');
          return;
        }
        const { error } = await updatePassword(password);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Đặt lại mật khẩu thành công!');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Chào mừng trở lại';
      case 'signup': return 'Tạo tài khoản';
      case 'forgot': return 'Quên mật khẩu';
      case 'reset': return 'Đặt lại mật khẩu';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Đăng nhập để quản lý tài chính của bạn';
      case 'signup': return 'Đăng ký để bắt đầu quản lý tài chính';
      case 'forgot': return 'Nhập email để nhận link đặt lại mật khẩu';
      case 'reset': return 'Nhập mật khẩu mới của bạn';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Đang xử lý...';
    switch (mode) {
      case 'login': return 'Đăng nhập';
      case 'signup': return 'Đăng ký';
      case 'forgot': return 'Gửi email đặt lại';
      case 'reset': return 'Đặt lại mật khẩu';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">FinanceApp</span>
          </div>

          {/* Back button for forgot/reset mode */}
          {(mode === 'forgot' || mode === 'reset') && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </button>
          )}

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{getTitle()}</h1>
            <p className="text-muted-foreground">{getDescription()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === 'reset' ? 'Mật khẩu mới' : 'Mật khẩu'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {/* Forgot password link */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {getButtonText()}
            </Button>
          </form>

          {(mode === 'login' || mode === 'signup') && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'login' 
                  ? 'Chưa có tài khoản? Đăng ký ngay' 
                  : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="max-w-lg text-center space-y-6">
          <div className="mx-auto w-64 h-64 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-32 h-32 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Quản lý tài chính thông minh
          </h2>
          <p className="text-muted-foreground text-lg">
            Theo dõi chi tiêu, quản lý nhiều tài khoản và đạt được mục tiêu tài chính của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}
