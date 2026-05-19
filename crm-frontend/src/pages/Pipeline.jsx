import { useState } from 'react';
import { Plus, User, Calendar } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';
import OpportunityFormModal from '../components/OpportunityFormModal';
import OpportunityDetailPanel from '../components/OpportunityDetailPanel';
import PaymentFormModal from '../components/PaymentFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

// Màu theo tên giai đoạn
const stageColors = {
  'Mới':          { badge: 'bg-[#eae1d7] text-[#4f4637]', col: '' },
  'Đang tư vấn':  { badge: 'bg-[#C89A3D]/15 text-[#C89A3D]', col: '' },
  'Gửi báo giá':  { badge: 'bg-[#d5e3ff] text-[#001c3b]', col: '' },
  'Đàm phán':     { badge: 'bg-[#D96C3F]/15 text-[#D96C3F]', col: '' },
  'Chốt đơn':     { badge: 'bg-emerald-100 text-emerald-700', col: '' },
  'Thất bại':     { badge: 'bg-red-50 text-red-600', col: 'opacity-70' },
};

const getStageStyle = (name) => stageColors[name] || { badge: 'bg-[#eae1d7] text-[#4f4637]', col: '' };

export default function Pipeline() {
  const { opportunities, stages, leads, profiles, moveOpportunity, deleteOpportunity, loadingOpportunities, loadingStages } = useGlobalState();
  const [draggedId, setDraggedId] = useState(null);
  const [filterAssignee, setFilterAssignee] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [prefillOppId, setPrefillOppId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Lọc theo người phụ trách
  const filteredOpps = opportunities.filter(o => {
    if (filterAssignee && o.assignee_id !== filterAssignee) return false;
    return true;
  });

  // Nhóm theo stage_id
  const byStage = (stageId) => filteredOpps.filter(o => o.stage_id === stageId);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, stageId) => {
    e.preventDefault();
    if (draggedId) {
      await moveOpportunity(draggedId, stageId);
      if (selectedOpp?.id === draggedId) {
        setSelectedOpp(prev => ({ ...prev, stage_id: stageId }));
      }
    }
    setDraggedId(null);
  };

  const openAddPayment = (opp) => {
    setPrefillOppId(opp.id);
    setPaymentModal(true);
    setSelectedOpp(null);
  };

  const openEdit = (opp) => {
    setEditData(opp);
    setAddModal(true);
    setSelectedOpp(null);
  };

  const handleDelete = (opp) => {
    setDeleteConfirm(opp);
    setSelectedOpp(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteOpportunity(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  // Skeleton column
  const SkeletonCard = () => (
    <div className="glass-panel rounded-xl p-4 border border-[#E3D7C8]">
      <div className="h-3 bg-[#E3D7C8] rounded animate-pulse mb-2 w-3/4"></div>
      <div className="h-3 bg-[#E3D7C8] rounded animate-pulse mb-3 w-1/2"></div>
      <div className="h-4 bg-[#E3D7C8] rounded animate-pulse w-1/3"></div>
    </div>
  );

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col h-full w-full" style={{ flex: 1, minWidth: 0 }}>
        {/* Filter Bar */}
        <div className="glass-panel border-b border-[#E3D7C8] py-3 px-6 flex justify-between items-center shrink-0 z-20 relative">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filterAssignee}
              onChange={e => setFilterAssignee(e.target.value)}
              className="text-[13px] text-[#4f4637] px-3 py-1.5 rounded-lg border border-[#E3D7C8] bg-white/60 outline-none focus:border-[#C89A3D] transition-colors"
            >
              <option value="">Nhân viên: Tất cả</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
            <span className="text-xs text-[#8B8375]">
              {filteredOpps.length} cơ hội | Tổng:{' '}
              <span className="font-medium text-[#C89A3D]">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  filteredOpps.reduce((s, o) => s + (Number(o.expected_value) || 0), 0)
                )}
              </span>
            </span>
          </div>
          <button
            onClick={() => { setEditData(null); setAddModal(true); }}
            className="bg-[#C89A3D] text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#b08735] transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus size={16} /> Thêm cơ hội
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-6 bg-transparent">
          <div className="flex gap-5 h-full items-start pb-4 w-max">
            {loadingStages ? (
              // Loading skeleton columns
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="kanban-col-bg rounded-xl p-3 w-[275px] border border-outline-variant/10">
                  <div className="h-4 bg-[#E3D7C8] rounded animate-pulse mb-3 w-2/3"></div>
                  <div className="flex flex-col gap-2.5">
                    {Array.from({ length: 2 }).map((_, j) => <SkeletonCard key={j} />)}
                  </div>
                </div>
              ))
            ) : stages.map(stage => {
              const items = byStage(stage.id);
              const style = getStageStyle(stage.name);
              return (
                <div
                  key={stage.id}
                  className={`kanban-col-bg rounded-xl p-3 w-[275px] min-h-[200px] flex flex-col border border-outline-variant/10 ${style.col}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, stage.id)}
                >
                  <div className="flex justify-between items-center mb-3 px-1 shrink-0">
                    <h3 className="text-[12px] font-bold uppercase tracking-wide text-[#3F3A33]">{stage.name}</h3>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${style.badge}`}>{items.length}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar pr-1">
                    {loadingOpportunities ? (
                      Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : items.length === 0 ? (
                      <div className="h-12 border-2 border-dashed border-[#E3D7C8] rounded-xl flex items-center justify-center text-xs text-[#8B8375]">
                        Thả vào đây
                      </div>
                    ) : items.map(item => {
                      const leadName = item.lead?.name || '—';
                      const assigneeName = item.assignee?.full_name || '';
                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={e => handleDragStart(e, item.id)}
                          onClick={() => setSelectedOpp(item)}
                          className={`glass-panel rounded-xl p-4 shadow-sm border transition-all cursor-pointer group
                            border-[#E3D7C8] hover:border-[#C89A3D]
                            ${draggedId === item.id ? 'opacity-40' : ''}
                            ${selectedOpp?.id === item.id ? 'ring-2 ring-[#C89A3D]/40' : ''}`}
                        >
                          <h4 className="text-[13px] font-medium mb-1 line-clamp-2 leading-snug text-[#3F3A33] group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1 text-[12px] text-[#8B8375] mb-2">
                            <User size={13} /><span className="truncate">{leadName}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[#C89A3D] font-semibold text-[13px]">
                              {new Intl.NumberFormat('vi-VN').format(Number(item.expected_value || 0))} đ
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-[#eae1d7] text-[#4f4637] border-transparent">
                              {item.lead?.segment || '—'}
                            </span>
                          </div>
                          {assigneeName && (
                            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-[#C89A3D]/20 text-[#C89A3D] flex items-center justify-center text-[9px] font-bold">
                                  {assigneeName.split(' ').pop()[0]}
                                </div>
                                <span className="text-[11px] text-[#4f4637] truncate max-w-[100px]">{assigneeName}</span>
                              </div>
                              {item.expected_close_date && (
                                <div className="flex items-center gap-1 text-[11px] text-[#4f4637]">
                                  <Calendar size={11} />
                                  <span>{new Date(item.expected_close_date).toLocaleDateString('vi-VN')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* Empty drop zone */}
                    {!loadingOpportunities && items.length > 0 && (
                      <div className="h-8 border-2 border-dashed border-[#E3D7C8] rounded-xl opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-[#8B8375]">
                        Thả vào đây
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedOpp && (
        <OpportunityDetailPanel
          opp={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onEdit={() => openEdit(selectedOpp)}
          onDelete={() => handleDelete(selectedOpp)}
          onAddPayment={() => openAddPayment(selectedOpp)}
        />
      )}

      {/* Modals */}
      <OpportunityFormModal
        isOpen={addModal}
        onClose={() => { setAddModal(false); setEditData(null); }}
        editData={editData}
      />
      <PaymentFormModal
        isOpen={paymentModal}
        onClose={() => { setPaymentModal(false); setPrefillOppId(null); }}
        prefillOpportunityId={prefillOppId}
      />
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Xóa cơ hội"
        message={`Bạn có chắc muốn xóa cơ hội "${deleteConfirm?.title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa cơ hội"
      />
    </div>
  );
}
