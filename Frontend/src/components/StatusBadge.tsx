import React from 'react';

export type StatusType =
  | 'Draft'
  | 'Pending'
  | 'Pending Approval'
  | 'Accepted'
  | 'Approved'
  | 'Accepted/Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Closed'
  | 'Active'
  | 'Sent';

interface StatusBadgeProps {
  status: StatusType | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  // Normalize variations
  let normalized: string = status;
  if (status === 'Accepted' || status === 'Approved' || status === 'Accepted/Approved') {
    normalized = 'Accepted/Approved';
  }

  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    'Draft': { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', dot: 'bg-[#94A3B8]' },
    'Pending': { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', dot: 'bg-[#D97706]' },
    'Pending Approval': { bg: 'bg-[#EDE9FE]', text: 'text-[#5B21B6]', dot: 'bg-[#7C3AED]' },
    'Accepted/Approved': { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', dot: 'bg-[#059669]' },
    'Rejected': { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', dot: 'bg-[#EF4444]' },
    'Cancelled': { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', dot: 'bg-[#EF4444]' },
    'Closed': { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', dot: 'bg-[#94A3B8]' },
    'Active': { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', dot: 'bg-[#2563EB]' },
    'Sent': { bg: 'bg-[#EDE9FE]', text: 'text-[#5B21B6]', dot: 'bg-[#6366F1]' },
  };

  const current = styles[normalized] || { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', dot: 'bg-[#94A3B8]' };

  return (
    <span
      id={`status-badge-${normalized.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[12px] font-medium ${current.bg} ${current.text} select-none`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${current.dot}`} />
      {status}
    </span>
  );
}
