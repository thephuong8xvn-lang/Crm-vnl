import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Download } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';
import PaymentFormModal from '../components/PaymentFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const statusStyle = {
  'Đã thanh toán': 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]',
  'Chưa thanh toán': 'bg-[#fcf2e8] text-[#D96C3F] border border-[#f5d9cc]',
  'Hoàn tiền': 'bg-transparent text-[#D96C3F] border border-[#D96C3F]',
};

const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v || 0));

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

export default function Payments() {
  const { payments, deletePayment, loadingPayments } = useGlobalState();
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [detailPayment, setDetailPayment] = useState(null);
  const [formModal, setFormModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => payments.filter(p => !filterStatus || p.status === filterStatus), [payments, filterStatus]);

  const totalPaid = useMemo(() => payments.filter(p => p.status === 'Đã thanh toán').reduce((s, p) => s + Number(p.amount || 0), 0), [payments]);
  const totalUnpaid = useMemo(() => payments.filter(p => p.status === 'Chưa thanh toán').reduce((s, p) => s + Number(p.amount || 0), 0), [payments]);
  const totalAll = useMemo(() => filtered.reduce((s, p) => s + Number(p.amount || 0), 0), [filtered]);

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  const handleExportCSV = () => {
    const rows = [
      ['Khách hàng', 'Cơ hội', 'Số tiền', 'Trạng thái', 'Hình thức', 'Ngày tạo'],
      ...filtered.map(p => [p.lead?.name || '—', p.opportunity?.title || '—', p.amount, p.status, p.payment_method, new Date(p.created_at).toLocaleDateString('vi-VN')]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'thanh-toan.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const openEdit = (p) => { setEditData(p); setFormModal(true); setDetailPayment(null); };
  const openAdd = () => { setEditData(null); setFormModal(true); };
  const handleDelete = async () => {
    if (deleteConfirm) {
      await deletePayment(deleteConfirm.id);
      setDetailPayment(null);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 max-w-[1440px] mx-auto w-full">
        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { label: 'Tổng đã thanh toán:', val: fmt(totalPaid), valStyle: 'text-[#C89A3D]' },
            { label: 'Chưa thanh toán:', val: fmt(totalUnpaid), valStyle: 'text-[#1f1b15]' },
            { label: 'Tổng hiển thị:', val: fmt(totalAll), valStyle: 'text-[#1f1b15]' },
          ].map(s => (
            <div key={s.label} className="glass-panel rounded-full px-6 py-2 flex items-center gap-2">
              <span className="text-[#4f4637] font-medium text-sm">{s.label}</span>
              <span className={`font-bold text-sm ${s.valStyle}`}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-glass rounded-lg px-4 py-2 text-sm text-[#4f4637] outline-none cursor-pointer">
            <option value="">Trạng thái: Tất cả</option>
            <option>Đã thanh toán</option>
            <option>Chưa thanh toán</option>
            <option>Hoàn tiền</option>
          </select>
          <div className="flex items-center gap-3">
            <button onClick={handleExportCSV} className="px-4 py-2 rounded-lg border border-[#C89A3D] text-[#C89A3D] hover:bg-[#C89A3D]/10 transition-colors font-medium text-sm flex items-center gap-1.5">
              <Download size={16} /> Xuất CSV
            </button>
            <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-[#C89A3D] text-white hover:bg-[#b08530] transition-colors font-medium text-sm flex items-center gap-1 shadow-sm">
              <Plus size={16} /> Ghi nhận thanh toán
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-[#E3D7C8] text-xs font-medium text-[#4f4637]/80">
                  <th className="py-4 pl-6 pr-2 w-10">
                    <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded border-[#d2c5b1] text-[#C89A3D] cursor-pointer" />
                  </th>
                  {['Khách hàng', 'Cơ hội', 'Số tiền', 'Trạng thái', 'Hình thức', 'Ngày tạo', ''].map((h, i) => (
                    <th key={i} className={`py-4 px-3 font-medium ${h === 'Số tiền' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {loadingPayments ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#E3D7C8]">
                    <td className="py-4 pl-6 pr-2"><div className="w-4 h-4 bg-[#E3D7C8] rounded animate-pulse"></div></td>
                    {[140, 160, 100, 100, 80, 90].map((w, j) => (
                      <td key={j} className="py-4 px-3"><div className="h-4 bg-[#E3D7C8] rounded animate-pulse" style={{width:w}}></div></td>
                    ))}
                    <td></td>
                  </tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-[#8B8375] text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <p>Chưa có giao dịch nào</p>
                      <button onClick={openAdd} className="text-sm text-[#C89A3D] hover:underline font-medium">+ Ghi nhận thanh toán đầu tiên</button>
                    </div>
                  </td></tr>
                ) : filtered.map(payment => {
                  const isSel = selected.includes(payment.id);
                  const isActive = detailPayment?.id === payment.id;
                  const leadName = payment.lead?.name || '—';
                  return (
                    <tr key={payment.id}
                      className={`border-b border-[#E3D7C8]/50 transition-colors cursor-pointer ${isActive ? 'bg-[#C89A3D]/10' : isSel ? 'bg-[#fcf2e8]/50' : 'hover:bg-[#fcf2e8]/30'}`}
                      onClick={() => setDetailPayment(prev => prev?.id === payment.id ? null : payment)}>
                      <td className="py-4 pl-6 pr-2" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleSelect(payment.id)} className="rounded border-[#d2c5b1] text-[#C89A3D] cursor-pointer" />
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#eae1d7] flex items-center justify-center text-primary font-medium text-xs">{getInitials(leadName)}</div>
                          <span className="font-medium text-[#1f1b15]">{leadName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-[#1f1b15]">{payment.opportunity?.title || '—'}</td>
                      <td className="py-4 px-3 font-bold text-right text-[#1f1b15]">{fmt(payment.amount)}</td>
                      <td className="py-4 px-3"><span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${statusStyle[payment.status] || ''}`}>{payment.status}</span></td>
                      <td className="py-4 px-3 text-[#4f4637]">{payment.payment_method || '—'}</td>
                      <td className="py-4 px-3 text-[#4f4637]">{payment.created_at ? new Date(payment.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                      <td className="py-4 pr-4 pl-2 text-right" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(payment)} className="text-xs text-[#8B8375] hover:text-[#C89A3D] transition-colors px-2 py-1 rounded hover:bg-[#C89A3D]/10">Sửa</button>
                        <button onClick={() => setDeleteConfirm(payment)} className="text-xs text-[#8B8375] hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50 ml-1">Xóa</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length > 0 && (
                  <tr className="bg-[#fcf2e8]/80 font-medium">
                    <td className="py-4 pl-6 pr-2" />
                    <td className="py-4 px-3 text-[#1f1b15]">Tổng</td>
                    <td className="py-4 px-3" />
                    <td className="py-4 px-3 font-bold text-right text-[#C89A3D]">{fmt(totalAll)}</td>
                    <td colSpan={4} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-[#E3D7C8] flex justify-between items-center text-sm text-[#4f4637]">
            <span>Hiển thị {filtered.length} / {payments.length} giao dịch</span>
          </div>
        </div>
      </div>

      {/* Detail side panel */}
      {detailPayment && (
        <aside className="w-[320px] bg-white/95 backdrop-blur-md border-l border-[#E3D7C8] flex flex-col shrink-0 overflow-hidden">
          <div className="p-5 border-b border-[#E3D7C8] flex items-center justify-between">
            <h3 className="font-semibold text-[#3F3A33]">Chi tiết thanh toán</h3>
            <button onClick={() => setDetailPayment(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8375] hover:bg-black/5 transition-colors"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="text-center pb-4 border-b border-[#E3D7C8]">
              <p className="text-3xl font-bold text-[#C89A3D] mb-1">{fmt(detailPayment.amount)}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyle[detailPayment.status] || ''}`}>{detailPayment.status}</span>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Khách hàng', detailPayment.lead?.name || '—'],
                ['Cơ hội', detailPayment.opportunity?.title || '—'],
                ['Hình thức', detailPayment.payment_method || '—'],
                ['Ngày tạo', detailPayment.created_at ? new Date(detailPayment.created_at).toLocaleDateString('vi-VN') : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start">
                  <span className="text-[#8B8375] text-xs">{label}</span>
                  <span className="text-[#3F3A33] font-medium text-xs text-right ml-4">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-[#E3D7C8] flex gap-2">
            <button onClick={() => openEdit(detailPayment)} className="flex-1 py-2 rounded-lg text-sm font-medium border border-[#C89A3D] text-[#C89A3D] hover:bg-[#C89A3D]/10 transition-colors">Chỉnh sửa</button>
            <button onClick={() => setDeleteConfirm(detailPayment)} className="flex-1 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Xóa</button>
          </div>
        </aside>
      )}

      <PaymentFormModal isOpen={formModal} onClose={() => { setFormModal(false); setEditData(null); }} editData={editData} />
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Xóa giao dịch" message={`Xóa giao dịch này?`} confirmLabel="Xóa" />
    </div>
  );
}
