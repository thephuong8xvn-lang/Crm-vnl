// js/pages/dashboard.js
(function(){
  const page = {
    title: 'Tổng quan',
    subtitle: 'Tình hình kinh doanh trong 7 ngày gần nhất',

    render() {
      const ops    = CRM.db.getOpportunities();
      const tasks  = CRM.db.getTasks();
      const pays   = CRM.db.getPayments();
      const custs  = CRM.db.getCustomers();

      const openOps = ops.filter(o=>o.stage!=='Chốt đơn'&&o.stage!=='Thất bại');
      const pipeline = openOps.reduce((s,o)=>s+o.value,0);
      const revenue  = pays.filter(p=>p.status==='Đã thanh toán').reduce((s,p)=>s+p.amount,0);
      const urgent   = openOps.filter(o=>CRM.utils.isOverdue(o.closeDate)).length;
      const todayTasks = tasks.filter(t=>t.status!=='Hoàn thành').slice(0,5);
      const recentOps  = [...ops].sort((a,b)=>b.id-a.id).slice(0,4);

      return `
      <div class="p-8 space-y-6 max-w-7xl">
        <!-- Metric Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="metric-card">
            <p class="text-xs text-c-muted mb-2">Khách hàng</p>
            <p class="text-3xl font-semibold text-c-text">${custs.length}</p>
            <p class="text-xs text-c-success mt-1">+2 trong tháng này</p>
          </div>
          <div class="metric-card">
            <p class="text-xs text-c-muted mb-2">Cơ hội đang mở</p>
            <p class="text-3xl font-semibold text-c-text">${openOps.length}</p>
            <p class="text-xs text-c-warn mt-1">${urgent} cần theo dõi gấp</p>
          </div>
          <div class="metric-card">
            <p class="text-xs text-c-muted mb-2">Giá trị Pipeline</p>
            <p class="text-2xl font-semibold text-c-accent">${CRM.utils.formatCurrency(pipeline)}</p>
            <p class="text-xs text-c-muted mt-1">VND dự kiến</p>
          </div>
          <div class="metric-card">
            <p class="text-xs text-c-muted mb-2">Doanh thu tháng này</p>
            <p class="text-2xl font-semibold text-c-text">${CRM.utils.formatCurrency(revenue)}</p>
            <p class="text-xs text-c-muted mt-1">Đã thanh toán</p>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div class="glass-card p-6 lg:col-span-7">
            <h3 class="text-sm font-semibold text-c-text mb-4">Doanh thu theo tuần</h3>
            <div style="height:220px;position:relative;"><canvas id="rev-chart"></canvas></div>
          </div>
          <div class="glass-card p-6 lg:col-span-5">
            <h3 class="text-sm font-semibold text-c-text mb-4">Cơ hội theo giai đoạn</h3>
            <div style="height:220px;position:relative;"><canvas id="pipe-chart"></canvas></div>
          </div>
        </div>

        <!-- Lists Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Recent Opportunities -->
          <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-sm font-semibold text-c-text">Cơ hội mới nhất</h3>
              <button onclick="CRM.router.navigate('kanban')" class="text-xs text-c-accent hover:underline">Xem tất cả</button>
            </div>
            <div class="space-y-1">
              ${recentOps.map(o=>`
              <div class="flex items-center justify-between p-3 rounded-lg hover:bg-c-high/40 cursor-pointer transition-colors" onclick="CRM.router.navigate('kanban')">
                <div class="flex items-center gap-3">
                  <div class="avatar">${CRM.utils.getInitials(CRM.db.getCustomerName(o.customerId))}</div>
                  <div>
                    <p class="text-sm font-medium text-c-text leading-tight">${o.name}</p>
                    <p class="text-xs text-c-muted">${CRM.db.getCustomerName(o.customerId)}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-c-accent">${CRM.utils.formatCurrency(o.value)}</p>
                  ${CRM.utils.stageBadge(o.stage)}
                </div>
              </div>`).join('')}
            </div>
          </div>

          <!-- Today Tasks -->
          <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-sm font-semibold text-c-text">Việc cần làm hôm nay</h3>
              <button onclick="CRM.router.navigate('tasks')" class="text-xs text-c-accent hover:underline">Xem tất cả</button>
            </div>
            <div class="space-y-1">
              ${todayTasks.map(t=>`
              <div class="flex gap-3 p-3 rounded-lg hover:bg-c-high/40 cursor-pointer transition-colors items-start" onclick="CRM.router.navigate('tasks')">
                ${CRM.utils.priorityBadge(t.priority)}
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-c-text leading-tight">${t.title}</p>
                  <div class="flex items-center justify-between mt-0.5">
                    <p class="text-xs text-c-muted">${CRM.db.getCustomerName(t.customerId)}</p>
                    <p class="text-xs ${CRM.utils.isOverdue(t.dueDate)?'text-c-warn':'text-c-muted'}">${CRM.utils.formatDateTime(t.dueDate)}</p>
                  </div>
                </div>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
    },

    init() {
      // Wait for Chart.js to be available
      requestAnimationFrame(() => {
        if (typeof Chart === 'undefined') { setTimeout(()=>page.init(), 200); return; }
        page._drawCharts();
      });
    },

    _drawCharts() {
      const ACCENT = '#C89A3D', BORDER = '#E3D7C8', MUTED = '#8B8375';
      const baseOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid:{ display:false }, ticks:{ color:MUTED, font:{family:'Inter',size:11} } },
          y: { grid:{ color:BORDER, drawBorder:false }, ticks:{ color:MUTED, font:{family:'Inter',size:11} } }
        }
      };

      // Revenue
      const cRev = document.getElementById('rev-chart');
      if (cRev) {
        const ctx = cRev.getContext('2d');
        const grad = ctx.createLinearGradient(0,0,0,220);
        grad.addColorStop(0,'rgba(200,154,61,0.35)');
        grad.addColorStop(1,'rgba(200,154,61,0)');
        new Chart(ctx, { type:'line', data:{
          labels:['T2','T3','T4','T5','T6','T7','CN'],
          datasets:[{ data:[45,62,38,71,55,80,49], borderColor:ACCENT, backgroundColor:grad,
            borderWidth:2, tension:0.4, fill:true, pointBackgroundColor:'#fff',
            pointBorderColor:ACCENT, pointRadius:4 }]
        }, options:{...baseOpts} });
      }

      // Pipeline by stage
      const cPipe = document.getElementById('pipe-chart');
      if (cPipe) {
        const ops = CRM.db.getOpportunities();
        const stageMap = {};
        CRM.data.stages.slice(0,5).forEach(s=>{ stageMap[s]=0; });
        ops.forEach(o=>{ if(stageMap[o.stage]!==undefined) stageMap[o.stage]++; });
        new Chart(cPipe.getContext('2d'), { type:'bar', data:{
          labels: Object.keys(stageMap),
          datasets:[{ data:Object.values(stageMap), backgroundColor:ACCENT, borderRadius:4, barThickness:18 }]
        }, options:{...baseOpts, indexAxis:'y',
          scales:{ x:{...baseOpts.scales.x, grid:{color:BORDER,drawBorder:false}},
                   y:{...baseOpts.scales.y, grid:{display:false}} }} });
      }
    }
  };

  CRM.router.register('dashboard', page);
})();
