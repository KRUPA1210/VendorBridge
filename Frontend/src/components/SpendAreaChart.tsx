import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { yearlySpendData, ChartDataPoint } from '../data/mockData';
import { ChevronDown, TrendingUp } from 'lucide-react';

export default function SpendAreaChart() {
  const [filter, setFilter] = useState<'Last Year' | 'Last 6 Months' | 'This Month'>('Last Year');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getFilteredData = (): ChartDataPoint[] => {
    switch (filter) {
      case 'Last 6 Months':
        return yearlySpendData.slice(6);
      case 'This Month':
        return yearlySpendData.slice(11);
      case 'Last Year':
      default:
        return yearlySpendData;
    }
  };

  const calculateTotal = (data: ChartDataPoint[]) => {
    return data.reduce((acc, curr) => acc + curr.spend, 0);
  };

  const filteredData = getFilteredData();
  const currentTotal = calculateTotal(filteredData);

  const displayedTotal = filter === 'Last Year' ? '₹5,49,735' : formatCurrency(currentTotal);
  const displayedTrend = filter === 'Last Year' ? '↑ 25% increase' : '↑ 14% increase';

  return (
    <div
      id="spend-area-chart-card"
      className="bg-white border border-[#F1F5F9] rounded-xl p-6 flex flex-col h-96 hover:border-[#E2E8F0] hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)] hover:-translate-y-[2px] transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] select-none"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider block" style={{ letterSpacing: '0.08em' }}>
            Total Procurement Spend
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[26px] font-bold text-[#0F172A] leading-none tracking-tight font-sans">
              {displayedTotal}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#059669] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
              <TrendingUp size={11} />
              {displayedTrend}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            id="area-chart-filter-dropdown"
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
                {(['Last Year', 'Last 6 Months', 'This Month'] as const).map((opt) => (
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

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0F172A] border-none p-[10px_14px] rounded-lg shadow-xl text-xs min-w-[140px] font-sans">
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#64748B] font-semibold tracking-wider uppercase">
                        <span className="w-2 h-2 rounded-full bg-[#6366F1] inline-block" />
                        IN TOTAL
                      </div>
                      <p className="text-[18px] font-bold text-white leading-none">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-1">
                        {label} · FY2026
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="#6366F1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#spendGrad)"
              activeDot={{ r: 6, fill: '#6366F1', stroke: '#FFFFFF', strokeWidth: 2.5 }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
