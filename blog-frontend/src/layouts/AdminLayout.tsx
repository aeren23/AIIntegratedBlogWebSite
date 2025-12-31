import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Badge, Button } from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import ConfirmModal from '../components/common/ConfirmModal';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-100 text-slate-900">
            {/* Fixed Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-800/70 bg-slate-900 shadow-xl">
                <AdminSidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col pl-64">
                {/* Top Header */}
                <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md shadow-teal-500/30">
                                <span className="text-xs font-bold text-white">B</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">Blog</span>
                        </Link>
                        <Badge color="light" className="border border-slate-200 bg-slate-100 text-slate-700">
                            Admin Panel
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            as={Link}
                            to="/"
                            color="light"
                            size="sm"
                            className="border-slate-300 text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Site
                        </Button>

                        {user && (
                            <div className="flex items-center gap-2 border-l border-slate-300 pl-3">
                                <Badge color="success" className="bg-emerald-100 text-emerald-800 font-medium">
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
                                    className="border-red-200 text-red-600 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                    onClick={() => setIsLogoutOpen(true)}
                                >
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-slate-100 p-6">
                    <div className="mx-auto max-w-6xl">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}

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
                    }}
                    onCancel={() => setIsLogoutOpen(false)}
                />

                <footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-sm font-medium text-slate-600">
                    (c) 2025 Blog Platform - Admin Panel
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
