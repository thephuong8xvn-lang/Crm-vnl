// js/pages/customers.js
(function(){
  let state = { search:'', seg:'', selId:null };

  const page = {
    title: 'Khách hàng',
    subtitle: 'Danh sách và thông tin chi tiết khách hàng',

    render() {
      return `
      <div class="flex h-full overflow-hidden">
        <!-- Left -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
          <!-- Toolbar -->
          <div class="glass-panel border-b border-c-border px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 bg-white/80 border border-c-border rounded-lg px-3 py-2">
                <span class="material-symbols-outlined text-c-muted" style="font-size:18px;">search</span>
                <input id="cust-search" class="outline-none bg-transparent text-sm text-c-text w-52 placeholder:text-c-muted"
                  placeholder="Tìm tên, SĐT, email..." oninput="CustomersPage.applyFilter()" />
              </div>
              <select class="filter-select" id="cust-seg" onchange="CustomersPage.applyFilter()">
                <option value="">Phân khúc: Tất cả</option>
                ${CRM.data.segments.map(s=>`<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="CustomersPage.exportCSV()" class="btn-secondary">
                <span class="material-symbols-outlined" style="font-size:15px;">download</span> Xuất CSV
              </button>
              <button onclick="CustomersPage.openAddModal()" class="btn-primary">
                <span class="material-symbols-outlined" style="font-size:16px;">add</span> Thêm khách hàng
              </button>
            </div>
          </div>
          <!-- Table -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="glass-card overflow-hidden">
              <table class="data-table w-full">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Phân khúc</th>
                    <th>Sản phẩm quan tâm</th>
                    <th>Người phụ trách</th>
                    <th>Giá trị dự kiến</th>
                    <th>Ngày thêm</th>
                  </tr>
                </thead>
                <tbody id="cust-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Side panel -->
        <aside class="side-panel" id="cust-panel">
          <div id="cust-panel-content"></div>
        </aside>
      </div>`;
    },

    init() {
      state = { search:'', seg:'', selId:null };
      CustomersPage.renderList();
    },

    applyFilter() {
      state.search = document.getElementById('cust-search')?.value.toLowerCase()||'';
      state.seg    = document.getElementById('cust-seg')?.value||'';
      CustomersPage.renderList();
    },

    _filtered() {
      let list = CRM.db.getCustomers();
      if (state.search) list=list.filter(c=>c.name.toLowerCase().includes(state.search)||c.phone.includes(state.search)||(c.email||'').toLowerCase().includes(state.search));
      if (state.seg)    list=list.filter(c=>c.segment===state.seg);
      return list;
    },

    renderList() {
      const tbody = document.getElementById('cust-tbody');
      if (!tbody) return;
      const list = CustomersPage._filtered();
      tbody.innerHTML = list.length ? list.map(c=>`
        <tr class="${state.selId===c.id?'selected':''}" onclick="CustomersPage.openPanel(${c.id})">
          <td>
            <div class="flex items-center gap-3">
              <span class="avatar">${CRM.utils.getInitials(c.name)}</span>
              <div>
                <p class="font-medium text-sm">${c.name}</p>
                <p class="text-xs text-c-muted">${c.phone}</p>
              </div>
            </div>
          </td>
          <td>${CRM.utils.segmentBadge(c.segment)}</td>
          <td class="text-xs text-c-muted">${(c.products||[]).join(', ')||'—'}</td>
          <td>
            <div class="flex items-center gap-2">
              <span class="avatar" style="width:22px;height:22px;font-size:9px;">${CRM.db.getUserInitials(c.assignedTo)}</span>
              <span class="text-xs">${CRM.db.getUserName(c.assignedTo)}</span>
            </div>
          </td>
          <td class="text-sm font-medium text-c-accent">${CRM.utils.formatCurrency(c.value)}</td>
          <td class="text-xs text-c-muted">${CRM.utils.formatDate(c.createdAt)}</td>
        </tr>`).join('') : `<tr><td colspan="6" class="text-center text-c-muted py-12 text-sm">Không tìm thấy khách hàng nào</td></tr>`;
    },

    openPanel(id) {
      state.selId = id;
      const c   = CRM.db.getCustomer(id);
      const ops = CRM.db.getOpsByCustomer(id);
      if (!c) return;
      document.getElementById('cust-panel-content').innerHTML = `
        <div class="flex items-center justify-between px-5 py-4 border-b border-c-border">
          <div class="flex items-center gap-3">
            <span class="avatar" style="width:36px;height:36px;font-size:14px;">${CRM.utils.getInitials(c.name)}</span>
            <div>
              <h2 class="text-sm font-semibold">${c.name}</h2>
              ${CRM.utils.segmentBadge(c.segment)}
            </div>
          </div>
          <button onclick="CustomersPage.closePanel()" class="icon-btn">
            <span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <div class="grid grid-cols-[90px_1fr] gap-y-3 text-sm items-start">
            <span class="text-xs text-c-muted pt-0.5">Điện thoại</span><span>${c.phone}</span>
            <span class="text-xs text-c-muted pt-0.5">Email</span><span>${c.email||'—'}</span>
            <span class="text-xs text-c-muted pt-0.5">Địa chỉ</span><span>${c.address||'—'}</span>
            <span class="text-xs text-c-muted pt-0.5">Sản phẩm</span><span class="text-xs">${(c.products||[]).join(', ')||'—'}</span>
            <span class="text-xs text-c-muted pt-0.5">Phụ trách</span><span>${CRM.db.getUserName(c.assignedTo)}</span>
            ${c.notes?`<span class="text-xs text-c-muted pt-0.5">Ghi chú</span><span class="text-xs text-c-muted">${c.notes}</span>`:''}
          </div>
          <hr class="border-c-border" />
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-semibold text-c-muted uppercase tracking-wide">Cơ hội (${ops.length})</p>
              <button onclick="KanbanPage.openAddModal();CRM.db.updateOpportunity(-1,{customerId:${id}})" class="text-xs text-c-accent hover:underline">+ Thêm</button>
            </div>
            ${ops.length ? ops.map(o=>`
            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-c-bg transition-colors text-sm mb-1 cursor-pointer" onclick="CRM.router.navigate('kanban')">
              <span class="truncate text-c-text">${o.name}</span>
              <span class="text-xs text-c-accent ml-2 flex-shrink-0">${CRM.utils.formatCurrency(o.value)}</span>
            </div>`).join('') : '<p class="text-xs text-c-muted">Chưa có cơ hội nào</p>'}
          </div>
        </div>
        <div class="p-5 border-t border-c-border space-y-2">
          <button onclick="CustomersPage.openEditModal(${id})" class="btn-primary w-full justify-center">
            <span class="material-symbols-outlined" style="font-size:16px;">edit</span> Chỉnh sửa
          </button>
          <button onclick="CustomersPage.openAddOpportunity(${id})" class="btn-secondary w-full justify-center">
            <span class="material-symbols-outlined" style="font-size:16px;">auto_awesome</span> Tạo cơ hội mới
          </button>
          <button onclick="CustomersPage.deleteCustomer(${id})" class="btn-danger w-full justify-center">
            <span class="material-symbols-outlined" style="font-size:16px;">delete</span> Xoá khách hàng
          </button>
        </div>`;
      document.getElementById('cust-panel').classList.add('open');
      CustomersPage.renderList();
    },

    closePanel() {
      state.selId = null;
      document.getElementById('cust-panel').classList.remove('open');
      CustomersPage.renderList();
    },

    _custForm(c={}) {
      const users = CRM.db.getUsers();
      return `
        <div class="form-group"><label class="form-label">Tên khách hàng *</label>
          <input class="form-input" id="cf-name" value="${c.name||''}" placeholder="Nguyễn Văn A" /></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Số điện thoại *</label>
            <input class="form-input" id="cf-phone" value="${c.phone||''}" placeholder="09xx xxx xxx" /></div>
          <div class="form-group"><label class="form-label">Email</label>
            <input class="form-input" id="cf-email" value="${c.email||''}" placeholder="email@..." /></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Phân khúc</label>
            <select class="form-input" id="cf-seg">
              ${CRM.data.segments.map(s=>`<option value="${s}" ${s===c.segment?'selected':''}>${s}</option>`).join('')}
            </select></div>
          <div class="form-group"><label class="form-label">Người phụ trách</label>
            <select class="form-input" id="cf-user">
              ${users.map(u=>`<option value="${u.id}" ${u.id===c.assignedTo?'selected':''}>${u.name}</option>`).join('')}
            </select></div>
        </div>
        <div class="form-group"><label class="form-label">Địa chỉ</label>
          <input class="form-input" id="cf-addr" value="${c.address||''}" /></div>
        <div class="form-group"><label class="form-label">Sản phẩm quan tâm</label>
          <div class="flex gap-3 mt-1">
            ${CRM.data.products.map(p=>`<label class="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" value="${p}" ${(c.products||[]).includes(p)?'checked':''} class="accent-c-accent" /> ${p}
            </label>`).join('')}
          </div></div>
        <div class="form-group"><label class="form-label">Giá trị dự kiến (VND)</label>
          <input class="form-input" id="cf-value" type="number" value="${c.value||''}" /></div>
        <div class="form-group"><label class="form-label">Ghi chú</label>
          <textarea class="form-input" id="cf-notes" rows="2">${c.notes||''}</textarea></div>`;
    },

    _readForm() {
      const products = [...document.querySelectorAll('input[type=checkbox]:checked')].map(cb=>cb.value);
      return {
        name:       document.getElementById('cf-name').value.trim(),
        phone:      document.getElementById('cf-phone').value.trim(),
        email:      document.getElementById('cf-email').value.trim(),
        segment:    document.getElementById('cf-seg').value,
        assignedTo: parseInt(document.getElementById('cf-user').value)||1,
        address:    document.getElementById('cf-addr').value.trim(),
        products,
        value:      parseInt(document.getElementById('cf-value').value)||0,
        notes:      document.getElementById('cf-notes').value.trim(),
      };
    },

    openAddModal() {
      CRM.ui.openModal('Thêm khách hàng mới', `
        ${CustomersPage._custForm()}
        <div class="flex gap-3 justify-end pt-2">
          <button onclick="CRM.ui.forceClose()" class="btn-secondary">Huỷ</button>
          <button onclick="CustomersPage.submitAdd()" class="btn-primary">Thêm khách hàng</button>
        </div>`);
    },

    submitAdd() {
      const d = CustomersPage._readForm();
      if (!d.name||!d.phone) { CRM.ui.toast('Vui lòng điền tên và SĐT','error'); return; }
      const dup = CRM.db.getCustomers().find(c=>c.phone===d.phone);
      if (dup) { CRM.ui.toast(`SĐT đã tồn tại: ${dup.name}`,'error'); return; }
      CRM.db.addCustomer(d);
      CRM.ui.forceClose();
      CustomersPage.renderList();
      CRM.ui.toast('Đã thêm khách hàng','success');
    },

    openEditModal(id) {
      const c = CRM.db.getCustomer(id);
      CRM.ui.openModal('Chỉnh sửa khách hàng', `
        ${CustomersPage._custForm(c)}
        <div class="flex gap-3 justify-end pt-2">
          <button onclick="CRM.ui.forceClose()" class="btn-secondary">Huỷ</button>
          <button onclick="CustomersPage.submitEdit(${id})" class="btn-primary">Lưu thay đổi</button>
        </div>`);
    },

    submitEdit(id) {
      const d = CustomersPage._readForm();
      if (!d.name||!d.phone) { CRM.ui.toast('Vui lòng điền tên và SĐT','error'); return; }
      CRM.db.updateCustomer(id, d);
      CRM.ui.forceClose();
      CustomersPage.renderList();
      CustomersPage.openPanel(id);
      CRM.ui.toast('Đã cập nhật','success');
    },

    deleteCustomer(id) {
      CRM.ui.confirm('Xoá khách hàng này? Tất cả cơ hội liên quan vẫn được giữ.', ()=>{
        CRM.db.deleteCustomer(id);
        CustomersPage.closePanel();
        CRM.ui.toast('Đã xoá khách hàng','info');
      });
    },

    openAddOpportunity(custId) {
      CRM.ui.forceClose();
      setTimeout(()=>{ CRM.router.navigate('kanban'); setTimeout(()=>KanbanPage.openAddModal(),300); }, 100);
    },

    exportCSV() {
      const list = CustomersPage._filtered();
      const rows = [['Tên','SĐT','Email','Phân khúc','Sản phẩm quan tâm','Người phụ trách','Giá trị','Ngày thêm']];
      list.forEach(c=>rows.push([c.name,c.phone,c.email||'',c.segment,(c.products||[]).join(';'),CRM.db.getUserName(c.assignedTo),c.value,c.createdAt]));
      CRM.utils.csvDownload(rows, `khach-hang-${new Date().toISOString().slice(0,10)}.csv`);
      CRM.ui.toast('Đã xuất file CSV','success');
    },
  };

  window.CustomersPage = page;
  CRM.router.register('customers', page);
})();
