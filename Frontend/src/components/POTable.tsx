import React, { useState, useMemo } from 'react';
import { Search, X, Download, Printer, ArrowUpRight } from 'lucide-react';
import { PurchaseOrder, getFromStorage } from '../data/mockData';
import StatusBadge from './StatusBadge';

export default function POTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const poList = useMemo(() => getFromStorage<PurchaseOrder>('pos'), []);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return poList;
    const q = searchQuery.toLowerCase();
    return poList.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.status.toLowerCase().includes(q) ||
        order.orderDate.toLowerCase().includes(q) ||
        order.deliveryDate.toLowerCase().includes(q) ||
        order.total.toLowerCase().includes(q)
    );
  }, [searchQuery, poList]);

  return (
    <div
      id="po-table-section"
      className="bg-white border border-[#F1F5F9] rounded-xl p-[20px_24px] select-none animate-fade-slide-up shadow-sm"
      style={{ animationDelay: '400ms', animationFillMode: 'both' }}
    >
      {/* Header section with search */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-sm font-semibold text-[#0F172A] pl-1 uppercase tracking-wider font-sans">
          Recent Purchase Orders
        </h3>

        {/* Search Input with premium focus styles */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#94A3B8]">
            <Search size={15} />
          </span>
          <input
            id="po-table-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your orders..."
            className="w-full pl-[34px] pr-10 py-2 border border-[#E2E8F0] bg-white rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#6366F1] focus:ring-0 focus:outline-none focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all duration-180"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8] hover:text-[#475569] font-sans text-xs font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] rounded-lg">
              <th className="py-3 px-4 text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.07em] rounded-l-lg">
                Order ID
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.07em]">
                Order Date
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.07em]">
                Delivery Date
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.07em]">
                Status
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.07em] text-right rounded-r-lg">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#F1F5F9] hover:bg-[#FAFBFF] h-[52px] transition-colors duration-150 ease-in group cursor-pointer"
                  onClick={() => setSelectedPO(order)}
                >
                  <td className="py-3 px-4 font-mono">
                    <button
                      id={`link-${order.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPO(order);
                      }}
                      className="text-[#6366F1] hover:text-[#4F46E5] hover:underline font-medium text-[13px] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {order.id}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-[#475569] font-sans">
                    {order.orderDate}
                  </td>
                  <td className="py-3 px-4 text-[#475569] font-sans">
                    {order.deliveryDate}
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-4 text-[#0F172A] font-medium text-right font-mono">
                    {order.total}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#94A3B8] font-medium text-sm">
                  No orders found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PO Detail Slidesheet/Modal Overlay */}
      {selectedPO && (
        <div id="po-detail-overlay" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPO(null)}
          />

          {/* Modal Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-fade-slide-left">
            {/* Header */}
            <div className="p-6 border-b border-[#F1F5F9] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <span className="text-[10px] font-semibold text-[#6366F1] tracking-wider uppercase font-sans">
                  Order Details
                </span>
                <h4 className="text-lg font-bold text-[#0F172A] mt-0.5 font-sans">
                  {selectedPO.id}
                </h4>
              </div>
              <button
                id="btn-close-po-modal"
                onClick={() => setSelectedPO(null)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#475569] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Header */}
              <div className="flex justify-between items-center p-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl">
                <span className="text-xs font-semibold text-[#475569]">Current Status:</span>
                <StatusBadge status={selectedPO.status} />
              </div>

              {/* ERP Summary Card */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#475569] border-b border-[#F1F5F9] pb-1 font-sans">
                  Procurement Information
                </h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[#94A3B8] font-medium font-sans">Requisitioner</p>
                    <p className="text-[#0F172A] font-semibold mt-1">Denish Vekariya</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] font-medium font-sans">Department</p>
                    <p className="text-[#0F172A] font-semibold mt-1">IT & Operations</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] font-medium font-sans">Created On</p>
                    <p className="text-[#475569] font-mono mt-1">{selectedPO.orderDate}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] font-medium font-sans">Expected Delivery</p>
                    <p className="text-[#475569] font-mono mt-1">{selectedPO.deliveryDate}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] font-medium font-sans">Ship Via</p>
                    <p className="text-[#0F172A] font-semibold mt-1">Express Cargo Service</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] font-medium font-sans">Payment Term</p>
                    <p className="text-[#0F172A] font-semibold mt-1">Net 30 Days (Direct Dep)</p>
                  </div>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#475569] font-sans">
                  Financial Ledger
                </h5>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#475569]">
                    <span>Base Goods Value</span>
                    <span className="font-mono">{selectedPO.total}</span>
                  </div>
                  <div className="flex justify-between text-[#475569]">
                    <span>Freight & Logistics Extra</span>
                    <span className="font-mono">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-[#475569]">
                    <span>Applied GST / Taxes</span>
                    <span className="font-mono text-[#94A3B8]">Inc. SGST + CGST (18%)</span>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-2 flex justify-between font-bold text-sm text-[#0F172A] mt-2">
                    <span>Grand Total Due</span>
                    <span className="font-mono text-[#6366F1]">{selectedPO.total}</span>
                  </div>
                </div>
              </div>

              {/* Vendor & Entity info */}
              <div className="space-y-2 text-xs">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#475569] border-b border-[#F1F5F9] pb-1 font-sans">
                  Vendor Partner
                </h5>
                <div className="p-3 bg-white border border-[#F1F5F9] rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-[#0F172A]">{selectedPO.vendor || 'Reliance Digital Corp'}</p>
                    <p className="text-[#94A3B8] mt-0.5">vendor-partner@domain.in</p>
                  </div>
                  <span className="text-[11px] text-[#065F46] border border-[#A7F3D0] bg-[#D1FAE5] px-2 py-0.5 rounded-full font-semibold font-sans">
                    Preferred
                  </span>
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="p-5 border-t border-[#F1F5F9] bg-[#F8FAFC] flex gap-2">
              <button
                onClick={() => alert(`Purchase Order ${selectedPO.id} has been queued for printing.`)}
                className="flex-1 h-10 inline-flex items-center justify-center gap-1 bg-white border border-[#E2E8F0] text-[#374151] rounded-lg text-xs font-medium hover:bg-gray-50 hover:border-[#C7D2FE] cursor-pointer transition-colors duration-150"
              >
                <Printer size={14} className="text-[#6366F1]" />
                Print PO
              </button>
              <button
                onClick={() => alert(`Downloading PDF for ${selectedPO.id}...`)}
                className="flex-1 h-10 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white rounded-lg text-xs font-medium hover:opacity-90 shadow-sm cursor-pointer transition-all duration-150"
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
