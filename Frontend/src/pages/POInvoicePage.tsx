import React, { useState, useEffect, useRef } from 'react';
import ERPLayout from '../components/ERPLayout';
import { getFromStorage, saveToStorage, Invoice, PurchaseOrder, ActivityLog } from '../data/mockData';
import { Download, Printer, CheckCircle2, ChevronDown, Award, Mail, Sparkles, Building2, Landmark, Check, RefreshCw } from 'lucide-react';

export default function POInvoicePage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'pos'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [selectedPOId, setSelectedPOId] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Load from Storage — refreshes on window focus to catch new invoices from ApprovalPage
  useEffect(() => {
    const loadData = () => {
      const invList = getFromStorage<Invoice>('invoices');
      setInvoices(invList);
      if (invList.length > 0) {
        setSelectedInvoiceId(invList[0].id);
        setSelectedInvoice(invList[0]);
      }

      const poList = getFromStorage<PurchaseOrder>('pos').filter(p => p.status === 'Active');
      setPos(poList);
      if (poList.length > 0) {
        setSelectedPOId(poList[0].id);
        setSelectedPO(poList[0]);
      }
    };

    loadData();

    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, []);

  const handleInvoiceChange = (id: string) => {
    setSelectedInvoiceId(id);
    const matched = invoices.find(inv => inv.id === id) || null;
    setSelectedInvoice(matched);
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle invoice status to Paid/Approved
  const handleToggleStatus = () => {
    if (!selectedInvoice) return;
    const currentInvoices = getFromStorage<Invoice>('invoices');
    const newStatus = selectedInvoice.status === 'Paid' ? 'Pending' : 'Paid';

    const updated = currentInvoices.map(inv => {
      if (inv.id === selectedInvoice.id) {
        return { ...inv, status: newStatus as any };
      }
      return inv;
    });

    saveToStorage('invoices', updated);
    setInvoices(updated);
    setSelectedInvoice({ ...selectedInvoice, status: newStatus as any });

    // Activity log audit
    const logs = getFromStorage<ActivityLog>('activityLogs');
    saveToStorage('activityLogs', [{
      id: Date.now(),
      action: newStatus === 'Paid' ? 'Invoice cleared' : 'Invoice rollbacked',
      timestamp: '06 Jun 2026 · 05:30 PM',
      user: 'Brijesh S. (Chief Procurement Officer)',
      details: newStatus === 'Paid'
        ? `Invoice ${selectedInvoice.id} has been marked as fully disbursed & paid against PO bank routing account details.`
        : `Invoice ${selectedInvoice.id} payment status reset back to Pending review.`,
      type: 'invoice',
      color: newStatus === 'Paid' ? 'green' : 'amber',
      icon: 'Receipt'
    }, ...logs]);

    triggerToast(`Invoice ${selectedInvoice.id} status modified to "${newStatus}"!`);
  };

  const handlePrint = () => {
    if (!selectedInvoice || !invoiceRef.current) return;

    const printContents = invoiceRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=860,height=1000');
    if (!printWindow) {
      alert('Please allow popups for this site to enable printing.');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${selectedInvoice.id}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 32px; color: #0F172A; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @media print { body { padding: 0; } .no-print { display: none !important; } }
        </style>
      </head>
      <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 600);
  };

  const handleDownload = () => {
    if (!selectedInvoice) return;

    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${selectedInvoice.id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #0F172A; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #64748B; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #F8FAFC; padding: 10px 12px; text-align: left; font-size: 11px; color: #64748B; border-bottom: 2px solid #E2E8F0; }
    td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #E2E8F0; }
    .total-row { font-weight: bold; font-size: 14px; }
    .stamp { display: inline-block; border: 3px solid ${selectedInvoice.status === 'Paid' ? '#10B981' : '#F59E0B'}; color: ${selectedInvoice.status === 'Paid' ? '#065F46' : '#92400E'}; padding: 6px 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; transform: rotate(-12deg); margin: 20px 0; }
    .footer { margin-top: 40px; font-size: 10px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 16px; }
  </style>
</head>
<body>
  <h1>${selectedInvoice.vendor}</h1>
  <div class="meta">
    Invoice ID: <strong>${selectedInvoice.id}</strong> &nbsp;|&nbsp;
    PO Reference: <strong>${selectedInvoice.poId}</strong> &nbsp;|&nbsp;
    Issue Date: <strong>${selectedInvoice.issueDate}</strong> &nbsp;|&nbsp;
    Due Date: <strong>${selectedInvoice.dueDate}</strong>
  </div>
  <div class="stamp">${selectedInvoice.status === 'Paid' ? 'PAID & DISBURSED' : 'AWAITING CLEARANCE'}</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Unit Volume</th>
        <th>Unit Rate</th>
        <th>Net Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Enterprise Server hardware tower cluster procurement<br><small>Tender Specifications Rev1 alignment</small></td>
        <td>1 Standard Lot</td>
        <td>${selectedInvoice.amount}</td>
        <td>${selectedInvoice.amount}</td>
      </tr>
      <tr class="total-row">
        <td colspan="3" style="text-align:right">Total Due (incl. SGST/CGST):</td>
        <td style="color:#6366F1">${selectedInvoice.amount}</td>
      </tr>
    </tbody>
  </table>
  <div class="footer">
    <p>GSTIN: 27AAAAP9031Z4Z0 &nbsp;|&nbsp; Bank: State Bank of India &nbsp;|&nbsp; A/C: 10931204893 &nbsp;|&nbsp; IFSC: SBIN000213</p>
    <p>© 2026 ${selectedInvoice.vendor} · Compliant with GST e-Invoicing Regulations</p>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedInvoice.id}_invoice.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast(`Invoice ${selectedInvoice.id} downloaded successfully!`);
  };

  return (
    <ERPLayout title="Invoices & POs" subtitle="Audit tax invoices, link financial disbursement accounts, and record bank clearances">
      
      {/* Toast notifications */}
      {toast && (
        <div id="toast-success" className="fixed bottom-5 right-5 z-50 bg-[#0F172A] border border-slate-700 font-sans shadow-2xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center font-bold text-xs shrink-0">✓</div>
          <p className="text-xs font-bold leading-none">{toast}</p>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white border border-[#F1F5F9] rounded-xl p-2 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'invoices' ? 'bg-[#6366F1] text-white shadow' : 'text-[#64748B] hover:bg-slate-50'}`}
        >
          Tax Invoices
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pos' ? 'bg-[#6366F1] text-white shadow' : 'text-[#64748B] hover:bg-slate-50'}`}
        >
          Approved Purchase Orders
        </button>
      </div>

      {/* Invoice Selector and actions toolbar card */}
      {activeTab === 'invoices' && (
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-[#E2E8F0] transition-all select-none">
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <label className="text-[10px] font-bold text-[#94A3B8] block mb-1 uppercase tracking-wider">Select active invoice</label>
            <div className="flex gap-2 items-center">
              <select
                className="bg-white border border-[#E2E8F0] text-sm text-[#0F172A] font-bold rounded-lg py-2 px-3 outline-none cursor-pointer"
                value={selectedInvoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
              >
                {invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.id} - {inv.vendor} ({inv.status})</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const list = getFromStorage<Invoice>('invoices');
                  setInvoices(list);
                  if (list.length > 0) {
                    setSelectedInvoiceId(list[0].id);
                    setSelectedInvoice(list[0]);
                  }
                }}
                className="h-9 w-9 border border-[#E2E8F0] bg-white rounded-lg flex items-center justify-center text-[#64748B] hover:bg-slate-50 hover:text-[#6366F1] transition-all"
                title="Refresh invoice list"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {selectedInvoice && (
          <div id="po-invoice-action-controls" className="flex flex-wrap gap-2.5 items-center">
            
            {/* Status toggle lever */}
            <button
              onClick={handleToggleStatus}
              className={`h-9 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-sm border ${
                selectedInvoice.status === 'Paid'
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-transparent hover:opacity-95'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>{selectedInvoice.status === 'Paid' ? 'Mark as Unpaid' : 'Authorize payment'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="h-9 px-4 border border-[#E2E8F0] bg-white text-[#475569] rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="h-9 px-4 bg-[#6366F1] text-white rounded-lg text-xs font-semibold hover:bg-[#4F46E5] cursor-pointer inline-flex items-center gap-1.5 shadow"
            >
              <Download size={13} />
              <span>PDF Copy</span>
            </button>

          </div>
        )}
      </div>
      )}

      {activeTab === 'pos' && (
        <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8]">Approved Purchase Orders</h4>
            <p className="text-xs text-[#64748B] mt-0.5">All board-signed and executive-cleared purchase orders.</p>
          </div>
          <select
            className="bg-white border border-[#E2E8F0] text-sm text-[#0F172A] font-bold rounded-lg py-2 px-3 outline-none"
            value={selectedPOId}
            onChange={(e) => {
              setSelectedPOId(e.target.value);
              setSelectedPO(pos.find(p => p.id === e.target.value) || null);
            }}
          >
            {pos.length === 0
              ? <option value="">No approved POs yet</option>
              : pos.map(p => <option key={p.id} value={p.id}>{p.id} — {p.vendorName} ({p.total})</option>)
            }
          </select>
        </div>
      )}

      {activeTab === 'invoices' && selectedInvoice ? (
        <div className="max-w-3xl mx-auto select-none font-sans">
          
          {/* Printable Invoice PDF Replica Container */}
          <div ref={invoiceRef} className="bg-white border border-[#CBD5E1] rounded-2xl shadow-2xl overflow-hidden relative p-8 sm:p-12 space-y-8 min-h-[850px] flex flex-col justify-between">
            
            {/* Diagonal Stamp watermark based on payment clearance details */}
            <div className="absolute right-12 top-24 pointer-events-none select-none z-10">
              {selectedInvoice.status === 'Paid' ? (
                <div className="border-[4px] border-emerald-500 text-emerald-500 font-extrabold text-[14px] uppercase tracking-widest px-4 py-2 rotate-[-12deg] rounded-lg bg-white/90 shadow-lg">
                  PAID & DISBURSED
                </div>
              ) : (
                <div className="border-[4px] border-amber-500 text-amber-500 font-extrabold text-[13px] uppercase tracking-widest px-4 py-1.5 rotate-[-12deg] rounded-lg bg-white/90 shadow-lg">
                  AWAITING CLEARANCE
                </div>
              )}
            </div>

            <div className="space-y-8">
              
              {/* Document Header block */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#E2E8F0] pb-6">
                <div>
                  <h3 className="text-xl font-black text-[#0f172a] tracking-tight">{selectedInvoice.vendor}</h3>
                  <span className="text-xs text-[#64748B] font-medium block mt-1">Regd GSTIN: 27AAAAP9031Z4Z0</span>
                  <p className="text-xs text-[#94A3B8] max-w-sm mt-0.5">Corporate Park, Road #42, Bandra East, Mumbai - 400051</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-extrabold text-[#6366F1] block uppercase tracking-widest">Tax Statement</span>
                  <h4 className="text-lg font-black text-slate-800 font-mono mt-0.5">{selectedInvoice.id}</h4>
                  <span className="text-xs text-slate-400 font-semibold block mt-1">Issue Date: {selectedInvoice.issueDate}</span>
                </div>
              </div>

              {/* Sub-grid with References */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 border border-[#F1F5F9] p-5 rounded-xl text-xs font-sans">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Contract Invoice Reference</span>
                  <p className="font-bold text-[#0F172A]">{selectedInvoice.poId}</p>
                  <p className="text-slate-400 mt-1">Authorized Purchase Requisition</p>
                </div>
                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Clearance Due Deadline</span>
                  <p className="font-bold text-[#EF4444]">{selectedInvoice.dueDate}</p>
                  <p className="text-slate-400 mt-1">Payment Clause terms: Net 30 days</p>
                </div>
              </div>

              {/* Invoice line entries table */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">Statement Ledger Rows</span>
                <div className="border border-[#CBD5E1] rounded-xl overflow-hidden shadow-inner bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#CBD5E1] font-bold text-[#64748B]">
                        <th className="py-2.5 px-4">Line Description</th>
                        <th className="py-2.5 px-4 text-center">Unit Volume</th>
                        <th className="py-2.5 px-4 text-right">Unit Rate</th>
                        <th className="py-2.5 px-4 text-right">Row Net Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      <tr className="hover:bg-slate-50/30">
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#0f172a]">{selectedInvoice.vendor} — Supply Order</p>
                          <span className="text-[9px] text-[#94A3B8] font-semibold">PO Ref: {selectedInvoice.poId}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#475569]">1 Standard Lot</td>
                        <td className="py-3 px-4 text-right font-mono text-[#475569]">{selectedInvoice.amount || '—'}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#0F172A]">{selectedInvoice.amount || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Bottom ledger block */}
            <div className="space-y-6 pt-6 border-t border-[#CBD5E1]">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-[#E2E8F0] p-4 rounded-xl text-xs">
                <div>
                  <span className="text-[9px] font-bold text-[#94A3B8] uppercase block">Bank Clearance deposit details</span>
                  <p className="font-bold text-[#0F172A] flex items-center gap-1 mt-1">
                    <Landmark size={12} className="text-[#6366F1]" />
                    <span>State Bank of India (SBI)</span>
                  </p>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">A/C Number: 10931204893 · IFSC: SBIN000213</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[9px] font-bold text-[#94A3B8] uppercase block">Total Due inclusive of SGST/CGST:</span>
                  <p className="text-lg font-black font-mono text-[#6366F1] mt-0.5">{selectedInvoice.amount || '—'}</p>
                </div>
              </div>

              {/* Verified seal footings */}
              <div className="flex justify-between items-end text-[10px] text-slate-400 pt-2 font-sans select-none">
                <div>
                  <p>© 2026 {selectedInvoice.vendor}</p>
                  <p className="mt-0.5">Compliant with GST e-Invoicing Regulations</p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center font-bold text-[#94A3B8] tracking-widest font-mono mx-auto mb-1">
                    SEAL
                  </div>
                  <span className="font-bold text-[#64748B]">Audited & Verified Draft</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : activeTab === 'invoices' ? (
        <p className="text-sm text-slate-400">Empty Invoice catalogue.</p>
      ) : null}

      {activeTab === 'pos' && selectedPO && (
        <div className="max-w-3xl mx-auto font-sans relative">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-2xl p-8 sm:p-12 space-y-8">
            <div className="absolute right-12 top-24 pointer-events-none select-none z-10">
              <div className="border-[4px] border-emerald-500 text-emerald-500 font-extrabold text-[14px] uppercase tracking-widest px-4 py-2 rotate-[-12deg] rounded-lg bg-white/90 shadow-lg">
                APPROVED PO
              </div>
            </div>
            <div className="border-b border-[#E2E8F0] pb-6">
              <h3 className="text-xl font-black text-[#0F172A]">{selectedPO.vendorName}</h3>
              <span className="text-xs text-[#64748B] mt-1 block">Purchase Order Reference: <span className="font-mono font-bold">{selectedPO.id}</span></span>
              <span className="text-xs text-[#94A3B8] mt-0.5 block">Order Date: {selectedPO.orderDate} · Delivery: {selectedPO.deliveryDate}</span>
            </div>
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">Department</span>
                <p className="font-bold text-[#0F172A] mt-1">{selectedPO.department}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">Payment Terms</span>
                <p className="font-bold text-[#0F172A] mt-1">{selectedPO.paymentTerms || 'Net 30'} Days</p>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 border border-[#E2E8F0] p-4 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">Total PO Value (Tax incl.)</span>
                <p className="text-lg font-black font-mono text-[#6366F1] mt-0.5">{selectedPO.total}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">Status</span>
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300 font-bold uppercase tracking-wider text-[10px] mt-1 inline-block">
                  ✓ Approved & Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pos' && !selectedPO && (
        <p className="text-sm text-slate-400">No approved purchase orders yet. Approve a PO from the Approval page.</p>
      )}

    </ERPLayout>
  );
}
