CREATE INDEX idx_leads_assignee ON public.leads(assignee_id);
CREATE INDEX idx_leads_team ON public.leads(team_id);
CREATE INDEX idx_opportunities_assignee ON public.opportunities(assignee_id);
CREATE INDEX idx_opportunities_team ON public.opportunities(team_id);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX idx_team_members_profile ON public.team_members(profile_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
