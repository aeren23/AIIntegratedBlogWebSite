import { Badge } from 'flowbite-react';

type RoleBadgeProps = {
  role: string;
};

const roleColorMap: Record<string, string> = {
  SUPERADMIN: 'failure',
  ADMIN: 'purple',
  AUTHOR: 'warning',
  USER: 'info',
};

const RoleBadge = ({ role }: RoleBadgeProps) => {
  const color = roleColorMap[role] ?? 'gray';

  return (
    <Badge color={color} className="rounded-full px-2 py-0.5 text-xs">
      {role}
    </Badge>
  );
};

export default RoleBadge;
