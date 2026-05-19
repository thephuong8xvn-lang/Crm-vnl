import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useGlobalState } from '../context/GlobalStateContext';

const STATUSES = ['Chưa thanh toán', 'Đã thanh toán', 'Hoàn tiền'];
const METHODS = ['Chuyển khoản', 'Tiền mặt', 'Thẻ ngân hàng'];

const empty = {
  lead_id: '', opportunity_id: '',
  amount: '', status: 'Chưa thanh toán', payment_method: 'Chuyển khoản',
};

export default function PaymentFormModal({ isOpen, onClose, editData = null, prefillOpportunityId = null }) {
  const { leads, opportunities, addPayment, updatePayment } = useGlobalState();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        lead_id: editData.lead_id || '',
        opportunity_id: editData.opportunity_id || '',
        amount: String(editData.amount || ''),
        status: editData.status || 'Chưa thanh toán',
        payment_method: editData.payment_method || 'Chuyển khoản',
      });
    } else {
      const preOpp = prefillOpportunityId ? opportunities.find(o => o.id === prefillOpportunityId) : null;
      setForm({
        ...empty,
        opportunity_id: preOpp?.id || '',
        lead_id: preOpp?.lead_id || '',
        amount: preOpp?.expected_value ? String(preOpp.expected_value) : '',
      });
    }
    setErrors({});
    setApiError('');
  }, [editData, isOpen, prefillOpportunityId, opportunities]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLeadChange = (id) => {
    set('lead_id', id);
    set('opportunity_id', '');
  };

  const handleOpportunityChange = (id) => {
    const o = opportunities.find(o => o.id === id);
    set('opportunity_id', id);
    if (o?.expected_value) set('amount', String(o.expected_value));
    if (o?.lead_id) set('lead_id', o.lead_id);
  };

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Vui lòng nhập số tiền hợp lệ';
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
        lead_id: form.lead_id || null,
        opportunity_id: form.opportunity_id || null,
        amount: Number(form.amount),
        status: form.status,
        payment_method: form.payment_method,
      };
      if (editData) await updatePayment(editData.id, payload);
      else await addPayment(payload);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const inp = (err) => `w-full bg-transparent border ${err ? 'border-red-400' : 'border-[#E3D7C8]'} rounded-lg px-3 py-2.5 text-sm text-[#3F3A33] outline-none focus:border-[#C89A3D] transition-colors`;

  const relatedOpps = form.lead_id
    ? opportunities.filter(o => o.lead_id === form.lead_id)
    : opportunities;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Sửa thanh toán' : 'Ghi nhận thanh toán'} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>
        )}

        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Khách hàng</label>
          <select value={form.lead_id} onChange={e => handleLeadChange(e.target.value)} className={inp(false)}>
            <option value="">— Chọn khách hàng —</option>
            {leads.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Cơ hội</label>
          <select value={form.opportunity_id} onChange={e => handleOpportunityChange(e.target.value)} className={inp(false)}>
            <option value="">— Không gắn cơ hội —</option>
            {relatedOpps.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Số tiền (VND) *</label>
          <input value={form.amount} onChange={e => set('amount', e.target.value)} className={inp(errors.amount)} type="number" min="0" placeholder="VD: 50000000" />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          {form.amount && Number(form.amount) > 0 && (
            <p className="text-xs text-[#C89A3D] mt-1">
              = {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(form.amount))}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Trạng thái</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inp(false)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Hình thức</label>
            <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)} className={inp(false)}>
              {METHODS.map(m => <option key={m}>{m}</option>)}
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
            ) : editData ? 'Lưu thay đổi' : 'Ghi nhận'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
