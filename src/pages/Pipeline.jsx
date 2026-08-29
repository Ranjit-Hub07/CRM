import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useGetDealsQuery, useUpdateDealStageMutation } from '../store/apiSlice';

const stages = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const stageColors = {
  Qualification: '#3525cd', Discovery: '#544fc0', Proposal: '#3130c0',
  Negotiation: '#64748B', Won: '#16A34A', Lost: '#ba1a1a',
};
const fmtCurrency = (n) => { if (!n) return '₹0'; if (n >= 1000000) return `₹${(n/1000000).toFixed(1)}M`; if (n >= 1000) return `₹${(n/1000).toFixed(0)}K`; return `₹${n}`; };

export default function Pipeline() {
  const { data, isLoading } = useGetDealsQuery({ limit: 100 });
  const [updateStage] = useUpdateDealStageMutation();

  const deals = data?.deals || [];
  const dealsByStage = {};
  stages.forEach(s => { dealsByStage[s] = deals.filter(d => d.stage === s); });

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    const probMap = { Qualification: 20, Discovery: 40, Proposal: 60, Negotiation: 80, Won: 100, Lost: 0 };
    await updateStage({ id: dealId, stage: newStage, probability: probMap[newStage] });
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] flex h-screen overflow-hidden" style={{ fontFamily: 'Inter' }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen overflow-hidden">
        <Topbar title="Pipeline" />
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
            <div>
              <h2 className="font-bold text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '36px' }}>Pipeline</h2>
              <p className="text-[#464555] text-sm">Drag and drop deals between stages to update the pipeline.</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-[#3525cd] text-[36px]">progress_activity</span>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {stages.map(stage => {
                  const stageDeals = dealsByStage[stage];
                  const totalValue = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
                  return (
                    <div key={stage}
                      className="min-w-[280px] flex-1 bg-white border border-[#c7c4d8] rounded-xl flex flex-col max-h-[calc(100vh-220px)]"
                      style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handleDrop(e, stage)}>
                      <div className="p-4 border-b border-[#E2E8F0] flex-shrink-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stageColors[stage] }}></div>
                            <h3 className="font-semibold text-sm">{stage}</h3>
                          </div>
                          <span className="bg-[#f2f3ff] text-[#3525cd] text-xs font-bold px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                        </div>
                        <p className="text-xs text-[#464555]">{fmtCurrency(totalValue)}</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {stageDeals.map(deal => (
                          <div key={deal._id}
                            draggable
                            onDragStart={e => e.dataTransfer.setData('text/plain', deal._id)}
                            className="bg-[#faf8ff] border border-[#E2E8F0] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#3525cd] transition-colors">
                            <h4 className="font-semibold text-sm text-[#131b2e] mb-1">{deal.name}</h4>
                            <p className="font-bold text-lg text-[#131b2e]" style={{ fontFamily: 'Plus Jakarta Sans' }}>{fmtCurrency(deal.value)}</p>
                            <div className="flex justify-between items-center mt-2 text-xs text-[#464555]">
                              <span>{deal.ownerId?.name || '—'}</span>
                              <span>{deal.probability}%</span>
                            </div>
                            <div className="w-full bg-[#E2E8F0] rounded-full h-1 mt-1">
                              <div className="h-1 rounded-full" style={{ width: `${deal.probability}%`, backgroundColor: stageColors[stage] }}></div>
                            </div>
                          </div>
                        ))}
                        {stageDeals.length === 0 && (
                          <div className="text-center py-8 text-[#c7c4d8] text-xs">Drop deals here</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
