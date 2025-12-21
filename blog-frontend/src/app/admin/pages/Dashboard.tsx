import { Alert, Card, ListGroup, ListGroupItem, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import { fetchCategories } from '../../../api/category.api';
import { fetchTags } from '../../../api/tag.api';
import { fetchUsers } from '../../../api/user.api';
import { fetchLogs, type LogEntry } from '../../../api/log.api';

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalCategories: number;
  totalTags: number;
  recentLogs: number;
  adminUsers: number;
  authorUsers: number;
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveErrorMessage = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const apiMessage = (err.response?.data as { errorMessage?: string } | undefined)
        ?.errorMessage;
      if (apiMessage) {
        return apiMessage;
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Unable to load dashboard data.';
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [users, categories, tags, logs] = await Promise.all([
          fetchUsers(),
          fetchCategories(),
          fetchTags(),
          fetchLogs({ page: 1, pageSize: 8 }),
        ]);

        if (!isActive) {
          return;
        }

        const activeUsers = users.filter((user) => user.isActive).length;
        const inactiveUsers = users.length - activeUsers;

        const adminUsers = users.filter((user) =>
          user.roles.some((role) => role === 'ADMIN' || role === 'SUPERADMIN')
        ).length;
        const authorUsers = users.filter((user) => user.roles.includes('AUTHOR')).length;

        setStats({
          totalUsers: users.length,
          activeUsers,
          inactiveUsers,
          totalCategories: categories.length,
          totalTags: tags.length,
          recentLogs: logs.items.length,
          adminUsers,
          authorUsers,
        });
        setRecentLogs(logs.items);
      } catch (err) {
        if (isActive) {
          setError(resolveErrorMessage(err));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overview</p>
        <h2 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h2>
        <p className="max-w-2xl text-sm text-slate-600">
          Monitor user activity, taxonomy health, and system auditing in one place.
        </p>
      </header>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Dashboard error.</span> {error}
        </Alert>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner size="sm" />
          Loading admin metrics...
        </div>
      )}

      {stats && !isLoading && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            accentClassName="from-sky-100 via-white to-teal-100"
            shadowClassName="shadow-sky-300/60"
            iconClassName="bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-500/30"
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path d="M8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
                <path d="M19 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
                <path d="M3 20a5 5 0 0 1 10 0" />
                <path d="M11 20a4 4 0 0 1 8 0" />
              </svg>
            }
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers.toString()}
            accentClassName="from-emerald-100 via-white to-cyan-100"
            shadowClassName="shadow-emerald-300/60"
            iconClassName="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30"
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path d="M5 12l4 4L19 6" />
                <path d="M4 20h16" />
              </svg>
            }
          />
          <StatCard
            title="Inactive Users"
            value={stats.inactiveUsers.toString()}
            accentClassName="from-amber-100 via-white to-orange-100"
            shadowClassName="shadow-amber-300/60"
            iconClassName="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            }
          />
          <StatCard
            title="Total Categories"
            value={stats.totalCategories.toString()}
            accentClassName="from-violet-100 via-white to-indigo-100"
            shadowClassName="shadow-violet-300/60"
            iconClassName="bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30"
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path d="M4 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
              </svg>
            }
          />
          <StatCard
            title="Total Tags"
            value={stats.totalTags.toString()}
            accentClassName="from-pink-100 via-white to-rose-100"
            shadowClassName="shadow-pink-300/60"
            iconClassName="bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30"
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path d="M7 7h6l6 6-6 6-6-6z" />
                <circle cx="9.5" cy="9.5" r="1.2" />
              </svg>
            }
          />
          <StatCard
            title="Recent Logs (Last 8)"
            value={stats.recentLogs.toString()}
            accentClassName="from-slate-100 via-white to-slate-200"
            shadowClassName="shadow-slate-300/60"
            iconClassName="bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-lg shadow-slate-500/30"
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path d="M12 7v5l3 2" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            }
          />
        </section>
      )}

      {stats && !isLoading && (
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border border-white/70 bg-white/90 shadow-lg shadow-slate-200/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">User mix</p>
                <h3 className="text-lg font-semibold text-slate-900">Roles snapshot</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Active ratio {(stats.totalUsers
                  ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                  : 0)}%
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admins</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stats.adminUsers}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Authors</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stats.authorUsers}
                </p>
              </div>
            </div>
          </Card>
          <Card className="border border-white/70 bg-white/90 shadow-lg shadow-slate-200/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Taxonomy</p>
                <h3 className="text-lg font-semibold text-slate-900">Coverage</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Tags per category{' '}
                {stats.totalCategories
                  ? (stats.totalTags / stats.totalCategories).toFixed(1)
                  : '0.0'}
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Categories</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stats.totalCategories}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tags</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stats.totalTags}
                </p>
              </div>
            </div>
          </Card>
        </section>
      )}

      <section>
        <Card className="border border-white/70 bg-white/90 shadow-lg shadow-slate-200/70">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Logs</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Latest entries
            </span>
          </div>
          {isLoading ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
              <Spinner size="sm" />
              Loading logs...
            </div>
          ) : recentLogs.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No log entries found.</p>
          ) : (
            <ListGroup className="mt-4 divide-y divide-slate-200/70 border-none">
              {recentLogs.map((log) => (
                <ListGroupItem
                  key={log.id}
                  className="flex items-center justify-between gap-4 bg-transparent px-0 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm" />
                    <span className="text-sm text-slate-700">
                      {log.action} {log.entityType} - {log.description}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
