
-- Add parent_id column to accounts table for hierarchical structure
ALTER TABLE public.accounts ADD COLUMN parent_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX idx_accounts_parent_id ON public.accounts(parent_id);
