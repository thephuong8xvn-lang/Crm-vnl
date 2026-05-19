import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const GlobalStateContext = createContext(null);

// ─── Helper: bắt lỗi Supabase thân thiện ─────────────────────────────────
function handleSupabaseError(error, fallbackMsg = 'Đã xảy ra lỗi. Vui lòng thử lại.') {
  if (!error) return;
  console.error('[Supabase]', error);
  throw new Error(error.message || fallbackMsg);
}

export function GlobalStateProvider({ children }) {
  // ─── State ────────────────────────────────────────────────────────────
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stages, setStages] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingStages, setLoadingStages] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // ─── Fetch functions ──────────────────────────────────────────────────

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*, assignee:profiles!leads_assignee_id_fkey(id, full_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Lỗi tải khách hàng:', err.message);
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  const fetchOpportunities = useCallback(async () => {
    setLoadingOpportunities(true);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          lead:leads(id, name, segment),
          stage:pipeline_stages(id, name, order_index),
          assignee:profiles!opportunities_assignee_id_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOpportunities(data || []);
    } catch (err) {
      console.error('Lỗi tải cơ hội:', err.message);
    } finally {
      setLoadingOpportunities(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          lead:leads(id, name),
          opportunity:opportunities(id, title),
          assignee:profiles!tasks_assignee_id_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Lỗi tải công việc:', err.message);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          lead:leads(id, name),
          opportunity:opportunities(id, title)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error('Lỗi tải thanh toán:', err.message);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  const fetchStages = useCallback(async () => {
    setLoadingStages(true);
    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      setStages(data || []);
    } catch (err) {
      console.error('Lỗi tải giai đoạn:', err.message);
    } finally {
      setLoadingStages(false);
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Lỗi tải hồ sơ người dùng:', err.message);
    } finally {
      setLoadingProfiles(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, team_members(*, profile:profiles(id, full_name, role))')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setTeams(data || []);
    } catch (err) {
      console.error('Lỗi tải nhóm:', err.message);
    }
  }, []);

  // Fetch tất cả khi mount
  useEffect(() => {
    fetchLeads();
    fetchOpportunities();
    fetchTasks();
    fetchPayments();
    fetchStages();
    fetchProfiles();
    fetchTeams();
  }, [fetchLeads, fetchOpportunities, fetchTasks, fetchPayments, fetchStages, fetchProfiles, fetchTeams]);

  // ─── LEADS (Khách hàng) ───────────────────────────────────────────────

  const addLead = async (data) => {
    const { data: inserted, error } = await supabase
      .from('leads')
      .insert([data])
      .select('*, assignee:profiles!leads_assignee_id_fkey(id, full_name, email)')
      .single();
    if (error) handleSupabaseError(error, 'Không thể thêm khách hàng mới.');
    setLeads(prev => [inserted, ...prev]);
    return inserted;
  };

  const updateLead = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('leads')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, assignee:profiles!leads_assignee_id_fkey(id, full_name, email)')
      .single();
    if (error) handleSupabaseError(error, 'Không thể cập nhật khách hàng.');
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
    return updated;
  };

  const deleteLead = async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'Không thể xóa khách hàng.');
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  // ─── OPPORTUNITIES (Cơ hội) ───────────────────────────────────────────

  const addOpportunity = async (data) => {
    const { data: inserted, error } = await supabase
      .from('opportunities')
      .insert([data])
      .select(`*, lead:leads(id,name,segment), stage:pipeline_stages(id,name,order_index), assignee:profiles!opportunities_assignee_id_fkey(id,full_name)`)
      .single();
    if (error) handleSupabaseError(error, 'Không thể thêm cơ hội mới.');
    setOpportunities(prev => [inserted, ...prev]);
    return inserted;
  };

  const updateOpportunity = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('opportunities')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`*, lead:leads(id,name,segment), stage:pipeline_stages(id,name,order_index), assignee:profiles!opportunities_assignee_id_fkey(id,full_name)`)
      .single();
    if (error) handleSupabaseError(error, 'Không thể cập nhật cơ hội.');
    setOpportunities(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  };

  const deleteOpportunity = async (id) => {
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'Không thể xóa cơ hội.');
    setOpportunities(prev => prev.filter(o => o.id !== id));
  };

  const moveOpportunity = async (id, newStageId) => {
    return updateOpportunity(id, { stage_id: newStageId });
  };

  // ─── TASKS (Công việc) ────────────────────────────────────────────────

  const addTask = async (data) => {
    const { data: inserted, error } = await supabase
      .from('tasks')
      .insert([data])
      .select(`*, lead:leads(id,name), opportunity:opportunities(id,title), assignee:profiles!tasks_assignee_id_fkey(id,full_name)`)
      .single();
    if (error) handleSupabaseError(error, 'Không thể thêm công việc mới.');
    setTasks(prev => [inserted, ...prev]);
    return inserted;
  };

  const updateTask = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', id)
      .select(`*, lead:leads(id,name), opportunity:opportunities(id,title), assignee:profiles!tasks_assignee_id_fkey(id,full_name)`)
      .single();
    if (error) handleSupabaseError(error, 'Không thể cập nhật công việc.');
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'Không thể xóa công việc.');
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'Hoàn thành' ? 'Mới' : 'Hoàn thành';
    return updateTask(id, { status: newStatus });
  };

  // ─── PAYMENTS (Thanh toán) ────────────────────────────────────────────

  const addPayment = async (data) => {
    const { data: inserted, error } = await supabase
      .from('payments')
      .insert([data])
      .select(`*, lead:leads(id,name), opportunity:opportunities(id,title)`)
      .single();
    if (error) handleSupabaseError(error, 'Không thể thêm thanh toán mới.');
    setPayments(prev => [inserted, ...prev]);
    return inserted;
  };

  const updatePayment = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('payments')
      .update(data)
      .eq('id', id)
      .select(`*, lead:leads(id,name), opportunity:opportunities(id,title)`)
      .single();
    if (error) handleSupabaseError(error, 'Không thể cập nhật thanh toán.');
    setPayments(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deletePayment = async (id) => {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'Không thể xóa thanh toán.');
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  // ─── STAGES (Giai đoạn) ───────────────────────────────────────────────

  const addStage = async (data) => {
    const { data: inserted, error } = await supabase
      .from('pipeline_stages')
      .insert([{ ...data, order_index: stages.length + 1 }])
      .select()
      .single();
    if (error) handleSupabaseError(error, 'Không thể thêm giai đoạn mới.');
    setStages(prev => [...prev, inserted]);
    return inserted;
  };

  const updateStage = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('pipeline_stages')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) handleSupabaseError(error, 'Không thể cập nhật giai đoạn.');
    setStages(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  };

  const deleteStage = async (id) => {
    const { error } = await supabase.from('pipeline_stages').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'Không thể xóa giai đoạn.');
    setStages(prev => prev.filter(s => s.id !== id));
  };

  // ─── PROFILES (Người dùng) ────────────────────────────────────────────

  const updateProfile = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) handleSupabaseError(error, 'Không thể cập nhật hồ sơ.');
    setProfiles(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deleteProfile = async (id) => {
    // Chỉ xóa auth user — trigger cascade sẽ xóa profile
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) handleSupabaseError(error, 'Không thể xóa người dùng.');
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  // ─── TEAMS (Nhóm) ─────────────────────────────────────────────────────

  const addTeam = async (data) => {
    const { data: inserted, error } = await supabase
      .from('teams')
      .insert([data])
      .select()
      .single();
    if (error) handleSupabaseError(error, 'Không thể thêm nhóm mới.');
    await fetchTeams();
    return inserted;
  };

  const updateTeam = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('teams')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) handleSupabaseError(error, 'Không thể cập nhật nhóm.');
    await fetchTeams();
    return updated;
  };

  const deleteTeam = async (id) => {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'Không thể xóa nhóm.');
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  // Legacy aliases để không phải đổi toàn bộ page ngay lập tức
  const customers = leads;
  const addCustomer = addLead;
  const updateCustomer = updateLead;
  const deleteCustomer = deleteLead;

  const users = profiles;
  const addUser = () => { throw new Error('Dùng Supabase Auth để tạo user mới.'); };
  const updateUser = updateProfile;
  const deleteUser = deleteProfile;

  return (
    <GlobalStateContext.Provider value={{
      // Data
      leads, customers, opportunities, tasks, payments, stages, profiles, users, teams,
      // Loading
      loadingLeads, loadingOpportunities, loadingTasks, loadingPayments, loadingStages, loadingProfiles,
      // Leads / Customers
      addLead, updateLead, deleteLead,
      addCustomer, updateCustomer, deleteCustomer,
      // Opportunities
      addOpportunity, updateOpportunity, deleteOpportunity, moveOpportunity,
      // Tasks
      addTask, updateTask, deleteTask, toggleTask,
      // Payments
      addPayment, updatePayment, deletePayment,
      // Stages
      addStage, updateStage, deleteStage,
      // Profiles / Users
      updateProfile, deleteProfile,
      addUser, updateUser, deleteUser,
      // Teams
      teams, addTeam, updateTeam, deleteTeam,
      // Refresh
      fetchLeads, fetchOpportunities, fetchTasks, fetchPayments, fetchStages, fetchProfiles, fetchTeams,
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const ctx = useContext(GlobalStateContext);
  if (!ctx) throw new Error('useGlobalState phải được dùng trong GlobalStateProvider');
  return ctx;
}
