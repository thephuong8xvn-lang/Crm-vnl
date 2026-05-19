import { TrendingUp, Users, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const revenueData = [
  { day: 'T2', value: 45 },
  { day: 'T3', value: 62 },
  { day: 'T4', value: 38 },
  { day: 'T5', value: 71 },
  { day: 'T6', value: 55 },
  { day: 'T7', value: 80 },
  { day: 'CN', value: 49 },
];

const pipelineData = [
  { stage: 'Mới', count: 8 },
  { stage: 'Tư vấn', count: 6 },
  { stage: 'Báo giá', count: 7 },
  { stage: 'Đàm phán', count: 4 },
  { stage: 'Chốt đơn', count: 3 },
];

const recentOpportunities = [
  { initials: 'NT', name: 'Đơn hàng quà tặng sỉ', customer: 'Nguyễn Thị Thu', value: '45.000.000 ₫', stage: 'Gửi báo giá', stageStyle: 'bg-[#e9dece]/60 text-[#696255]' },
  { initials: 'HV', name: 'Tổ yến tinh chế 500g', customer: 'Hoàng Văn Hải', value: '22.500.000 ₫', stage: 'Đang tư vấn', stageStyle: 'bg-[#f0e7dc] text-[#4f4637]' },
  { initials: 'LP', name: 'Hợp đồng đại lý cấp 2', customer: 'Lê Phương', value: '120.000.000 ₫', stage: 'Đàm phán', stageStyle: 'bg-[#C89A3D]/15 text-[#C89A3D]' },
  { initials: 'TC', name: 'Yến rút lông nguyên tổ', customer: 'Trần Chung', value: '8.500.000 ₫', stage: 'Mới', stageStyle: 'bg-[#f0e7dc] text-[#4f4637]' },
];

const todayTasks = [
  { priority: 'Cao', priorityStyle: 'bg-[#D96C3F]/15 text-[#D96C3F]', title: 'Gửi hợp đồng sửa đổi', customer: 'Công ty TNHH Phú Quý', time: '14:00', timeStyle: 'text-[#D96C3F]' },
  { priority: 'TB', priorityStyle: 'bg-[#e9dece] text-[#696255]', title: 'Gọi xác nhận đơn hàng', customer: 'Chị Hoa - Quận 7', time: '15:30', timeStyle: 'text-[#8B8375]' },
  { priority: 'Cao', priorityStyle: 'bg-[#D96C3F]/15 text-[#D96C3F]', title: 'Duyệt chiết khấu đại lý mới', customer: 'Đại lý miền Trung', time: '17:00', timeStyle: 'text-[#D96C3F]' },
];

const kpiCards = [
  {
    label: 'Khách hàng mới',
    value: '12',
    sub: '+3 so với tuần trước',
    subStyle: 'text-[#3A8F68]',
    icon: Users,
    iconBg: 'bg-[#e9dece]',
    iconColor: 'text-[#645e51]',
  },
  {
    label: 'Cơ hội đang mở',
    value: '28',
    sub: '5 cần theo dõi gấp',
    subStyle: 'text-[#D96C3F]',
    icon: Sparkles,
    iconBg: 'bg-[#C89A3D]/15',
    iconColor: 'text-[#C89A3D]',
  },
  {
    label: 'Giá trị Pipeline',
    value: '2.4 tỷ',
    sub: 'VND dự kiến',
    subStyle: 'text-[#8B8375]',
    icon: TrendingUp,
    iconBg: 'bg-[#C89A3D]/15',
    iconColor: 'text-[#C89A3D]',
  },
  {
    label: 'Doanh thu tháng này',
    value: '380 triệu',
    sub: 'VND đã thanh toán',
    subStyle: 'text-[#8B8375]',
    icon: CreditCard,
    iconBg: 'bg-[#e9dece]',
    iconColor: 'text-[#645e51]',
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel border border-[#E3D7C8] rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-[#8B8375] mb-0.5">{label}</p>
        <p className="font-semibold text-[#C89A3D]">{payload[0].value} triệu</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  return (
    <div className="p-8 max-w-[1440px] mx-auto w-full space-y-6">
      {/* Sub-header */}
      <p className="text-sm text-[#8B8375] -mt-2">Tình hình trong 7 ngày gần nhất</p>

      {/* ROW 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => (
          <div key={card.label} className="glass-panel rounded-2xl p-6 border border-[#E3D7C8]">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm text-[#8B8375]">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-[#1f1b15] mb-1">{card.value}</p>
            <p className={`text-xs font-medium ${card.subStyle}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ROW 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Area Chart - Revenue */}
        <div className="glass-panel rounded-2xl p-6 border border-[#E3D7C8] lg:col-span-7 flex flex-col">
          <h3 className="text-[17px] font-medium text-[#3F3A33] mb-5">Doanh thu theo tuần</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C89A3D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C89A3D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#E3D7C8" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#817665', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#817665', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#C89A3D"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#C89A3D' }}
                  activeDot={{ r: 5, fill: '#C89A3D' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Pipeline */}
        <div className="glass-panel rounded-2xl p-6 border border-[#E3D7C8] lg:col-span-5 flex flex-col">
          <h3 className="text-[17px] font-medium text-[#3F3A33] mb-5">Cơ hội theo giai đoạn</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E3D7C8" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#817665', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fill: '#4f4637', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip cursor={{ fill: 'rgba(200,154,61,0.05)' }} content={({ active, payload, label }) => active && payload?.length ? (
                  <div className="glass-panel border border-[#E3D7C8] rounded-lg px-3 py-2 text-xs shadow-lg">
                    <p className="text-[#8B8375] mb-0.5">{label}</p>
                    <p className="font-semibold text-[#C89A3D]">{payload[0].value} cơ hội</p>
                  </div>
                ) : null} />
                <Bar dataKey="count" fill="#C89A3D" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Opportunities */}
        <div className="glass-panel rounded-2xl p-6 border border-[#E3D7C8]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[17px] font-medium text-[#3F3A33]">Cơ hội mới nhất</h3>
            <button className="text-xs text-[#C89A3D] hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {recentOpportunities.map((opp, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl hover:bg-[#f6ece2]/60 transition-colors ${i > 0 ? 'border-t border-[#E3D7C8]/50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e9dece] text-[#696255] flex items-center justify-center text-sm font-medium shrink-0">
                    {opp.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1f1b15]">{opp.name}</p>
                    <p className="text-xs text-[#8B8375]">{opp.customer}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-semibold text-[#C89A3D]">{opp.value}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] mt-0.5 ${opp.stageStyle}`}>{opp.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="glass-panel rounded-2xl p-6 border border-[#E3D7C8]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[17px] font-medium text-[#3F3A33]">Việc cần làm hôm nay</h3>
            <button className="text-xs text-[#C89A3D] hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {todayTasks.map((task, i) => (
              <div key={i} className={`flex gap-4 p-3 rounded-xl hover:bg-[#f6ece2]/60 transition-colors ${i > 0 ? 'border-t border-[#E3D7C8]/50' : ''}`}>
                <div className="mt-0.5 shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${task.priorityStyle}`}>{task.priority}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1f1b15]">{task.title}</p>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-xs text-[#8B8375] truncate">{task.customer}</p>
                    <p className={`text-xs font-medium ml-3 shrink-0 ${task.timeStyle}`}>{task.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
