-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Enable realtime for accounts table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;