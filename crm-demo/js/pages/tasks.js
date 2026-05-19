// js/pages/tasks.js
(function(){
  let state = { filter:'all', selId:null };

  const page = {
    title: 'Công việc',
    subtitle: 'Quản lý và theo dõi công việc bán hàng',

    render() {
      return `
      <div class="flex h-full overflow-hidden">
        <!-- Left: List -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
          <!-- Filter bar -->
          <div class="glass-panel border-b border-c-border px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-2">
              <button class="filter-tab active" data-filter="all"    onclick="TasksPage.setFilter('all',this)">Tất cả</button>
              <button class="filter-tab"         data-filter="today"  onclick="TasksPage.setFilter('today',this)">Hôm nay</button>
              <button class="filter-tab"         data-filter="week"   onclick="TasksPage.setFilter('week',this)">Tuần này</button>
              <button class="filter-tab"         data-filter="overdue"onclick="TasksPage.setFilter('overdue',this)">Quá hạn</button>
            </div>
            <div class="flex items-center gap-3">
              <select class="filter-select" id="tf-priority" onchange="TasksPage.renderList()">
                <option value="">Ưu tiên: Tất cả</option>
                ${CRM.data.priorities.map(p=>`<option value="${p}">${p}</option>`).join('')}
              </select>
              <select class="filter-select" id="tf-user" onchange="TasksPage.renderList()">
                <option value="">Người phụ trách: Tất cả</option>
                ${CRM.db.getUsers().map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
              <button onclick="TasksPage.openAddModal()" class="btn-primary">
                <span class="material-symbols-outlined" style="font-size:16px;">add</span> Thêm công việc
              </button>
            </div>
          </div>
          <!-- Table -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="glass-card overflow-hidden">
              <table class="data-table w-full" id="tasks-table">
                <thead>
                  <tr>
                    <th style="width:36px;"></th>
                    <th>Tiêu đề</th>
                    <th>Khách hàng</th>
                    <th>Ưu tiên</th>
                    <th>Trạng thái</th>
                    <th>Hạn chót</th>
                    <th>Người phụ trách</th>
                  </tr>
                </thead>
                <tbody id="tasks-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Right: Side panel -->
        <aside class="side-panel" id="task-panel">
          <div id="task-panel-content"></div>
        </aside>
      </div>`;
    },

    init() {
      state = { filter:'all', selId:null };
      TasksPage.renderList();
    },

    setFilter(f, btn) {
      state.filter = f;
      document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      TasksPage.renderList();
    },

    _applyFilter(tasks) {
      const now   = new Date();
      const start = new Date(); start.setHours(0,0,0,0);
      const end   = new Date(start); end.setDate(end.getDate()+7);
      const prio  = document.getElementById('tf-priority')?.value;
      const uid   = document.getElementById('tf-user')?.value;
      let list = [...tasks];
      if (state.filter==='today')  list=list.filter(t=>{ const d=new Date(t.dueDate); return d>=start&&d<new Date(start.getTime()+86400000); });
      if (state.filter==='week')   list=list.filter(t=>{ const d=new Date(t.dueDate); return d>=start&&d<=end; });
      if (state.filter==='overdue')list=list.filter(t=>t.status!=='Hoàn thành'&&new Date(t.dueDate)<now);
      if (prio) list=list.filter(t=>t.priority===prio);
      if (uid)  list=list.filter(t=>String(t.assignedTo)===uid);
      return list;
    },

    renderList() {
      const tbody = document.getElementById('tasks-tbody');
      if (!tbody) return;
      const tasks = TasksPage._applyFilter(CRM.db.getTasks());
      tbody.innerHTML = tasks.length ? tasks.map(t=>`
        <tr class="${t.status==='Hoàn thành'?'opacity-50':''} ${state.selId===t.id?'selected':''}"
            onclick="TasksPage.openPanel(${t.id})">
          <td onclick="event.stopPropagation()">
            <input type="checkbox" class="task-check" ${t.status==='Hoàn thành'?'checked':''}
              onchange="TasksPage.toggleComplete(${t.id},this)" />
          </td>
          <td class="font-medium ${t.status==='Hoàn thành'?'line-through text-c-muted':''}">${t.title}</td>
          <td class="text-c-muted text-xs">${CRM.db.getCustomerName(t.customerId)}</td>
          <td>${CRM.utils.priorityBadge(t.priority)}</td>
          <td>${CRM.utils.statusBadge(t.status)}</td>
          <td class="text-xs ${CRM.utils.isOverdue(t.dueDate)&&t.status!=='Hoàn thành'?'text-c-warn font-medium':''}">${CRM.utils.formatDateTime(t.dueDate)}</td>
          <td>
            <div class="flex items-center gap-2">
              <span class="avatar">${CRM.db.getUserInitials(t.assignedTo)}</span>
              <span class="text-xs">${CRM.db.getUserName(t.assignedTo)}</span>
            </div>
          </td>
        </tr>`).join('') : `<tr><td colspan="7" class="text-center text-c-muted py-12 text-sm">Không có công việc nào</td></tr>`;
    },

    openPanel(id) {
      state.selId = id;
      const t    = CRM.db.getTask(id);
      if (!t) return;
      const panel = document.getElementById('task-panel');
      document.getElementById('task-panel-content').innerHTML = `
        <div class="flex items-start justify-between px-5 py-4 border-b border-c-border">
          <h2 class="text-sm font-semibold text-c-text leading-tight pr-4">${t.title}</h2>
          <button onclick="TasksPage.closePanel()" class="icon-btn flex-shrink-0">
            <span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <div class="grid grid-cols-[100px_1fr] gap-y-3 text-sm items-center">
            <span class="text-xs text-c-muted">Khách hàng</span>
            <a class="text-c-accent hover:underline cursor-pointer" onclick="CRM.router.navigate('customers')">${CRM.db.getCustomerName(t.customerId)}</a>
            <span class="text-xs text-c-muted">Cơ hội</span>
            <span>${CRM.db.getOpportunityName(t.opportunityId)}</span>
            <span class="text-xs text-c-muted">Ưu tiên</span>
            <div>${CRM.utils.priorityBadge(t.priority)}</div>
            <span class="text-xs text-c-muted">Trạng thái</span>
            <div>
              <select class="form-input" id="panel-status" style="max-width:160px;">
                ${CRM.data.taskStatuses.map(s=>`<option value="${s}" ${s===t.status?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
            <span class="text-xs text-c-muted">Hạn chót</span>
            <span class="${CRM.utils.isOverdue(t.dueDate)?'text-c-warn font-medium':''}">${CRM.utils.formatDateTime(t.dueDate)}</span>
            <span class="text-xs text-c-muted">Phụ trách</span>
            <div class="flex items-center gap-2">
              <span class="avatar">${CRM.db.getUserInitials(t.assignedTo)}</span>
              <span>${CRM.db.getUserName(t.assignedTo)}</span>
            </div>
          </div>
          <hr class="border-c-border" />
          <div>
            <label class="form-label">Ghi chú</label>
            <textarea id="panel-notes" class="form-input" rows="4" placeholder="Thêm ghi chú...">${t.notes||''}</textarea>
          </div>
        </div>
        <div class="p-5 border-t border-c-border space-y-2">
          <button onclick="TasksPage.savePanel(${id})" class="btn-primary w-full justify-center">
            <span class="material-symbols-outlined" style="font-size:16px;">save</span> Lưu thay đổi
          </button>
          <button onclick="TasksPage.markDone(${id})" class="btn-secondary w-full justify-center">
            <span class="material-symbols-outlined" style="font-size:16px;">check_circle</span> Đánh dấu hoàn thành
          </button>
          <button onclick="TasksPage.deleteTask(${id})" class="btn-danger w-full justify-center">
            <span class="material-symbols-outlined" style="font-size:16px;">delete</span> Xoá công việc
          </button>
        </div>`;
      panel.classList.add('open');
      TasksPage.renderList();
    },

    closePanel() {
      state.selId = null;
      document.getElementById('task-panel').classList.remove('open');
      TasksPage.renderList();
    },

    savePanel(id) {
      const status = document.getElementById('panel-status').value;
      const notes  = document.getElementById('panel-notes').value;
      CRM.db.updateTask(id, { status, notes });
      CRM.ui.toast('Đã lưu','success');
      TasksPage.renderList();
    },

    markDone(id) {
      CRM.db.completeTask(id);
      TasksPage.closePanel();
      CRM.ui.toast('Đã hoàn thành công việc','success');
    },

    deleteTask(id) {
      CRM.ui.confirm('Xoá công việc này?', ()=>{
        CRM.db.deleteTask(id);
        TasksPage.closePanel();
        CRM.ui.toast('Đã xoá','info');
      });
    },

    toggleComplete(id, cb) {
      const task = CRM.db.getTask(id);
      if (!task) return;
      const newStatus = cb.checked ? 'Hoàn thành' : 'Đang làm';
      CRM.db.updateTask(id, { status: newStatus });
      TasksPage.renderList();
    },

    openAddModal() {
      const users = CRM.db.getUsers();
      const custs = CRM.db.getCustomers();
      CRM.ui.openModal('Thêm công việc mới', `
        <div class="form-group"><label class="form-label">Tiêu đề *</label>
          <input class="form-input" id="t-title" placeholder="VD: Gọi tư vấn cho khách..." /></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Khách hàng</label>
            <select class="form-input" id="t-cust">
              <option value="">-- Chọn --</option>
              ${custs.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
            </select></div>
          <div class="form-group"><label class="form-label">Ưu tiên</label>
            <select class="form-input" id="t-priority">
              ${CRM.data.priorities.map(p=>`<option>${p}</option>`).join('')}
            </select></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Hạn chót</label>
            <input class="form-input" id="t-due" type="datetime-local" /></div>
          <div class="form-group"><label class="form-label">Người phụ trách</label>
            <select class="form-input" id="t-user">
              ${users.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}
            </select></div>
        </div>
        <div class="form-group"><label class="form-label">Ghi chú</label>
          <textarea class="form-input" id="t-notes" rows="2"></textarea></div>
        <div class="flex gap-3 justify-end pt-2">
          <button onclick="CRM.ui.forceClose()" class="btn-secondary">Huỷ</button>
          <button onclick="TasksPage.submitAdd()" class="btn-primary">Tạo công việc</button>
        </div>`);
    },

    submitAdd() {
      const title  = document.getElementById('t-title').value.trim();
      const custId = parseInt(document.getElementById('t-cust').value)||null;
      const prio   = document.getElementById('t-priority').value;
      const due    = document.getElementById('t-due').value;
      const user   = parseInt(document.getElementById('t-user').value)||1;
      const notes  = document.getElementById('t-notes').value;
      if (!title) { CRM.ui.toast('Vui lòng nhập tiêu đề','error'); return; }
      CRM.db.addTask({ title, customerId:custId, opportunityId:null, assignedTo:user, dueDate:due, priority:prio, status:'Mới', notes });
      CRM.ui.forceClose();
      TasksPage.renderList();
      CRM.ui.toast('Đã thêm công việc','success');
    },
  };

  window.TasksPage = page;
  CRM.router.register('tasks', page);
})();
