ALTER TABLE public.fabrics_db
  ADD COLUMN IF NOT EXISTS has_offer boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS offer_text text,
  ADD COLUMN IF NOT EXISTS in_all_branches boolean NOT NULL DEFAULT true;