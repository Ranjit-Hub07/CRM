import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetReportsOverviewQuery } from '../store/apiSlice';

const fmtCurrency = (n) => { if (!n) return '₹0'; if (n >= 1000000) return `₹${(n/1000000).toFixed(1)}M`; if (n >= 1000) return `₹${(n/1000).toFixed(0)}K`; return `₹${n}`; };

export default function Reports() {
  const { data, isLoading } = useGetReportsOverviewQuery();

  const revenueByMonth = data?.revenueByMonth || [];
  const conversionRate = data?.conversionRate ?? 0;
  const topAccounts = data?.topAccounts || [];
  const reps = data?.repPerformance || [];

  // Bar chart max for scaling
  const maxRevenue = Math.max(...revenueByMonth.map(r => r.revenue), 1);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex h-screen overflow-hidden" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Topbar title="Reports" />
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
            <div>
              <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Reports</h2>
              <p className="text-[#464555] text-sm">Performance analytics and sales insights.</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[36px]">progress_activity</span>
              </div>
            ) : (
              <>
                {/* Top Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue by Month */}
                  <div className="lg:col-span-2 bg-white border border-[#c7c4d8] rounded-xl p-5" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                    <h3 className="font-semibold text-[#131b2e] mb-4" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>Revenue by Month</h3>
                    {revenueByMonth.length === 0 ? (
                      <p className="text-sm text-[#464555] py-8 text-center">No revenue data available yet.</p>
                    ) : (
                      <div className="flex items-end gap-3 h-[200px]">
                        {revenueByMonth.map(m => (
                          <div key={m._id} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-[#131b2e]">{fmtCurrency(m.revenue)}</span>
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-[#3525cd] to-[#4f46e5] transition-all hover:opacity-80"
                              style={{ height: `${(m.revenue / maxRevenue) * 160}px`, minHeight: '4px' }}></div>
                            <span className="text-xs text-[#464555]">{m._id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Conversion Rate */}
                  <div className="bg-white border border-[#c7c4d8] rounded-xl p-5 flex flex-col items-center justify-center" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                    <h3 className="font-semibold text-[#131b2e] mb-4" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>Conversion Rate</h3>
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#3525cd" strokeWidth="10"
                          strokeDasharray={`${conversionRate * 3.27} 327`}
                          strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-bold text-3xl text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>{conversionRate}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-[#464555] mt-3">Lead → Qualified</p>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Accounts */}
                  <div className="bg-white border border-[#c7c4d8] rounded-xl p-5" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                    <h3 className="font-semibold text-[#131b2e] mb-4" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>Top Accounts by ARR</h3>
                    <div className="space-y-3">
                      {topAccounts.map((a, i) => (
                        <div key={a._id} className="flex items-center justify-between p-3 rounded-lg bg-[#faf8ff] border border-[#E2E8F0]">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-[#3525cd] text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                            <div>
                              <p className="font-semibold text-sm text-[#131b2e]">{a.name}</p>
                              <p className="text-xs text-[#464555]">{a.plan}</p>
                            </div>
                          </div>
                          <span className="font-bold text-[#131b2e]">{fmtCurrency(a.arr)}</span>
                        </div>
                      ))}
                      {topAccounts.length === 0 && <p className="text-sm text-[#464555] text-center py-4">No data.</p>}
                    </div>
                  </div>

                  {/* Sales Rep Leaderboard */}
                  <div className="bg-white border border-[#c7c4d8] rounded-xl p-5" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                    <h3 className="font-semibold text-[#131b2e] mb-4" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>Sales Rep Leaderboard</h3>
                    <div className="space-y-3">
                      {[...reps].sort((a, b) => b.wonRevenue - a.wonRevenue).map((r, i) => {
                        const initials = r.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '?';
                        return (
                          <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#faf8ff] border border-[#E2E8F0]">
                            <span className="w-7 h-7 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-xs font-bold">{initials}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-[#131b2e]">{r.name}</p>
                              <div className="flex gap-4 text-xs text-[#464555] mt-0.5">
                                <span>{r.wonDeals} won</span>
                                <span>{r.winRate}% win rate</span>
                              </div>
                            </div>
                            <span className="font-bold text-[#16A34A]">{fmtCurrency(r.wonRevenue)}</span>
                          </div>
                        );
                      })}
                      {reps.length === 0 && <p className="text-sm text-[#464555] text-center py-4">No data.</p>}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
