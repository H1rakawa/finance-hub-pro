
-- Create table for planned expenses and debts
CREATE TABLE public.planned_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'planned_expense', -- 'planned_expense' or 'debt'
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  note TEXT,
  creditor TEXT, -- person/org you owe (for debts)
  currency TEXT NOT NULL DEFAULT 'VND',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.planned_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own planned expenses"
ON public.planned_expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own planned expenses"
ON public.planned_expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planned expenses"
ON public.planned_expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planned expenses"
ON public.planned_expenses FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_planned_expenses_updated_at
BEFORE UPDATE ON public.planned_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.planned_expenses;
