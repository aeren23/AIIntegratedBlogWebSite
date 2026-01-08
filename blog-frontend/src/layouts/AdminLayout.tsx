import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Badge, Button } from 'flowbite-react';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from './AdminSidebar';
import ConfirmModal from '../components/common/ConfirmModal';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const { showSuccess } = useToast();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-100 to-violet-50/30 text-slate-900">
            {/* Fixed Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 w-64 border-r border-violet-900/20 bg-gradient-to-b from-slate-900 via-slate-900 to-violet-950 shadow-xl">
                <AdminSidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col pl-64">
                {/* Top Header */}
                <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-violet-100/50 bg-white/80 px-6 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30 transition-transform group-hover:scale-105">
                                <HiSparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">AI Blog</span>
                        </Link>
                        <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200">
                            Admin Panel
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            as={Link}
                            to="/"
                            color="light"
                            size="sm"
                            className="border-violet-200 text-violet-700 shadow-sm hover:bg-violet-50"
                        >
                            <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Site
                        </Button>

                        {user && (
                            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                                <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 font-medium">
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
                <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-100 to-violet-50/30 p-6">
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
                        showSuccess('Logged out successfully!');
                    }}
                    onCancel={() => setIsLogoutOpen(false)}
                />

                <footer className="border-t border-violet-100/50 bg-white/80 backdrop-blur-sm px-6 py-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
                        <HiSparkles className="h-3 w-3 text-violet-500" />
                        <span>© 2025 AI Blog Platform - Admin Panel</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
