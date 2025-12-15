import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/format';
import { PieChart, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Transaction {
  type: string;
  category: string;
  amount: number;
  date: string;
}

const categoryLabels: Record<string, string> = {
  salary: 'Lương',
  food: 'Ăn uống',
  transport: 'Di chuyển',
  shopping: 'Mua sắm',
  entertainment: 'Giải trí',
  bills: 'Hóa đơn',
  health: 'Sức khỏe',
  education: 'Giáo dục',
  investment: 'Đầu tư',
  other_income: 'Thu nhập khác',
  other_expense: 'Chi tiêu khác',
};

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function Reports() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    
    // Get current month transactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('type, category, amount, date')
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    if (error) {
      toast.error('Không thể tải dữ liệu báo cáo');
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const netIncome = totalIncome - totalExpense;

  // Group expenses by category
  const expenseByCategory = expenseTransactions.reduce((acc, t) => {
    const category = t.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += parseFloat(t.amount.toString());
    return acc;
  }, {} as Record<string, number>);

  const expenseChartData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    name: categoryLabels[category] || category,
    value: amount,
  }));

  // Group income by category
  const incomeByCategory = incomeTransactions.reduce((acc, t) => {
    const category = t.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += parseFloat(t.amount.toString());
    return acc;
  }, {} as Record<string, number>);

  const incomeChartData = Object.entries(incomeByCategory).map(([category, amount]) => ({
    name: categoryLabels[category] || category,
    value: amount,
  }));

  // Group expenses by date for bar chart
  const expenseByDate = expenseTransactions.reduce((acc, t) => {
    const date = t.date;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += parseFloat(t.amount.toString());
    return acc;
  }, {} as Record<string, number>);

  const dailyExpenseChartData = Object.entries(expenseByDate)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      fullDate: date,
      amount: amount,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Báo cáo</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Thống kê tài chính tháng này</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-success/10 text-success shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Tổng thu nhập</p>
                <p className="text-lg sm:text-2xl font-bold text-success truncate">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-destructive/10 text-destructive shrink-0">
                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Tổng chi tiêu</p>
                <p className="text-lg sm:text-2xl font-bold text-destructive truncate">{formatCurrency(totalExpense)}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl shrink-0 ${
                netIncome >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              }`}>
                <PieChart className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Thu nhập ròng</p>
                <p className={`text-lg sm:text-2xl font-bold truncate ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(netIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Expense Bar Chart */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Chi tiêu theo ngày</h3>
          </div>
          {dailyExpenseChartData.length === 0 ? (
            <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu chi tiêu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyExpenseChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Chi tiêu']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Expense Chart */}
          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Chi tiêu theo danh mục</h3>
            {expenseChartData.length === 0 ? (
              <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">
                Chưa có dữ liệu chi tiêu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    layout="horizontal"
                    verticalAlign="bottom"
                  />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </div>

          {/* Income Chart */}
          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Thu nhập theo danh mục</h3>
            {incomeChartData.length === 0 ? (
              <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">
                Chưa có dữ liệu thu nhập
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={incomeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incomeChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    layout="horizontal"
                    verticalAlign="bottom"
                  />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Chi tiết chi tiêu theo danh mục</h3>
          {expenseChartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm">Chưa có dữ liệu chi tiêu</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {expenseChartData
                .sort((a, b) => b.value - a.value)
                .map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3 sm:gap-4">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1 gap-2">
                        <span className="font-medium text-foreground text-sm truncate">{item.name}</span>
                        <span className="text-muted-foreground text-sm shrink-0">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.value / totalExpense) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
