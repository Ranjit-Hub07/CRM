import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetTeamMembersQuery } from '../store/apiSlice';

const fmtCurrency = (n) => { if (!n) return '₹0'; if (n >= 1000000) return `₹${(n/1000000).toFixed(1)}M`; if (n >= 1000) return `₹${(n/1000).toFixed(0)}K`; return `₹${n}`; };
const roleColors = { Admin: '#ba1a1a', Manager: '#e8590c', Executive: '#3525cd' };

export default function Team() {
  const [viewMode, setViewMode] = useState('grid');
  const { data: members, isLoading } = useGetTeamMembersQuery();

  const team = members || [];

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex h-screen overflow-hidden" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Topbar title="Team" />
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Team</h2>
                <p className="text-[#464555] text-sm">{team.length} team member{team.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-[#c7c4d8] rounded-lg p-1">
                <button onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#3525cd] text-white' : 'text-[#464555] hover:bg-[#f2f3ff]'}`}>
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[#3525cd] text-white' : 'text-[#464555] hover:bg-[#f2f3ff]'}`}>
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[36px]">progress_activity</span>
              </div>
            ) : team.length === 0 ? (
              <div className="text-center py-20 text-[#464555]"><p>No team members found.</p></div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {team.map(m => {
                  const initials = m.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '?';
                  const quota = 200000;
                  const progress = Math.min(Math.round((m.wonRevenue / quota) * 100), 100);
                  return (
                    <div key={m._id} className="bg-white border border-[#c7c4d8] rounded-xl p-5 hover:shadow-md transition-shadow"
                      style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-sm">{initials}</div>
                        <div>
                          <h4 className="font-semibold text-[#131b2e]">{m.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: roleColors[m.role], backgroundColor: `${roleColors[m.role]}15` }}>{m.role}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div className="bg-[#faf8ff] rounded-lg p-2">
                          <p className="font-bold text-[#131b2e]">{m.leads}</p>
                          <p className="text-xs text-[#464555]">Leads</p>
                        </div>
                        <div className="bg-[#faf8ff] rounded-lg p-2">
                          <p className="font-bold text-[#131b2e]">{m.deals}</p>
                          <p className="text-xs text-[#464555]">Deals</p>
                        </div>
                        <div className="bg-[#faf8ff] rounded-lg p-2">
                          <p className="font-bold text-[#131b2e]">{m.activities}</p>
                          <p className="text-xs text-[#464555]">Activities</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#464555]">Quota ({fmtCurrency(quota)})</span>
                          <span className="font-semibold text-[#131b2e]">{progress}%</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{
                            width: `${progress}%`,
                            backgroundColor: progress >= 80 ? '#16A34A' : progress >= 50 ? '#e8590c' : '#ba1a1a',
                          }}></div>
                        </div>
                        <p className="text-xs text-right text-[#464555]">{fmtCurrency(m.wonRevenue)} won</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#c7c4d8] rounded-xl overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f2f3ff] text-[#464555] uppercase text-xs tracking-widest">
                      <th className="text-left px-4 py-3 font-semibold">Name</th>
                      <th className="text-left px-4 py-3 font-semibold">Role</th>
                      <th className="text-left px-4 py-3 font-semibold">Region</th>
                      <th className="text-center px-4 py-3 font-semibold">Leads</th>
                      <th className="text-center px-4 py-3 font-semibold">Deals</th>
                      <th className="text-right px-4 py-3 font-semibold">Won Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map(m => {
                      const initials = m.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '?';
                      return (
                        <tr key={m._id} className="border-t border-[#E2E8F0] hover:bg-[#f8f9ff] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs">{initials}</div>
                              <span className="font-semibold">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="text-xs font-semibold" style={{ color: roleColors[m.role] }}>{m.role}</span></td>
                          <td className="px-4 py-3 text-[#464555]">{m.region || '—'}</td>
                          <td className="px-4 py-3 text-center">{m.leads}</td>
                          <td className="px-4 py-3 text-center">{m.deals}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[#16A34A]">{fmtCurrency(m.wonRevenue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
