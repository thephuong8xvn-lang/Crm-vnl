-- Function hỗ trợ lấy role tối ưu RLS
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS text AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Bật RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Chính sách cho bảng leads
CREATE POLICY "Admin full access leads" ON public.leads
FOR ALL TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Team lead access team leads" ON public.leads
FOR ALL TO authenticated
USING (
  public.get_user_role() = 'team_lead' AND 
  team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid() AND is_leader = true)
);

CREATE POLICY "Sales access own leads" ON public.leads
FOR ALL TO authenticated
USING (
  public.get_user_role() = 'sales' AND 
  assignee_id = auth.uid()
);

-- Chính sách cho bảng opportunities
CREATE POLICY "Admin full access opportunities" ON public.opportunities
FOR ALL TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Team lead access team opportunities" ON public.opportunities
FOR ALL TO authenticated
USING (
  public.get_user_role() = 'team_lead' AND 
  team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid() AND is_leader = true)
);

CREATE POLICY "Sales access own opportunities" ON public.opportunities
FOR ALL TO authenticated
USING (
  public.get_user_role() = 'sales' AND 
  assignee_id = auth.uid()
);

-- Chính sách cho bảng tasks
CREATE POLICY "Admin full access tasks" ON public.tasks
FOR ALL TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Team lead access team tasks" ON public.tasks
FOR ALL TO authenticated
USING (
  public.get_user_role() = 'team_lead' AND 
  team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid() AND is_leader = true)
);

CREATE POLICY "Sales access own tasks" ON public.tasks
FOR ALL TO authenticated
USING (
  public.get_user_role() = 'sales' AND 
  assignee_id = auth.uid()
);

-- Chính sách cho bảng payments
CREATE POLICY "Admin full access payments" ON public.payments
FOR ALL TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Team lead access team payments" ON public.payments
FOR ALL TO authenticated
USING (
  public.get_user_role() = 'team_lead' AND 
  (SELECT team_id FROM public.opportunities WHERE id = public.payments.opportunity_id) IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid() AND is_leader = true)
);

CREATE POLICY "Sales access own payments" ON public.payments
FOR ALL TO authenticated
USING (
  public.get_user_role() = 'sales' AND 
  (SELECT assignee_id FROM public.opportunities WHERE id = public.payments.opportunity_id) = auth.uid()
);
