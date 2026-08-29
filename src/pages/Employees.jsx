import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetAllUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '../store/apiSlice';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const roleColors = { Admin: '#ba1a1a', Manager: '#e8590c', Executive: '#3525cd' };
const roleOptions = ['Executive', 'Manager', 'Admin'];

export default function Employees() {
  const currentUser = useSelector((state) => state.auth.user);
  const { data: users = [], isLoading } = useGetAllUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Executive', region: '', avatar: '' });

  // Prevent non-admin access
  if (currentUser?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role, region: user.region || '', avatar: user.avatar || '' });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'Executive', region: '', avatar: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      const dataToUpdate = { id: editingUser._id, ...formData };
      if (!dataToUpdate.password) delete dataToUpdate.password;
      await updateUser(dataToUpdate);
    } else {
      await createUser(formData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await deleteUser(id);
    }
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex h-screen overflow-hidden" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Topbar title="Employees" />

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Employees</h2>
                <p className="text-[#464555] text-sm">Manage system users and their roles.</p>
              </div>
              <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-[#3525cd] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#3323cc] transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Employee
              </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#c7c4d8] rounded-xl overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[36px]">progress_activity</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-20 text-[#464555]">
                  <p>No employees found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f2f3ff] text-[#464555] uppercase text-xs tracking-widest">
                        <th className="text-left px-4 py-3 font-semibold">Name</th>
                        <th className="text-left px-4 py-3 font-semibold">Contact</th>
                        <th className="text-left px-4 py-3 font-semibold">Role</th>
                        <th className="text-left px-4 py-3 font-semibold">Region</th>
                        <th className="text-right px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-t border-[#E2E8F0] hover:bg-[#f8f9ff] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {initials(u.name)}
                              </div>
                              <p className="font-semibold text-[#131b2e]">{u.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[#131b2e]">{u.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ color: roleColors[u.role], backgroundColor: `${roleColors[u.role]}15` }}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#464555]">{u.region || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleOpenModal(u)} className="p-1.5 rounded-lg text-[#3525cd] hover:bg-[#eaedff] transition-colors" title="Edit">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(u._id)} disabled={isDeleting} className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors disabled:opacity-50" title="Delete">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c7c4d8]" onClick={e => e.stopPropagation()} style={{ boxShadow: '0px 10px 40px rgba(15, 23, 42, 0.15)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {editingUser ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button onClick={handleCloseModal} className="text-[#777587] hover:text-[#131b2e]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-[#c7c4d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3525cd] text-sm" placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-[#c7c4d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3525cd] text-sm" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">
                  Password {editingUser && <span className="text-xs font-normal text-gray-400">(leave blank to keep current)</span>}
                </label>
                <input required={!editingUser} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-[#c7c4d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3525cd] text-sm" placeholder="••••••••" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#464555] mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-[#c7c4d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3525cd] text-sm bg-white">
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#464555] mb-1">Region</label>
                  <input type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full px-3 py-2 border border-[#c7c4d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3525cd] text-sm" placeholder="North America" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#e2e8f0]">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg border border-[#c7c4d8] text-sm font-semibold text-[#464555] hover:bg-[#f2f3ff] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating || isUpdating} className="px-4 py-2 rounded-lg bg-[#3525cd] text-white text-sm font-semibold hover:bg-[#3323cc] transition-colors disabled:opacity-50 flex items-center gap-2">
                  {(isCreating || isUpdating) && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                  {editingUser ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
