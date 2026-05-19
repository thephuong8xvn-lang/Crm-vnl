-- Trigger Tự động tạo Profile khi user đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Unknown User'),
    'sales', -- Mặc định là Sales, Admin sẽ đổi role sau
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger tự động map Team_id cho Leads và Opportunities
CREATE OR REPLACE FUNCTION public.set_team_id_from_assignee()
RETURNS trigger AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL THEN
    SELECT team_id INTO NEW.team_id FROM public.team_members WHERE profile_id = NEW.assignee_id LIMIT 1;
  ELSE
    NEW.team_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_team_id_leads
BEFORE INSERT OR UPDATE OF assignee_id ON public.leads
FOR EACH ROW EXECUTE PROCEDURE public.set_team_id_from_assignee();

CREATE TRIGGER trg_set_team_id_opportunities
BEFORE INSERT OR UPDATE OF assignee_id ON public.opportunities
FOR EACH ROW EXECUTE PROCEDURE public.set_team_id_from_assignee();
