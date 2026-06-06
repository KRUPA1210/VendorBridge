import React, { useState, useEffect } from 'react';
import ERPLayout from '../components/ERPLayout';
import Timeline from '../components/Timeline';
import { getFromStorage, ActivityLog } from '../data/mockData';
import { Search, RotateCcw, Calendar, History } from 'lucide-react';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'rfq' | 'vendor' | 'po' | 'invoice'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load logs on mount
  useEffect(() => {
    setLogs(getFromStorage<ActivityLog>('activityLogs'));
  }, []);

  // Filter logs dynamically
  const filteredLogs = logs.filter((log) => {
    // Tab filter matching type
    const matchesTab = activeTab === 'All' || log.type === activeTab;

    // Search query matching action, details, user
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveTab('All');
    setStartDate('');
    setEndDate('');
  };

  return (
    <ERPLayout title="Audit Trail" subtitle="Trace transactional changes, user logs, network dispatches, and ledger sign-offs">
      
      {/* Dynamic tab selectors card */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl shadow-sm p-4 hover:border-[#E2E8F0] transition-colors select-none">
        <div className="flex border-b border-[#F1F5F9] overflow-x-auto gap-6 text-sm font-semibold select-none">
          {([
            { id: 'All', title: 'Comprehensive Trace' },
            { id: 'rfq', title: 'RFQs & Bids' },
            { id: 'vendor', title: 'Supplier Portfolios' },
            { id: 'po', title: 'Purchase Orders' },
            { id: 'invoice', title: 'Financial Ledger' }
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`audit-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3.5 px-1 border-b-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-[#6366F1] text-[#6366F1]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tab.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and mock date range bar */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm hover:border-[#E2E8F0] transition-colors space-y-4 select-none">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          
          {/* Key query matching input */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
              <Search size={16} />
            </span>
            <input
              id="audit-trail-search"
              type="text"
              placeholder="Filter audit logs by keyword or author..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 pl-9 pr-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Date Picker wrappers */}
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-1 px-3 text-xs text-[#0f172a] font-semibold">
              <Calendar size={13} className="text-[#64748B]" />
              <input
                type="date"
                className="bg-transparent border-none outline-none font-sans"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <span className="text-slate-400 text-xs">to</span>

            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-1 px-3 text-xs text-[#0f172a] font-semibold">
              <Calendar size={13} className="text-[#64748B]" />
              <input
                type="date"
                className="bg-transparent border-none outline-none font-sans"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button
              onClick={handleClearFilters}
              className="text-[#64748B] hover:text-[#0F172A] p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              title="Reset Audit Controls"
            >
              <RotateCcw size={15} />
            </button>
          </div>

        </div>
      </div>

      {/* Dynamic timeline list panel */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm hover:border-[#E2E8F0] transition-colors relative">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#0f172a] mb-6 flex items-center gap-1.5 select-none border-b pb-2">
          <History size={14} className="text-[#6366F1]" />
          <span>Audit transactional ledger sequence</span>
        </h4>

        {filteredLogs.length > 0 ? (
          <Timeline logs={filteredLogs} />
        ) : (
          <div className="py-16 text-center select-none font-sans">
            <p className="text-xs text-slate-400 font-bold">No transaction records match the current filters.</p>
            <button
              onClick={handleClearFilters}
              className="mt-3.5 bg-indigo-50 border border-indigo-100 text-[#6366F1] font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

    </ERPLayout>
  );
}
