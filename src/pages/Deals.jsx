import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetDealsQuery, useGetDealStatsQuery, useCreateDealMutation } from '../store/apiSlice';

const stageColors = {
  Qualification: '#3525cd', Discovery: '#544fc0', Proposal: '#3130c0',
  Negotiation: '#64748B', Won: '#16A34A', Lost: '#ba1a1a',
};

const fmtCurrency = (n) => { if (!n) return '₹0'; if (n >= 1000000) return `₹${(n/1000000).toFixed(1)}M`; if (n >= 1000) return `₹${(n/1000).toFixed(0)}K`; return `₹${n}`; };

export default function Deals() {
  const [stage, setStage] = useState('All');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newDeal, setNewDeal] = useState({ name: '', value: '' });

  const { data, isLoading } = useGetDealsQuery({ stage: stage !== 'All' ? stage : undefined, search: search || undefined });
  const { data: stats } = useGetDealStatsQuery();
  const [createDeal, { isLoading: creating }] = useCreateDealMutation();

  const deals = data?.deals || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDeal.name || !newDeal.value) return;
    await createDeal({ name: newDeal.name, value: Number(newDeal.value), stage: 'Qualification', probability: 20 });
    setNewDeal({ name: '', value: '' });
    setShowNew(false);
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex h-screen overflow-hidden" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Topbar title="Deals" />
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Deals</h2>
                <p className="text-[#464555] text-sm">Track and manage your deal pipeline.</p>
              </div>
              <button onClick={() => setShowNew(true)}
                className="flex items-center gap-2 bg-[#3525cd] text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#3323cc] transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span> New Deal
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#c7c4d8] rounded-xl p-4" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                <p className="text-xs text-[#464555] uppercase tracking-widest font-semibold">Total Deals</p>
                <p className="font-bold text-2xl text-[#131b2e] mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{stats?.totalDeals ?? '—'}</p>
              </div>
              <div className="bg-white border border-[#c7c4d8] rounded-xl p-4" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                <p className="text-xs text-[#464555] uppercase tracking-widest font-semibold">Total Value</p>
                <p className="font-bold text-2xl text-[#131b2e] mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{fmtCurrency(stats?.totalValue)}</p>
              </div>
              <div className="bg-white border border-[#c7c4d8] rounded-xl p-4" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                <p className="text-xs text-[#464555] uppercase tracking-widest font-semibold">Won Deals</p>
                <p className="font-bold text-2xl text-[#16A34A] mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{stats?.stages?.Won?.count ?? 0}</p>
              </div>
              <div className="bg-white border border-[#c7c4d8] rounded-xl p-4" style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                <p className="text-xs text-[#464555] uppercase tracking-widest font-semibold">Won Revenue</p>
                <p className="font-bold text-2xl text-[#16A34A] mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{fmtCurrency(stats?.stages?.Won?.value)}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8]">search</span>
                <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c7c4d8] rounded-lg text-sm placeholder-[#464555] outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd]"
                  placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-1 flex-wrap">
                {['All', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'].map(s => (
                  <button key={s} onClick={() => setStage(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${stage === s ? 'bg-[#3525cd] text-white' : 'bg-white border border-[#c7c4d8] text-[#464555] hover:bg-[#f2f3ff]'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Deal Cards */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[36px]">progress_activity</span>
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-20 text-[#464555]"><p>No deals found.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {deals.map(deal => (
                  <div key={deal._id} className="bg-white border border-[#c7c4d8] rounded-xl p-5 hover:shadow-md transition-shadow"
                    style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>{deal.name}</h4>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ color: stageColors[deal.stage], backgroundColor: `${stageColors[deal.stage]}20` }}>{deal.stage}</span>
                    </div>
                    <p className="text-2xl font-bold text-[#131b2e] mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>{fmtCurrency(deal.value)}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#464555]">Probability</span>
                        <span className="font-semibold">{deal.probability}%</span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${deal.probability}%`, backgroundColor: stageColors[deal.stage] }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-[#464555]">
                        <span>Owner: {deal.ownerId?.name || '—'}</span>
                        <span>{deal.expectedClosingDate ? new Date(deal.expectedClosingDate).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Deal Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <form className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c7c4d8]" onClick={e => e.stopPropagation()} onSubmit={handleCreate}
            style={{ boxShadow: '0px 10px 40px rgba(15, 23, 42, 0.15)' }}>
            <h3 className="font-bold text-lg text-[#131b2e] mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Create New Deal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Deal Name</label>
                <input className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none"
                  value={newDeal.name} onChange={e => setNewDeal(d => ({ ...d, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#464555] mb-1">Value ($)</label>
                <input type="number" className="w-full rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none"
                  value={newDeal.value} onChange={e => setNewDeal(d => ({ ...d, value: e.target.value }))} required />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg border border-[#c7c4d8] text-sm font-semibold text-[#464555]">Cancel</button>
              <button type="submit" disabled={creating} className="px-4 py-2 rounded-lg bg-[#3525cd] text-white text-sm font-semibold hover:bg-[#3323cc] disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Deal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
