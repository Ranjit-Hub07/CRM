import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetCustomersQuery, useGetCustomerStatsQuery } from '../store/apiSlice';

const statusStyles = {
  Active:   { color: '#16A34A', bg: '#DCFCE7' },
  'At Risk': { color: '#e8590c', bg: '#FFF4E6' },
  Churned:  { color: '#ba1a1a', bg: '#ffdad6' },
};

const planColors = { Starter: '#777587', Professional: '#3525cd', Enterprise: '#4f46e5' };
const fmtCurrency = (n) => { if (!n) return '₹0'; if (n >= 1000000) return `₹${(n/1000000).toFixed(1)}M`; if (n >= 1000) return `₹${(n/1000).toFixed(0)}K`; return `₹${n}`; };

export default function Customers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data, isLoading } = useGetCustomersQuery({ page, limit: 10, search: search || undefined, status: statusFilter !== 'All' ? statusFilter : undefined });
  const { data: stats } = useGetCustomerStatsQuery();

  const customers = data?.customers || [];
  const totalPages = data?.pages || 1;

  const statCards = [
    { label: 'Total Customers',  value: stats?.total ?? '—',   icon: 'groups',        color: '#3525cd' },
    { label: 'Active',           value: stats?.active ?? '—',  icon: 'check_circle',  color: '#16A34A' },
    { label: 'At Risk',          value: stats?.atRisk ?? '—',  icon: 'warning',       color: '#e8590c' },
    { label: 'Total ARR',        value: fmtCurrency(stats?.totalArr), icon: 'payments', color: '#4f46e5' },
  ];

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex h-screen overflow-hidden" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Topbar title="Customers" />
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
            <div>
              <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Customers</h2>
              <p className="text-[#464555] text-sm">Track customer health, ARR, and engagement metrics.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon, color }) => (
                <div key={label} className="bg-white border border-[#c7c4d8] rounded-xl p-5 hover:-translate-y-0.5 transition-transform"
                  style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#464555] uppercase text-xs tracking-widest">{label}</h3>
                    <span className="material-symbols-outlined" style={{ color }}>{icon}</span>
                  </div>
                  <span className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '30px' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8]">search</span>
                <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c7c4d8] rounded-lg text-sm placeholder-[#464555] outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd]"
                  placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-white border border-[#c7c4d8] rounded-lg px-3 py-2 text-sm cursor-pointer">
                {['All', 'Active', 'At Risk', 'Churned'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Cards */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[36px]">progress_activity</span>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-20 text-[#464555]"><p>No customers found.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {customers.map(c => {
                  const ss = statusStyles[c.status] || statusStyles.Active;
                  return (
                    <div key={c._id} className="bg-white border border-[#c7c4d8] rounded-xl p-5 hover:shadow-md transition-shadow"
                      style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>{c.name}</h4>
                          <p className="text-xs text-[#464555]">{c.contactPerson} • {c.email}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="font-semibold" style={{ color: planColors[c.plan] }}>{c.plan}</span>
                        <span className="font-bold text-[#131b2e]">{fmtCurrency(c.arr)}/yr</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[#464555]">
                          <span>Health Score</span>
                          <span className="font-semibold">{c.health}%</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{
                            width: `${c.health}%`,
                            backgroundColor: c.health >= 70 ? '#16A34A' : c.health >= 40 ? '#e8590c' : '#ba1a1a',
                          }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#464555]">Page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#c7c4d8] text-[#3525cd] hover:bg-[#eaedff] disabled:opacity-40 transition-colors">Previous</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#c7c4d8] text-[#3525cd] hover:bg-[#eaedff] disabled:opacity-40 transition-colors">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
