import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetLeadsQuery, useGetLeadStatsQuery, useCreateLeadMutation, useUpdateLeadMutation, useConvertLeadMutation, useGetAllUsersQuery } from '../store/apiSlice';

const priorityColors = { High: '#ba1a1a', Medium: '#3130c0', Low: '#777587' };
const statusStyles = {
  New:         { color: '#464555', bg: '#e2e7ff' },
  Contacted:   { color: '#544fc0', bg: '#e2dfff' },
  Qualified:   { color: '#3525cd', bg: '#eaedff' },
  Unqualified: { color: '#93000a', bg: '#ffdad6' },
};

const sourceOptions = ['All', 'Website Organic', 'Referral', 'Cold Call', 'Webinar Sign-up', 'LinkedIn', 'Trade Show', 'Partner'];
const statusOptions = ['All', 'New', 'Contacted', 'Qualified', 'Unqualified'];
const priorityOptions = ['All', 'Low', 'Medium', 'High'];

export default function Leads() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'All', priority: 'All', source: 'All' });
  const [showConvert, setShowConvert] = useState(null);

  const queryParams = { page, limit: 10, search: search || undefined, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== 'All')) };
  const { data, isLoading } = useGetLeadsQuery(queryParams);
  const { data: stats } = useGetLeadStatsQuery();
  const { data: users } = useGetAllUsersQuery();
  const [createLead] = useCreateLeadMutation();
  const [updateLead] = useUpdateLeadMutation();
  const [convertLead, { isLoading: converting }] = useConvertLeadMutation();

  const leads = data?.leads || [];
  const totalPages = data?.pages || 1;

  const statCards = [
    { label: 'Total Leads', value: stats?.total ?? '—', icon: 'group' },
    { label: 'New Leads',   value: stats?.new ?? '—',   icon: 'fiber_new' },
    { label: 'Qualified',   value: stats?.qualified ?? '—', icon: 'check_circle' },
    { label: 'Unqualified', value: stats?.unqualified ?? '—', icon: 'cancel' },
  ];

  const handleConvert = async () => {
    if (!showConvert) return;
    await convertLead({ id: showConvert._id, plan: 'Professional', dealValue: 75000 });
    setShowConvert(null);
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex h-screen overflow-hidden" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Topbar title="Leads" />

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Leads</h2>
                <p className="text-[#464555] text-sm">Manage and track your sales opportunities systematically.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 border border-[#c7c4d8] bg-white text-[#3525cd] rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#f2f3ff] transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">download</span> Import
                </button>
                <button className="flex items-center gap-2 border border-[#c7c4d8] bg-white text-[#3525cd] rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#f2f3ff] transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">upload</span> Export
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statCards.map(({ label, value, icon }) => (
                <div key={label}
                  className="bg-white border border-[#c7c4d8] rounded-xl p-5 hover:-translate-y-0.5 transition-transform duration-200"
                  style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#464555] uppercase text-xs tracking-widest">{label}</h3>
                    <span className="material-symbols-outlined text-[#777587]">{icon}</span>
                  </div>
                  <span className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '30px' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-[#c7c4d8] rounded-xl p-2 flex flex-col md:flex-row gap-2"
              style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8]">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:ring-2 focus:ring-[#3525cd] rounded-lg text-sm text-[#131b2e] placeholder-[#464555] outline-none"
                  placeholder="Search leads by name, email, or company..."
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="hidden md:block w-px bg-[#c7c4d8]/50 my-2 mx-1"></div>
              <div className="flex overflow-x-auto gap-2 pb-1 md:pb-0">
                <select value={filters.status} onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
                  className="bg-[#f2f3ff] text-[#131b2e] px-3 py-2 rounded-lg text-xs font-semibold border border-[#c7c4d8] cursor-pointer">
                  {statusOptions.map(o => <option key={o} value={o}>Status: {o}</option>)}
                </select>
                <select value={filters.priority} onChange={(e) => { setFilters(f => ({ ...f, priority: e.target.value })); setPage(1); }}
                  className="bg-[#f2f3ff] text-[#131b2e] px-3 py-2 rounded-lg text-xs font-semibold border border-[#c7c4d8] cursor-pointer">
                  {priorityOptions.map(o => <option key={o} value={o}>Priority: {o}</option>)}
                </select>
                <select value={filters.source} onChange={(e) => { setFilters(f => ({ ...f, source: e.target.value })); setPage(1); }}
                  className="bg-[#f2f3ff] text-[#131b2e] px-3 py-2 rounded-lg text-xs font-semibold border border-[#c7c4d8] cursor-pointer">
                  {sourceOptions.map(o => <option key={o} value={o}>Source: {o}</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#c7c4d8] rounded-xl overflow-hidden"
              style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[36px]">progress_activity</span>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-20 text-[#464555]">
                  <span className="material-symbols-outlined text-[48px] text-[#c7c4d8]">search_off</span>
                  <p className="mt-2 text-sm">No leads found matching your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f2f3ff] text-[#464555] uppercase text-xs tracking-widest">
                        <th className="text-left px-4 py-3 font-semibold">Lead</th>
                        <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Contact</th>
                        <th className="text-left px-4 py-3 font-semibold">Source</th>
                        <th className="text-left px-4 py-3 font-semibold">Status</th>
                        <th className="text-left px-4 py-3 font-semibold">Priority</th>
                        <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Assigned To</th>
                        <th className="text-left px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => {
                        const ss = statusStyles[lead.status] || statusStyles.New;
                        return (
                          <tr key={lead._id} className="border-t border-[#E2E8F0] hover:bg-[#f8f9ff] transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  {initials(lead.name)}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#131b2e]">{lead.name}</p>
                                  <p className="text-xs text-[#464555]">{lead.title} • {lead.company}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <p className="text-[#131b2e]">{lead.email}</p>
                              <p className="text-xs text-[#464555]">{lead.phone}</p>
                            </td>
                            <td className="px-4 py-3 text-[#464555]">{lead.source}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ color: ss.color, backgroundColor: ss.bg }}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold" style={{ color: priorityColors[lead.priority] }}>
                                {lead.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="text-[#464555] text-sm">{lead.assignedTo?.name || '—'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {lead.status !== 'Qualified' && lead.status !== 'Unqualified' && (
                                  <button onClick={() => setShowConvert(lead)}
                                    className="p-1.5 rounded-lg text-[#3525cd] hover:bg-[#eaedff] transition-colors" title="Convert to Customer">
                                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                                  </button>
                                )}
                                <button className="p-1.5 rounded-lg text-[#464555] hover:bg-[#f2f3ff] transition-colors" title="View Details">
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
                  <span className="text-xs text-[#464555]">Page {page} of {totalPages} ({data?.total} leads)</span>
                  <div className="flex gap-1">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#c7c4d8] text-[#3525cd] hover:bg-[#eaedff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Previous
                    </button>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#c7c4d8] text-[#3525cd] hover:bg-[#eaedff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Convert Lead Modal */}
      {showConvert && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConvert(null)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c7c4d8]" onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0px 10px 40px rgba(15, 23, 42, 0.15)' }}>
            <h3 className="font-bold text-lg text-[#131b2e] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Convert Lead</h3>
            <p className="text-sm text-[#464555] mb-4">Convert <strong>{showConvert.name}</strong> from <strong>{showConvert.company}</strong> into a Customer and create an initial Deal.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConvert(null)}
                className="px-4 py-2 rounded-lg border border-[#c7c4d8] text-sm font-semibold text-[#464555] hover:bg-[#f2f3ff] transition-colors">
                Cancel
              </button>
              <button onClick={handleConvert} disabled={converting}
                className="px-4 py-2 rounded-lg bg-[#3525cd] text-white text-sm font-semibold hover:bg-[#3323cc] transition-colors disabled:opacity-50 flex items-center gap-2">
                {converting && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                Convert Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
