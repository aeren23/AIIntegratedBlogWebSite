import type { ReactNode } from 'react';
import { Card } from 'flowbite-react';

type StatCardProps = {
  title: string;
  value: string;
  icon?: ReactNode;
  accentClassName?: string;
  shadowClassName?: string;
  iconClassName?: string;
};

const StatCard = ({
  title,
  value,
  icon,
  accentClassName,
  shadowClassName,
  iconClassName,
}: StatCardProps) => {
  const backgroundClasses = accentClassName ?? 'from-white via-gray-50 to-gray-100';
  const shadowClasses = shadowClassName ?? 'shadow-gray-200/60';
  const iconClasses = iconClassName ?? 'bg-white/90 text-gray-600 ring-1 ring-white/70';

  return (
    <Card
      className={`border border-gray-300/50 bg-gradient-to-br ${backgroundClasses} shadow-xl ${shadowClasses} hover:shadow-2xl transition-shadow duration-200`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClasses}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
