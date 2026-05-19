/* js/ui.js – Shared UI: Modal, Toast, Form builders */
'use strict';

window.CRM = window.CRM || {};

CRM.ui = {

  /* ── Toast ──────────────────────────────────────────────────────────── */
  toast(msg, type = 'success') {
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="material-symbols-outlined">${icons[type] || 'info'}</span>
      <span style="flex:1">${msg}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <span class="material-symbols-outlined" style="font-size:16px">close</span>
      </button>`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .35s'; }, 2600);
    setTimeout(() => el.remove(), 3000);
  },

  /* ── Modal ──────────────────────────────────────────────────────────── */
  openModal(title, bodyHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    const ov = document.getElementById('modal-overlay');
    ov.classList.add('open');
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-title').textContent = '';
  },

  confirm(msg) {
    return new Promise(resolve => {
      this.openModal('Xác nhận', `
        <p style="color:#4f4637;margin-bottom:20px;font-size:14px">${msg}</p>
        <div class="form-actions">
          <button id="cfm-cancel" class="btn-ghost">Hủy</button>
          <button id="cfm-ok" style="display:inline-flex;align-items:center;gap:6px;background:#ba1a1a;color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:500;cursor:pointer">
            <span class="material-symbols-outlined" style="font-size:16px">delete</span>Xác nhận xóa
          </button>
        </div>`);
      document.getElementById('cfm-cancel').onclick = () => { this.closeModal(); resolve(false); };
      document.getElementById('cfm-ok').onclick    = () => { this.closeModal(); resolve(true);  };
    });
  },

  /* ── Header ─────────────────────────────────────────────────────────── */
  setHeader(title, subtitle = '') {
    document.getElementById('page-title').textContent    = title;
    document.getElementById('page-subtitle').textContent = subtitle;
  },

  /* ── Sidebar active ─────────────────────────────────────────────────── */
  setActivePage(page) {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === page);
    });
  },

  /* ── Form select builders ───────────────────────────────────────────── */
  selectUsers(name, val = '', label = 'Người phụ trách') {
    const opts = CRM.db.getUsers().map(u =>
      `<option value="${u.id}" ${+u.id === +val ? 'selected' : ''}>${u.name} (${u.role})</option>`).join('');
    return this._select(name, label, `<option value="">-- Chọn --</option>${opts}`);
  },

  selectStages(name, val = '') {
    const opts = CRM.data.stages.map(s =>
      `<option value="${s}" ${s === val ? 'selected' : ''}>${s}</option>`).join('');
    return this._select(name, 'Giai đoạn', opts);
  },

  selectCustomers(name, val = '') {
    const opts = CRM.db.getCustomers().map(c =>
      `<option value="${c.id}" ${+c.id === +val ? 'selected' : ''}>${c.name}</option>`).join('');
    return this._select(name, 'Khách hàng', `<option value="">-- Chọn --</option>${opts}`);
  },

  selectOpportunities(name, val = '', customerId = null) {
    let opps = CRM.db.getOpportunities();
    if (customerId) opps = opps.filter(o => o.customer_id === +customerId);
    const opts = opps.map(o =>
      `<option value="${o.id}" ${+o.id === +val ? 'selected' : ''}>${o.name}</option>`).join('');
    return this._select(name, 'Cơ hội liên quan', `<option value="">-- Không chọn --</option>${opts}`);
  },

  selectPaymentStatuses(name, val = '') {
    const opts = CRM.data.paymentStatuses.map(s =>
      `<option value="${s}" ${s === val ? 'selected' : ''}>${s}</option>`).join('');
    return this._select(name, 'Trạng thái', opts);
  },

  selectPaymentMethods(name, val = '') {
    const opts = CRM.data.paymentMethods.map(m =>
      `<option value="${m}" ${m === val ? 'selected' : ''}>${m}</option>`).join('');
    return this._select(name, 'Hình thức thanh toán', opts);
  },

  selectPriorities(name, val = '') {
    const opts = CRM.data.taskPriorities.map(p =>
      `<option value="${p}" ${p === val ? 'selected' : ''}>${p}</option>`).join('');
    return this._select(name, 'Ưu tiên', opts);
  },

  selectSegments(name, val = '') {
    const opts = CRM.data.segments.map(s =>
      `<option value="${s}" ${s === val ? 'selected' : ''}>${s}</option>`).join('');
    return this._select(name, 'Phân khúc', opts);
  },

  _select(name, label, options) {
    return `
      <div class="form-group">
        <label class="form-label">${label}</label>
        <select name="${name}" class="form-input">${options}</select>
      </div>`;
  },

  field(name, label, type = 'text', val = '', placeholder = '') {
    return `
      <div class="form-group">
        <label class="form-label">${label}</label>
        <input name="${name}" type="${type}" class="form-input" value="${this._esc(val)}" placeholder="${placeholder}">
      </div>`;
  },

  textarea(name, label, val = '', placeholder = '') {
    return `
      <div class="form-group">
        <label class="form-label">${label}</label>
        <textarea name="${name}" class="form-input" rows="3" placeholder="${placeholder}" style="resize:vertical">${this._esc(val)}</textarea>
      </div>`;
  },

  checkboxGroup(name, label, options, selected = []) {
    const boxes = options.map(o => `
      <label style="display:inline-flex;align-items:center;gap:5px;margin-right:14px;font-size:13px;cursor:pointer">
        <input type="checkbox" name="${name}" value="${o}" ${selected.includes(o) ? 'checked' : ''}
          style="accent-color:#C89A3D;width:15px;height:15px"> ${o}
      </label>`).join('');
    return `
      <div class="form-group">
        <label class="form-label">${label}</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px;padding-top:4px">${boxes}</div>
      </div>`;
  },

  formActions(submitLabel = 'Lưu') {
    return `
      <div class="form-actions">
        <button type="button" onclick="CRM.ui.closeModal()" class="btn-ghost">Hủy</button>
        <button type="submit" class="btn-primary">
          <span class="material-symbols-outlined" style="font-size:16px">save</span>${submitLabel}
        </button>
      </div>`;
  },

  getFormData(form) {
    const d = {};
    new FormData(form).forEach((v, k) => {
      if (d[k]) {
        d[k] = Array.isArray(d[k]) ? [...d[k], v] : [d[k], v];
      } else {
        d[k] = v;
      }
    });
    // collect multi-checkboxes
    form.querySelectorAll('input[type=checkbox]').forEach(cb => {
      if (!cb.checked) return;
      const k = cb.name;
      d[k] = d[k] ? (Array.isArray(d[k]) ? [...d[k], cb.value] : [d[k], cb.value]) : [cb.value];
    });
    return d;
  },

  _esc(str) { return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); },
};
