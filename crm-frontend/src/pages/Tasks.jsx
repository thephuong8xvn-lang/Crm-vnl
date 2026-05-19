import { useState, useMemo } from 'react';
import { Plus, ListTodo, LayoutGrid, CheckCircle2, Trash2, X, Edit } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const priorityStyle = {
  'Cao': 'bg-[#D96C3F]/10 text-[#D96C3F] border border-[#D96C3F]/20',
  'Trung bình': 'bg-[#3F3A33]/10 text-[#3F3A33] border border-[#3F3A33]/20',
  'Thấp': 'bg-[#E3D7C8] text-[#8B8375] border border-transparent',
};
const statusStyle = {
  'Đang làm': 'bg-[#C89A3D]/10 text-[#C89A3D] border border-[#C89A3D]/20',
  'Mới': 'bg-[#a7c8ff]/20 text-[#17477f] border border-[#a7c8ff]/30',
  'Hoàn thành': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'Quá hạn': 'bg-red-50 text-red-600 border border-red-200',
};
const KANBAN_STATUS = ['Mới', 'Đang làm', 'Hoàn thành'];
const kanbanCol = {
  'Mới': { label: 'Mới', color: 'bg-[#a7c8ff]/10 border-[#a7c8ff]/20', badge: 'bg-[#a7c8ff]/20 text-[#17477f]' },
  'Đang làm': { label: 'Đang làm', color: 'bg-[#C89A3D]/5 border-[#C89A3D]/15', badge: 'bg-[#C89A3D]/15 text-[#C89A3D]' },
  'Hoàn thành': { label: 'Hoàn thành', color: 'bg-emerald-50/50 border-emerald-200/30', badge: 'bg-emerald-100 text-emerald-700' },
};

