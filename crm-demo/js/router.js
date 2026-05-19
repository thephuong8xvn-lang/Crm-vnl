/* js/router.js – Hash-based SPA router + global app state */
'use strict';

window.CRM = window.CRM || {};

/* ── App state (shared across pages) ──────────────────────────────────── */
CRM.state = {
  currentPage:      'dashboard',
  currentUserId:    1,            // logged-in user (Admin demo)
  tasksView:        'list',       // 'list' | 'board'
  tasksFilter:      'all',        // 'all' | 'today' | 'week' | 'overdue'
  tasksPriority:    '',
  tasksAssigned:    '',
  taskPanelId:      null,
  customersSearch:  '',
  customersSegment: '',
  customersProduct: '',
  customerPanelId:  null,
  paymentsStatus:   '',
  paymentsUser:     '',
  kanbanAssigned:   '',
  kanbanSegment:    '',
  settingsTab:      'users',
};

/* ── Page registry ────────────────────────────────────────────────────── */
CRM.router = {
  _map: {
    dashboard: { title: 'Tổng quan',       subtitle: 'Tình hình trong 7 ngày gần nhất' },
    kanban:    { title: 'Cơ hội bán hàng', subtitle: 'Quản lý pipeline theo giai đoạn' },
    tasks:     { title: 'Công việc',        subtitle: 'Danh sách việc cần làm' },
    customers: { title: 'Khách hàng',       subtitle: 'Danh sách và hồ sơ khách hàng' },
    payments:  { title: 'Thanh toán',       subtitle: 'Ghi nhận và theo dõi thanh toán' },
    settings:  { title: 'Cài đặt',          subtitle: 'Cấu hình hệ thống' },
  },

  navigate(page) {
    if (!this._map[page]) page = 'dashboard';
    CRM.state.currentPage = page;
    CRM.ui.setHeader(this._map[page].title, this._map[page].subtitle);
    CRM.ui.setActivePage(page);
    // Close any open side panels before navigating
    document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
    CRM.pages[page].render();
    history.replaceState(null, '', '#' + page);
  },

  init() {
    /* Sidebar nav clicks */
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); this.navigate(el.dataset.nav); });
    });

    /* Modal close button */
    document.getElementById('modal-close').addEventListener('click', () => CRM.ui.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) CRM.ui.closeModal();
    });

    /* Initial route from hash */
    const hash = location.hash.replace('#', '');
    this.navigate(this._map[hash] ? hash : 'dashboard');

    window.addEventListener('hashchange', () => {
      const h = location.hash.replace('#', '');
      if (this._map[h] && h !== CRM.state.currentPage) this.navigate(h);
    });
  },
};
