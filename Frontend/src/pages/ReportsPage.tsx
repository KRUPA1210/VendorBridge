import React, { useState } from 'react';
import ERPLayout from '../components/ERPLayout';
import StatCard from '../components/StatCard';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { yearlySpendData } from '../data/mockData';
import { TrendingUp, Award, Calendar, CheckSquare, Sparkles } from 'lucide-react';

export default function ReportsPage() {
  const [range, setRange] = useState<'This Quarter' | 'Last 6 Months' | 'Fiscal Annual'>('Fiscal Annual');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter trend data
  const getChartData = () => {
    switch (range) {
      case 'This Quarter':
        return yearlySpendData.slice(9);
      case 'Last 6 Months':
        return yearlySpendData.slice(6);
      case 'Fiscal Annual':
      default:
        return yearlySpendData;
    }
  };

  return (
    <ERPLayout title="Reports & Analytics" subtitle="Interactive charts, transactional aggregates, contract completions, and ROI analysis">
      
      {/* Target range selector toolbar */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-[#E2E8F0] transition-colors select-none">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8]">Fiscal range selector</h4>
          <p className="text-xs text-[#64748B] mt-0.5 font-sans">Toggle report summaries to filter visual compound analytics matrices.</p>
        </div>
        
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['This Quarter', 'Last 6 Months', 'Fiscal Annual'] as const).map((opt) => {
            const isActive = range === opt;
            return (
              <button
                key={opt}
                id={`report-range-${opt.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setRange(opt)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6366F1] text-white shadow shadow-indigo-600/10'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#475569]'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics KPI counters row */}
      <div id="reports-kpi-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="Cumulative Fiscal spend"
          value="₹5,49,735"
          trendText="↑ 25% Increase vs target"
          trendType="success"
          iconName="IndianRupee"
          delayMs={0}
        />
        <StatCard
          label="Averaged Bids TAT Days"
          value="4.5 Days"
          trendText="↓ 1.2 Days faster turn"
          trendType="info"
          iconName="Clock"
          delayMs={80}
        />
        <StatCard
          label="Tender Conversion rate"
          value="95.8%"
          trendText="↑ 4% Growth efficiency"
          trendType="success"
          iconName="CheckSquare"
          delayMs={160}
        />
      </div>

      {/* Compound Composed Chart: PO Counts + Cumulative Spend Overlay */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm hover:border-[#E2E8F0] transition-colors space-y-4 select-none">
        <div>
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest block">Monthly Compound Bidding ledger</span>
          <h3 className="text-base font-bold text-[#0F172A] mt-1 pr-6 leading-tight">Contract conversion volume vs Total Capital Spend</h3>
          <p className="text-xs text-[#64748B] mt-1 font-sans">Dual axis representation illustrating monthly active Purchase Order counts as bars and total fiscal spend overlaid as a line.</p>
        </div>

        {/* Recharts responsive block */}
        <div className="w-full h-96 min-h-0 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={getChartData()} margin={{ top: 20, right: -5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
              />
              {/* Left YAxis for Spend Line */}
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              {/* Right YAxis for PO Counts Bar */}
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${val} POs`}
              />
              
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0F172A] text-white p-3 rounded-lg shadow-xl border border-slate-800 text-xs min-w-44 font-sans">
                        <p className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">
                          {label} · Report Summary
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Monthly Spend:</span>
                            <span className="font-bold text-white">{formatCurrency(payload[0].value as number)}</span>
                          </div>
                          {payload[1] && (
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Active PO Count:</span>
                              <span className="font-bold text-indigo-400">{payload[1].value} fully cleared POs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569' }} />
              
              {/* Monthly PO counts as bars */}
              <Bar yAxisId="right" dataKey="officeSupplies" name="Active PO Volume count" fill="#94A3B8" fillOpacity={0.4} radius={[3, 3, 0, 0]} />
              
              {/* Spend overlay as a smooth line */}
              <Line yAxisId="left" type="monotone" dataKey="spend" name="Gross Allocation Capital" stroke="#6366F1" strokeWidth={2.5} activeDot={{ r: 6 }} />

            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports analytical conclusions insights bento list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none font-sans">
        
        <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm space-y-2 hover:border-[#E2E8F0] transition-colors relative">
          <span className="text-[10px] font-bold text-[#4338CA] uppercase tracking-wider">Direct savings insight</span>
          <h4 className="text-sm font-bold text-[#0F172A]">Volume aggregation benefits</h4>
          <p className="text-xs text-[#475569] leading-relaxed">
            By centralizing recurring order sheets for <span className="font-bold text-[#0F172A]">IT hardware</span> through global VendorBridge bidding workflows, pre-estimated margin leak was decreased by <span className="font-bold text-emerald-700">18.5% savings</span> across Q3/Q4 cycles.
          </p>
        </div>

        <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm space-y-2 hover:border-[#E2E8F0] transition-colors relative">
          <div className="absolute right-4 top-4 text-purple-600">
            <Sparkles size={16} />
          </div>
          <span className="text-[10px] font-bold text-[#721C24] uppercase tracking-wider">Logistics compliance insight</span>
          <h4 className="text-sm font-bold text-[#0F172A]">Preferred partner fulfillment timelines</h4>
          <p className="text-xs text-[#475569] leading-relaxed">
            Preferred entities like <span className="font-semibold text-[#0F172A]">Global Tech Solutions</span> retain a stellar score with an averaged TAT lead speed of <span className="font-bold text-purple-700">4.1 days</span>, outperforming regular partners by 40%.
          </p>
        </div>

      </div>

    </ERPLayout>
  );
}
