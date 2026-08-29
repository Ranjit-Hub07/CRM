import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/leads', icon: 'person_search', label: 'Leads' },
  { path: '/customers', icon: 'groups', label: 'Customers' },
  { path: '/deals', icon: 'handshake', label: 'Deals' },
  { path: '/activities', icon: 'event_note', label: 'Activities' },
  { path: '/pipeline', icon: 'account_tree', label: 'Pipeline' },
  { path: '/reports', icon: 'bar_chart', label: 'Reports' },
  { path: '/notifications', icon: 'notifications', label: 'Notifications' },
  { path: '/team', icon: 'group_add', label: 'Team' },
  { path: '/employees', icon: 'manage_accounts', label: 'Employees' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="hidden md:flex flex-col h-screen left-0 w-[260px] bg-[#faf8ff] border-r border-[#c7c4d8] z-40 fixed">
      {/* Logo */}
      <div className="px-5 py-4 flex-shrink-0 flex items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#3525cd] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            SP
          </div>
          <div>
            <h1 className="font-bold text-[#3525cd]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '18px', lineHeight: '22px' }}>
              SalesForce Pro
            </h1>
            <p className="text-[#777587] uppercase" style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.08em' }}>
              Enterprise CRM
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Action */}
      <div className="px-4 pb-2 flex-shrink-0">
        <Link to="/deals"
          className="flex items-center justify-center gap-2 bg-[#3525cd] text-white px-4 py-2.5 rounded-lg font-semibold text-xs hover:bg-[#3323cc] transition-colors active:scale-95 duration-150">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Deal
        </Link>
      </div>

      {/* Scrollable Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
        <nav className="flex flex-col gap-0.5">
          {navItems.filter(item => item.path !== '/employees' || user?.role === 'Admin').map(({ path, icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  isActive
                    ? 'text-[#3525cd] font-semibold bg-[#eaedff]'
                    : 'text-[#464555] hover:text-[#3525cd] hover:bg-[#f2f3ff]'
                }`}
              >
                <span
                  className="material-symbols-outlined flex-shrink-0"
                  style={{
                    fontSize: '20px',
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    color: isActive ? '#3525cd' : undefined,
                  }}
                >
                  {icon}
                </span>
                <span style={{ fontFamily: 'Inter', fontSize: '14px' }}>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-5 bg-[#3525cd] rounded-full flex-shrink-0"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer — always at bottom */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-[#e2e8f0]">
        <a
          href="https://support.nexuscrm.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#464555] hover:text-[#3525cd] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '20px' }}>help</span>
          <span style={{ fontFamily: 'Inter', fontSize: '14px' }}>Help Center</span>
        </a>

        {/* User Profile Row */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg hover:bg-[#f2f3ff] transition-colors group">
          <div className="w-8 h-8 rounded-full bg-[#3525cd] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#131b2e] truncate" style={{ fontFamily: 'Inter', fontSize: '13px' }}>{user?.name || 'Guest'}</p>
            <p className="text-[#777587] truncate" style={{ fontFamily: 'Inter', fontSize: '11px' }}>{user?.role || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1 rounded-md text-[#777587] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors opacity-0 group-hover:opacity-100"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
