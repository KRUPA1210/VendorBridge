import React from 'react';
import * as Lucide from 'lucide-react';

export type IconSquareColor = 'amber' | 'blue' | 'pink' | 'green' | 'purple' | 'indigo';

interface IconSquareProps {
  iconName: keyof typeof Lucide;
  color: IconSquareColor;
}

export default function IconSquare({ iconName, color }: IconSquareProps) {
  const IconComponent = Lucide[iconName] as React.ComponentType<{ size?: number; className?: string }>;

  const styles: Record<IconSquareColor, { bg: string; icon: string; anim: string }> = {
    amber: { bg: 'bg-[#FEF3C7]', icon: 'text-[#D97706]', anim: 'icon-bounce' },
    blue: { bg: 'bg-[#DBEAFE]', icon: 'text-[#2563EB]', anim: 'icon-rotate' },
    pink: { bg: 'bg-[#FCE7F3]', icon: 'text-[#DB2777]', anim: 'icon-scale' },
    green: { bg: 'bg-[#D1FAE5]', icon: 'text-[#059669]', anim: 'icon-slideright' },
    purple: { bg: 'bg-[#EDE9FE]', icon: 'text-[#7C3AED]', anim: 'icon-scale' },
    indigo: { bg: 'bg-[#E0E7FF]', icon: 'text-[#6366F1]', anim: 'icon-rotate' },
  };

  const current = styles[color] || styles.indigo;

  return (
    <div
      className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${current.bg}`}
      style={{ width: '40px', height: '40px' }}
    >
      {IconComponent && <IconComponent size={20} className={`${current.icon} ${current.anim} transition-transform duration-300`} />}
    </div>
  );
}
