import { X, Phone, Mail, MapPin, Tag, User, CreditCard, Sparkles, Trash2, Edit2 } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';

const segStyle = {
  'VIP': 'bg-[#C89A3D]/12 text-[#C89A3D]',
  'Đại lý': 'bg-[#e9dece]/50 text-[#645e51]',
  'Khách lẻ': 'bg-[#d2c5b1]/30 text-[#4f4637]',
};

const stageColor = {
  'Mới': 'bg-[#f0e7dc] text-[#4f4637]',
  'Đang tư vấn': 'bg-[#C89A3D]/15 text-[#C89A3D]',
  'Gửi báo giá': 'bg-[#d5e3ff] text-[#001c3b]',
  'Đàm phán': 'bg-[#D96C3F]/15 text-[#D96C3F]',
  'Chốt đơn': 'bg-emerald-100 text-emerald-700',
  'Thất bại': 'bg-red-50 text-red-600',
};

const fmt = (v) => Number(v || 0).toLocaleString('vi-VN') + ' đ';

export default function CustomerDetailPanel({ customer, onClose, onEdit, onDelete, onAddOpportunity }) {
  const { opportunities, payments } = useGlobalState();

  if (!customer) return null;

  const relOpp = opportunities.filter(o => o.customerId === customer.id);
  const relPay = payments.filter(p => p.customerId === customer.id);
  const totalPaid = relPay.filter(p => p.status === 'Đã thanh toán').reduce((s, p) => s + p.amount, 0);

  return (
    <aside className="w-[380px] bg-white/95 backdrop-blur-md border-l border-[#E3D7C8] flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-5 border-b border-[#E3D7C8]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#e9dece] flex items-center justify-center text-lg font-bold text-[#696255] shrink-0">
              {customer.initials}
            </div>
            <div>
              <h3 className="font-bold text-[#3F3A33] text-base">{customer.name}</h3>
              <p className="text-xs text-[#8B8375]">{customer.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && <button onClick={onEdit} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8375] hover:text-[#C89A3D] hover:bg-[#C89A3D]/10 transition-colors"><Edit2 size={16} /></button>}
            {onDelete && <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8375] hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8375] hover:text-[#3F3A33] hover:bg-black/5 transition-colors"><X size={18} /></button>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${segStyle[customer.segment] || ''}`}>{customer.segment}</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
        <div className="space-y-2.5">
          {customer.phone && <div className="flex items-center gap-2.5 text-sm"><Phone size={14} className="text-[#8B8375] shrink-0" /><span className="text-[#3F3A33]">{customer.phone}</span></div>}
          {customer.email && <div className="flex items-center gap-2.5 text-sm"><Mail size={14} className="text-[#8B8375] shrink-0" /><span className="text-[#3F3A33] truncate">{customer.email}</span></div>}
          {customer.address && <div className="flex items-start gap-2.5 text-sm"><MapPin size={14} className="text-[#8B8375] shrink-0 mt-0.5" /><span className="text-[#4f4637]">{customer.address}</span></div>}
          <div className="flex items-center gap-2.5 text-sm"><User size={14} className="text-[#8B8375] shrink-0" /><span className="text-[#4f4637]">Phụ trách: {customer.manager}</span></div>
        </div>

        {customer.products?.length > 0 && (
          <div>
            <p className="text-xs text-[#8B8375] mb-2 flex items-center gap-1"><Tag size={12} /> Sản phẩm quan tâm</p>
            <div className="flex flex-wrap gap-1.5">
              {customer.products.map(p => <span key={p} className="px-2.5 py-1 border border-[#E3D7C8] rounded-full text-xs text-[#4f4637]">{p}</span>)}
            </div>
          </div>
        )}

        <div className="glass-panel rounded-xl p-4 border border-[#E3D7C8]">
          <div className="flex justify-between">
            <div><p className="text-xs text-[#8B8375] mb-0.5">Đã thanh toán</p><p className="font-bold text-[#C89A3D]">{fmt(totalPaid)}</p></div>
            <div className="text-right"><p className="text-xs text-[#8B8375] mb-0.5">Số cơ hội</p><p className="font-bold text-[#3F3A33]">{relOpp.length}</p></div>
          </div>
        </div>

        {relOpp.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#8B8375] uppercase tracking-wide mb-2">Cơ hội ({relOpp.length})</p>
            <div className="space-y-1.5">
              {relOpp.map(o => (
                <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#f6ece2]/60">
                  <span className="text-xs text-[#3F3A33] truncate flex-1 mr-2">{o.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${stageColor[o.stage] || ''}`}>{o.stage}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {relPay.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#8B8375] uppercase tracking-wide mb-2">Thanh toán ({relPay.length})</p>
            <div className="space-y-1.5">
              {relPay.map(p => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#f6ece2]/60">
                  <span className="text-xs text-[#8B8375]">{p.date}</span>
                  <span className="text-xs font-semibold text-[#C89A3D]">{Number(p.amount).toLocaleString('vi-VN')} đ</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#E3D7C8] bg-white/70 backdrop-blur-md">
        <button onClick={onAddOpportunity} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-[#C89A3D] text-white hover:bg-[#b08735] transition-colors shadow-sm">
          <Sparkles size={16} /> Tạo cơ hội mới
        </button>
      </div>
    </aside>
  );
}
