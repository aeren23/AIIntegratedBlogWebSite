import type { ReactNode } from 'react';
import { Card } from 'flowbite-react';

type AdminTableWrapperProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const AdminTableWrapper = ({ title, description, actions, children }: AdminTableWrapperProps) => {
  return (
    <Card className="border border-white/70 bg-white/90 shadow-lg shadow-slate-200/70">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  );
};

export default AdminTableWrapper;
