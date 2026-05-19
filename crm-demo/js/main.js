// js/main.js — Router, UI (modal, toast, sidebar), global events
window.CRM = window.CRM || {};

// ===== ROUTER =====
CRM.router = {
  pages: {},   // registered by page modules

  register(name, mod) { CRM.router.pages[name] = mod; },

  navigate(page) {
    window.location.hash = page;
  },

  init() {
    window.addEventListener('hashchange', () => CRM.router._render());
    CRM.router._render();
  },

  _render() {
    const hash = window.location.hash.replace('#','') || 'dashboard';
    const page = CRM.router.pages[hash] || CRM.router.pages['dashboard'];
    if (!page) return;

    // Update sidebar active
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.page === hash);
    });

    // Update header
    document.getElementById('page-title').textContent    = page.title    || '';
    document.getElementById('page-subtitle').textContent = page.subtitle || '';

    // Render page
    const content = document.getElementById('page-content');
    content.innerHTML = page.render();
    content.classList.add('fade-in');
    setTimeout(()=>content.classList.remove('fade-in'),300);

    // Init page interactions
    if (page.init) page.init();
  },
};

// ===== UI HELPERS =====
CRM.ui = {
  // ----- MODAL -----
  openModal(title, bodyHtml, opts={}) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML    = bodyHtml;
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('hidden');
    if (opts.wide) document.getElementById('modal-box').style.maxWidth = '700px';
    else           document.getElementById('modal-box').style.maxWidth = '520px';
    if (opts.afterRender) opts.afterRender();
  },

  closeModal(e) {
    if (e && e.target !== document.getElementById('modal-overlay')) return;
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
  },

  forceClose() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
  },

  // ----- CONFIRM DIALOG -----
  confirm(message, onConfirm) {
    CRM.ui.openModal('Xác nhận', `
      <p class="text-sm text-c-muted mb-6">${message}</p>
      <div class="flex gap-3 justify-end">
        <button onclick="CRM.ui.forceClose()" class="btn-secondary">Huỷ</button>
        <button id="confirm-yes" class="btn-primary" style="background:#ba1a1a;">Xoá</button>
      </div>
    `);
    setTimeout(()=>{
      const btn = document.getElementById('confirm-yes');
      if (btn) btn.onclick = () => { CRM.ui.forceClose(); onConfirm(); };
    }, 50);
  },

  // ----- TOAST -----
  toast(message, type='info') {
    const icons = { success:'check_circle', error:'error', info:'info' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">${icons[type]||'info'}</span><span>${message}</span>`;
    const container = document.getElementById('toast-container');
    container.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity 0.3s'; setTimeout(()=>el.remove(),300); }, 3000);
  },

  // ----- SEARCH OVERLAY -----
  showSearch() {
    const el = document.createElement('div');
    el.className = 'search-overlay';
    el.id = 'search-overlay';
    el.innerHTML = `
      <div class="search-box">
        <div class="flex items-center px-4 py-3 border-b border-c-border">
          <span class="material-symbols-outlined mr-3 text-c-muted">search</span>
          <input id="search-input" class="flex-1 outline-none text-sm bg-transparent text-c-text placeholder:text-c-muted"
            placeholder="Tìm khách hàng, cơ hội, công việc..." autofocus />
          <button onclick="document.getElementById('search-overlay').remove()" class="icon-btn ml-2">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div id="search-results" class="p-4 space-y-2 max-h-80 overflow-y-auto">
          <p class="text-xs text-c-muted">Nhập từ khoá để tìm kiếm...</p>
        </div>
      </div>
    `;
    el.addEventListener('click', e => { if(e.target===el) el.remove(); });
    document.body.appendChild(el);

    const input = document.getElementById('search-input');
    input.focus();
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const res = document.getElementById('search-results');
      if (!q) { res.innerHTML='<p class="text-xs text-c-muted">Nhập từ khoá để tìm kiếm...</p>'; return; }

      const customers = CRM.db.getCustomers().filter(c=>c.name.toLowerCase().includes(q)||c.phone.includes(q));
      const opps      = CRM.db.getOpportunities().filter(o=>o.name.toLowerCase().includes(q));
      const tasks     = CRM.db.getTasks().filter(t=>t.title.toLowerCase().includes(q));

      let html = '';
      customers.forEach(c => { html+=`<div class="search-item" onclick="document.getElementById('search-overlay').remove();CRM.router.navigate('customers')">
        <span class="material-symbols-outlined text-c-muted" style="font-size:16px;">person</span>
        <div><div class="text-sm font-medium">${c.name}</div><div class="text-xs text-c-muted">${c.phone}</div></div></div>`; });
      opps.forEach(o => { html+=`<div class="search-item" onclick="document.getElementById('search-overlay').remove();CRM.router.navigate('kanban')">
        <span class="material-symbols-outlined text-c-muted" style="font-size:16px;">auto_awesome</span>
        <div><div class="text-sm font-medium">${o.name}</div><div class="text-xs text-c-muted">${CRM.db.getCustomerName(o.customerId)}</div></div></div>`; });
      tasks.forEach(t => { html+=`<div class="search-item" onclick="document.getElementById('search-overlay').remove();CRM.router.navigate('tasks')">
        <span class="material-symbols-outlined text-c-muted" style="font-size:16px;">assignment</span>
        <div><div class="text-sm font-medium">${t.title}</div><div class="text-xs text-c-muted">${CRM.db.getCustomerName(t.customerId)}</div></div></div>`; });
      res.innerHTML = html || '<p class="text-xs text-c-muted">Không tìm thấy kết quả.</p>';
    });
  },
};

// add search-item style dynamically
(function(){
  const style = document.createElement('style');
  style.textContent = `.search-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background 0.12s;}
  .search-item:hover{background:rgba(200,154,61,0.08);}`;
  document.head.appendChild(style);
})();
