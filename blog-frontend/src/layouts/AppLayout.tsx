import { NavLink, Outlet, Link } from 'react-router-dom';
import { Badge, Button } from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';

const navLinkClass =
  'text-sm font-medium text-slate-700 transition-colors hover:text-teal-600';
const navLinkActiveClass = 'text-sm font-semibold text-teal-600';

const AppLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('ADMIN') || roles.includes('SUPERADMIN');
  const isAuthor = roles.includes('AUTHOR') || isAdmin;
  const isUserOnly = roles.length === 1 && roles.includes('USER');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
              <span className="text-base font-bold text-white">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900">Blog</span>
              <span className="text-xs font-medium text-slate-500">Content platform</span>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? navLinkActiveClass : navLinkClass
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                isActive ? navLinkActiveClass : navLinkClass
              }
            >
              Search
            </NavLink>

            {isAuthenticated && isUserOnly && (
              <NavLink
                to="/user"
                className={({ isActive }) =>
                  isActive ? navLinkActiveClass : navLinkClass
                }
              >
                My Space
              </NavLink>
            )}

            {/* Author Panel Link - Only for authors (not admin-only) */}
            {isAuthor && !isAdmin && (
              <NavLink
                to="/author"
                className={({ isActive }) =>
                  isActive ? navLinkActiveClass : navLinkClass
                }
              >
                Author Panel
              </NavLink>
            )}

            {/* Admin Panel Link */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `${isActive ? 'bg-teal-600 text-white' : 'bg-teal-500 text-white hover:bg-teal-600'} rounded-lg px-3 py-1.5 text-sm font-medium shadow-md shadow-teal-500/25 transition-all`
                }
              >
                Admin Panel
              </NavLink>
            )}

            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Button as={Link} to="/login" color="teal" size="sm" className="shadow-md shadow-teal-500/20">
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  color="light"
                  size="sm"
                  className="border-slate-300 text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Register
                </Button>
              </div>
            )}

            {isAuthenticated && user && (
              <div className="flex flex-wrap items-center gap-3 border-l border-slate-300 pl-4">
                <Badge color="dark" className="bg-slate-800 text-white">
                  {user.username}
                </Badge>
                <Button
                  as={Link}
                  to="/profile"
                  color="light"
                  size="sm"
                  className="border-slate-300 text-slate-700 shadow-sm"
                >
                  Profile
                </Button>
                <Button
                  color="light"
                  size="sm"
                  className="border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <main>
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm font-medium text-slate-600">
          © 2025 Blog Platform. Built with React, NestJS & Flowbite.
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