const formatDue = (due_date) => {
  if (!due_date) return '—';
  return new Date(due_date).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export default function Tasks() {
  const { tasks, toggleTask, deleteTask, profiles, loadingTasks } = useGlobalState();
  const [selectedTask, setSelectedTask] = useState(null);
  const [view, setView] = useState('list');
  const [filterDate, setFilterDate] = useState('Tất cả');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [formModal, setFormModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const today = new Date();

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const due = t.due_date ? new Date(t.due_date) : null;
      if (filterDate === 'Hôm nay' && due && due.toDateString() !== today.toDateString()) return false;
      if (filterDate === 'Quá hạn' && (!due || due >= today || t.status === 'Hoàn thành')) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterAssignee && t.assignee_id !== filterAssignee) return false;
      return true;
    });
  }, [tasks, filterDate, filterPriority, filterAssignee]);

  const openEdit = (task) => { setEditData(task); setFormModal(true); };
  const openAdd = () => { setEditData(null); setFormModal(true); };
  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteTask(deleteConfirm.id);
      if (selectedTask?.id === deleteConfirm.id) setSelectedTask(null);
      setDeleteConfirm(null);
    }
  };
  const handleToggle = async (id) => { await toggleTask(id); };
  const isOverdue = (due_date, status) => due_date && new Date(due_date) < today && status !== 'Hoàn thành';

  return (
    <div className="flex h-full relative">
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${selectedTask ? 'mr-[360px]' : ''}`}>
        {/* Filter Bar */}
        <div className="glass-panel border-b border-[#E3D7C8] px-6 py-3 flex flex-wrap items-center justify-between z-10 flex-shrink-0 gap-4">
          <div className="flex items-center gap-2">
            {['Tất cả', 'Hôm nay', 'Tuần này', 'Quá hạn'].map(f => (
              <button key={f} onClick={() => setFilterDate(f)}
                className={`px-4 py-1.5 rounded-full text-xs transition-colors font-medium ${filterDate === f ? 'bg-[#C89A3D] text-white' : 'bg-transparent border border-[#E3D7C8] text-[#8B8375] hover:border-[#C89A3D]'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="text-xs text-[#3F3A33] px-3 py-1.5 rounded-lg border border-[#E3D7C8] bg-white/60 outline-none focus:border-[#C89A3D]">
              <option value="">Ưu tiên: Tất cả</option>
              <option>Cao</option><option>Trung bình</option><option>Thấp</option>
            </select>
            <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="text-xs text-[#3F3A33] px-3 py-1.5 rounded-lg border border-[#E3D7C8] bg-white/60 outline-none focus:border-[#C89A3D]">
              <option value="">Phụ trách: Tất cả</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
            <div className="flex items-center bg-[#F9F5EE] rounded-lg p-0.5 border border-[#E3D7C8]">
              <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-[#C89A3D]' : 'text-[#8B8375]'}`}><ListTodo size={18} /></button>
              <button onClick={() => setView('board')} className={`p-1.5 rounded-md transition-colors ${view === 'board' ? 'bg-white shadow-sm text-[#C89A3D]' : 'text-[#8B8375]'}`}><LayoutGrid size={18} /></button>
            </div>
            <button onClick={openAdd} className="bg-[#C89A3D] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#b08735] transition-colors flex items-center gap-1 shadow-sm">
              <Plus size={16} /> Thêm công việc
            </button>
          </div>
        </div>

        {view === 'list' && (
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="glass-panel rounded-2xl overflow-hidden border border-[#E3D7C8]">
              <div className="grid grid-cols-[40px_minmax(250px,1fr)_minmax(180px,1fr)_100px_120px_120px_140px] gap-4 px-6 py-3 border-b border-[#E3D7C8]">
                {['', 'Tiêu đề', 'Khách hàng', 'Ưu tiên', 'Trạng thái', 'Hạn chót', 'Phụ trách'].map((h, i) => (
                  <div key={i} className="text-xs font-medium text-[#8B8375]">{h}</div>
                ))}
              </div>
              <div className="flex flex-col">
                {loadingTasks ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[40px_minmax(250px,1fr)_minmax(180px,1fr)_100px_120px_120px_140px] gap-4 px-6 py-4 border-b border-[#E3D7C8]">
                    {[40,200,140,70,80,80,100].map((w, j) => <div key={j} className="h-4 bg-[#E3D7C8] rounded animate-pulse" style={{width:w}}></div>)}
                  </div>
                )) : filtered.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#e9dece] flex items-center justify-center"><ListTodo size={20} className="text-[#8B8375]" /></div>
                    <p className="text-[#8B8375] text-sm">Chưa có công việc nào</p>
                    <button onClick={openAdd} className="text-sm text-[#C89A3D] hover:underline font-medium">+ Thêm công việc mới</button>
                  </div>
                ) : filtered.map(task => {
                  const isDone = task.status === 'Hoàn thành';
                  return (
                    <div key={task.id} onClick={() => setSelectedTask(task)}
                      className={`grid grid-cols-[40px_minmax(250px,1fr)_minmax(180px,1fr)_100px_120px_120px_140px] gap-4 px-6 py-3.5 border-b border-[#E3D7C8] cursor-pointer transition-colors items-center
                        ${selectedTask?.id === task.id ? 'bg-[#C89A3D]/10' : 'hover:bg-[#C89A3D]/[0.03]'} ${isDone ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isDone} onChange={() => handleToggle(task.id)} className="w-4 h-4 rounded border-[#E3D7C8] text-[#C89A3D] cursor-pointer" />
                      </div>
                      <div className={`text-sm font-medium truncate ${isDone ? 'text-[#8B8375] line-through' : 'text-[#3F3A33]'}`}>{task.title}</div>
                      <div className="text-xs text-[#8B8375] truncate">{task.lead?.name || '—'}</div>
                      <div><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${priorityStyle[task.priority] || ''}`}>{task.priority}</span></div>
                      <div><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${statusStyle[task.status] || ''}`}>{task.status}</span></div>
                      <div className={`text-xs ${isOverdue(task.due_date, task.status) ? 'text-[#D96C3F] font-medium' : 'text-[#3F3A33]'}`}>{formatDue(task.due_date)}</div>
                      <div className="text-xs text-[#4f4637] truncate">{task.assignee?.full_name || '—'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'board' && (
          <div className="p-8 flex-1 overflow-x-auto custom-scrollbar">
            <div className="flex gap-5 min-w-max h-full items-start">
              {KANBAN_STATUS.map(status => {
                const col = kanbanCol[status];
                const colTasks = filtered.filter(t => t.status === status);
                return (
                  <div key={status} className={`w-[300px] rounded-xl p-3 border ${col.color} bg-white/40`}>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-sm font-bold text-[#3F3A33]">{col.label}</h3>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${col.badge}`}>{colTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colTasks.map(task => (
                        <div key={task.id} onClick={() => setSelectedTask(task)}
                          className={`bg-white/90 rounded-xl p-3.5 border border-[#E3D7C8] hover:border-[#C89A3D] cursor-pointer transition-colors ${task.status === 'Hoàn thành' ? 'opacity-60' : ''}`}>
                          <p className={`text-sm font-medium mb-1.5 line-clamp-2 ${task.status === 'Hoàn thành' ? 'line-through text-[#8B8375]' : 'text-[#3F3A33]'}`}>{task.title}</p>
                          <p className="text-xs text-[#8B8375] mb-2 truncate">{task.lead?.name || '—'}</p>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityStyle[task.priority] || ''}`}>{task.priority}</span>
                            <span className="text-[11px] text-[#8B8375]">{formatDue(task.due_date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Side Panel */}
      <aside className={`glass-panel w-[360px] border-l border-[#E3D7C8] flex flex-col flex-shrink-0 z-20 absolute right-0 top-0 h-full transition-transform duration-300 transform ${selectedTask ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedTask && (
          <>
            <div className="p-6 border-b border-[#E3D7C8] flex justify-between items-start">
              <h2 className={`text-lg font-semibold leading-tight pr-4 ${selectedTask.status === 'Hoàn thành' ? 'text-[#8B8375] line-through' : 'text-[#3F3A33]'}`}>{selectedTask.title}</h2>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(selectedTask)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8375] hover:text-[#C89A3D] hover:bg-[#C89A3D]/10 transition-colors"><Edit size={16} /></button>
                <button onClick={() => setSelectedTask(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8375] hover:bg-black/5 transition-colors"><X size={18} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {selectedTask.description && <p className="text-sm text-[#4f4637] bg-[#f9f5ee] rounded-lg p-3">{selectedTask.description}</p>}
              <div className="grid grid-cols-[120px_1fr] gap-y-3 items-center text-sm">
                <span className="text-xs text-[#8B8375]">Khách hàng</span>
                <span className="font-medium text-[#3F3A33]">{selectedTask.lead?.name || '—'}</span>
                {selectedTask.opportunity?.title && <>
                  <span className="text-xs text-[#8B8375]">Cơ hội</span>
                  <span className="text-xs text-[#3F3A33]">{selectedTask.opportunity.title}</span>
                </>}
                <span className="text-xs text-[#8B8375]">Ưu tiên</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium w-fit ${priorityStyle[selectedTask.priority] || ''}`}>{selectedTask.priority}</span>
                <span className="text-xs text-[#8B8375]">Trạng thái</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium w-fit ${statusStyle[selectedTask.status] || ''}`}>{selectedTask.status}</span>
                <span className="text-xs text-[#8B8375]">Hạn chót</span>
                <span className={`text-xs font-medium ${isOverdue(selectedTask.due_date, selectedTask.status) ? 'text-[#D96C3F]' : 'text-[#3F3A33]'}`}>{formatDue(selectedTask.due_date)}</span>
                <span className="text-xs text-[#8B8375]">Phụ trách</span>
                <span className="text-sm font-medium text-[#3F3A33]">{selectedTask.assignee?.full_name || '—'}</span>
              </div>
            </div>
            <div className="p-5 border-t border-[#E3D7C8] bg-white/50 space-y-2.5">
              <button onClick={() => handleToggle(selectedTask.id)}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2
                  ${selectedTask.status === 'Hoàn thành' ? 'bg-transparent text-[#8B8375] border border-[#E3D7C8]' : 'bg-[#C89A3D] text-white hover:bg-[#b08735]'}`}>
                <CheckCircle2 size={18} />
                {selectedTask.status === 'Hoàn thành' ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
              </button>
              <button onClick={() => setDeleteConfirm(selectedTask)}
                className="w-full bg-transparent text-[#ba1a1a] py-2.5 rounded-lg text-sm font-medium hover:bg-[#ba1a1a]/5 transition-colors flex items-center justify-center gap-2">
                <Trash2 size={16} /> Xóa công việc
              </button>
            </div>
          </>
        )}
      </aside>

      <TaskFormModal isOpen={formModal} onClose={() => { setFormModal(false); setEditData(null); }} editData={editData} />
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Xóa công việc" message={`Xóa công việc "${deleteConfirm?.title}"?`} confirmLabel="Xóa" />
    </div>
  );
}
