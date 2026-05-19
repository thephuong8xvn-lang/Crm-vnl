import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const TABS = ['Người dùng', 'Vai trò & Nhóm', 'Quy trình bán hàng', 'Sản phẩm'];

const roleStyle = {
  'Admin': 'bg-[#C89A3D]/10 text-[#c89a3d]',
  'Trưởng nhóm': 'bg-[#8B8375]/10 text-[#8B8375]',
  'Sales': 'bg-[#E3D7C8]/50 text-[#3F3A33]',
};

// ── User Form Modal ──
function UserFormModal({ isOpen, onClose, editData, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'Sales', team: 'Nhóm Miền Nam', status: 'Hoạt động' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [err, setErr] = useState({});

  const handleOpen = () => {
    setForm(editData ? { name: editData.name, email: editData.email, role: editData.role, team: editData.team === '—' ? '' : editData.team, status: editData.status } : { name: '', email: '', role: 'Sales', team: 'Nhóm Miền Nam', status: 'Hoạt động' });
    setErr({});
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const initials = form.name.split(' ').slice(-2).map(p => p[0]).join('').toUpperCase();
    onSubmit({ ...form, initials, team: form.team || '—' });
    onClose();
  };

  const inp = (k) => `w-full bg-transparent border ${err[k] ? 'border-red-400' : 'border-[#E3D7C8]'} rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C89A3D] transition-colors`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Sửa người dùng' : 'Thêm người dùng'} size="md">
      <form onSubmit={submit} className="p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Họ và tên *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={inp('name')} placeholder="Nguyễn Văn A" />
          {err.name && <p className="text-red-500 text-xs mt-1">{err.name}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Email *</label>
          <input value={form.email} onChange={e => set('email', e.target.value)} className={inp('email')} placeholder="user@yensaovinhung.vn" type="email" />
          {err.email && <p className="text-red-500 text-xs mt-1">{err.email}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Vai trò</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className={inp('role')}>
              <option>Sales</option><option>Trưởng nhóm</option><option>Admin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Nhóm</label>
            <input value={form.team} onChange={e => set('team', e.target.value)} className={inp('team')} placeholder="Nhóm Miền Nam" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Trạng thái</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className={inp('status')}>
            <option>Hoạt động</option><option>Không hoạt động</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-[#E3D7C8]">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#4f4637] border border-[#E3D7C8] hover:bg-[#f6ece2] transition-colors">Hủy</button>
          <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#C89A3D] text-white hover:bg-[#b08735] transition-colors">{editData ? 'Lưu' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Stage Form Modal ──
function StageFormModal({ isOpen, onClose, editData, onSubmit }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setErr('Vui lòng nhập tên giai đoạn'); return; }
    onSubmit({ name, color: '#8B8375' });
    onClose(); setName('');
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Sửa giai đoạn' : 'Thêm giai đoạn'} size="sm">
      <form onSubmit={submit} className="p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Tên giai đoạn *</label>
          <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} className="w-full bg-transparent border border-[#E3D7C8] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C89A3D]" placeholder="VD: Chờ duyệt" />
          {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-[#E3D7C8]">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#4f4637] border border-[#E3D7C8] hover:bg-[#f6ece2]">Hủy</button>
          <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#C89A3D] text-white hover:bg-[#b08735]">{editData ? 'Lưu' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Product Form Modal ──
function ProductFormModal({ isOpen, onClose, editData, onSubmit }) {
  const [form, setForm] = useState({ name: '', unit: '', price: '', note: '' });
  const [err, setErr] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Vui lòng nhập tên sản phẩm'); return; }
    onSubmit(form);
    onClose(); setForm({ name: '', unit: '', price: '', note: '' });
  };
  const inp = `w-full bg-transparent border border-[#E3D7C8] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C89A3D] transition-colors`;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} size="md">
      <form onSubmit={submit} className="p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Tên sản phẩm *</label>
          <input value={form.name} onChange={e => { set('name', e.target.value); setErr(''); }} className={inp} placeholder="VD: Yến chưng" />
          {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Đơn vị</label>
            <input value={form.unit} onChange={e => set('unit', e.target.value)} className={inp} placeholder="kg / hộp / lọ" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Giá tham khảo</label>
            <input value={form.price} onChange={e => set('price', e.target.value)} className={inp} placeholder="VD: 350,000 đ/hộp" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[#8B8375] mb-1.5 block">Ghi chú</label>
          <textarea value={form.note} onChange={e => set('note', e.target.value)} className={`${inp} resize-none h-16`} placeholder="Mô tả ngắn..." />
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-[#E3D7C8]">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#4f4637] border border-[#E3D7C8] hover:bg-[#f6ece2]">Hủy</button>
          <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#C89A3D] text-white hover:bg-[#b08735]">{editData ? 'Lưu' : 'Thêm'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Settings ──
export default function Settings() {
  const { users, addUser, updateUser, deleteUser, stages, addStage, updateStage, deleteStage, products, addProduct, updateProduct, deleteProduct } = useGlobalState();
  const [tab, setTab] = useState('Người dùng');
  const [userModal, setUserModal] = useState(false);
  const [stageModal, setStageModal] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openAdd = () => { setEditTarget(null); if (tab === 'Người dùng') setUserModal(true); else if (tab === 'Quy trình bán hàng') setStageModal(true); else if (tab === 'Sản phẩm') setProductModal(true); };
  const openEdit = (item) => { setEditTarget(item); if (tab === 'Người dùng') setUserModal(true); else if (tab === 'Quy trình bán hàng') setStageModal(true); else if (tab === 'Sản phẩm') setProductModal(true); };

  const handleUserSubmit = (data) => { if (editTarget) updateUser(editTarget.id, data); else addUser(data); };
  const handleStageSubmit = (data) => { if (editTarget) updateStage(editTarget.id, data); else addStage(data); };
  const handleProductSubmit = (data) => { if (editTarget) updateProduct(editTarget.id, data); else addProduct(data); };

  const canAdd = tab !== 'Vai trò & Nhóm';

  return (
    <div className="p-8 w-full max-w-[1440px] mx-auto flex gap-6 h-[calc(100vh-60px)]">
      {/* Left Nav */}
      <div className="w-[220px] shrink-0 glass-panel rounded-xl p-2 flex flex-col h-full overflow-y-auto">
        <div className="px-4 pt-4 pb-2"><span className="text-[11px] text-[#8B8375] font-semibold uppercase tracking-wider">Hệ thống</span></div>
        <nav className="flex flex-col gap-1 px-2">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 rounded-lg text-sm transition-colors w-full text-left font-medium ${tab === t ? 'bg-[#C89A3D]/10 text-[#c89a3d]' : 'text-[#4f4637] hover:bg-[#eae1d7]/50'}`}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="px-4 pt-6 pb-2"><span className="text-[11px] text-[#8B8375] font-semibold uppercase tracking-wider">Tài khoản</span></div>
        <nav className="flex flex-col gap-1 px-2 mb-4">
          {['Hồ sơ cá nhân', 'Bảo mật'].map(t => (
            <button key={t} className="px-4 py-2.5 rounded-lg text-[#4f4637] hover:bg-[#eae1d7]/50 text-sm transition-colors w-full text-left">{t}</button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 glass-panel rounded-xl p-6 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl text-[#3F3A33] font-medium">{tab}</h3>
          {canAdd && (
            <button onClick={openAdd} className="bg-[#C89A3D] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#b08735] transition-colors shadow-sm">
              <Plus size={18} /> Thêm mới
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto rounded-lg border border-[#E3D7C8]/50 custom-scrollbar">
          {/* ── Người dùng ── */}
          {tab === 'Người dùng' && (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[#eae1d7]/30 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  {['Tên', 'Email', 'Vai trò', 'Nhóm', 'Trạng thái', ''].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs text-[#8B8375] font-medium border-b border-[#E3D7C8]/50 ${h === '' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D7C8]/30">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-[#fcf2e8]/50 transition-colors group">
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${user.role === 'Admin' ? 'bg-[#C89A3D] text-white' : 'bg-[#eae1d7] text-[#1f1b15]'}`}>{user.initials}</div>
                      <span className="font-medium text-[#1f1b15]">{user.name}</span>
                    </td>
                    <td className="px-4 py-4 text-[#4f4637] text-sm">{user.email}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${roleStyle[user.role] || ''}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-4 text-[#4f4637] text-sm">{user.team}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Hoạt động' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm text-[#4f4637]">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => openEdit(user)} className="text-[#817665] hover:text-[#C89A3D] transition-colors p-1 opacity-0 group-hover:opacity-100 mr-2"><Edit size={18} /></button>
                      {user.role !== 'Admin' && (
                        <button onClick={() => setDeleteConfirm({ item: user, type: 'user' })} className="text-[#817665] hover:text-[#ba1a1a] transition-colors p-1 opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Vai trò & Nhóm ── */}
          {tab === 'Vai trò & Nhóm' && (
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-[#3F3A33] mb-3">Vai trò</h4>
                <div className="space-y-2">
                  {[
                    { role: 'Admin', desc: 'Toàn quyền hệ thống — xem, thêm, sửa, xóa tất cả' },
                    { role: 'Trưởng nhóm', desc: 'Xem báo cáo nhóm, giao việc, duyệt chiết khấu' },
                    { role: 'Sales', desc: 'Quản lý khách hàng, cơ hội và công việc của mình' },
                  ].map(r => (
                    <div key={r.role} className="flex items-center justify-between p-4 rounded-xl border border-[#E3D7C8] bg-white/50">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold mr-3 ${roleStyle[r.role]}`}>{r.role}</span>
                        <span className="text-sm text-[#4f4637]">{r.desc}</span>
                      </div>
                      <span className="text-xs text-[#8B8375]">{users.filter(u => u.role === r.role).length} thành viên</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[#3F3A33] mb-3">Nhóm</h4>
                <div className="p-4 rounded-xl border border-[#E3D7C8] bg-white/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#3F3A33]">Nhóm Miền Nam</p>
                    <p className="text-xs text-[#8B8375] mt-0.5">Phụ trách khách hàng và đại lý khu vực Miền Nam</p>
                  </div>
                  <span className="text-xs text-[#8B8375]">{users.filter(u => u.team === 'Nhóm Miền Nam').length} thành viên</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Quy trình bán hàng ── */}
          {tab === 'Quy trình bán hàng' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#eae1d7]/30 sticky top-0">
                <tr>
                  {['Thứ tự', 'Tên giai đoạn', ''].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs text-[#8B8375] font-medium border-b border-[#E3D7C8]/50 ${h === '' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D7C8]/30">
                {stages.sort((a, b) => a.order - b.order).map(stage => (
                  <tr key={stage.id} className="hover:bg-[#fcf2e8]/50 transition-colors group">
                    <td className="px-4 py-4 text-[#8B8375] text-sm">{stage.order}</td>
                    <td className="px-4 py-4 font-medium text-[#3F3A33]">{stage.name}</td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => openEdit(stage)} className="text-[#817665] hover:text-[#C89A3D] transition-colors p-1 opacity-0 group-hover:opacity-100 mr-2"><Edit size={18} /></button>
                      <button onClick={() => setDeleteConfirm({ item: stage, type: 'stage' })} className="text-[#817665] hover:text-[#ba1a1a] transition-colors p-1 opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Sản phẩm ── */}
          {tab === 'Sản phẩm' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#eae1d7]/30 sticky top-0">
                <tr>
                  {['Tên sản phẩm', 'Đơn vị', 'Giá tham khảo', 'Ghi chú', ''].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs text-[#8B8375] font-medium border-b border-[#E3D7C8]/50 ${h === '' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D7C8]/30">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#fcf2e8]/50 transition-colors group">
                    <td className="px-4 py-4 font-medium text-[#3F3A33]">{p.name}</td>
                    <td className="px-4 py-4 text-[#4f4637] text-sm">{p.unit}</td>
                    <td className="px-4 py-4 text-[#C89A3D] font-semibold text-sm">{p.price}</td>
                    <td className="px-4 py-4 text-[#8B8375] text-sm">{p.note}</td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => openEdit(p)} className="text-[#817665] hover:text-[#C89A3D] transition-colors p-1 opacity-0 group-hover:opacity-100 mr-2"><Edit size={18} /></button>
                      <button onClick={() => setDeleteConfirm({ item: p, type: 'product' })} className="text-[#817665] hover:text-[#ba1a1a] transition-colors p-1 opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserFormModal isOpen={userModal} onClose={() => { setUserModal(false); setEditTarget(null); }} editData={editTarget} onSubmit={handleUserSubmit} />
      <StageFormModal isOpen={stageModal} onClose={() => { setStageModal(false); setEditTarget(null); }} editData={editTarget} onSubmit={handleStageSubmit} />
      <ProductFormModal isOpen={productModal} onClose={() => { setProductModal(false); setEditTarget(null); }} editData={editTarget} onSubmit={handleProductSubmit} />
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          const { item, type } = deleteConfirm || {};
          if (type === 'user') deleteUser(item.id);
          else if (type === 'stage') deleteStage(item.id);
          else if (type === 'product') deleteProduct(item.id);
        }}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa "${deleteConfirm?.item?.name}"?`}
        confirmLabel="Xóa"
      />
    </div>
  );
}
