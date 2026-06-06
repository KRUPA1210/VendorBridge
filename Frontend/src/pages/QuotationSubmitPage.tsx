import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ERPLayout from '../components/ERPLayout';
import { getFromStorage, saveToStorage, RFQ, Quotation, ActivityLog } from '../data/mockData';
import { ArrowLeft, CheckCircle, Calculator, FileText, Info, IndianRupee } from 'lucide-react';

export default function QuotationSubmitPage() {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRFQId, setSelectedRFQId] = useState('');
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);

  // Quote input form state
  const [vendorName, setVendorName] = useState('Global Tech Solutions Ltd');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [deliveryDays, setDeliveryDays] = useState('14');
  const [exceptions, setExceptions] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Dynamic price mapping for item rows: key is item index, value is unit price bid (number)
  const [bidPrices, setBidPrices] = useState<Record<number, number>>({});

  // Load RFQs from Storage
  useEffect(() => {
    const list = getFromStorage<RFQ>('rfqs');
    setRfqs(list);
    if (list.length > 0) {
      setSelectedRFQId(list[0].id);
      setSelectedRFQ(list[0]);
      // Pre-populate bid prices
      const initialPrices: Record<number, number> = {};
      list[0].items.forEach((it, index) => {
        initialPrices[index] = it.estPrice * 0.95; // default 5% lower bid
      });
      setBidPrices(initialPrices);
    }
  }, []);

  // Update selected RFQ details
  const handleRFQChange = (id: string) => {
    setSelectedRFQId(id);
    const matched = rfqs.find(r => r.id === id) || null;
    setSelectedRFQ(matched);
    if (matched) {
      const initialPrices: Record<number, number> = {};
      matched.items.forEach((it, index) => {
        initialPrices[index] = it.estPrice * 0.95;
      });
      setBidPrices(initialPrices);
    }
  };

  const handlePriceChange = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    setBidPrices({
      ...bidPrices,
      [index]: num
    });
  };

  // Perform math calculations
  const calculateTotals = () => {
    if (!selectedRFQ) return { subtotal: 0, gst: 0, total: 0 };
    let subtotal = 0;
    selectedRFQ.items.forEach((it, index) => {
      const unitPrice = bidPrices[index] !== undefined ? bidPrices[index] : it.estPrice;
      subtotal += (unitPrice * it.qty);
    });
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const { subtotal, gst, total } = calculateTotals();

  // Save Quote under quotations database in LocalStorage
  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQ) return;

    const currentQuotations = getFromStorage<Quotation>('quotations');
    const newQuoteId = `QUO-0${currentQuotations.length + 1}`;

    const lineItems = selectedRFQ.items.map((it, index) => ({
      description: it.description,
      qty: it.qty,
      unitPrice: bidPrices[index] !== undefined ? bidPrices[index] : it.estPrice,
      total: (bidPrices[index] !== undefined ? bidPrices[index] : it.estPrice) * it.qty
    }));

    const newQuote: Quotation = {
      id: newQuoteId,
      rfqId: selectedRFQ.id,
      rfqTitle: selectedRFQ.title,
      vendorId: 'vendor-101',
      vendorName,
      vendorRating: 4.8,
      total: total,
      deliveryTime: parseInt(deliveryDays) || 10,
      paymentTerms: paymentTerms,
      validity: 60,
      gstPercent: 18,
      notes: exceptions || 'Submitted standard commercial bid.',
      items: lineItems,
      status: 'Pending'
    };

    const updated = [newQuote, ...currentQuotations];
    saveToStorage('quotations', updated);

    // Audit logs
    const logs = getFromStorage<ActivityLog>('activityLogs');
    saveToStorage('activityLogs', [{
      id: Date.now(),
      action: 'Bid proposal received',
      timestamp: '06 Jun 2026 · 04:50 PM',
      user: 'Global Tech (Supplier portal)',
      details: `Incoming Quotation ${newQuoteId} registered for Tender ${selectedRFQ.id} with total price of ${newQuote.total}.`,
      type: 'rfq',
      color: 'indigo',
      icon: 'FileText'
    }, ...logs]);

    setStatusMsg(`Quotation proposal ${newQuoteId} recorded! Redirecting to Dashboard.`);
    setTimeout(() => {
      setStatusMsg(null);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <ERPLayout title="Quotations" subtitle="Supplier Portal: Submit commercial quotes and terms against broadcasted RFQs">
      
      {/* Toast confirmation */}
      {statusMsg && (
        <div id="toast-success" className="fixed bottom-5 right-5 z-50 bg-[#0F172A] border border-slate-700 font-sans shadow-2xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center font-bold text-xs">✓</div>
          <p className="text-xs font-bold leading-none">{statusMsg}</p>
        </div>
      )}

      {/* Selector banner */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-[#E2E8F0] transition-colors duration-200">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8]">Step 1: Choose Active RFQ Spectrum</h4>
          <p className="text-xs text-[#64748B] mt-0.5 font-sans">Pick from open tenders broadcasted globally to submit commercial proposals.</p>
        </div>
        <div className="relative">
          <select
            id="rfq-select-dropdown"
            className="bg-white border border-[#E2E8F0] text-sm text-[#0F172A] font-bold rounded-lg py-2 px-3 outline-none"
            value={selectedRFQId}
            onChange={(e) => handleRFQChange(e.target.value)}
          >
            {rfqs.map(r => (
              <option key={r.id} value={r.id}>{r.id} - {r.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Split layout */}
      {selectedRFQ ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start select-none">
          
          {/* Left Read-Only details (span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Specs card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4 font-sans">
              <span className="text-[10px] font-bold bg-[#E0E7FF] text-[#4338CA] px-2 py-0.5 rounded uppercase font-mono">Tender Specification Specs</span>
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold block">TENDER REF</span>
                <p className="text-xs font-bold text-[#0F172A] font-mono">{selectedRFQ.id}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold block">SPEC TITLE</span>
                <p className="text-xs font-bold text-[#0F172A] leading-tight mt-0.5">{selectedRFQ.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-dashed border-[#E2E8F0]">
                <div>
                  <span className="text-[10px] text-[#94A3B8] font-bold block">Priority Level</span>
                  <span className="text-xs font-semibold text-[#EF4444]">{selectedRFQ.priority}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94A3B8] font-bold block">Tender Cutoff</span>
                  <span className="text-xs font-semibold text-[#0F172A]">{selectedRFQ.closeDate}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-dashed border-[#E2E8F0] text-xs">
                <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Procurement requirements guidelines</span>
                <p className="text-[#475569] mt-1 italic whitespace-pre-line leading-relaxed bg-white border border-slate-200 p-3 rounded-lg text-[11px]">{selectedRFQ.description}</p>
              </div>
            </div>

            {/* Items display */}
            <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm space-y-3 hover:border-[#E2E8F0] transition-colors">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#0F172A] border-b pb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-[#6366F1]" />
                <span>Requisition Rows list</span>
              </h4>
              <div className="space-y-2 text-xs">
                {selectedRFQ.items.map((it, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#0f172a]">{it.description}</p>
                      <span className="text-[10px] text-[#94A3B8] block mt-0.5 font-semibold">Required volume: {it.qty} {it.unit}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Est. ₹{it.estPrice.toLocaleString('en-IN')}/u</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Bid spec input Form (span 7) */}
          <div className="lg:col-span-7 bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm space-y-6 hover:border-[#E2E8F0] transition-all">
            <div className="border-b border-[#F1F5F9] pb-3">
              <span className="text-xs font-extrabold text-[#6366F1] uppercase tracking-wider block">Step 2: Enter Proposal Specification Pricing</span>
              <h3 className="text-base font-bold text-[#0F172A] mt-0.5">Commercial Submission Form</h3>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151]">Authorized Vendor Entity</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] font-semibold outline-none"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151]">Payment Terms Offered</label>
                  <select
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#0F172A] outline-none"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  >
                    <option value="Net 30">Net 30 (Standard Corp)</option>
                    <option value="Net 15">Net 15 (Mid Term)</option>
                    <option value="Net 45">Net 45 (Extended Account)</option>
                    <option value="Advance">Advance (100% Retainer)</option>
                  </select>
                </div>
              </div>

              {/* Editable prices grid list */}
              <div className="space-y-3 pt-3 border-t border-[#F1F5F9]">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Unit Price Bid Rows</h4>
                
                <div className="space-y-2">
                  {selectedRFQ.items.map((it, idx) => (
                    <div key={idx} className="bg-slate-50/50 border border-[#CBD5E1] rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#0F172A]">{it.description}</p>
                        <span className="text-[10px] text-[#94A3B8] block mt-0.5 font-semibold">Tender volume requested: {it.qty} {it.unit}</span>
                      </div>

                      <div className="w-full sm:w-48 space-y-1 shrink-0">
                        <label className="text-[10px] font-bold text-[#64748B] block">Bid Unit Price (₹)</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">₹</span>
                          <input
                            type="number"
                            min={1}
                            required
                            className="w-full bg-white border border-[#CBD5E1] rounded-lg py-1.5 pl-6 pr-3 text-xs text-[#0f172a] font-mono font-bold outline-none focus:border-[#6366F1]"
                            value={bidPrices[idx] !== undefined ? bidPrices[idx] : ''}
                            onChange={(e) => handlePriceChange(idx, e.target.value)}
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery and logistics settings */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#F1F5F9]">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151]">Delivery Lead Days</label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="e.g. 10"
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] font-mono outline-none"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151]">Exceptions / Special specifications Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. valid only for next 30 days specifications"
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none"
                    value={exceptions}
                    onChange={(e) => setExceptions(e.target.value)}
                  />
                </div>
              </div>

              {/* Live ledger calculation box */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3.5 shadow-sm">
                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#6366F1] flex items-center gap-1.5">
                  <Calculator size={14} />
                  <span>Real-time Financial accounting ledger</span>
                </h4>
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#64748B] font-semibold">
                    <span>Offered Commercial Base Sum:</span>
                    <span className="font-mono text-[#0F172A]">₹{subtotal.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between text-[#64748B] font-semibold">
                    <span>Applied GST Value (18% standard):</span>
                    <span className="font-mono text-[#0F172A]">₹{gst.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-2 flex justify-between font-bold text-sm text-indigo-700 mt-2">
                    <span>Grand Supplier Quote Total (INR):</span>
                    <span className="font-mono">₹{total.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-[#F1F5F9] flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="h-10 px-5 border border-[#E2E8F0] text-[#374151] rounded-lg text-xs font-semibold hover:bg-[#F9FAFB] cursor-pointer"
                >
                  Cancel Submission
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white rounded-lg text-xs font-bold hover:opacity-92 transition-all cursor-pointer shadow-md inline-flex items-center gap-1"
                >
                  <CheckCircle size={14} />
                  <span>Submit commercial Bid</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      ) : (
        <p className="text-sm text-[#94A3B8]">No active RFQs present to submit quotes.</p>
      )}

    </ERPLayout>
  );
}
