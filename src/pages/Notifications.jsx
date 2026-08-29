import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../store/apiSlice';

const typeIcons = { deal: 'handshake', lead: 'person_add', system: 'settings', activity: 'event', team: 'group' };
const typeColors = { deal: '#3525cd', lead: '#4f46e5', system: '#777587', activity: '#544fc0', team: '#16A34A' };

export default function Notifications() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [readFilter, setReadFilter] = useState(undefined);

  const { data, isLoading } = useGetNotificationsQuery({
    type: typeFilter !== 'All' ? typeFilter : undefined,
    read: readFilter,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread || 0;

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex h-screen overflow-hidden" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Topbar title="Notifications" />
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[900px] mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Notifications</h2>
                <p className="text-[#464555] text-sm">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
              </div>
              {unreadCount > 0 && (
                <button onClick={() => markAllRead()}
                  className="flex items-center gap-2 border border-[#c7c4d8] bg-white text-[#3525cd] rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#f2f3ff] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">done_all</span> Mark All Read
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {['All', 'deal', 'lead', 'activity', 'system', 'team'].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${typeFilter === t ? 'bg-[#3525cd] text-white' : 'bg-white border border-[#c7c4d8] text-[#464555] hover:bg-[#f2f3ff]'}`}>{t}</button>
              ))}
              <div className="w-px bg-[#c7c4d8] mx-1"></div>
              <button onClick={() => setReadFilter(readFilter === 'false' ? undefined : 'false')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${readFilter === 'false' ? 'bg-[#3525cd] text-white' : 'bg-white border border-[#c7c4d8] text-[#464555] hover:bg-[#f2f3ff]'}`}>
                Unread Only
              </button>
            </div>

            {/* Notification Feed */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[36px]">progress_activity</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20 text-[#464555]">
                <span className="material-symbols-outlined text-[48px] text-[#c7c4d8]">notifications_off</span>
                <p className="mt-2 text-sm">No notifications found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n._id}
                    className={`bg-white border rounded-xl p-4 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer ${n.read ? 'border-[#E2E8F0]' : 'border-[#3525cd]/30 bg-[#faf8ff]'}`}
                    style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}
                    onClick={() => !n.read && markRead(n._id)}>
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${typeColors[n.type]}15` }}>
                      <span className="material-symbols-outlined text-[20px]" style={{ color: typeColors[n.type] }}>{typeIcons[n.type] || 'notifications'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold text-sm ${n.read ? 'text-[#464555]' : 'text-[#131b2e]'}`}>{n.title}</h4>
                        {!n.read && <span className="w-2 h-2 bg-[#3525cd] rounded-full flex-shrink-0"></span>}
                      </div>
                      <p className="text-sm text-[#464555] mt-0.5">{n.body}</p>
                      <span className="text-xs text-[#777587] mt-1 block">{new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
