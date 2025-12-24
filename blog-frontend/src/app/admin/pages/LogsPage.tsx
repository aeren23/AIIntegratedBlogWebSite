import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Label,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from 'flowbite-react';
import axios from 'axios';
import AdminTableWrapper from '../components/AdminTableWrapper';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { deleteLog, fetchLogs, type LogEntry } from '../../../api/log.api';

type LogFilters = {
  action: string;
  entityType: string;
  userId: string;
};

const actionButtonBase =
  'gap-1.5 !rounded-lg !px-2.5 !py-1.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40';
const deleteButtonClass = `${actionButtonBase} !border-rose-200 !bg-rose-50 !text-rose-600 hover:!bg-rose-100`;

const TrashIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M7 6l1 14h8l1-14" />
  </svg>
);

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
  return 'Unable to load logs.';
};

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogFilters>({
    action: '',
    entityType: '',
    userId: '',
  });
  const [draftFilters, setDraftFilters] = useState<LogFilters>({
    action: '',
    entityType: '',
    userId: '',
  });
  const [confirmDelete, setConfirmDelete] = useState<LogEntry | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [
    pageSize,
    totalCount,
  ]);

  const loadLogs = useCallback(async (nextPage: number, nextFilters: LogFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchLogs({
        page: nextPage,
        pageSize,
        action: nextFilters.action || undefined,
        entityType: nextFilters.entityType || undefined,
        userId: nextFilters.userId || undefined,
      });
      setLogs(response.items);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    loadLogs(page, filters);
  }, [filters, loadLogs, page]);

  const handleApplyFilters = () => {
    setPage(1);
    setFilters(draftFilters);
  };

  const handleClearFilters = () => {
    const cleared = { action: '', entityType: '', userId: '' };
    setDraftFilters(cleared);
    setFilters(cleared);
    setPage(1);
  };

  const handleDeleteLog = async () => {
    if (!confirmDelete) {
      return;
    }
    try {
      await deleteLog(confirmDelete.id);
      setConfirmDelete(null);
      loadLogs(page, filters);
    } catch (err) {
      setError(resolveErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert color="failure">
          <span className="font-medium">Log error.</span> {error}
        </Alert>
      )}

      <AdminTableWrapper
        title="Audit Logs"
        description="Track system events with paging and filters."
        actions={
          <Button color="purple" onClick={() => loadLogs(page, filters)} disabled={isLoading}>
            Refresh
          </Button>
        }
      >
        <div className="grid gap-4 rounded-xl border border-slate-200/60 bg-white/80 p-4 text-sm text-slate-700 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="log-action">Action</Label>
            <TextInput
              id="log-action"
              placeholder="CREATE"
              value={draftFilters.action}
              onChange={(event) =>
                setDraftFilters((prev) => ({ ...prev, action: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-entity">Entity type</Label>
            <TextInput
              id="log-entity"
              placeholder="User"
              value={draftFilters.entityType}
              onChange={(event) =>
                setDraftFilters((prev) => ({ ...prev, entityType: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-user">User ID</Label>
            <TextInput
              id="log-user"
              placeholder="User UUID"
              value={draftFilters.userId}
              onChange={(event) =>
                setDraftFilters((prev) => ({ ...prev, userId: event.target.value }))
              }
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 md:col-span-3">
            <Button color="purple" onClick={handleApplyFilters}>
              Apply filters
            </Button>
            <Button color="light" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Spinner size="sm" />
              Loading logs...
            </div>
          ) : (
            <Table className="w-full text-sm">
              <TableHead className="bg-slate-100/70 text-slate-700">
                <TableHeadCell>Action</TableHeadCell>
                <TableHeadCell>Entity</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>User</TableHeadCell>
                <TableHeadCell>Date</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <TableRow className="bg-white/80">
                    <TableCell colSpan={6} className="py-6 text-center text-slate-500">
                      No log entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="bg-white/80">
                      <TableCell className="font-medium text-slate-900">{log.action}</TableCell>
                      <TableCell className="text-slate-600">
                        {log.entityType}
                        {log.entityId ? (
                          <span className="mt-1 block text-xs text-slate-400">
                            {log.entityId}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-slate-600">{log.description}</TableCell>
                      <TableCell className="text-slate-600">
                        {log.user?.username ?? 'System'}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          color="light"
                          size="xs"
                          className={deleteButtonClass}
                          onClick={() => setConfirmDelete(log)}
                        >
                          <span className="flex items-center gap-1.5">
                            <TrashIcon />
                            Delete
                          </span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showIcons
          />
        </div>
      </AdminTableWrapper>

      {confirmDelete && (
        <ConfirmModal
          open={Boolean(confirmDelete)}
          title="Delete log entry"
          description="This will permanently delete the log entry."
          confirmLabel="Delete"
          confirmColor="failure"
          onConfirm={handleDeleteLog}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default LogsPage;
