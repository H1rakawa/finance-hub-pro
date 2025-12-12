import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface FinancialSummary {
  totalBalance: number;
  accounts: Account[];
  recentTransactions: Transaction[];
  monthlyIncome: number;
  monthlyExpense: number;
  topExpenseCategories: { category: string; amount: number }[];
}

export function useFinancialData() {
  const { user } = useAuth();
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch accounts
        const { data: accounts } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);

        // Fetch transactions from current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startOfMonth.toISOString().split('T')[0])
          .order('date', { ascending: false });

        // Calculate totals
        const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
        
        const monthlyIncome = transactions
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        
        const monthlyExpense = transactions
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        // Calculate top expense categories
        const expenseByCategory: Record<string, number> = {};
        transactions
          ?.filter(t => t.type === 'expense')
          .forEach(t => {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + Number(t.amount);
          });

        const topExpenseCategories = Object.entries(expenseByCategory)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        setData({
          totalBalance,
          accounts: accounts || [],
          recentTransactions: transactions?.slice(0, 10) || [],
          monthlyIncome,
          monthlyExpense,
          topExpenseCategories,
        });
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { data, loading };
}
