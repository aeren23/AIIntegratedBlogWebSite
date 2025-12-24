import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Label,
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
  TextInput,
} from 'flowbite-react';
import axios from 'axios';
import AdminTableWrapper from '../components/AdminTableWrapper';
import ConfirmModal from '../../../components/common/ConfirmModal';
import StatusBadge from '../components/StatusBadge';
import { createTag, deleteTag, fetchTags, updateTag, type Tag } from '../../../api/tag.api';

type AdminTag = Tag & { isDeleted?: boolean };

const actionButtonBase =
  'gap-1.5 !rounded-lg !px-2.5 !py-1.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40';
const editButtonClass = `${actionButtonBase} !border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-100`;
const deleteButtonClass = `${actionButtonBase} !border-rose-200 !bg-rose-50 !text-rose-600 hover:!bg-rose-100`;

const EditIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
  >
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M14 6l4 4" />
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
  return 'Unable to process request.';
};

const TagsPage = () => {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<AdminTag | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminTag | null>(null);
  const [formState, setFormState] = useState({ name: '', slug: '' });

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTags();
      setTags(data.map((item) => ({ ...item, isDeleted: false })));
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const openCreateModal = () => {
    setEditingTag(null);
    setFormState({ name: '', slug: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tag: AdminTag) => {
    setEditingTag(tag);
    setFormState({ name: tag.name, slug: tag.slug });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formState.name.trim() || !formState.slug.trim()) {
      setFormError('Name and slug are required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      if (editingTag) {
        const updated = await updateTag(editingTag.id, {
          name: formState.name.trim(),
          slug: formState.slug.trim(),
        });
        setTags((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createTag({
          name: formState.name.trim(),
          slug: formState.slug.trim(),
        });
        setTags((prev) => [{ ...created, isDeleted: false }, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(resolveErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      return;
    }
    try {
      await deleteTag(confirmDelete.id);
      setTags((prev) =>
        prev.map((item) =>
          item.id === confirmDelete.id ? { ...item, isDeleted: true } : item
        )
      );
      setConfirmDelete(null);
    } catch (err) {
      setError(resolveErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert color="failure">
          <span className="font-medium">Tag error.</span> {error}
        </Alert>
      )}

      <AdminTableWrapper
        title="Tags"
        description="Manage tag taxonomy with quick create and edit workflows."
        actions={
          <>
            <Button color="light" onClick={loadTags} disabled={isLoading}>
              Refresh
            </Button>
            <Button color="purple" onClick={openCreateModal}>
              New tag
            </Button>
          </>
        }
      >
        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Spinner size="sm" />
            Loading tags...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHead className="bg-slate-100/70 text-slate-700">
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Slug</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Created</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y divide-slate-100">
                {tags.length === 0 ? (
                  <TableRow className="bg-white/80">
                    <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                      No tags found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tags.map((tag) => (
                    <TableRow
                      key={tag.id}
                      className={`bg-white/80 ${tag.isDeleted ? 'opacity-60' : ''}`}
                    >
                      <TableCell className="font-medium text-slate-900">{tag.name}</TableCell>
                      <TableCell className="text-slate-600">{tag.slug}</TableCell>
                      <TableCell>
                        <StatusBadge status={tag.isDeleted ? 'deleted' : 'active'} />
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(tag.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            color="light"
                            size="xs"
                            className={editButtonClass}
                            onClick={() => openEditModal(tag)}
                            disabled={tag.isDeleted}
                          >
                            <span className="flex items-center gap-1.5">
                              <EditIcon />
                              Edit
                            </span>
                          </Button>
                          <Button
                            color="light"
                            size="xs"
                            className={deleteButtonClass}
                            onClick={() => setConfirmDelete(tag)}
                            disabled={tag.isDeleted}
                          >
                            <span className="flex items-center gap-1.5">
                              <TrashIcon />
                              Delete
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

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader className="border-b border-slate-200/70">
          {editingTag ? 'Edit tag' : 'Create tag'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Name</Label>
              <TextInput
                id="tag-name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-slug">Slug</Label>
              <TextInput
                id="tag-slug"
                value={formState.slug}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, slug: event.target.value }))
                }
              />
            </div>
            {formError && (
              <Alert color="failure">
                <span className="font-medium">Save failed.</span> {formError}
              </Alert>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="border-t border-slate-200/70">
          <Button color="purple" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button color="light" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {confirmDelete && (
        <ConfirmModal
          open={Boolean(confirmDelete)}
          title="Delete tag"
          description="This will soft delete the tag and hide it from selection lists."
          confirmLabel="Delete"
          confirmColor="failure"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default TagsPage;
