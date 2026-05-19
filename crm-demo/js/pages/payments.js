// js/pages/payments.js
(function(){
  let state = { status:'', user:'' };

  const page = {
    title: 'Thanh toán',
    subtitle: 'Ghi nhận và theo dõi thanh toán',

    render() {
      const pays = CRM.db.getPayments();
      const totalPaid   = pays.filter(p=>p.status==='Đã thanh toán').reduce((s,p)=>s+p.amount,0);
      const totalUnpaid = pays.filter(p=>p.status==='Chưa thanh toán').reduce((s,p)=>s+p.amount,0);
      const users = CRM.db.getUsers();

      return `
      <div class="p-6 flex flex-col gap-5 h-full overflow-y-auto">
        <!-- Summary pills -->
        <div class="flex flex-wrap gap-3">
          <div class="glass-panel rounded-full px-5 py-2 flex items-center gap-2 text-sm border border-c-border">
            <span class="text-c-muted">Đã thanh toán:</span>
            <span class="font-semibold text-c-accent">${CRM.utils.formatCurrency(totalPaid)}</span>
          </div>
          <div class="glass-panel rounded-full px-5 py-2 flex items-center gap-2 text-sm border border-c-border">
            <span class="text-c-muted">Chưa thanh toán:</span>
            <span class="font-semibold text-c-warn">${CRM.utils.formatCurrency(totalUnpaid)}</span>
          </div>
          <div class="glass-panel rounded-full px-5 py-2 flex items-center gap-2 text-sm border border-c-border">
            <span class="text-c-muted">Tổng:</span>
            <span class="font-semibold">${CRM.utils.formatCurrency(totalPaid+totalUnpaid)}</span>
          </div>
        </div>

        <!-- Filters + Add button -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <select class="filter-select" id="pf-status" onchange="PaymentsPage.applyFilter()">
              <option value="">Trạng thái: Tất cả</option>
              ${CRM.data.paymentStatuses.map(s=>`<option value="${s}">${s}</option>`).join('')}
            </select>
            <select class="filter-select" id="pf-user" onchange="PaymentsPage.applyFilter()">
              <option value="">Người ghi nhận: Tất cả</option>
              ${users.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}
            </select>
          </div>
          <button onclick="PaymentsPage.openAddModal()" class="btn-primary">
            <span class="material-symbols-outlined" style="font-size:16px;">add</span> Thêm thanh toán
          </button>
        </div>

        <!-- Table -->
        <div class="glass-card overflow-hidden">
          <table class="data-table w-full">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Cơ hội / Đơn hàng</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Hình thức</th>
                <th>Ngày</th>
                <th>Người ghi nhận</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="pay-tbody"></tbody>
          </table>
        </div>
      </div>`;
    },

    init() {
      state = { status:'', user:'' };
      PaymentsPage.renderList();
    },

    applyFilter() {
      state.status = document.getElementById('pf-status')?.value||'';
      state.user   = document.getElementById('pf-user')?.value||'';
      PaymentsPage.renderList();
    },

    renderList() {
      const tbody = document.getElementById('pay-tbody');
      if (!tbody) return;
      let list = CRM.db.getPayments();
      if (state.status) list=list.filter(p=>p.status===state.status);
      if (state.user)   list=list.filter(p=>String(p.recordedBy)===state.user);
      tbody.innerHTML = list.length ? list.map(p=>`
        <tr>
          <td>
            <div class="flex items-center gap-2">
              <span class="avatar">${CRM.utils.getInitials(CRM.db.getCustomerName(p.customerId))}</span>
              <span class="text-sm font-medium">${CRM.db.getCustomerName(p.customerId)}</span>
            </div>
          </td>
          <td class="text-xs text-c-muted max-w-[180px] truncate">${CRM.db.getOpportunityName(p.opportunityId)}</td>
          <td class="font-semibold text-c-accent">${CRM.utils.formatCurrency(p.amount)}</td>
          <td>${CRM.utils.paymentBadge(p.status)}</td>
          <td class="text-sm">${p.method}</td>
          <td class="text-xs text-c-muted">${CRM.utils.formatDate(p.date)}</td>
          <td>
            <div class="flex items-center gap-2">
              <span class="avatar" style="width:22px;height:22px;font-size:9px;">${CRM.db.getUserInitials(p.recordedBy)}</span>
              <span class="text-xs">${CRM.db.getUserName(p.recordedBy)}</span>
            </div>
          </td>
          <td>
            <div class="flex items-center gap-1">
              <button onclick="PaymentsPage.openDetailModal(${p.id})" class="icon-btn" title="Chi tiết">
                <span class="material-symbols-outlined" style="font-size:17px;">open_in_new</span>
              </button>
              <button onclick="PaymentsPage.deletePayment(${p.id})" class="icon-btn" title="Xoá" style="color:var(--warn)">
                <span class="material-symbols-outlined" style="font-size:17px;">delete</span>
              </button>
            </div>
          </td>
        </tr>`).join('') : `<tr><td colspan="8" class="text-center text-c-muted py-12 text-sm">Không có bản ghi thanh toán nào</td></tr>`;
    },

    openAddModal() {
      const custs = CRM.db.getCustomers();
      const ops   = CRM.db.getOpportunities().filter(o=>o.stage==='Chốt đơn'||o.stage==='Đàm phán');
      const users = CRM.db.getUsers();
      CRM.ui.openModal('Thêm bản ghi thanh toán', `
        <div class="form-group"><label class="form-label">Khách hàng *</label>
          <select class="form-input" id="pf-cust" onchange="PaymentsPage.filterOps(this.value)">
            <option value="">-- Chọn khách hàng --</option>
            ${custs.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">Cơ hội liên quan</label>
          <select class="form-input" id="pf-op">
            <option value="">-- Không có --</option>
            ${ops.map(o=>`<option value="${o.id}">${o.name}</option>`).join('')}
          </select></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Số tiền (VND) *</label>
            <input class="form-input" id="pf-amount" type="number" placeholder="0" /></div>
          <div class="form-group"><label class="form-label">Trạng thái</label>
            <select class="form-input" id="pf-stat">
              ${CRM.data.paymentStatuses.map(s=>`<option>${s}</option>`).join('')}
            </select></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Hình thức</label>
            <select class="form-input" id="pf-method">
              ${CRM.data.paymentMethods.map(m=>`<option>${m}</option>`).join('')}
            </select></div>
          <div class="form-group"><label class="form-label">Người ghi nhận</label>
            <select class="form-input" id="pf-rec">
              ${users.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}
            </select></div>
        </div>
        <div class="form-group"><label class="form-label">Ghi chú</label>
          <textarea class="form-input" id="pf-notes" rows="2"></textarea></div>
        <div class="flex gap-3 justify-end pt-2">
          <button onclick="CRM.ui.forceClose()" class="btn-secondary">Huỷ</button>
          <button onclick="PaymentsPage.submitAdd()" class="btn-primary">Ghi nhận</button>
        </div>`);
    },

    filterOps(custId) {
      const ops = CRM.db.getOpsByCustomer(parseInt(custId));
      const sel = document.getElementById('pf-op');
      if (!sel) return;
      sel.innerHTML = '<option value="">-- Không có --</option>' +
        ops.map(o=>`<option value="${o.id}">${o.name}</option>`).join('');
    },

    submitAdd() {
      const custId = parseInt(document.getElementById('pf-cust').value);
      const opId   = parseInt(document.getElementById('pf-op').value)||null;
      const amount = parseInt(document.getElementById('pf-amount').value)||0;
      const status = document.getElementById('pf-stat').value;
      const method = document.getElementById('pf-method').value;
      const recBy  = parseInt(document.getElementById('pf-rec').value)||1;
      const notes  = document.getElementById('pf-notes').value;
      if (!custId||!amount) { CRM.ui.toast('Vui lòng chọn khách hàng và nhập số tiền','error'); return; }
      CRM.db.addPayment({ customerId:custId, opportunityId:opId, amount, status, method, recordedBy:recBy, notes });
      CRM.ui.forceClose();
      PaymentsPage.renderList();
      CRM.ui.toast('Đã ghi nhận thanh toán','success');
    },

    openDetailModal(id) {
      const p = CRM.db.getPayments().find(x=>x.id===id);
      if (!p) return;
      CRM.ui.openModal('Chi tiết thanh toán', `
        <div class="grid grid-cols-[120px_1fr] gap-y-4 text-sm items-start">
          <span class="text-c-muted text-xs">Khách hàng</span><span class="font-medium">${CRM.db.getCustomerName(p.customerId)}</span>
          <span class="text-c-muted text-xs">Cơ hội</span><span>${CRM.db.getOpportunityName(p.opportunityId)}</span>
          <span class="text-c-muted text-xs">Số tiền</span><span class="font-semibold text-c-accent">${CRM.utils.formatCurrency(p.amount)}</span>
          <span class="text-c-muted text-xs">Trạng thái</span><div>
            <select class="form-input" id="pd-status" style="max-width:180px;">
              ${CRM.data.paymentStatuses.map(s=>`<option ${s===p.status?'selected':''}>${s}</option>`).join('')}
            </select></div>
          <span class="text-c-muted text-xs">Hình thức</span><span>${p.method}</span>
          <span class="text-c-muted text-xs">Ngày</span><span>${CRM.utils.formatDate(p.date)}</span>
          <span class="text-c-muted text-xs">Người ghi nhận</span><span>${CRM.db.getUserName(p.recordedBy)}</span>
          ${p.notes?`<span class="text-c-muted text-xs">Ghi chú</span><span class="text-c-muted">${p.notes}</span>`:''}
        </div>
        <div class="flex gap-3 justify-end pt-4 mt-4 border-t border-c-border">
          <button onclick="CRM.ui.forceClose()" class="btn-secondary">Đóng</button>
          <button onclick="PaymentsPage.updateStatus(${id})" class="btn-primary">Lưu trạng thái</button>
        </div>`);
    },

    updateStatus(id) {
      const status = document.getElementById('pd-status').value;
      CRM.db.updatePayment(id, { status });
      CRM.ui.forceClose();
      PaymentsPage.renderList();
      CRM.ui.toast('Đã cập nhật trạng thái','success');
    },

    deletePayment(id) {
      CRM.ui.confirm('Xoá bản ghi thanh toán này?', ()=>{
        CRM.db.deletePayment(id);
        PaymentsPage.renderList();
        CRM.ui.toast('Đã xoá','info');
      });
    },
  };

  window.PaymentsPage = page;
  CRM.router.register('payments', page);
})();
