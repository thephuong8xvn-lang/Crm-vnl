import { X, User, Calendar, Tag, TrendingUp, FileText, CreditCard, Trash2, Edit2 } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';

const fmt = (v) => Number(v || 0).toLocaleString('vi-VN') + ' đ';

const stageColor = {
  'Mới': 'bg-[#f0e7dc] text-[#4f4637]',
  'Đang tư vấn': 'bg-[#C89A3D]/15 text-[#C89A3D]',
  'Gửi báo giá': 'bg-[#d5e3ff] text-[#001c3b]',
  'Đàm phán': 'bg-[#D96C3F]/15 text-[#D96C3F]',
  'Chốt đơn': 'bg-emerald-100 text-emerald-700',
  'Thất bại': 'bg-red-50 text-red-600',
};

export default function OpportunityDetailPanel({ opp, onClose, onEdit, onDelete, onAddPayment }) {
  const { tasks, payments } = useGlobalState();

  if (!opp) return null;

  const relatedTasks = tasks.filter(t => t.opportunityId === opp.id);
  const relatedPayments = payments.filter(p => p.opportunityId === opp.id);
  const totalPaid = relatedPayments.filter(p => p.status === 'Đã thanh toán').reduce((s, p) => s + p.amount, 0);

  return (
    <aside className="w-[380px] bg-white/95 backdrop-blur-md border-l border-[#E3D7C8] flex flex-col h-full overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-[#E3D7C8] flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#3F3A33] leading-tight text-base mb-1 line-clamp-2">{opp.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor[opp.stage] || 'bg-gray-100 text-gray-600'}`}>
            {opp.stage}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button onClick={onEdit} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8375] hover:text-[#C89A3D] hover:bg-[#C89A3D]/10 transition-colors">
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8375] hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8375] hover:text-[#3F3A33] hover:bg-black/5 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
        {/* Key Info */}
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center text-sm">
          <div className="flex items-center gap-1.5 text-[#8B8375] text-xs whitespace-nowrap"><User size={14} /> Khách hàng</div>
          <span className="font-medium text-[#3F3A33]">{opp.customer}</span>

          <div className="flex items-center gap-1.5 text-[#8B8375] text-xs whitespace-nowrap"><TrendingUp size={14} /> Giá trị</div>
          <span className="font-bold text-[#C89A3D]">{fmt(opp.value)}</span>

          <div className="flex items-center gap-1.5 text-[#8B8375] text-xs whitespace-nowrap"><Tag size={14} /> Phân khúc</div>
          <span className="text-[#4f4637]">{opp.type}</span>

          <div className="flex items-center gap-1.5 text-[#8B8375] text-xs whitespace-nowrap"><User size={14} /> Phụ trách</div>
          <span className="text-[#4f4637]">{opp.manager}</span>

          {opp.date && <>
            <div className="flex items-center gap-1.5 text-[#8B8375] text-xs whitespace-nowrap"><Calendar size={14} /> Ngày dự kiến</div>
            <span className="text-[#4f4637]">{opp.date}</span>
          </>}

          {opp.note && <>
            <div className="flex items-center gap-1.5 text-[#8B8375] text-xs whitespace-nowrap self-start pt-0.5"><FileText size={14} /> Ghi chú</div>
            <span className="text-[#4f4637] text-xs leading-relaxed">{opp.note}</span>
          </>}
        </div>

        {/* Payment summary */}
        <div className="glass-panel rounded-xl p-4 border border-[#E3D7C8]">
          <p className="text-xs text-[#8B8375] mb-1">Đã thanh toán</p>
          <p className="text-xl font-bold text-[#C89A3D]">{fmt(totalPaid)}</p>
          <p className="text-xs text-[#8B8375] mt-0.5">/ {fmt(opp.value)} mục tiêu</p>
          <div className="mt-2 h-1.5 rounded-full bg-[#E3D7C8] overflow-hidden">
            <div className="h-full bg-[#C89A3D] rounded-full transition-all" style={{ width: `${Math.min(100, opp.value > 0 ? (totalPaid / Number(opp.value)) * 100 : 0)}%` }} />
          </div>
        </div>

        {/* Related Tasks */}
        {relatedTasks.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#8B8375] uppercase tracking-wide mb-2">Công việc liên quan ({relatedTasks.length})</p>
            <div className="space-y-1.5">
              {relatedTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f6ece2]/60">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${t.completed ? 'bg-emerald-500' : 'bg-[#D96C3F]'}`} />
                  <span className={`text-xs flex-1 truncate ${t.completed ? 'line-through text-[#8B8375]' : 'text-[#3F3A33]'}`}>{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Payments */}
        {relatedPayments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#8B8375] uppercase tracking-wide mb-2">Thanh toán ({relatedPayments.length})</p>
            <div className="space-y-1.5">
              {relatedPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#f6ece2]/60">
                  <span className="text-xs text-[#3F3A33]">{p.date}</span>
                  <span className="text-xs font-semibold text-[#C89A3D]">{fmt(p.amount)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#E3D7C8] bg-white/70 backdrop-blur-md">
        <button
          onClick={onAddPayment}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-[#C89A3D] text-white hover:bg-[#b08735] transition-colors shadow-sm"
        >
          <CreditCard size={16} />
          Ghi nhận thanh toán
        </button>
      </div>
    </aside>
  );
}
