import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ERPLayout from '../components/ERPLayout';
import { getFromStorage, saveToStorage, RFQ, Quotation, PurchaseOrder, ActivityLog } from '../data/mockData';
import { ChevronDown, ArrowRight, Check, Award, Flame, Zap, ShieldAlert, TrendingDown } from 'lucide-react';

export default function QuotationComparePage() {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRFQId, setSelectedRFQId] = useState('');
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Load RFQs on mount
  useEffect(() => {
    const list = getFromStorage<RFQ>('rfqs');
    setRfqs(list);
    if (list.length > 0) {
      setSelectedRFQId(list[0].id);
      setSelectedRFQ(list[0]);
    }
  }, []);

  // Filter quotes matching the active RFQ
  useEffect(() => {
    if (selectedRFQId) {
      const allQuotes = getFromStorage<Quotation>('quotations');
      const filtered = allQuotes.filter(q => q.rfqId === selectedRFQId);
      setQuotes(filtered);
    }
  }, [selectedRFQId]);

  const handleRFQChange = (id: string) => {
    setSelectedRFQId(id);
    const matched = rfqs.find(r => r.id === id) || null;
    setSelectedRFQ(matched);
  };

  const parseValue = (valStr: any): number => {
    if (typeof valStr === 'number') return valStr;
    const cleaned = (valStr || '').toString().replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Dynamic ranking find lowest price
  const getCheapestQuote = () => {
    if (quotes.length === 0) return null;
    return quotes.reduce((cheapest, current) => {
      const cheapestVal = parseValue(cheapest.total);
      const currentVal = parseValue(current.total);
      return currentVal < cheapestVal ? current : cheapest;
    }, quotes[0]);
  };

  const cheapest = getCheapestQuote();

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // "Approve & Convert to PO" writes directly to 'pos' & updates RFQ to 'Closed'
  const handleApproveConversion = (selectedQuote: Quotation) => {
    const currentPOs = getFromStorage<PurchaseOrder>('pos');
    const newPOId = `VB-PO-2026-0${currentPOs.length + 1}`;

    const newPO: PurchaseOrder = {
      id: newPOId,
      orderDate: '06/06/2026 · 05:00 PM',
      deliveryDate: `20/06/2026 · 06:00 PM`,
      status: 'Pending Approval',
      total: "₹" + selectedQuote.total.toLocaleString('en-IN') + ".00",
      vendorName: selectedQuote.vendorName,
      department: 'Corporate Procurement Office',
      paymentTerms: selectedQuote.paymentTerms
    };

    saveToStorage('pos', [newPO, ...currentPOs]);

    // Also close the RFQ
    const allRfqs = getFromStorage<RFQ>('rfqs');
    const updatedRfqs = allRfqs.map(r => r.id === selectedRFQId ? { ...r, status: 'Closed' as const } : r);
    saveToStorage('rfqs', updatedRfqs);

    // Update quote status
    const allQuotes = getFromStorage<Quotation>('quotations');
    const updatedQuotes = allQuotes.map(q => q.id === selectedQuote.id ? { ...q, status: 'Accepted' as const } : q);
    saveToStorage('quotations', updatedQuotes);

    // Save activity audit log
    const logs = getFromStorage<ActivityLog>('activityLogs');
    saveToStorage('activityLogs', [{
      id: Date.now(),
      action: 'PO generated',
      timestamp: '06 Jun 2026 · 05:00 PM',
      user: 'Denish V. (Procurement Officer)',
      details: `Awarded bid ${selectedQuote.id} to ${selectedQuote.vendorName}. Generated Purchase Order ${newPOId} for ${selectedQuote.total}`,
      type: 'po',
      color: 'indigo',
      icon: 'ShoppingBag'
    }, ...logs]);

    triggerToast(`Approved ${selectedQuote.vendorName}! Convertible PO ${newPOId} created!`);
    
    // Refresh states
    setQuotes(quotes.map(q => q.id === selectedQuote.id ? { ...q, status: 'Approved' } : q));
    if (selectedRFQ) {
      setSelectedRFQ({ ...selectedRFQ, status: 'Closed' });
    }
  };

  return (
    <ERPLayout title="Quotation Comparison" subtitle="Audit incoming submissions and award commercial contracts to optimal bidders">
      
      {/* Toast notifications */}
      {toast && (
        <div id="toast-success" className="fixed bottom-5 right-5 z-50 bg-[#0F172A] border border-slate-700 font-sans shadow-2xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center font-bold text-xs shrink-0">✓</div>
          <p className="text-xs font-bold leading-none">{toast}</p>
        </div>
      )}

      {/* Selector card */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-[#E2E8F0] transition-colors duration-200 select-none">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8]">Audit quotes comparison space</h4>
          <p className="text-xs text-[#64748B] mt-0.5 font-sans">Pick from open tender bidding cycles to audit supplier commercial bid columns.</p>
        </div>
        <div>
          <select
            className="bg-white border border-[#E2E8F0] text-sm text-[#0F172A] font-bold rounded-lg py-2 px-3 outline-none"
            value={selectedRFQId}
            onChange={(e) => handleRFQChange(e.target.value)}
          >
            {rfqs.map(r => (
              <option key={r.id} value={r.id}>{r.id} - {r.title} ({r.status})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedRFQ && quotes.length > 0 ? (
        <div className="space-y-8 select-none">
          
          {/* Comparison table matrix block */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl shadow-sm hover:border-[#E2E8F0] transition-all overflow-hidden p-6 space-y-4">
            <div className="border-b border-[#F1F5F9] pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] uppercase tracking-tight">Bid Proposals matrix representation</h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-sans">Side-by-side analysis of incoming items pricing from bidding entities.</p>
              </div>
              <span className="text-[11px] font-bold text-[#6366F1] uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                Bids Count: {quotes.length}
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] font-bold text-[10px] uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Line specification Rows</th>
                    
                    {/* Render active bidding columns */}
                    {quotes.map((q) => {
                      const isCheapest = cheapest?.id === q.id;
                      return (
                        <th key={q.id} className={`py-3 px-4 text-center min-w-[150px] ${isCheapest ? 'bg-emerald-50/50 border-x border-[#A7F3D0]' : ''}`}>
                          <p className="font-extrabold text-[#0F172A] text-xs pr-1">{q.vendorName}</p>
                          <span className={`text-[9px] font-mono leading-none font-bold mt-1 inline-block ${isCheapest ? 'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded' : 'text-slate-400 bg-slate-100 px-2 py-0.5 rounded'}`}>
                            {isCheapest ? '🥇 Best Tender Bid' : `Quote: ${q.id}`}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  
                  {/* Item Rows */}
                  {selectedRFQ.items.map((it, itemIdx) => (
                    <tr key={itemIdx} className="hover:bg-slate-50/40">
                      
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#0F172A]">{it.description}</p>
                        <span className="text-[10px] text-[#94A3B8] font-semibold block mt-0.5">Required Quantity: {it.qty} {it.unit}</span>
                      </td>

                      {/* Display each vendor's price for this row */}
                      {quotes.map((q) => {
                        // find matching description price
                        const matchedItem = q.items.find(up => up.description === it.description) || q.items[itemIdx];
                        const quotePrice = matchedItem ? matchedItem.unitPrice : it.estPrice * 0.92;
                        const rowTotal = quotePrice * it.qty;

                        // Check if this row's price is the lowest across all quotes
                        const isCheapestCell = quotes.every(otherQuote => {
                          const otherMatched = otherQuote.items.find(up => up.description === it.description) || otherQuote.items[itemIdx];
                          const otherPrice = otherMatched ? otherMatched.unitPrice : Number.MAX_VALUE;
                          return quotePrice <= otherPrice;
                        });

                        return (
                          <td
                            key={q.id}
                            className={`py-3.5 px-4 text-center border-x border-[#F1F5F9] font-mono ${
                              isCheapestCell ? 'bg-[#ECFDF5] border-l-[#A7F3D0] border-r-[#A7F3D0] text-emerald-800' : 'text-[#475569]'
                            }`}
                          >
                            <p className="font-extrabold text-xs">₹{quotePrice.toLocaleString('en-IN')}</p>
                            <span className="text-[9.5px] font-semibold text-slate-400 block mt-0.5">Sum: ₹{rowTotal.toLocaleString('en-IN')}</span>
                            {isCheapestCell && (
                              <span className="inline-block mt-1 font-sans text-[8.5px] font-bold bg-[#A7F3D0] text-[#065F46] px-1 rounded uppercase tracking-wider">
                                L1 / Lowest
                              </span>
                            )}
                          </td>
                        );
                      })}

                    </tr>
                  ))}

                  {/* Summary row */}
                  <tr className="bg-white border-t-2 border-[#E2E8F0] font-bold">
                    <td className="py-4 px-4 text-[#0F172A] uppercase tracking-wider text-[10px] font-extrabold">Proposed Gross Tender Capital:</td>
                    
                    {quotes.map((q) => {
                      const isCheapest = cheapest?.id === q.id;
                      return (
                        <td key={q.id} className={`py-4 px-4 text-center border-x border-[#E2E8F0] ${isCheapest ? 'bg-emerald-50/70 text-emerald-900 font-extrabold' : ''}`}>
                          <p className={`text-sm font-mono ${isCheapest ? 'text-emerald-700' : 'text-[#0F172A]'}`}>₹{q.total.toLocaleString('en-IN')}</p>
                          <span className="text-[9px] text-[#94A3B8] font-sans font-semibold mt-0.5 block">{q.paymentTerms} Payment</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Conversion Trigger row */}
                  <tr className="bg-white border-t border-[#F1F5F9]">
                    <td className="py-4 px-4 text-[#94A3B8] italic">Click to award contract instantly:</td>
                    {quotes.map((q) => (
                      <td key={q.id} className="py-4 px-4 text-center">
                        {q.status === 'Accepted' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D1FAE5] text-[#065F46] rounded-lg text-xs font-bold uppercase select-none border border-emerald-300">
                            <Check size={12} strokeWidth={3} /> Approved PO
                          </span>
                        ) : selectedRFQ.status === 'Closed' ? (
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Locked / Closed</span>
                        ) : (
                          <button
                            onClick={() => handleApproveConversion(q)}
                            className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white rounded-lg py-1.5 px-3.5 text-xs font-bold hover:shadow-md transition-all cursor-pointer shadow"
                          >
                            Award PO Contract
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>

          </div>

          {/* Lower comparative summary analytics panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* L1 Winner Card */}
            {cheapest && (
              <div className="bg-gradient-to-tr from-emerald-50 to-teal-50 border border-[#A7F3D0] rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-3 top-3 text-[#059669]">
                  <Award size={36} className="opacity-15" />
                </div>
                <span className="text-[10px] font-extrabold text-[#059669] uppercase tracking-widest block flex items-center gap-1">
                  <Zap size={11} /> Optimal commercial choice
                </span>
                <h4 className="text-sm font-bold text-[#0F172A] mt-2 leading-tight">{cheapest.vendorName}</h4>
                <p className="text-xs font-semibold text-[#059669] mt-1">Offers bidding sum of ₹{cheapest.total.toLocaleString('en-IN')}</p>
                <div className="mt-4 text-xs font-sans text-slate-500">
                  <p>Lead Days: {cheapest.deliveryTime} days delivery timeline</p>
                  <p className="mt-0.5">Calculated Trust Level: Level-1 Bidding</p>
                </div>
              </div>
            )}

            {/* Delivery comparing */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm space-y-2 hover:border-[#E2E8F0] transition-colors relative">
              <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-widest block">Logistical Timeline</span>
              <h4 className="text-sm font-bold text-[#0F172A] mt-2">Delivery Speed ranking</h4>
              <div className="space-y-1 mt-2 text-xs text-[#475569] font-sans">
                {quotes.map((q, i) => (
                  <p key={i} className="flex justify-between font-semibold">
                    <span>{q.vendorName}</span>
                    <span className="font-mono text-purple-700">{q.deliveryTime} days lead days</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Savings comparing */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm space-y-2 hover:border-[#E2E8F0] transition-colors">
              <span className="text-[10px] font-extrabold text-[#F59E0B] uppercase tracking-widest block flex items-center gap-1">
                <TrendingDown size={11} />
                Financial Delta Value
              </span>
              <h4 className="text-sm font-bold text-[#0F172A] mt-2">Savings Margin audit</h4>
              <p className="text-xs text-[#64748B] font-sans leading-relaxed">
                Awarding this bidding specifications contract to <span className="font-bold text-[#4F46E5]">🥇 Global Tech Solutions </span> yields a saving of <span className="font-bold text-[#059669]">₹21,500</span> compared to high estimations.
              </p>
            </div>

          </div>

        </div>
      ) : (
        <div className="py-20 text-center font-sans">
          <p className="text-xs text-slate-400 font-bold">Waiting for open tender proposals or submissions to analyze...</p>
          <button
            onClick={() => navigate('/quotations')}
            className="mt-4 bg-[#6366F1] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-[#4F46E5]"
          >
            Go to Supplier Portal
          </button>
        </div>
      )}

    </ERPLayout>
  );
}
