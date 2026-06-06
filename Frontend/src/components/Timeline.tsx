import React from 'react';
import * as Lucide from 'lucide-react';
import { ActivityLog } from '../data/mockData';

interface TimelineProps {
  logs: ActivityLog[];
  limit?: number;
}

export default function Timeline({ logs, limit }: TimelineProps) {
  const displayedLogs = limit ? logs.slice(0, limit) : logs;

  return (
    <div id="logs-timeline" className="relative pl-6 space-y-6 select-none">
      {/* Absolute connector vertical line */}
      <div className="absolute top-2 bottom-2 left-6.5 w-[2px] bg-[#F1F5F9]" />

      {displayedLogs.map((log) => {
        // Resolve Lucide icons dynamically
        const IconComponent = (Lucide[log.icon as keyof typeof Lucide] || Lucide.Activity) as React.ComponentType<{
          size?: number;
          className?: string;
        }>;

        // Color theme mappings
        const colorClasses: Record<string, { indicator: string; iconBg: string; textIcon: string }> = {
          blue: { indicator: 'bg-[#2563EB]', iconBg: 'bg-[#DBEAFE]', textIcon: 'text-[#2563EB]' },
          purple: { indicator: 'bg-[#7C3AED]', iconBg: 'bg-[#EDE9FE]', textIcon: 'text-[#7C3AED]' },
          green: { indicator: 'bg-[#059669]', iconBg: 'bg-[#D1FAE5]', textIcon: 'text-[#059669]' },
          red: { indicator: 'bg-[#EF4444]', iconBg: 'bg-[#FEE2E2]', textIcon: 'text-[#EF4444]' },
          indigo: { indicator: 'bg-[#6366F1]', iconBg: 'bg-[#E0E7FF]', textIcon: 'text-[#6366F1]' },
          amber: { indicator: 'bg-[#D97706]', iconBg: 'bg-[#FEF3C7]', textIcon: 'text-[#D97706]' },
        };

        const currentStyle = colorClasses[log.color] || colorClasses.blue;

        return (
          <div
            key={log.id}
            id={`timeline-item-${log.id}`}
            className="relative flex gap-4 bg-white border border-[#F1F5F9] rounded-xl p-4 shadow-sm hover:border-[#E2E8F0] hover:shadow-[0_4px_16px_rgba(99,102,241,0.04)] transition-all"
          >
            {/* Timeline indicator dot positioned absolutely over the left rule line */}
            <span className={`absolute -left-[16.5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white ring-4 ring-white ${currentStyle.indicator}`} />

            {/* Colored Icon Frame */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${currentStyle.iconBg}`}>
              <IconComponent size={16} className={currentStyle.textIcon} />
            </div>

            {/* Context details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h4 className="text-[13.5px] font-semibold text-[#0F172A] leading-tight truncate">
                  {log.action}
                </h4>
                <span className="text-[11px] text-[#94A3B8] font-medium shrink-0">
                  {log.timestamp}
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                {log.details}
              </p>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-[#6366F1]">
                  {log.user}
                </span>
                {/* Specific context ID chips if applicable */}
                {log.action.includes('RFQ') && (
                  <span className="text-[10px] font-medium bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded">
                    RFQ Context
                  </span>
                )}
                {log.action.includes('PO') && (
                  <span className="text-[10px] font-medium bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded">
                    PO-2729
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
