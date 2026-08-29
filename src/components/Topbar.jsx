import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetNotificationsQuery } from '../store/apiSlice';

export default function Topbar({ title = 'Sales Manager', showNew = true }) {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const { data: notifData } = useGetNotificationsQuery({}, { skip: !user });

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const navLinks = [
    { path: '/leads', label: 'Leads' },
    { path: '/deals', label: 'Deals' },
    { path: '/pipeline', label: 'Pipeline' },
  ];

  return (
    <header className="bg-[#faf8ff] border-b border-[#c7c4d8] shadow-sm flex justify-between items-center w-full px-8 sticky top-0 z-30 h-16">
      <div className="flex items-center gap-6">
        {/* Mobile menu placeholder */}
        <button className="md:hidden text-[#464555] p-2 rounded hover:bg-[#eaedff]">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div
          className="font-semibold text-[#131b2e] hidden md:block"
          style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}
        >
          {title}
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:flex items-center bg-[#f2f3ff] rounded-lg px-3 py-1.5 border border-[#c7c4d8] focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20 transition-all">
        <span className="material-symbols-outlined text-[#777587] mr-2" style={{ fontSize: '18px' }}>search</span>
        <input
          className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm text-[#131b2e] placeholder-[#777587]"
          placeholder="Search leads, deals, contacts..."
          type="text"
        />
        <span className="text-xs text-[#c7c4d8] font-medium hidden lg:block">⌘K</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick nav links */}
        <nav className="hidden lg:flex items-center gap-5 mr-2">
          {navLinks.map(({ path, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`text-sm font-medium pb-0.5 border-b-2 transition-all ${
                  isActive
                    ? 'text-[#3525cd] border-[#3525cd]'
                    : 'text-[#464555] border-transparent hover:text-[#3525cd] hover:border-[#c7c4d8]'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* + New Deal button */}
        {showNew && (
          <Link
            to="/deals"
            className="hidden md:flex items-center gap-1.5 bg-[#3525cd] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#3323cc] active:scale-95 transition-all duration-150"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            New
          </Link>
        )}

        {/* Notifications bell → /notifications */}
        <Link
          to="/notifications"
          className="p-2 rounded-full text-[#464555] hover:bg-[#eaedff] hover:text-[#3525cd] transition-colors relative"
          title="Notifications"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
          {notifData?.unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-[#ba1a1a] rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center px-1">
              {notifData.unread > 9 ? '9+' : notifData.unread}
            </span>
          )}
        </Link>

        {/* Profile avatar → /settings */}
        <Link
          to="/settings"
          title="Account Settings"
          className="w-8 h-8 rounded-full bg-[#3525cd] flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-[#3525cd] hover:ring-offset-1 transition-all duration-150"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
