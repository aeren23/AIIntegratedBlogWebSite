import { Outlet, NavLink, Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const isAdmin =
    user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPERADMIN');
  const isAuthor = user?.roles?.includes('AUTHOR');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
                <span className="text-sm font-bold text-white">U</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">My Space</h1>
            </Link>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
              User
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink 
              to="/user" 
              end 
              className={({ isActive }) => 
                isActive 
                  ? 'font-medium text-sky-600' 
                  : 'text-slate-600 hover:text-sky-600 transition-colors'
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                isActive 
                  ? 'font-medium text-sky-600' 
                  : 'text-slate-600 hover:text-sky-600 transition-colors'
              }
            >
              Profile
            </NavLink>
            {isAuthor && (
              <NavLink
                to="/author"
                className={({ isActive }) =>
                  isActive
                    ? 'font-medium text-sky-600'
                    : 'text-slate-600 hover:text-sky-600 transition-colors'
                }
              >
                Writer Panel
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? 'font-medium text-sky-600'
                    : 'text-slate-600 hover:text-sky-600 transition-colors'
                }
              >
                Admin Panel
              </NavLink>
            )}
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="text-xs text-slate-500">{user?.username}</span>
              <Button color="light" size="xs" className="border-slate-300" onClick={logout}>
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
