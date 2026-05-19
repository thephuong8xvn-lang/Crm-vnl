import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useGlobalState } from '../context/GlobalStateContext';
import { useAuth } from '../context/AuthContext';

const empty = {
  title: '', lead_id: '', stage_id: '', expected_value: '',
  expected_close_date: '', assignee_id: '',
};

export default function OpportunityFormModal({ isOpen, onClose, editData = null }) {
  const { leads, stages, profiles, addOpportunity, updateOpportunity } = useGlobalState();
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        lead_id: editData.lead_id || '',
        stage_id: editData.stage_id || (stages[0]?.id || ''),
        expected_value: editData.expected_value ? String(editData.expected_value) : '',
        expected_close_date: editData.expected_close_date || '',
        assignee_id: editData.assignee_id || user?.id || '',
      });
    } else {
      setForm({
        ...empty,
        stage_id: stages[0]?.id || '',
        assignee_id: user?.id || '',
        lead_id: editData?.lead_id || '',
      });
    }
    setErrors({});
    setApiError('');
  }, [editData, isOpen, stages, user?.id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Vui lòng nhập tên cơ hội';
    if (!form.lead_id) e.lead_id = 'Vui lòng chọn khách hàng';
    if (!form.expected_value || Number(form.expected_value) <= 0) e.expected_value = 'Vui lòng nhập giá trị hợp lệ';
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
        lead_id: form.lead_id || null,
        stage_id: form.stage_id || null,
        expected_value: Number(form.expected_value),
        expected_close_date: form.expected_close_date || null,
        assignee_id: form.assignee_id || null,
      };
      if (editData?.id) await updateOpportunity(editData.id, payload);
      else await addOpportunity(payload);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const inp = (err) => `w-full bg-transparent border ${err ? 'border-red-400' : 'border-[#E3D7C8]'} rounded-lg px-3 py-2.5 text-sm text-[#3F3A33] outline-none focus:border-[#C89A3D] transition-colors`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData?.id ? 'Chỉnh sửa cơ hội' : 'Thêm cơ hội mới'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Tên cơ hội *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} className={inp(errors.title)} placeholder="VD: Hợp đồng đại lý Q3" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Lead */}
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Khách hàng *</label>
          <select value={form.lead_id} onChange={e => set('lead_id', e.target.value)} className={inp(errors.lead_id)}>
            <option value="">— Chọn khách hàng —</option>
            {leads.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.lead_id && <p className="text-red-500 text-xs mt-1">{errors.lead_id}</p>}
        </div>

        {/* Value + Stage */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Giá trị (VND) *</label>
            <input value={form.expected_value} onChange={e => set('expected_value', e.target.value)} className={inp(errors.expected_value)} placeholder="VD: 280000000" type="number" min="0" />
            {errors.expected_value && <p className="text-red-500 text-xs mt-1">{errors.expected_value}</p>}
            {form.expected_value && Number(form.expected_value) > 0 && (
              <p className="text-xs text-[#C89A3D] mt-1">
                = {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(form.expected_value))}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Giai đoạn</label>
            <select value={form.stage_id} onChange={e => set('stage_id', e.target.value)} className={inp(false)}>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Date + Assignee */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Ngày dự kiến chốt</label>
            <input value={form.expected_close_date} onChange={e => set('expected_close_date', e.target.value)} className={inp(false)} type="date" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Người phụ trách</label>
            <select value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)} className={inp(false)}>
              <option value="">— Chưa chỉ định —</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
        </div>

        {/* Actions */}
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
            ) : editData?.id ? 'Lưu thay đổi' : 'Tạo cơ hội'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
