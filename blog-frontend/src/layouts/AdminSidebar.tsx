import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react';
import type { ComponentProps, MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type AdminSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

type IconProps = ComponentProps<'svg'>;

const DashboardIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
    <rect x="13" y="13" width="8" height="8" rx="2" />
  </svg>
);

const ArticleIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
    <path d="M6 3h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M14 3v5h5" />
    <path d="M8 12h8M8 16h6" />
  </svg>
);

const CategoryIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
    <path d="M4 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
  </svg>
);

const TagIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
    <path d="M7 7h6l6 6-6 6-6-6z" />
    <circle cx="9.5" cy="9.5" r="1.2" />
  </svg>
);

const UsersIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
    <path d="M8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
    <path d="M19 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
    <path d="M3 20a5 5 0 0 1 10 0" />
    <path d="M11 20a4 4 0 0 1 8 0" />
  </svg>
);

const LogsIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
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
    'h-full w-64 bg-slate-900',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const sidebarTheme = {
    root: {
      base: 'h-full',
      inner: 'h-full overflow-y-auto bg-transparent px-3 py-4',
    },
    items: {
      base: 'space-y-1',
    },
    item: {
      base: 'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-slate-400 hover:bg-slate-800 hover:text-white',
      active: 'bg-teal-600 text-white shadow-lg shadow-teal-600/30',
      icon: {
        base: 'h-5 w-5 text-slate-500 transition-colors group-hover:text-slate-300',
        active: 'text-white',
      },
      content: {
        base: 'flex-1 text-left',
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
      {/* Header Section */}
      <div className="mb-6 border-b border-slate-700/50 pb-4">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/40">
            <span className="text-sm font-bold text-white">AC</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin Console</p>
            <p className="text-xs text-slate-400">Control center</p>
          </div>
        </div>
      </div>

      {/* Navigation Label */}
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Navigation
      </p>

      <SidebarItems className="bg-transparent px-0">
        <SidebarItemGroup className="space-y-1">
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
              >
                {item.label}
              </SidebarItem>
            );
          })}
        </SidebarItemGroup>
      </SidebarItems>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700/50 bg-slate-900/80 p-3">
        <p className="text-center text-xs text-slate-500">
          v1.0.0 • Blog Admin
        </p>
      </div>
    </Sidebar>
  );
};

export default AdminSidebar;
