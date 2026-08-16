-- Add column to track if user has actively selected a plan
ALTER TABLE public.profiles 
ADD COLUMN has_selected_plan boolean NOT NULL DEFAULT false;

-- Update existing users who have paid plans to have has_selected_plan = true
UPDATE public.profiles SET has_selected_plan = true WHERE plan != 'free';