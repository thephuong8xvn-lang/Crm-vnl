// js/data.js — Mock Data Layer
// To add backend: replace CRM.db.* functions with Supabase/fetch API calls

window.CRM = window.CRM || {};

CRM.data = {
  nextId: 200,
  users: [
    { id:1, name:'Nguyễn Hùng',  initials:'NH', email:'hung@ysvh.vn',  role:'Admin',        team:'Ban Giám Đốc', status:'active' },
    { id:2, name:'Trần Hoa',     initials:'TH', email:'hoa@ysvh.vn',   role:'Trưởng nhóm',  team:'Nhóm Nam',     status:'active' },
    { id:3, name:'Nguyễn Lan',   initials:'NL', email:'lan@ysvh.vn',   role:'Sales',        team:'Nhóm Nam',     status:'active' },
    { id:4, name:'Lê Minh',      initials:'LM', email:'minh@ysvh.vn',  role:'Sales',        team:'Nhóm Bắc',     status:'active' },
    { id:5, name:'Phạm Thảo',    initials:'PT', email:'thao@ysvh.vn',  role:'CSKH',         team:'Nhóm Nam',     status:'active' },
  ],

  customers: [
    { id:101, name:'Nguyễn Thùy Linh', phone:'0901 234 567', email:'linh@huongviet.vn',  address:'Quận 1, TP.HCM',   segment:'Đại lý', products:['Yến tinh chế','Yến chưng'],     assignedTo:2, notes:'Đại lý lâu năm, ưu tiên cao',    value:280000000, createdAt:'2026-02-15' },
    { id:102, name:'Trần Minh Quân',   phone:'0912 345 678', email:'quan@anphat.vn',     address:'Quận 3, TP.HCM',   segment:'Đại lý', products:['Yến thô','Yến tinh chế'],       assignedTo:3, notes:'Xuất khẩu, thanh toán nhanh',      value:450000000, createdAt:'2026-01-20' },
    { id:103, name:'Lê Bảo Anh',       phone:'0923 456 789', email:'baoanh@gmail.com',   address:'Quận 7, TP.HCM',   segment:'VIP',    products:['Yến chưng','Yến tinh chế'],     assignedTo:4, notes:'Khách VIP, mua định kỳ quà biếu',   value:65000000,  createdAt:'2026-03-05' },
    { id:104, name:'Phạm Ngọc Hưng',   phone:'0934 567 890', email:'hung@saigonevent.vn',address:'Quận 5, TP.HCM',   segment:'Đại lý', products:['Yến chưng','Yến tinh chế'],     assignedTo:2, notes:'Sự kiện doanh nghiệp, số lượng lớn', value:320000000, createdAt:'2026-03-20' },
    { id:105, name:'Vũ Thu Trang',      phone:'0945 678 901', email:'trang@annhien.vn',   address:'Hà Nội',           segment:'Đại lý', products:['Yến thô','Yến chưng'],          assignedTo:3, notes:'Chuỗi đặc sản miền Trung, Hà Nội',   value:210000000, createdAt:'2026-04-01' },
    { id:106, name:'Đặng Quốc Khánh',  phone:'0956 789 012', email:'khanh@gmail.com',    address:'Bình Dương',       segment:'Khách lẻ',products:['Yến chưng','Yến tinh chế'],    assignedTo:4, notes:'Mua hàng tháng, biếu tặng',         value:35000000,  createdAt:'2026-04-15' },
  ],

  opportunities: [
    { id:201, name:'Gói nhập hàng tháng 6',      customerId:105, stage:'Mới',          value:210000000, closeDate:'2026-05-30', assignedTo:2, notes:'Đang chờ xác nhận từ kho' },
    { id:202, name:'Set quà VIP dịp 1/6',         customerId:103, stage:'Mới',          value:65000000,  closeDate:'2026-06-01', assignedTo:4, notes:'Khách cần gói quà cao cấp' },
    { id:203, name:'Thăm dò sản phẩm mới',        customerId:106, stage:'Mới',          value:35000000,  closeDate:'2026-06-05', assignedTo:3, notes:'' },
    { id:204, name:'Hợp đồng đại lý miền Nam',    customerId:101, stage:'Đang tư vấn',  value:280000000, closeDate:'2026-05-25', assignedTo:2, notes:'Đã gặp 2 lần, cần thêm thông tin' },
    { id:205, name:'Hợp đồng Q3 Hương Việt',      customerId:101, stage:'Đang tư vấn',  value:280000000, closeDate:'2026-05-28', assignedTo:2, notes:'Gia hạn hợp đồng Q3' },
    { id:206, name:'Combo quà doanh nghiệp',       customerId:104, stage:'Gửi báo giá',  value:320000000, closeDate:'2026-05-20', assignedTo:2, notes:'Báo giá đã gửi 15/05' },
    { id:207, name:'Gói An Nhiên đặc sản',         customerId:105, stage:'Gửi báo giá',  value:210000000, closeDate:'2026-05-22', assignedTo:4, notes:'Chờ phản hồi từ khách' },
    { id:208, name:'Hợp đồng An Phát Q2',          customerId:102, stage:'Đàm phán',     value:450000000, closeDate:'2026-05-18', assignedTo:2, notes:'Đang đàm phán chiết khấu 5%' },
    { id:209, name:'Đại lý chiến lược miền Bắc',  customerId:105, stage:'Đàm phán',     value:210000000, closeDate:'2026-05-19', assignedTo:3, notes:'Gần chốt, cần duyệt giám đốc' },
    { id:210, name:'Yến tinh chế xuất khẩu',      customerId:102, stage:'Chốt đơn',     value:450000000, closeDate:'2026-05-15', assignedTo:2, notes:'Đã ký hợp đồng' },
    { id:211, name:'Báo giá tháng 3 từ chối',     customerId:103, stage:'Thất bại',     value:120000000, closeDate:'2026-03-31', assignedTo:3, notes:'Khách chọn nhà cung cấp khác' },
  ],

  tasks: [
    { id:301, title:'Gọi tư vấn gói đại lý Hương Việt',           customerId:101, opportunityId:204, assignedTo:2, dueDate:'2026-05-18T16:00', priority:'Cao',       status:'Đang làm',  notes:'Cần chuẩn bị tài liệu giới thiệu sản phẩm' },
    { id:302, title:'Gửi báo giá combo quà tặng Sài Gòn Event',   customerId:104, opportunityId:206, assignedTo:2, dueDate:'2026-05-19T11:00', priority:'Cao',       status:'Mới',       notes:'Gửi qua email và zalo' },
    { id:303, title:'Hẹn gặp thử sản phẩm tại An Nhiên',         customerId:105, opportunityId:207, assignedTo:3, dueDate:'2026-05-21T15:00', priority:'Trung bình', status:'Mới',       notes:'Chuẩn bị mẫu yến chưng và yến thô' },
    { id:304, title:'Gọi chăm sóc đơn lặp lại tháng 6 anh Khánh',customerId:106, opportunityId:null,assignedTo:2, dueDate:'2026-05-25T10:00', priority:'Trung bình', status:'Mới',       notes:'Nhắc đặt combo tháng 6' },
    { id:305, title:'Gửi catalog và ưu đãi VIP cho chị Bảo Anh', customerId:103, opportunityId:202, assignedTo:3, dueDate:'2026-05-22T09:00', priority:'Thấp',      status:'Hoàn thành',notes:'Đã gửi qua email 20/05' },
    { id:306, title:'Duyệt chiết khấu đại lý An Phát',            customerId:102, opportunityId:208, assignedTo:1, dueDate:'2026-05-17T17:00', priority:'Cao',       status:'Quá hạn',   notes:'Cần giám đốc phê duyệt' },
  ],

  payments: [
    { id:401, customerId:102, opportunityId:210, amount:450000000, status:'Đã thanh toán',   method:'Chuyển khoản', recordedBy:2, date:'2026-05-15', notes:'TT đủ 100%, đã xuất hóa đơn' },
    { id:402, customerId:101, opportunityId:204, amount:140000000, status:'Đã thanh toán',   method:'Chuyển khoản', recordedBy:2, date:'2026-05-10', notes:'Đặt cọc 50%' },
    { id:403, customerId:104, opportunityId:206, amount:320000000, status:'Chưa thanh toán', method:'COD',          recordedBy:3, date:'2026-05-20', notes:'Chờ xác nhận nhận hàng' },
    { id:404, customerId:103, opportunityId:202, amount:65000000,  status:'Chưa thanh toán', method:'Tiền mặt',     recordedBy:4, date:'2026-05-22', notes:'Khách thanh toán khi nhận' },
    { id:405, customerId:106, opportunityId:null,amount:35000000,  status:'Đã thanh toán',   method:'Tiền mặt',     recordedBy:3, date:'2026-05-08', notes:'Mua lẻ tại cửa hàng' },
  ],

  stages: ['Mới','Đang tư vấn','Gửi báo giá','Đàm phán','Chốt đơn','Thất bại'],
  products: ['Yến thô','Yến chưng','Yến tinh chế'],
  segments: ['Khách lẻ','Đại lý','VIP'],
  priorities: ['Cao','Trung bình','Thấp'],
  taskStatuses: ['Mới','Đang làm','Hoàn thành','Quá hạn'],
  paymentStatuses: ['Đã thanh toán','Chưa thanh toán','Hoàn tiền'],
  paymentMethods: ['Tiền mặt','Chuyển khoản','COD'],
  roles: ['Admin','Trưởng nhóm','Sales','CSKH'],
};

