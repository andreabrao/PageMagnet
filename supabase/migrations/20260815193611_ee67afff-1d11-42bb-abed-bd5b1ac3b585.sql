-- 1. DELETE policy for profiles
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Harden handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  safe_full_name text;
BEGIN
  safe_full_name := NULLIF(btrim(substring(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, '') from 1 for 255)), '');
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(safe_full_name, NEW.email));
  RETURN NEW;
END;
$function$;

-- 3. Prevent client-side plan escalation: only service_role may set a paid plan
CREATE OR REPLACE FUNCTION public.prevent_plan_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan
     AND NEW.plan <> 'free'::public.subscription_plan
     AND COALESCE(auth.role(), '') <> 'service_role' THEN
    NEW.plan := OLD.plan;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS profiles_prevent_plan_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_plan_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_plan_escalation();

-- 4. Trigger functions must not be callable via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_plan_escalation() FROM PUBLIC, anon, authenticated;