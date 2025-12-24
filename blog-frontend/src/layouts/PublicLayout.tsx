import { NavLink, Outlet, Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { getRoleRedirectPath, useAuth } from '../contexts/AuthContext';

const PublicLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const dashboardPath = user ? getRoleRedirectPath(user.roles) : '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 text-gray-800">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md shadow-teal-500/20">
              <span className="text-sm font-bold text-white">B</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Blog</h1>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => 
                isActive 
                  ? 'font-medium text-teal-600' 
                  : 'text-gray-600 hover:text-teal-600 transition-colors'
              }
            >
              Home
            </NavLink>
            {!isAuthenticated && (
              <>
                <Button as={Link} to="/login" color="teal" size="sm">
                  Login
                </Button>
              </>
            )}
            {isAuthenticated && user && (
              <>
                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700">
                  {user.username}
                </span>
                <Button
                  as={Link}
                  to="/profile"
                  color="light"
                  size="sm"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </Button>
                <Button as={Link} to={dashboardPath} color="teal" size="sm">
                  Dashboard
                </Button>
                <Button color="light" size="sm" className="border-gray-200 text-gray-700" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Outlet />
      </main>
      <footer className="border-t border-gray-100 bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-gray-500">
          © 2025 Blog Platform. Built with React, NestJS & Flowbite.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
