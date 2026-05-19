import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useGlobalState } from '../context/GlobalStateContext';
import { useAuth } from '../context/AuthContext';

const SEGMENTS = ['Đại lý', 'VIP', 'Khách lẻ'];
const PRODUCTS = ['Yến thô', 'Yến chưng', 'Yến tinh chế'];

const empty = {
  name: '', phone_1: '', phone_2: '', email: '', address: '',
  segment: 'Đại lý', product_interest: [], assignee_id: '', notes: '',
};

export default function CustomerFormModal({ isOpen, onClose, editData = null }) {
  const { addLead, updateLead, leads, profiles } = useGlobalState();
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || '',
        phone_1: editData.phone_1 || '',
        phone_2: editData.phone_2 || '',
        email: editData.email || '',
        address: editData.address || '',
        segment: editData.segment || 'Đại lý',
        product_interest: editData.product_interest || [],
        assignee_id: editData.assignee_id || user?.id || '',
        notes: editData.notes || '',
      });
    } else {
      setForm({ ...empty, assignee_id: user?.id || '' });
    }
    setErrors({});
    setApiError('');
  }, [editData, isOpen, user?.id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleProduct = (p) => {
    setForm(f => ({
      ...f,
      product_interest: f.product_interest.includes(p)
        ? f.product_interest.filter(x => x !== p)
        : [...f.product_interest, p],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!form.phone_1.trim()) e.phone_1 = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{9,11}$/.test(form.phone_1.replace(/\s/g, ''))) e.phone_1 = 'Số điện thoại không hợp lệ';
    // Kiểm tra trùng SĐT
    const dup = leads.find(c =>
      c.phone_1?.replace(/\s/g, '') === form.phone_1.replace(/\s/g, '') &&
      (!editData || c.id !== editData.id)
    );
    if (dup) e.phone_1 = 'Số điện thoại đã tồn tại';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
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
        name: form.name.trim(),
        phone_1: form.phone_1.trim(),
        phone_2: form.phone_2.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        segment: form.segment,
        product_interest: form.product_interest,
        assignee_id: form.assignee_id || null,
        notes: form.notes.trim() || null,
      };
      if (editData) {
        await updateLead(editData.id, payload);
      } else {
        await addLead(payload);
      }
      onClose();
    } catch (err) {
      setApiError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const inp = (err) =>
    `w-full bg-transparent border ${err ? 'border-red-400' : 'border-[#E3D7C8]'} rounded-lg px-3 py-2.5 text-sm text-[#3F3A33] outline-none focus:border-[#C89A3D] transition-colors`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Họ và tên *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className={inp(errors.name)} placeholder="Nguyễn Thị Thu" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Số điện thoại *</label>
            <input value={form.phone_1} onChange={e => set('phone_1', e.target.value)} className={inp(errors.phone_1)} placeholder="0901 234 567" />
            {errors.phone_1 && <p className="text-red-500 text-xs mt-1">{errors.phone_1}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Số điện thoại 2</label>
            <input value={form.phone_2} onChange={e => set('phone_2', e.target.value)} className={inp(false)} placeholder="0912 345 678" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Email</label>
            <input value={form.email} onChange={e => set('email', e.target.value)} className={inp(errors.email)} placeholder="email@company.vn" type="email" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Phân khúc</label>
            <select value={form.segment} onChange={e => set('segment', e.target.value)} className={inp(false)}>
              {SEGMENTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Địa chỉ</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} className={inp(false)} placeholder="Địa chỉ giao hàng..." />
          </div>
        </div>

        {/* Products */}
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-2 block">Sản phẩm quan tâm</label>
          <div className="flex gap-2 flex-wrap">
            {PRODUCTS.map(p => (
              <button
                type="button"
                key={p}
                onClick={() => toggleProduct(p)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  form.product_interest.includes(p)
                    ? 'bg-[#C89A3D]/10 border-[#C89A3D] text-[#C89A3D] font-medium'
                    : 'border-[#E3D7C8] text-[#4f4637] hover:border-[#C89A3D]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Người phụ trách — lấy từ profiles */}
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Người phụ trách</label>
          <select value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)} className={inp(false)}>
            <option value="">— Chưa chỉ định —</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Ghi chú</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className={`${inp(false)} resize-none h-20`} placeholder="Ghi chú thêm về khách hàng..." />
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
            ) : editData ? 'Lưu thay đổi' : 'Thêm khách hàng'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
