import { Badge } from 'flowbite-react';

type StatusBadgeProps = {
  status: 'active' | 'inactive' | 'deleted' | 'pending';
};

const statusConfig: Record<StatusBadgeProps['status'], { label: string; color: string }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'warning' },
  deleted: { label: 'Deleted', color: 'failure' },
  pending: { label: 'Pending', color: 'info' },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge color={config.color} className="rounded-full px-2 py-0.5 text-xs">
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
