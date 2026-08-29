import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetActivitiesQuery, useGetActivityStatsQuery, useCreateActivityMutation, useToggleActivityStatusMutation } from '../store/apiSlice';

const typeIcons = { Call: 'call', Email: 'mail', Meeting: 'groups', Demo: 'slideshow', Note: 'sticky_note_2' };
const typeColors = { Call: '#3525cd', Email: '#777587', Meeting: '#544fc0', Demo: '#e8590c', Note: '#16A34A' };

export default function Activities() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ type: 'Call', title: '', notes: '', duration: 30 });

  const { data, isLoading } = useGetActivitiesQuery({ type: typeFilter !== 'All' ? typeFilter : undefined });
  const { data: stats } = useGetActivityStatsQuery();
  const [createActivity, { isLoading: creating }] = useCreateActivityMutation();
  const [toggleStatus] = useToggleActivityStatusMutation();

  const activities = data?.activities || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    await createActivity({ ...form, duration: Number(form.duration) });
    setForm({ type: 'Call', title: '', notes: '', duration: 30 });
    setShowNew(false);
  };

  const statCards = [
    { label: 'Total',     value: stats?.total ?? '—',     icon: 'event_note' },
    { label: 'Pending',   value: stats?.pending ?? '—',   icon: 'pending' },
    { label: 'Overdue',   value: stats?.overdue ?? '—',   icon: 'warning' },
    { label: 'Completed', value: stats?.completed ?? '—', icon: 'task_alt' },
  ];

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex h-screen overflow-hidden" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Topbar title="Activities" />
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Activities</h2>
                <p className="text-[#464555] text-sm">Track calls, emails, meetings, and demos.</p>
              </div>
              <button onClick={() => setShowNew(true)}
                className="flex items-center gap-2 bg-[#3525cd] text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#3323cc] transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span> Log Activity
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon }) => (
                <div key={label} className="bg-white border border-[#c7c4d8] rounded-xl p-4" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs text-[#464555] uppercase tracking-widest font-semibold">{label}</p>
                    <span className="material-symbols-outlined text-[#777587] text-[20px]">{icon}</span>
                  </div>
                  <p className="font-bold text-2xl text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {['All', 'Call', 'Email', 'Meeting', 'Demo', 'Note'].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${typeFilter === t ? 'bg-[#3525cd] text-white' : 'bg-white border border-[#c7c4d8] text-[#464555] hover:bg-[#f2f3ff]'}`}>{t}</button>
              ))}
            </div>

            {/* Timeline */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[36px]">progress_activity</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-20 text-[#464555]"><p>No activities found.</p></div>
            ) : (
              <div className="relative pl-8 border-l-2 border-[#E2E8F0] space-y-4">
                {activities.map(a => (
                  <div key={a._id} className="relative bg-white border border-[#c7c4d8] rounded-xl p-4 hover:shadow-md transition-shadow"
                    style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                    <div className="absolute -left-[49px] top-4 w-8 h-8 flex items-center justify-center bg-white rounded-full border-2" style={{ borderColor: typeColors[a.type] || '#777587' }}>
                      <span className="material-symbols-outlined text-[16px]" style={{ color: typeColors[a.type] }}>{typeIcons[a.type] || 'event'}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: typeColors[a.type], backgroundColor: `${typeColors[a.type]}15` }}>{a.type}</span>
                          {a.status === 'Completed' ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-[#16A34A] bg-[#DCFCE7]">Completed</span>
                          ) : new Date(a.date) < new Date() ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-[#dc2626] bg-[#fef2f2]">Overdue</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-[#e8590c] bg-[#FFF4E6]">Pending</span>
                          )}
                        </div>
                        <h4 className="font-semibold text-[#131b2e]">{a.title}</h4>
                        {a.notes && <p className="text-sm text-[#464555] mt-1">{a.notes}</p>}
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#464555]">
                          <span>{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {a.duration > 0 && <span>{a.duration} min</span>}
                          {a.createdBy?.name && <span>by {a.createdBy.name}</span>}
                        </div>
                      </div>
                      <button onClick={() => toggleStatus(a._id)}
                        className="p-1.5 rounded-lg hover:bg-[#f2f3ff] transition-colors" title="Toggle status">
                        <span className="material-symbols-outlined text-[18px]">{a.status === 'Completed' ? 'undo' : 'check_circle'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Log Activity Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <form className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c7c4d8]" onClick={e => e.stopPropagation()} onSubmit={handleCreate}
            style={{ boxShadow: '0px 10px 40px rgba(15, 23, 42, 0.15)' }}>
            <h3 className="font-bold text-lg text-[#131b2e] mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Log Activity</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm">
                  {['Call', 'Email', 'Meeting', 'Demo', 'Note'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Title</label>
                <input className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm focus:border-[#3525cd] outline-none"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Notes</label>
                <textarea className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm focus:border-[#3525cd] outline-none resize-none" rows={3}
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Duration (min)</label>
                <input type="number" className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm focus:border-[#3525cd] outline-none"
                  value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg border border-[#c7c4d8] text-sm font-semibold text-[#464555]">Cancel</button>
              <button type="submit" disabled={creating} className="px-4 py-2 rounded-lg bg-[#3525cd] text-white text-sm font-semibold hover:bg-[#3323cc] disabled:opacity-50">
                {creating ? 'Saving…' : 'Log Activity'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
