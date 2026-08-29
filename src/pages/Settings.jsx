import { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetProfileQuery, useUpdateProfileMutation } from '../store/apiSlice';

const settingsSections = [
  { id: 'profile', icon: 'person', label: 'Profile' },
  { id: 'account', icon: 'manage_accounts', label: 'Account' },
  { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  { id: 'integrations', icon: 'extension', label: 'Integrations' },
  { id: 'security', icon: 'shield', label: 'Security & Privacy' },
  { id: 'billing', icon: 'payments', label: 'Billing' },
];

const integrations = [
  { name: 'Gmail', icon: 'mail', description: 'Sync emails and track replies automatically.', connected: true, color: '#dc2626' },
  { name: 'Google Calendar', icon: 'calendar_month', description: 'Sync meetings and schedule calls directly.', connected: true, color: '#0284c7' },
  { name: 'Slack', icon: 'forum', description: 'Get deal updates and alerts in Slack channels.', connected: false, color: '#7c3aed' },
  { name: 'Zoom', icon: 'video_call', description: 'One-click Zoom meetings from deal pages.', connected: false, color: '#2563eb' },
  { name: 'HubSpot', icon: 'hub', description: 'Import contacts and sync marketing data.', connected: false, color: '#d97706' },
  { name: 'Stripe', icon: 'credit_card', description: 'Track payments and subscription statuses.', connected: true, color: '#7c3aed' },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#3525cd]' : 'bg-[#c7c4d8]'}`}>
      <span className={`inline-block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
    </button>
  );
}

export default function Settings() {
  const user = useSelector((s) => s.auth.user);
  const { data: profile } = useGetProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const [activeSection, setActiveSection] = useState('profile');
  const [profileForm, setProfileForm] = useState(null);
  const [saved, setSaved] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    dealWon: true, leadAssigned: true, taskDue: true, emailReply: false, weeklyDigest: true, teamUpdates: false,
  });
  const [twoFA, setTwoFA] = useState(false);
  const [integrationStates, setIntegrationStates] = useState(
    Object.fromEntries(integrations.map(i => [i.name, i.connected]))
  );

  const toggleNotif = key => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleInteg = name => setIntegrationStates(prev => ({ ...prev, [name]: !prev[name] }));

  // Initialize form from profile
  const currentProfile = profileForm || profile || {};
  const initials = currentProfile.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSave = async () => {
    if (!profileForm) return;
    await updateProfile(profileForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Profile Settings</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#3525cd] text-white flex items-center justify-center font-bold text-xl">{initials}</div>
              <div>
                <p className="font-semibold text-[#131b2e]">{currentProfile.name || 'User'}</p>
                <p className="text-sm text-[#464555]">{currentProfile.email}</p>
                <p className="text-xs text-[#3525cd] font-semibold">{currentProfile.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Full Name</label>
                <input className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm focus:border-[#3525cd] outline-none"
                  value={(profileForm || profile)?.name || ''} onChange={e => setProfileForm(f => ({ ...(f || profile), name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Email</label>
                <input className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm bg-[#f2f3ff] cursor-not-allowed" value={currentProfile.email || ''} disabled />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Phone</label>
                <input className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm focus:border-[#3525cd] outline-none"
                  value={(profileForm || profile)?.phone || ''} onChange={e => setProfileForm(f => ({ ...(f || profile), phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Region</label>
                <input className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm focus:border-[#3525cd] outline-none"
                  value={(profileForm || profile)?.region || ''} onChange={e => setProfileForm(f => ({ ...(f || profile), region: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={saving || !profileForm}
                className="px-6 py-2 bg-[#3525cd] text-white rounded-lg text-sm font-semibold hover:bg-[#3323cc] transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : null}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              {saved && <span className="text-sm text-[#16A34A] font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check</span> Saved!</span>}
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Account Settings</h3>
            <div className="bg-[#faf8ff] border border-[#E2E8F0] rounded-xl p-5">
              <h4 className="font-semibold text-sm mb-3">Account Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#464555]">Account ID</span><span className="font-mono text-[#131b2e]">{currentProfile._id?.slice(-8) || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#464555]">Role</span><span className="font-semibold text-[#3525cd]">{currentProfile.role}</span></div>
                <div className="flex justify-between"><span className="text-[#464555]">Member Since</span><span>{currentProfile.createdAt ? new Date(currentProfile.createdAt).toLocaleDateString() : '—'}</span></div>
              </div>
            </div>
            <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl p-5">
              <h4 className="font-semibold text-sm text-[#ba1a1a] mb-2">Danger Zone</h4>
              <p className="text-sm text-[#464555] mb-3">Once you delete your account, there is no going back.</p>
              <button className="px-4 py-2 bg-[#ba1a1a] text-white rounded-lg text-xs font-semibold hover:bg-[#93000a] transition-colors">Delete Account</button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'dealWon', label: 'Deal Won', desc: 'Get notified when a deal is marked as won.' },
                { key: 'leadAssigned', label: 'Lead Assigned', desc: 'Receive alerts for new lead assignments.' },
                { key: 'taskDue', label: 'Task Due', desc: 'Reminders for upcoming tasks and deadlines.' },
                { key: 'emailReply', label: 'Email Replies', desc: 'Notifications for client email responses.' },
                { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of weekly sales performance.' },
                { key: 'teamUpdates', label: 'Team Updates', desc: 'News and updates from your team.' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white border border-[#E2E8F0] rounded-xl">
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-[#464555]">{desc}</p>
                  </div>
                  <Toggle checked={notifPrefs[key]} onChange={() => toggleNotif(key)} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map(integ => (
                <div key={integ.name} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4"
                  style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${integ.color}15` }}>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: integ.color }}>{integ.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{integ.name}</p>
                    <p className="text-xs text-[#464555] truncate">{integ.description}</p>
                  </div>
                  <Toggle checked={integrationStates[integ.name]} onChange={() => toggleInteg(integ.name)} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Security & Privacy</h3>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-5">
              <div>
                <h4 className="font-semibold text-sm mb-2">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm" placeholder="Current Password" type="password" />
                  <input className="rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm" placeholder="New Password" type="password" />
                </div>
                <button className="mt-3 px-4 py-2 bg-[#3525cd] text-white rounded-lg text-xs font-semibold hover:bg-[#3323cc]">Update Password</button>
              </div>
              <hr className="border-[#E2E8F0]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-[#464555]">Add an extra layer of security to your account.</p>
                </div>
                <Toggle checked={twoFA} onChange={setTwoFA} />
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Billing</h3>
            <div className="bg-gradient-to-br from-[#3525cd] to-[#4f46e5] rounded-xl p-6 text-white">
              <p className="text-sm opacity-80 mb-1">Current Plan</p>
              <h4 className="font-bold text-2xl mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Enterprise</h4>
              <p className="text-sm opacity-80">$299/month • Next billing: Sep 1, 2026</p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
              <h4 className="font-semibold text-sm mb-3">Payment Method</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#faf8ff] border border-[#E2E8F0]">
                <span className="material-symbols-outlined text-[#3525cd]">credit_card</span>
                <div>
                  <p className="text-sm font-semibold">•••• •••• •••• 4242</p>
                  <p className="text-xs text-[#464555]">Expires 12/2028</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex min-h-screen" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        <Topbar title="Settings" showNew={false} />
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[1000px] mx-auto space-y-6 pb-12">
            <div>
              <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Settings</h2>
              <p className="text-[#464555] text-sm">Manage your account preferences and configurations.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar Nav */}
              <nav className="lg:w-56 flex-shrink-0">
                <div className="bg-white border border-[#c7c4d8] rounded-xl p-2" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                  {settingsSections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeSection === s.id ? 'bg-[#eaedff] text-[#3525cd] font-semibold' : 'text-[#464555] hover:bg-[#f2f3ff]'}`}>
                      <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Content */}
              <div className="flex-1 bg-white border border-[#c7c4d8] rounded-xl p-6" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                {renderSection()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
