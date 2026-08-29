import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetDashboardStatsQuery } from '../store/apiSlice';

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n ?? 0));
const fmtCurrency = (n) => {
  if (!n) return '₹0';
  if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

export default function Dashboard() {
  const user = useSelector((s) => s.auth.user);
  const { data, isLoading } = useGetDashboardStatsQuery();

  const firstName = user?.name?.split(' ')[0] || 'there';

  const kpiCards = [
    { title: 'Total Leads',     value: fmt(data?.leads?.total),       icon: 'person_add',             color: '#3525cd' },
    { title: 'Qualified Leads', value: fmt(data?.leads?.qualified),   icon: 'how_to_reg',             color: '#16A34A' },
    { title: 'Total Customers', value: fmt(data?.customers?.total),   icon: 'storefront',             color: '#544fc0' },
    { title: 'Pipeline Revenue',value: fmtCurrency(data?.deals?.totalRevenue), icon: 'account_balance_wallet', color: '#e8590c' },
  ];

  // Build funnel from deal stages
  const stageOrder = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won'];
  const stageColors = ['#3525cd', '#544fc0', '#3130c0', '#64748B', '#16A34A'];
  const stageBgs    = ['#eaedff', '#e2e7ff', '#E2E8F0', '#CBD5E1', '#DCFCE7'];
  const funnelStages = stageOrder.map((s, i) => ({
    label: s,
    count: data?.deals?.stages?.[s]?.count || 0,
    value: fmtCurrency(data?.deals?.stages?.[s]?.value || 0),
    color: stageColors[i],
    bg: stageBgs[i],
    indent: i * 2,
  }));

  // Activities
  const recentActivities = data?.activities?.recent || [];
  const activityIcons = { Call: 'call', Email: 'mail', Meeting: 'groups', Demo: 'slideshow', Note: 'sticky_note_2' };
  const activityColors = { Call: '#3525cd', Email: '#777587', Meeting: '#544fc0', Demo: '#e8590c', Note: '#16A34A' };

  // Lead sources donut
  const sources = data?.leadsBySource || {};
  const sourceEntries = Object.entries(sources).sort((a, b) => b[1] - a[1]);
  const totalLeads = sourceEntries.reduce((s, [, c]) => s + c, 0) || 1;
  const sourceColors = ['#4f46e5', '#8f8bff', '#3525cd', '#d2d9f4', '#c7c4d8', '#94A3B8', '#64748B'];

  // Build conic gradient
  let cumPct = 0;
  const gradientParts = sourceEntries.map(([, count], i) => {
    const pct = (count / totalLeads) * 100;
    const from = cumPct;
    cumPct += pct;
    return `${sourceColors[i % sourceColors.length]} ${from}% ${cumPct}%`;
  });
  const conicGradient = gradientParts.length > 0
    ? `conic-gradient(${gradientParts.join(', ')})`
    : 'conic-gradient(#E2E8F0 0% 100%)';

  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC] text-[#131b2e] flex min-h-screen" style={{ fontFamily: 'Inter' }}>
        <Sidebar />
        <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
          <Topbar title={user?.role || 'Dashboard'} />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[48px]">progress_activity</span>
              <span className="text-[#464555] text-sm">Loading dashboard…</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] text-[#131b2e] flex min-h-screen" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        <Topbar title={user?.role || 'Dashboard'} />

        <div className="p-8 flex-1 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>
                Good morning, {firstName} 👋
              </h2>
              <p className="text-[#464555] mt-1" style={{ fontSize: '16px' }}>
                Here's what's happening with your sales today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-[#D1D5DB] rounded-lg px-3 py-2 shadow-sm text-sm text-[#131b2e] cursor-pointer hover:border-[#3525cd] transition-colors">
                <span className="material-symbols-outlined text-[18px] text-[#464555]">calendar_today</span>
                <span>This Week</span>
                <span className="material-symbols-outlined text-[18px] text-[#464555]">arrow_drop_down</span>
              </div>
              <button className="flex items-center gap-2 bg-white border border-[#D1D5DB] text-[#3525cd] rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#f2f3ff] transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiCards.map((card) => (
              <div key={card.title} className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:shadow-md transition-shadow relative overflow-hidden group"
                style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-[#464555] uppercase text-xs tracking-widest">{card.title}</h3>
                  <div className="p-1.5 bg-[#eaedff] rounded-lg text-[#3130c0]">
                    <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '30px' }}>{card.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Overview */}
            <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col"
              style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>
                  Revenue Overview
                </h3>
                <div className="flex bg-[#f2f3ff] rounded-lg p-1 border border-[#c7c4d8]">
                  {['7D', '30D', '90D'].map((p) => (
                    <button key={p}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${p === '30D' ? 'bg-white shadow-sm text-[#3525cd]' : 'text-[#464555] hover:text-[#3525cd]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 relative min-h-[250px] w-full mt-4 flex items-end">
                <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-xs text-[#464555] text-right pr-2">
                  <span>{fmtCurrency((data?.deals?.totalRevenue || 0))}</span><span>{fmtCurrency((data?.deals?.totalRevenue || 0) * 0.75)}</span><span>{fmtCurrency((data?.deals?.totalRevenue || 0) * 0.5)}</span><span>{fmtCurrency((data?.deals?.totalRevenue || 0) * 0.25)}</span><span>0</span>
                </div>
                <div className="absolute left-10 right-0 top-0 bottom-6 flex flex-col justify-between z-0">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-px" style={{ backgroundColor: '#F1F5F9' }} />
                  ))}
                </div>
                <div className="absolute left-10 right-0 top-0 bottom-6 z-10 pt-2">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 220">
                    <defs>
                      <linearGradient id="areaGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,200 L100,180 L200,150 L300,160 L400,120 L500,140 L600,90 L700,110 L800,60 L900,80 L1000,30 L1000,220 L0,220 Z"
                      fill="url(#areaGrad)" />
                    <path d="M0,200 L100,180 L200,150 L300,160 L400,120 L500,140 L600,90 L700,110 L800,60 L900,80 L1000,30"
                      fill="none" stroke="#4f46e5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                    {[[400, 120], [600, 90], [800, 60], [1000, 30]].map(([cx, cy]) => (
                      <circle key={cx} cx={cx} cy={cy} r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />
                    ))}
                  </svg>
                </div>
                <div className="absolute left-10 right-0 bottom-0 h-6 flex justify-between text-xs text-[#464555] pt-2 px-2">
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(w => <span key={w}>{w}</span>)}
                </div>
              </div>
            </div>

            {/* Sales Pipeline Funnel */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col"
              style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
              <h3 className="font-semibold text-[#131b2e] mb-6" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>
                Sales Pipeline
              </h3>
              <div className="flex-1 flex flex-col gap-3 justify-center">
                {funnelStages.map((s) => (
                  <div key={s.label}
                    className="relative flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-[#3525cd]/30 transition-colors"
                    style={{ backgroundColor: s.bg, marginLeft: `${s.indent * 4}px`, marginRight: `${s.indent * 4}px` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full" style={{ backgroundColor: s.color }}></div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: '#131b2e' }}>{s.label}</div>
                        <div className="text-xs" style={{ color: '#464555' }}>{s.count} deals</div>
                      </div>
                    </div>
                    <div className="font-medium text-sm" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Activities */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5"
              style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>
                  Recent Activities
                </h3>
                <a href="/activities" className="text-[#3525cd] text-xs font-semibold hover:underline">View All</a>
              </div>
              <div className="relative pl-8 border-l-2 border-[#E2E8F0] space-y-6 ml-2">
                {recentActivities.length === 0 && (
                  <p className="text-sm text-[#464555]">No recent activities.</p>
                )}
                {recentActivities.map((a, i) => (
                  <div key={a._id || i} className="relative">
                    <div className="absolute -left-[41px] top-0 bg-white p-1 rounded-full border-2"
                      style={{ borderColor: activityColors[a.type] || '#777587', color: activityColors[a.type] || '#777587' }}>
                      <span className="material-symbols-outlined text-[16px]">{activityIcons[a.type] || 'event'}</span>
                    </div>
                    <div className="flex flex-col ml-2">
                      <p className="text-sm text-[#131b2e]"><strong>{a.type}:</strong> {a.title}</p>
                      <span className="text-xs text-[#464555] mt-1">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Sources Donut */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col"
              style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
              <h3 className="font-semibold text-[#131b2e] mb-6" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>
                Lead Sources
              </h3>
              <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="relative w-48 h-48 rounded-full flex-shrink-0"
                  style={{ background: conicGradient }}>
                  <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '30px' }}>{totalLeads === 1 ? 0 : totalLeads}</span>
                    <span className="text-[#464555] text-xs font-semibold">Total Leads</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  {sourceEntries.map(([source, count], i) => (
                    <div key={source} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sourceColors[i % sourceColors.length] }}></div>
                        <span className="text-sm text-[#131b2e]">{source}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#464555]">{Math.round((count / totalLeads) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
