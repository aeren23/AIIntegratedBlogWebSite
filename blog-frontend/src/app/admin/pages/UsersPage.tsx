import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import axios from 'axios';
import AdminTableWrapper from '../components/AdminTableWrapper';
import ConfirmModal from '../components/ConfirmModal';
import RoleBadge from '../components/RoleBadge';
import StatusBadge from '../components/StatusBadge';
import {
  assignUserRole,
  activateUser,
  deactivateUser,
  fetchRoles,
  fetchUsers,
  hardDeleteUser,
  removeUserRole,
  type UserRecord,
} from '../../../api/user.api';

type ConfirmAction = {
  type: 'deactivate' | 'hardDelete';
  user: UserRecord;
};

const actionButtonBase =
  'gap-1.5 !rounded-lg !px-2.5 !py-1.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40';
const roleButtonClass = `${actionButtonBase} !border-indigo-200 !bg-indigo-50 !text-indigo-700 hover:!bg-indigo-100`;
const deactivateButtonClass = `${actionButtonBase} !border-amber-200 !bg-amber-50 !text-amber-700 hover:!bg-amber-100`;
const activateButtonClass = `${actionButtonBase} !border-emerald-200 !bg-emerald-50 !text-emerald-700 hover:!bg-emerald-100`;
const deleteButtonClass = `${actionButtonBase} !border-rose-200 !bg-rose-50 !text-rose-700 hover:!bg-rose-100`;
const roleToggleBase =
  '!rounded-full !px-3 !py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40';
const roleToggleActive = `${roleToggleBase} !border-indigo-200 !bg-indigo-100 !text-indigo-700 hover:!bg-indigo-200`;
const roleToggleInactive = `${roleToggleBase} !border-slate-200 !bg-white !text-slate-600 hover:!bg-slate-100`;

const RolesIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
  >
    <path d="M12 7v5l3 2" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const ToggleIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
  >
    <path d="M4 12h16" />
    <path d="M12 4v16" />
  </svg>
);

const PowerIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
  >
    <path d="M12 2v10" />
    <path d="M5.5 7.5a8 8 0 1 0 13 0" />
  </svg>
);

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
  return 'Something went wrong. Please try again.';
};

