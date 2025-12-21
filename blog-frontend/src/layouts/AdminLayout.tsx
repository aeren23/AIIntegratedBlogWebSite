import { Outlet, Link } from 'react-router-dom';
import { Badge, Button, Drawer, DrawerHeader, DrawerItems } from 'flowbite-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-teal-100/40 text-gray-900">
      <div className="flex">
        <aside className="hidden h-screen w-64 lg:sticky lg:top-0 lg:block">
          <AdminSidebar />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-gray-300/60 bg-white/95 shadow-md backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Button
                  color="light"
                  size="sm"
                  className="border-gray-200 text-gray-700 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <span className="sr-only">Open navigation</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                <div className="flex flex-col">
                  <Link to="/admin" className="text-lg font-semibold text-gray-900">
                    Admin Dashboard
                  </Link>
                  <span className="text-xs text-gray-500">Content operations</span>
                </div>
                <Badge color="teal" className="hidden sm:inline-flex">
                  Admin
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-xs text-gray-500 sm:block">{user?.username}</div>
                <Button color="teal" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-8">
            <Outlet />
          </main>
        </div>
      </div>

      <Drawer
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        position="left"
        className="bg-white lg:hidden"
      >
        <DrawerHeader
          title="Admin Navigation"
          className="border-b border-gray-200 text-gray-900"
        />
        <DrawerItems className="p-0">
          <AdminSidebar
            className="w-full border-none"
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </DrawerItems>
      </Drawer>
    </div>
  );
};

export default AdminLayout;
