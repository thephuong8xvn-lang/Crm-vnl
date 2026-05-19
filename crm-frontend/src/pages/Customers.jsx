import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';
import CustomerFormModal from '../components/CustomerFormModal';
import CustomerDetailPanel from '../components/CustomerDetailPanel';
import OpportunityFormModal from '../components/OpportunityFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Customers() {
  const { leads, deleteLead, loadingLeads } = useGlobalState();
  const [search, setSearch] = useState('');
  const [filterSegment, setFilterSegment] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [selected, setSelected] = useState([]);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [formModal, setFormModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [oppModal, setOppModal] = useState(false);
  const [prefillLeadId, setPrefillLeadId] = useState(null);

  const filtered = useMemo(() => {
    return leads.filter(c => {
      const q = search.toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !c.phone_1?.includes(q) && !c.email?.toLowerCase().includes(q)) return false;
      if (filterSegment && c.segment !== filterSegment) return false;
      if (filterProduct && !c.product_interest?.includes(filterProduct)) return false;
      return true;
    });
  }, [leads, search, filterSegment, filterProduct]);

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id));

  const openEdit = (c) => { setEditData(c); setFormModal(true); setDetailCustomer(null); };
  const openAdd = () => { setEditData(null); setFormModal(true); };
  const openDelete = (c) => { setDeleteConfirm(c); setDetailCustomer(null); };
  const openAddOpp = (c) => { setPrefillLeadId(c.id); setOppModal(true); setDetailCustomer(null); };
  const handleRowClick = (c) => setDetailCustomer(prev => prev?.id === c.id ? null : c);

  const counts = {
    total: leads.length,
    dai_ly: leads.filter(c => c.segment === 'Đại lý').length,
    vip: leads.filter(c => c.segment === 'VIP').length,
    le: leads.filter(c => c.segment === 'Khách lẻ').length,
  };

  const segStyle = (seg) => {
    if (seg === 'VIP') return 'bg-[#C89A3D]/12 text-[#C89A3D]';
    if (seg === 'Đại lý') return 'bg-[#e9dece]/50 text-[#645e51]';
    return 'bg-[#d2c5b1]/30 text-[#4f4637]';
  };

  const getInitials = (name) => {
    const parts = (name || '').trim().split(' ');
    return parts.length >= 2 ? (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase() : (name || '').slice(0, 2).toUpperCase();
  };

  // Skeleton row
  const SkeletonRow = () => (
    <tr className="border-b border-[#E3D7C8]">
      <td className="py-3.5 px-5 w-12"><div className="w-4 h-4 bg-[#E3D7C8] rounded animate-pulse mx-auto"></div></td>
      {[180, 80, 140, 120, 80].map((w, i) => (
        <td key={i} className="py-3.5 px-5">
          <div className={`h-4 bg-[#E3D7C8] rounded animate-pulse`} style={{ width: w }}></div>
        </td>
      ))}
    </tr>
  );

  const handleDelete = async (id) => {
    await deleteLead(id);
    setDetailCustomer(null);
    setDeleteConfirm(null);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 p-8 flex flex-col gap-4 overflow-y-auto max-w-[1440px] w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-2 gap-4">
            <div className="relative w-full lg:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8375]" size={18} />
              <input
                className="input-glass w-full pl-10 pr-4 py-2.5 text-sm placeholder-[#8B8375] outline-none"
                placeholder="Tìm theo tên, SĐT, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={filterSegment} onChange={e => setFilterSegment(e.target.value)} className="input-glass appearance-none pl-4 pr-8 py-2.5 text-sm outline-none cursor-pointer">
                <option value="">Phân khúc: Tất cả</option>
                <option>Đại lý</option><option>VIP</option><option>Khách lẻ</option>
              </select>
              <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className="input-glass appearance-none pl-4 pr-8 py-2.5 text-sm outline-none cursor-pointer">
                <option value="">Sản phẩm: Tất cả</option>
                <option>Yến tinh chế</option><option>Yến chưng</option><option>Yến thô</option>
              </select>
              <button onClick={openAdd} className="px-4 py-2.5 text-sm font-medium bg-[#C89A3D] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm">
                <Plus size={16} /> Thêm khách hàng
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: `Tổng: ${counts.total} khách hàng`, dot: 'bg-[#8B8375]' },
              { label: `${counts.dai_ly} Đại lý`, dot: 'bg-[#645e51]' },
              { label: `${counts.vip} VIP`, dot: 'bg-[#c89a3d]' },
              { label: `${counts.le} Khách lẻ`, dot: 'bg-[#817665]' },
            ].map(s => (
              <div key={s.label} className="glass-panel rounded-full px-4 py-1.5 text-xs text-[#8B8375] flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {s.label}
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#E3D7C8]">
                    <th className="py-3 px-5 w-12 text-center">
                      <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded border-[#E3D7C8] text-[#C89A3D] cursor-pointer" />
                    </th>
                    {['Tên khách hàng', 'Phân khúc', 'Sản phẩm quan tâm', 'Người phụ trách', 'Ngày tạo'].map(h => (
                      <th key={h} className="py-3 px-5 text-xs text-[#8B8375] font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loadingLeads ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#e9dece] flex items-center justify-center">
                            <Search size={20} className="text-[#8B8375]" />
                          </div>
                          <p className="text-[#8B8375] text-sm">
                            {search || filterSegment || filterProduct ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng nào'}
                          </p>
                          {!search && !filterSegment && !filterProduct && (
                            <button onClick={openAdd} className="text-sm text-[#C89A3D] hover:underline font-medium">
                              + Thêm khách hàng mới
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map(customer => {
                    const isSel = selected.includes(customer.id);
                    const isActive = detailCustomer?.id === customer.id;
                    return (
                      <tr
                        key={customer.id}
                        className={`border-b border-[#E3D7C8] transition-colors cursor-pointer relative
                          ${isActive ? 'bg-[#C89A3D]/10' : isSel ? 'bg-[#C89A3D]/[0.05]' : 'hover:bg-[#C89A3D]/[0.03]'}`}
                        onClick={() => handleRowClick(customer)}
                      >
                        {isSel && <td className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#C89A3D]" />}
                        <td className="py-3.5 px-5 text-center" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleSelect(customer.id)} className="rounded border-[#E3D7C8] text-[#C89A3D] cursor-pointer" />
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary font-medium shrink-0">
                              {getInitials(customer.name)}
                            </div>
                            <div>
                              <div className="font-medium text-[#1f1b15]">{customer.name}</div>
                              <div className="text-xs text-[#8B8375]">{customer.phone_1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${segStyle(customer.segment)}`}>{customer.segment}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex gap-1.5 flex-wrap">
                            {(customer.product_interest || []).map(p => (
                              <span key={p} className="px-2 py-0.5 border border-[#E3D7C8] rounded text-xs text-[#4f4637]">{p}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="text-[#4f4637] text-sm">
                            {customer.assignee?.full_name || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[#4f4637]">
                          {customer.created_at ? new Date(customer.created_at).toLocaleDateString('vi-VN') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-white/40 border-t border-[#E3D7C8]">
              <div className="text-sm text-[#8B8375]">Hiển thị {filtered.length} / {leads.length} khách hàng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {detailCustomer && (
        <CustomerDetailPanel
          customer={detailCustomer}
          onClose={() => setDetailCustomer(null)}
          onEdit={() => openEdit(detailCustomer)}
          onDelete={() => openDelete(detailCustomer)}
          onAddOpportunity={() => openAddOpp(detailCustomer)}
        />
      )}

      {/* Modals */}
      <CustomerFormModal isOpen={formModal} onClose={() => { setFormModal(false); setEditData(null); }} editData={editData} />
      <OpportunityFormModal
        isOpen={oppModal}
        onClose={() => { setOppModal(false); setPrefillLeadId(null); }}
        editData={prefillLeadId ? { lead_id: prefillLeadId } : null}
      />
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm?.id)}
        title="Xóa khách hàng"
        message={`Bạn có chắc muốn xóa "${deleteConfirm?.name}"? Thao tác không thể hoàn tác.`}
        confirmLabel="Xóa khách hàng"
      />
    </div>
  );
}
