import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { yearlySpendData } from '../data/mockData';
import { ChevronDown } from 'lucide-react';

export default function CategoryBarChart() {
  const [filter, setFilter] = useState<'Last 12 Months' | 'Last 6 Months'>('Last 12 Months');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getFilteredData = () => {
    return filter === 'Last 6 Months' ? yearlySpendData.slice(6) : yearlySpendData;
  };

  const displayedTotal = filter === 'Last 12 Months' ? '₹1,56,000' : '₹91,000';
  const displayedTrend = '↓ 6% decrease';

  return (
    <div
      id="category-bar-chart-card"
      className="bg-white border border-[#F1F5F9] rounded-xl p-6 flex flex-col h-96 hover:border-[#E2E8F0] hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)] hover:-translate-y-[2px] transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] select-none animate-fade-slide-up"
      style={{ animationDelay: '320ms', animationFillMode: 'both' }}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider block" style={{ letterSpacing: '0.08em' }}>
            IT Hardware vs Office Supplies
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[26px] font-bold text-[#0F172A] leading-none tracking-tight font-sans">
              {displayedTotal}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#EF4444] bg-[#FEE2E2] px-2 py-0.5 rounded-full">
              {displayedTrend}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Custom Legendary circle indicators */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
              <span>IT Hardware</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C7D2FE]" />
              <span>Office Supplies</span>
            </div>
          </div>

          <div className="relative">
            <button
              id="bar-chart-filter-dropdown"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#374151] hover:bg-gray-50 hover:border-[#C7D2FE] cursor-pointer transition-all duration-180"
            >
              {filter}
              <ChevronDown size={14} className="text-[#94A3B8]" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#F1F5F9] rounded-lg shadow-lg py-1 z-20">
                  {(['Last 12 Months', 'Last 6 Months'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setFilter(opt);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        filter === opt
                          ? 'bg-[#E0E7FF] text-[#4338CA]'
                          : 'text-gray-700 hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getFilteredData()} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={10} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(v) => `₹${v / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(99, 102, 241, 0.02)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0F172A] border-none p-[10px_14px] rounded-lg shadow-xl text-xs min-w-[140px] font-sans">
                      <div className="text-[10px] text-[#64748B] font-semibold tracking-wider uppercase mb-2">
                        Monthly Comparison ({label})
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center gap-4 text-white">
                          <span className="text-[#64748B]">IT Hardware:</span>
                          <span className="font-bold">{formatCurrency(payload[0].payload.itHardware)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 text-[#C7D2FE]">
                          <span className="text-[#64748B]">Office Supplies:</span>
                          <span className="font-bold">{formatCurrency(payload[0].payload.officeSupplies)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="itHardware"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
              animationBegin={200}
            />
            <Bar
              dataKey="officeSupplies"
              fill="#C7D2FE"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
