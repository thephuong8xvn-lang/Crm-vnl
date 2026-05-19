// js/utils.js — Formatting helpers
window.CRM = window.CRM || {};

CRM.utils = {
  formatCurrency(n) {
    if (!n && n !== 0) return '—';
    if (n >= 1000000000) return (n/1000000000).toFixed(1).replace('.0','') + ' tỷ ₫';
    if (n >= 1000000)    return (n/1000000).toFixed(0) + ' triệu ₫';
    return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
  },

  formatDate(str) {
    if (!str) return '—';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
  },

  formatShortDate(str) {
    if (!str) return '';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  },

  formatDateTime(str) {
    if (!str) return '—';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  },

  getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  },

  isOverdue(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  },

  segmentBadge(seg) {
    const map = { 'VIP':'badge-vip', 'Đại lý':'badge-agency', 'Khách lẻ':'badge-retail' };
    return `<span class="badge ${map[seg]||'badge-retail'}">${seg}</span>`;
  },

  priorityBadge(p) {
    const map = { 'Cao':'badge-high', 'Trung bình':'badge-mid', 'Thấp':'badge-low' };
    return `<span class="badge ${map[p]||'badge-low'}">${p}</span>`;
  },

  statusBadge(s) {
    const map = { 'Mới':'badge-new', 'Đang làm':'badge-inprog', 'Hoàn thành':'badge-done', 'Quá hạn':'badge-overdue' };
    return `<span class="badge ${map[s]||'badge-new'}">${s}</span>`;
  },

  paymentBadge(s) {
    const map = { 'Đã thanh toán':'badge-paid', 'Chưa thanh toán':'badge-unpaid', 'Hoàn tiền':'badge-refund' };
    return `<span class="badge ${map[s]||'badge-unpaid'}">${s}</span>`;
  },

  stageBadge(s) {
    const colors = { 'Mới':'#e9dece', 'Đang tư vấn':'#d5e3ff', 'Gửi báo giá':'#ffdea6',
      'Đàm phán':'#c8e3ff', 'Chốt đơn':'rgba(200,154,61,0.2)', 'Thất bại':'#eae1d7' };
    const texts  = { 'Mới':'#645e51', 'Đang tư vấn':'#17477f', 'Gửi báo giá':'#5d4200',
      'Đàm phán':'#00386e', 'Chốt đơn':'#7b5800', 'Thất bại':'#8B8375' };
    const bg = colors[s]||'#eae1d7', color = texts[s]||'#8B8375';
    return `<span class="badge" style="background:${bg};color:${color};">${s}</span>`;
  },

  avatar(userId) {
    const init = CRM.db.getUserInitials(userId);
    return `<span class="avatar">${init}</span>`;
  },

  csvDownload(rows, filename) {
    const BOM = '﻿';
    const csv = BOM + rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  },
};
