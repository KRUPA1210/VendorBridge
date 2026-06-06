import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import IconSquare, { IconSquareColor } from './IconSquare';

// Count-up Hook
function useCountUp(targetStr: string | number, duration: number = 1200) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const valStr = (targetStr !== undefined && targetStr !== null) ? targetStr.toString() : '0';
    const hasRupee = valStr.includes('₹');
    const hasPercent = valStr.includes('%');
    const hasDays = valStr.toLowerCase().includes('days');
    
    const cleaned = valStr.replace(/[^\d.]/g, '');
    const isFloat = cleaned.includes('.');
    const targetNum = parseFloat(cleaned) || 0;

    if (targetNum === 0) {
      setDisplay(valStr);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const percentage = Math.min(progress / duration, 1);

      // easeOutCubic easing
      const ease = 1 - Math.pow(1 - percentage, 3);
      const current = ease * targetNum;

      let formatted = '';
      if (isFloat) {
        const decimals = cleaned.split('.')[1]?.length || 1;
        formatted = current.toFixed(decimals);
      } else {
        formatted = Math.floor(current).toString();
      }

      if (!isFloat && targetNum >= 1000) {
        if (hasRupee) {
          formatted = Math.floor(current).toLocaleString('en-IN');
        } else {
          formatted = Math.floor(current).toLocaleString();
        }
      }

      if (hasRupee) formatted = '₹' + formatted;
      if (hasPercent) formatted = formatted + '%';
      if (hasDays) formatted = formatted + ' Days';

      setDisplay(formatted);

      if (percentage < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplay(valStr);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetStr, duration]);

  return display;
}

interface StatCardProps {
  label: string;
  value: string | number;
  trendText: string;
  trendType: 'warning' | 'info' | 'danger' | 'success' | 'purple' | 'indigo';
  iconName: keyof typeof Lucide;
  delayMs?: number;
}

export default function StatCard({ label, value, trendText, trendType, iconName, delayMs }: StatCardProps) {
  // Map trendType to color for IconSquare
  const colorMap: Record<string, IconSquareColor> = {
    warning: 'amber',
    info: 'blue',
    danger: 'pink',
    success: 'green',
    purple: 'purple',
    indigo: 'indigo',
  };

  const currentSquareColor = colorMap[trendType] || 'indigo';
  const animatedValue = useCountUp(value);

  const getTrendStyle = () => {
    const normalized = trendText.trim();
    if (normalized.startsWith('Action Required')) {
      return {
        bg: 'bg-[#FEF3C7] text-[#92400E]',
        dot: <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D97706] mr-1.5 shrink-0" />
      };
    }
    if (normalized.startsWith('Bidding Ongoing')) {
      return {
        bg: 'bg-[#DBEAFE] text-[#1D4ED8]',
        dot: <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB] mr-1.5 shrink-0" />
      };
    }
    if (normalized.startsWith('Pending Clearance')) {
      return {
        bg: 'bg-[#EDE9FE] text-[#5B21B6]',
        dot: <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7C3AED] mr-1.5 shrink-0" />
      };
    }
    if (normalized.includes('↓')) {
      return {
        bg: 'bg-[#FEE2E2] text-[#991B1B]',
        dot: null
      };
    }
    if (normalized.includes('↑')) {
      return {
        bg: 'bg-[#D1FAE5] text-[#065F46]',
        dot: null
      };
    }
    return {
      bg: 'bg-[#F1F5F9] text-[#475569]',
      dot: <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#94A3B8] mr-1.5 shrink-0" />
    };
  };

  const trendStyle = getTrendStyle();

  return (
    <div
      id={`stat-card-${label.replace(/\s+/g, '-').toLowerCase()}`}
      className="bg-white border border-[#F1F5F9] rounded-xl p-[20px_24px] hover:border-[#E2E8F0] hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)] hover:-translate-y-[2px] transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] group animate-fade-slide-up"
      style={{ animationDelay: `${delayMs || 0}ms`, animationFillMode: 'both' }}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span
            className="text-[11px] font-medium text-[#94A3B8] uppercase block tracking-wider font-sans"
            style={{ letterSpacing: '0.08em' }}
          >
            {label}
          </span>
          <h3 className="text-[30px] font-bold text-[#0F172A] leading-tight font-sans tracking-tight">
            {animatedValue}
          </h3>
        </div>
        <IconSquare iconName={iconName} color={currentSquareColor} />
      </div>

      <div className="mt-4">
        <span className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[12px] font-medium select-none ${trendStyle.bg}`}>
          {trendStyle.dot}
          {trendText}
        </span>
      </div>
    </div>
  );
}
