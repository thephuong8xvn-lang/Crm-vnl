// js/pages/kanban.js
(function(){
  const page = {
    title: 'Cơ hội bán hàng',
    subtitle: 'Quản lý pipeline theo quy trình bán hàng',

    render() {
      const filterBar = `
      <div class="glass-panel border-b border-c-border px-8 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <select class="filter-select" id="kf-user" onchange="KanbanPage.applyFilter()">
            <option value="">Nhân viên: Tất cả</option>
            ${CRM.db.getUsers().map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}
          </select>
          <select class="filter-select" id="kf-seg" onchange="KanbanPage.applyFilter()">
            <option value="">Phân khúc: Tất cả</option>
            ${CRM.data.segments.map(s=>`<option value="${s}">${s}</option>`).join('')}
          </select>
          <select class="filter-select" id="kf-prod" onchange="KanbanPage.applyFilter()">
            <option value="">Sản phẩm: Tất cả</option>
            ${CRM.data.products.map(p=>`<option value="${p}">${p}</option>`).join('')}
          </select>
        </div>
        <button onclick="KanbanPage.openAddModal()" class="btn-primary">
          <span class="material-symbols-outlined" style="font-size:16px;">add</span> Thêm cơ hội
        </button>
      </div>`;

      const board = `<div class="kanban-board flex-1" id="kanban-board" style="height:calc(100vh - 130px);overflow-y:hidden;">
        ${CRM.data.stages.map(stage => `
        <div class="kanban-col" data-stage="${stage}">
          <div class="kanban-col-header">
            <span class="kanban-col-title ${stage==='Chốt đơn'?'text-c-accent':stage==='Thất bại'?'text-c-muted':''}">${stage}</span>
            <span class="kanban-col-count" id="count-${stage.replace(/\s/g,'-')}">0</span>
          </div>
          <div class="kanban-col-body" id="col-${stage.replace(/\s/g,'-')}" data-stage="${stage}"></div>
          <button class="kanban-add-btn" onclick="KanbanPage.openAddModal('${stage}')">
            <span class="material-symbols-outlined" style="font-size:14px;">add</span> Thêm
          </button>
        </div>`).join('')}
      </div>`;

      return `<div class="flex flex-col h-full overflow-hidden">${filterBar}<div class="flex-1 overflow-hidden">${board}</div></div>`;
    },

    init() {
      KanbanPage._renderCards(CRM.db.getOpportunities());
      KanbanPage._initSortable();
    },

    _renderCards(ops) {
      // Clear all columns
      CRM.data.stages.forEach(stage=>{
        const id = stage.replace(/\s/g,'-');
        const col = document.getElementById(`col-${id}`);
        const cnt = document.getElementById(`count-${id}`);
        if (col) col.innerHTML='';
        if (cnt) cnt.textContent='0';
      });
      // Place cards
      ops.forEach(o=>{
        const id = o.stage.replace(/\s/g,'-');
        const col = document.getElementById(`col-${id}`);
        const cnt = document.getElementById(`count-${id}`);
        if (!col) return;
        col.insertAdjacentHTML('beforeend', KanbanPage._cardHtml(o));
        if (cnt) cnt.textContent = parseInt(cnt.textContent||0)+1;
      });
    },

    _cardHtml(o) {
      const cust = CRM.db.getCustomer(o.customerId);
      const seg  = cust ? cust.segment : '';
      const over = CRM.utils.isOverdue(o.closeDate);
      const won  = o.stage==='Chốt đơn';
      return `
      <div class="kanban-card ${won?'border-c-accent/40':''}" data-id="${o.id}" onclick="KanbanPage.openDetail(${o.id})">
        ${won?`<span class="material-symbols-outlined text-c-accent" style="font-size:14px;float:right;margin:-2px 0 4px 0;font-variation-settings:'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 24;">check_circle</span>`:''}
        <h4 class="text-sm font-medium text-c-text mb-1 leading-tight" style="padding-right:${won?'18px':'0'}">${o.name}</h4>
        <div class="flex items-center gap-1 text-xs text-c-muted mb-2">
          <span class="material-symbols-outlined" style="font-size:13px;">person</span>
          <span class="truncate">${cust?cust.name:'—'}</span>
        </div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-semibold text-c-accent">${CRM.utils.formatCurrency(o.value)}</span>
          ${CRM.utils.segmentBadge(seg)}
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-c-border/40">
          <div class="flex items-center gap-1.5">
            <span class="avatar" style="width:20px;height:20px;font-size:9px;">${CRM.db.getUserInitials(o.assignedTo)}</span>
            <span class="text-xs text-c-muted">${CRM.db.getUserName(o.assignedTo).split(' ').pop()}</span>
          </div>
          <div class="flex items-center gap-1 text-xs ${over?'text-c-warn':'text-c-muted'}">
            <span class="material-symbols-outlined" style="font-size:12px;">calendar_today</span>
            <span>${CRM.utils.formatShortDate(o.closeDate)}</span>
          </div>
        </div>
      </div>`;
    },

    _initSortable() {
      if (typeof Sortable === 'undefined') { setTimeout(()=>KanbanPage._initSortable(), 200); return; }
      document.querySelectorAll('.kanban-col-body').forEach(col=>{
        Sortable.create(col, {
          group: 'kanban',
          animation: 150,
          ghostClass: 'sortable-ghost',
          dragClass:  'sortable-drag',
          onEnd(evt) {
            const id    = parseInt(evt.item.dataset.id);
            const stage = evt.to.dataset.stage;
            CRM.db.moveOpportunity(id, stage);
            // update counts
            CRM.data.stages.forEach(s=>{
              const cnt = document.getElementById(`count-${s.replace(/\s/g,'-')}`);
              const col = document.getElementById(`col-${s.replace(/\s/g,'-')}`);
              if (cnt && col) cnt.textContent = col.querySelectorAll('.kanban-card').length;
            });
            CRM.ui.toast(`Đã chuyển sang "${stage}"`, 'success');
          }
        });
      });
    },

    applyFilter() {
      const uid  = document.getElementById('kf-user')?.value;
      const seg  = document.getElementById('kf-seg')?.value;
      const prod = document.getElementById('kf-prod')?.value;
      let ops = CRM.db.getOpportunities();
      if (uid) ops = ops.filter(o=>String(o.assignedTo)===uid);
      if (seg) {
        const custIds = CRM.db.getCustomers().filter(c=>c.segment===seg).map(c=>c.id);
        ops = ops.filter(o=>custIds.includes(o.customerId));
      }
      if (prod) {
        const custIds = CRM.db.getCustomers().filter(c=>c.products.includes(prod)).map(c=>c.id);
        ops = ops.filter(o=>custIds.includes(o.customerId));
      }
      KanbanPage._renderCards(ops);
    },

    openAddModal(defaultStage='Mới') {
      const users  = CRM.db.getUsers();
      const custs  = CRM.db.getCustomers();
      CRM.ui.openModal('Thêm cơ hội mới', `
        <div class="form-group"><label class="form-label">Tên cơ hội *</label>
          <input class="form-input" id="op-name" placeholder="VD: Hợp đồng đại lý Q3" /></div>
        <div class="form-group"><label class="form-label">Khách hàng *</label>
          <select class="form-input" id="op-cust">
            <option value="">-- Chọn khách hàng --</option>
            ${custs.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
          </select></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Giai đoạn</label>
            <select class="form-input" id="op-stage">
              ${CRM.data.stages.map(s=>`<option value="${s}" ${s===defaultStage?'selected':''}>${s}</option>`).join('')}
            </select></div>
          <div class="form-group"><label class="form-label">Giá trị (VND)</label>
            <input class="form-input" id="op-value" type="number" placeholder="100000000" /></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Ngày dự kiến chốt</label>
            <input class="form-input" id="op-date" type="date" /></div>
          <div class="form-group"><label class="form-label">Người phụ trách</label>
            <select class="form-input" id="op-user">
              ${users.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}
            </select></div>
        </div>
        <div class="form-group"><label class="form-label">Ghi chú</label>
          <textarea class="form-input" id="op-notes" rows="2" placeholder="Ghi chú thêm..."></textarea></div>
        <div class="flex gap-3 justify-end pt-2">
          <button onclick="CRM.ui.forceClose()" class="btn-secondary">Huỷ</button>
          <button onclick="KanbanPage.submitAdd()" class="btn-primary">Tạo cơ hội</button>
        </div>`);
    },

    submitAdd() {
      const name  = document.getElementById('op-name').value.trim();
      const custId= parseInt(document.getElementById('op-cust').value);
      const stage = document.getElementById('op-stage').value;
      const value = parseInt(document.getElementById('op-value').value)||0;
      const date  = document.getElementById('op-date').value;
      const user  = parseInt(document.getElementById('op-user').value)||1;
      const notes = document.getElementById('op-notes').value.trim();
      if (!name || !custId) { CRM.ui.toast('Vui lòng điền tên và chọn khách hàng','error'); return; }
      const op = CRM.db.addOpportunity({ name, customerId:custId, stage, value, closeDate:date, assignedTo:user, notes });
      CRM.ui.forceClose();
      // Add card to column
      const colId = stage.replace(/\s/g,'-');
      const col   = document.getElementById(`col-${colId}`);
      const cnt   = document.getElementById(`count-${colId}`);
      if (col) { col.insertAdjacentHTML('beforeend', KanbanPage._cardHtml(op)); if(cnt) cnt.textContent=parseInt(cnt.textContent)+1; }
      CRM.ui.toast('Đã thêm cơ hội mới','success');
    },

    openDetail(id) {
      const o    = CRM.db.getOpportunity(id);
      const cust = CRM.db.getCustomer(o.customerId);
      if (!o) return;
      CRM.ui.openModal(o.name, `
        <div class="grid grid-cols-[110px_1fr] gap-y-4 text-sm items-center mb-4">
          <span class="text-c-muted text-xs">Khách hàng</span>
          <span class="font-medium">${cust?cust.name:'—'}</span>
          <span class="text-c-muted text-xs">Giai đoạn</span>
          <div>
            <select class="form-input" id="det-stage" style="max-width:200px;">
              ${CRM.data.stages.map(s=>`<option value="${s}" ${s===o.stage?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
          <span class="text-c-muted text-xs">Giá trị</span>
          <span class="font-semibold text-c-accent">${CRM.utils.formatCurrency(o.value)}</span>
          <span class="text-c-muted text-xs">Dự kiến chốt</span>
          <span>${CRM.utils.formatDate(o.closeDate)}</span>
          <span class="text-c-muted text-xs">Người phụ trách</span>
          <span>${CRM.db.getUserName(o.assignedTo)}</span>
        </div>
        ${o.notes?`<div class="bg-c-bg rounded-lg p-3 text-sm text-c-muted mb-4">${o.notes}</div>`:''}
        <div class="flex gap-3 justify-between pt-2 border-t border-c-border">
          <button onclick="CRM.ui.confirm('Xoá cơ hội này?',()=>{CRM.db.deleteOpportunity(${id});CRM.ui.forceClose();KanbanPage._renderCards(CRM.db.getOpportunities());CRM.ui.toast('Đã xoá','info');})" class="btn-danger">
            <span class="material-symbols-outlined" style="font-size:15px;">delete</span> Xoá
          </button>
          <div class="flex gap-2">
            <button onclick="CRM.ui.forceClose()" class="btn-secondary">Đóng</button>
            <button onclick="KanbanPage.updateStage(${id})" class="btn-primary">Lưu giai đoạn</button>
          </div>
        </div>`);
    },

    updateStage(id) {
      const stage = document.getElementById('det-stage').value;
      CRM.db.updateOpportunity(id, { stage });
      CRM.ui.forceClose();
      KanbanPage._renderCards(CRM.db.getOpportunities());
      CRM.ui.toast('Đã cập nhật giai đoạn','success');
    }
  };

  window.KanbanPage = page;
  CRM.router.register('kanban', page);
})();
