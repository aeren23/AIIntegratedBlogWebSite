import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Badge, Button } from 'flowbite-react';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/common/ConfirmModal';

const navLinkClass =
  'text-sm font-medium text-slate-600 transition-colors hover:text-violet-600';
const navLinkActiveClass = 'text-sm font-semibold text-violet-600';

const AppLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { showSuccess } = useToast();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('ADMIN') || roles.includes('SUPERADMIN');
  const isAuthor = roles.includes('AUTHOR') || isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-violet-100/50 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105">
              <HiSparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">AI Blog</span>
              <span className="text-xs font-medium text-slate-400">Powered by AI</span>
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
            {isAuthenticated && (
              <>
                <NavLink
                  to="/articles"
                  className={({ isActive }) =>
                    isActive ? navLinkActiveClass : navLinkClass
                  }
                >
                  Articles
                </NavLink>
                <NavLink
                  to="/search"
                  className={({ isActive }) =>
                    isActive ? navLinkActiveClass : navLinkClass
                  }
                >
                  Search
                </NavLink>
                <NavLink
                  to="/categories"
                  className={({ isActive }) =>
                    isActive ? navLinkActiveClass : navLinkClass
                  }
                >
                  Categories
                </NavLink>
              </>
            )}

            {/* Author Panel Link - For authors and admins */}
            {isAuthenticated && (isAuthor || isAdmin) && (
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
                  `${isActive ? 'bg-violet-600 text-white' : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700'} rounded-lg px-3 py-1.5 text-sm font-medium shadow-md shadow-violet-500/25 transition-all`
                }
              >
                Admin Panel
              </NavLink>
            )}

            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Button 
                  as={Link} 
                  to="/login" 
                  size="sm" 
                  className="bg-gradient-to-r from-violet-500 to-purple-600 shadow-md shadow-violet-500/20 hover:from-violet-600 hover:to-purple-700"
                >
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  color="light"
                  size="sm"
                  className="border-violet-200 text-violet-700 shadow-sm hover:bg-violet-50"
                >
                  Register
                </Button>
              </div>
            )}

            {isAuthenticated && user && (
              <div className="flex flex-wrap items-center gap-3 border-l border-slate-200 pl-4">
                <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 font-medium">
                  {user.username}
                </Badge>
                <Button
                  as={Link}
                  to="/profile"
                  color="light"
                  size="sm"
                  className="border-violet-200 text-violet-700 shadow-sm hover:bg-violet-50"
                >
                  Profile
                </Button>
                <Button
                  color="light"
                  size="sm"
                  className="border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
                  onClick={() => setIsLogoutOpen(true)}
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


      <ConfirmModal
        open={isLogoutOpen}
        title="Do you want to logout?"
        description="Do you really want to logout from your account?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        confirmColor="failure"
        onConfirm={() => {
          setIsLogoutOpen(false);
          logout();
          showSuccess('Logged out successfully!');
        }}
        onCancel={() => setIsLogoutOpen(false)}
      />

      <footer className="border-t border-violet-100/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
            <HiSparkles className="h-4 w-4 text-violet-500" />
            <span>© 2025 AI Blog Platform. Built with</span>
            <span className="font-semibold text-violet-600">React</span>
            <span>+</span>
            <span className="font-semibold text-violet-600">NestJS</span>
            <span>+</span>
            <span className="font-semibold text-violet-600">Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