const UsersPage = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<UserRecord | null>(null);
  const [roleSelection, setRoleSelection] = useState<string[]>([]);
  const [roleModalError, setRoleModalError] = useState<string | null>(null);
  const [isRoleSaving, setIsRoleSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activatingUserId, setActivatingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([fetchUsers(), fetchRoles()]);
      setUsers(usersData);
      setRoles(rolesData.map((role) => role.name));
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openRoleModal = (user: UserRecord) => {
    setRoleModalUser(user);
    setRoleSelection(user.roles);
    setRoleModalError(null);
  };

  const toggleRole = (role: string) => {
    setRoleSelection((prev) =>
      prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!roleModalUser) {
      return;
    }

    setIsRoleSaving(true);
    setRoleModalError(null);

    const currentRoles = roleModalUser.roles;
    const nextRoles = roleSelection;
    const rolesToAdd = nextRoles.filter((role) => !currentRoles.includes(role));
    const rolesToRemove = currentRoles.filter((role) => !nextRoles.includes(role));

    try {
      for (const role of rolesToAdd) {
        await assignUserRole(roleModalUser.id, role);
      }
      for (const role of rolesToRemove) {
        await removeUserRole(roleModalUser.id, role);
      }

      await loadUsers();
      setRoleModalUser(null);
    } catch (err) {
      setRoleModalError(resolveErrorMessage(err));
    } finally {
      setIsRoleSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) {
      return;
    }

    setIsActionLoading(true);
    try {
      if (confirmAction.type === 'deactivate') {
        await deactivateUser(confirmAction.user.id);
      }

      if (confirmAction.type === 'hardDelete') {
        await hardDeleteUser(confirmAction.user.id);
      }

      await loadUsers();
      setConfirmAction(null);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleActivate = async (userId: string) => {
    setActivatingUserId(userId);
    setError(null);
    try {
      await activateUser(userId);
      await loadUsers();
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setActivatingUserId(null);
    }
  };

  const confirmContent = useMemo(() => {
    if (!confirmAction) {
      return null;
    }

    if (confirmAction.type === 'deactivate') {
      return {
        title: 'Deactivate user',
        description: `This will deactivate ${confirmAction.user.username}. They will no longer be able to access the system.`,
        confirmLabel: 'Deactivate',
      };
    }

    return {
      title: 'Hard delete user',
      description:
        'This action is permanent and will remove the user and related data. This cannot be undone.',
      confirmLabel: 'Delete permanently',
    };
  }, [confirmAction]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert color="failure">
          <span className="font-medium">User management error.</span> {error}
        </Alert>
      )}

      <AdminTableWrapper
        title="Users"
        description="Manage roles, status, and access for platform users."
        actions={
          <Button color="purple" onClick={loadUsers} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Spinner size="sm" />
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHead className="bg-slate-100/70 text-slate-700">
                <TableHeadCell>Username</TableHeadCell>
                <TableHeadCell>Email</TableHeadCell>
                <TableHeadCell>Roles</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Created</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <TableRow className="bg-white/80">
                    <TableCell colSpan={6} className="py-6 text-center text-slate-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="bg-white/80">
                      <TableCell className="font-medium text-slate-900">
                        {user.username}
                      </TableCell>
                      <TableCell className="text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <RoleBadge key={role} role={role} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            color="light"
                            size="xs"
                            className={roleButtonClass}
                            onClick={() => openRoleModal(user)}
                            disabled={!user.isActive}
                          >
                            <span className="flex items-center gap-1.5">
                              <RolesIcon />
                              Roles
                            </span>
                          </Button>
                          {user.isActive ? (
                            <Button
                              color="light"
                              size="xs"
                              className={deactivateButtonClass}
                              onClick={() => setConfirmAction({ type: 'deactivate', user })}
                            >
                              <span className="flex items-center gap-1.5">
                                <PowerIcon />
                                Deactivate
                              </span>
                            </Button>
                          ) : (
                            <Button
                              color="light"
                              size="xs"
                              className={activateButtonClass}
                              onClick={() => handleActivate(user.id)}
                              disabled={activatingUserId === user.id}
                            >
                              <span className="flex items-center gap-1.5">
                                <ToggleIcon />
                                {activatingUserId === user.id ? 'Activating...' : 'Activate'}
                              </span>
                            </Button>
                          )}
                          <Button
                            color="light"
                            size="xs"
                            className={deleteButtonClass}
                            onClick={() => setConfirmAction({ type: 'hardDelete', user })}
                          >
                            <span className="flex items-center gap-1.5">
                              <TrashIcon />
                              Hard delete
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </AdminTableWrapper>

      <Modal show={Boolean(roleModalUser)} onClose={() => setRoleModalUser(null)}>
        <ModalHeader className="border-b border-slate-200/70">
          Manage roles
        </ModalHeader>
        <ModalBody>
          {roleModalUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{roleModalUser.username}</p>
                <p className="text-xs text-slate-500">{roleModalUser.email}</p>
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Assigned roles
                </p>
                <div className="flex flex-wrap gap-2">
                  {roleSelection.length === 0 ? (
                    <span className="text-sm text-slate-500">No roles assigned.</span>
                  ) : (
                    roleSelection.map((role) => <RoleBadge key={role} role={role} />)
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Toggle roles
                </p>
                <div className="flex flex-wrap gap-2">
                  {roles.length === 0 ? (
                    <span className="text-sm text-slate-500">No roles available.</span>
                  ) : (
                    roles.map((role) => {
                      const isSelected = roleSelection.includes(role);
                      return (
                        <Button
                          key={role}
                          color="light"
                          size="xs"
                          className={isSelected ? roleToggleActive : roleToggleInactive}
                          onClick={() => toggleRole(role)}
                        >
                          {role}
                        </Button>
                      );
                    })
                  )}
                </div>
              </div>
              {roleModalError && (
                <Alert color="failure">
                  <span className="font-medium">Role update failed.</span> {roleModalError}
                </Alert>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-slate-200/70">
          <Button color="purple" onClick={handleSaveRoles} disabled={isRoleSaving}>
            {isRoleSaving ? 'Saving...' : 'Save roles'}
          </Button>
          <Button color="light" onClick={() => setRoleModalUser(null)} disabled={isRoleSaving}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {confirmContent && (
        <ConfirmModal
          open={Boolean(confirmAction)}
          title={confirmContent.title}
          description={confirmContent.description}
          confirmLabel={confirmContent.confirmLabel}
          confirmColor="failure"
          isLoading={isActionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
