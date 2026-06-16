'use client';

interface StatusBadgeProps {
  label: string;
  variant: 'danger' | 'success' | 'warning' | 'info';
}

const variantClasses: Record<StatusBadgeProps['variant'], string> = {
  danger: 'bg-[#FEE2E2] text-[#B91C1C]',
  success: 'bg-[#DCFCE7] text-[#166534]',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
  info: 'bg-[#DBEAFE] text-[#1E3A8A]',
};

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${variantClasses[variant]}`}>{label}</span>;
}