// ===== DB LAYER — replace with API calls when adding backend =====
CRM.db = {
  // --- CUSTOMERS ---
  getCustomers:        ()  => [...CRM.data.customers],
  getCustomer:         (id)=> CRM.data.customers.find(c=>c.id===id),
  addCustomer:         (d) => { const r={...d,id:++CRM.data.nextId,createdAt:new Date().toISOString().slice(0,10)}; CRM.data.customers.push(r); return r; },
  updateCustomer:      (id,d)=>{ const i=CRM.data.customers.findIndex(c=>c.id===id); if(i>-1){ CRM.data.customers[i]={...CRM.data.customers[i],...d}; return CRM.data.customers[i]; } },
  deleteCustomer:      (id) => { CRM.data.customers=CRM.data.customers.filter(c=>c.id!==id); },

  // --- OPPORTUNITIES ---
  getOpportunities:    ()  => [...CRM.data.opportunities],
  getOpportunity:      (id)=> CRM.data.opportunities.find(o=>o.id===id),
  getOpsByCustomer:    (cid)=>CRM.data.opportunities.filter(o=>o.customerId===cid),
  addOpportunity:      (d) => { const r={...d,id:++CRM.data.nextId}; CRM.data.opportunities.push(r); return r; },
  updateOpportunity:   (id,d)=>{ const i=CRM.data.opportunities.findIndex(o=>o.id===id); if(i>-1){ CRM.data.opportunities[i]={...CRM.data.opportunities[i],...d}; return CRM.data.opportunities[i]; } },
  deleteOpportunity:   (id) => { CRM.data.opportunities=CRM.data.opportunities.filter(o=>o.id!==id); },
  moveOpportunity:     (id,stage)=>CRM.db.updateOpportunity(id,{stage}),

  // --- TASKS ---
  getTasks:            ()  => [...CRM.data.tasks],
  getTask:             (id)=> CRM.data.tasks.find(t=>t.id===id),
  addTask:             (d) => { const r={...d,id:++CRM.data.nextId}; CRM.data.tasks.push(r); return r; },
  updateTask:          (id,d)=>{ const i=CRM.data.tasks.findIndex(t=>t.id===id); if(i>-1){ CRM.data.tasks[i]={...CRM.data.tasks[i],...d}; return CRM.data.tasks[i]; } },
  deleteTask:          (id) => { CRM.data.tasks=CRM.data.tasks.filter(t=>t.id!==id); },
  completeTask:        (id) => CRM.db.updateTask(id,{status:'Hoàn thành'}),

  // --- PAYMENTS ---
  getPayments:         ()  => [...CRM.data.payments],
  addPayment:          (d) => { const r={...d,id:++CRM.data.nextId,date:new Date().toISOString().slice(0,10)}; CRM.data.payments.push(r); return r; },
  updatePayment:       (id,d)=>{ const i=CRM.data.payments.findIndex(p=>p.id===id); if(i>-1){ CRM.data.payments[i]={...CRM.data.payments[i],...d}; return CRM.data.payments[i]; } },
  deletePayment:       (id) => { CRM.data.payments=CRM.data.payments.filter(p=>p.id!==id); },

  // --- USERS ---
  getUsers:            ()  => [...CRM.data.users],
  getUser:             (id)=> CRM.data.users.find(u=>u.id===id),
  addUser:             (d) => { const r={...d,id:++CRM.data.nextId,status:'active'}; CRM.data.users.push(r); return r; },
  updateUser:          (id,d)=>{ const i=CRM.data.users.findIndex(u=>u.id===id); if(i>-1){ CRM.data.users[i]={...CRM.data.users[i],...d}; } },
  deleteUser:          (id) => { CRM.data.users=CRM.data.users.filter(u=>u.id!==id); },

  // --- HELPERS ---
  getUserName:         (id)=> { const u=CRM.data.users.find(u=>u.id===id); return u?u.name:'—'; },
  getUserInitials:     (id)=> { const u=CRM.data.users.find(u=>u.id===id); return u?u.initials:'?'; },
  getCustomerName:     (id)=> { const c=CRM.data.customers.find(c=>c.id===id); return c?c.name:'—'; },
  getOpportunityName:  (id)=> { if(!id) return '—'; const o=CRM.data.opportunities.find(o=>o.id===id); return o?o.name:'—'; },
};
