import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useGlobalState } from '../context/GlobalStateContext';
import { useAuth } from '../context/AuthContext';

const PRIORITIES = ['Cao', 'Trung bình', 'Thấp'];
const STATUSES = ['Mới', 'Đang làm', 'Hoàn thành'];

const empty = {
  title: '', description: '', lead_id: '', opportunity_id: '',
  assignee_id: '', priority: 'Trung bình', status: 'Mới', due_date: '',
};

export default function TaskFormModal({ isOpen, onClose, editData = null, prefillLeadId = null }) {
  const { leads, opportunities, profiles, addTask, updateTask } = useGlobalState();
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        description: editData.description || '',
        lead_id: editData.lead_id || '',
        opportunity_id: editData.opportunity_id || '',
        assignee_id: editData.assignee_id || user?.id || '',
        priority: editData.priority || 'Trung bình',
        status: editData.status || 'Mới',
        due_date: editData.due_date ? editData.due_date.slice(0, 16) : '',
      });
    } else {
      setForm({ ...empty, lead_id: prefillLeadId || '', assignee_id: user?.id || '' });
    }
    setErrors({});
    setApiError('');
  }, [editData, isOpen, prefillLeadId, user?.id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLeadChange = (id) => {
    set('lead_id', id);
    set('opportunity_id', ''); // reset cơ hội khi đổi khách hàng
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Vui lòng nhập tiêu đề';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        lead_id: form.lead_id || null,
        opportunity_id: form.opportunity_id || null,
        assignee_id: form.assignee_id || null,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null,
      };
      if (editData) await updateTask(editData.id, payload);
      else await addTask(payload);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const inp = (err) => `w-full bg-transparent border ${err ? 'border-red-400' : 'border-[#E3D7C8]'} rounded-lg px-3 py-2.5 text-sm text-[#3F3A33] outline-none focus:border-[#C89A3D] transition-colors`;

  // Lọc cơ hội theo khách hàng đã chọn
  const relatedOpps = form.lead_id
    ? opportunities.filter(o => o.lead_id === form.lead_id)
    : opportunities;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>
        )}

        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Tiêu đề *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} className={inp(errors.title)} placeholder="VD: Gọi tư vấn khách hàng" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Mô tả</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} className={`${inp(false)} resize-none h-16`} placeholder="Mô tả chi tiết công việc..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Khách hàng</label>
            <select value={form.lead_id} onChange={e => handleLeadChange(e.target.value)} className={inp(false)}>
              <option value="">— Chọn khách hàng —</option>
              {leads.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Cơ hội liên quan</label>
            <select value={form.opportunity_id} onChange={e => set('opportunity_id', e.target.value)} className={inp(false)}>
              <option value="">— Không có —</option>
              {relatedOpps.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Ưu tiên</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)} className={inp(false)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Trạng thái</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inp(false)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Hạn chót</label>
            <input
              type="datetime-local"
              value={form.due_date}
              onChange={e => set('due_date', e.target.value)}
              className={inp(false)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Người phụ trách</label>
            <select value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)} className={inp(false)}>
              <option value="">— Chưa chỉ định —</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#E3D7C8]">
          <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#4f4637] border border-[#E3D7C8] hover:bg-[#f6ece2] transition-colors disabled:opacity-50">
            Hủy
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#C89A3D] text-white hover:bg-[#b08735] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
            {saving ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang lưu...
              </>
            ) : editData ? 'Lưu thay đổi' : 'Tạo công việc'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
