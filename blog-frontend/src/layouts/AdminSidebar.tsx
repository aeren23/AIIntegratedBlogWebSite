import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react';
import type { ComponentProps, MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type AdminSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

type IconProps = ComponentProps<'svg'>;

const DashboardIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
    <rect x="13" y="13" width="8" height="8" rx="2" />
  </svg>
);

const ArticleIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <path d="M6 3h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M14 3v5h5" />
    <path d="M8 12h8M8 16h6" />
  </svg>
);

const CategoryIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <path d="M4 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
  </svg>
);

const TagIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <path d="M7 7h6l6 6-6 6-6-6z" />
    <circle cx="9.5" cy="9.5" r="1.2" />
  </svg>
);

const UsersIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <path d="M8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
    <path d="M19 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
    <path d="M3 20a5 5 0 0 1 10 0" />
    <path d="M11 20a4 4 0 0 1 8 0" />
  </svg>
);

const LogsIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <path d="M12 7v5l3 2" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', to: '/admin', end: true, icon: DashboardIcon },
  { label: 'Articles', to: '/admin/articles', icon: ArticleIcon },
  { label: 'Categories', to: '/admin/categories', icon: CategoryIcon },
  { label: 'Tags', to: '/admin/tags', icon: TagIcon },
  { label: 'Users', to: '/admin/users', icon: UsersIcon },
  { label: 'Logs', to: '/admin/logs', icon: LogsIcon },
];

const AdminSidebar = ({ onNavigate, className }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerClasses = [
    'h-full w-64 bg-gradient-to-br from-gray-50 to-gray-100/70 border-r border-gray-300/60',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const sidebarTheme = {
    root: {
      base: 'h-full',
      inner:
        'h-full overflow-y-auto bg-transparent px-3 pb-6',
    },
    items: {
      base: 'space-y-3',
    },
    item: {
      base: 'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-cyan-50 hover:text-cyan-800',
      active:
        'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-500/25 ring-1 ring-teal-500/20',
      icon: {
        base: 'h-5 w-5 text-gray-600 transition-colors group-hover:text-teal-700',
        active: 'text-white',
      },
      content: {
        base: 'flex-1 text-left text-gray-700',
      },
    },
  };

  const handleNavigate = (path: string) => (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    navigate(path);
    onNavigate?.();
  };

  return (
    <Sidebar aria-label="Admin navigation" className={containerClasses} theme={sidebarTheme}>
      <div className="px-4 pb-6 pt-6 border-b border-gray-300/50">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-xl shadow-teal-500/30 ring-2 ring-teal-400/20">
            <span className="text-sm font-bold">AC</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Admin Console</p>
            <p className="text-xs text-gray-600">Control center</p>
          </div>
        </div>
      </div>

      <SidebarItems className="bg-transparent px-0">
        <SidebarItemGroup className="space-y-1 pt-4">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <SidebarItem
                key={item.label}
                href={item.to}
                icon={item.icon}
                active={isActive}
                onClick={handleNavigate(item.to)}
                className={isActive ? '' : 'text-gray-700 hover:shadow-sm'}
              >
                {item.label}
              </SidebarItem>
            );
          })}
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
};

export default AdminSidebar;
