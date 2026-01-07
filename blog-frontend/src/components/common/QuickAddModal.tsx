import { useState } from 'react';
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, TextInput } from 'flowbite-react';
import { HiPlus, HiFolder, HiTag } from 'react-icons/hi';

type QuickAddType = 'category' | 'tag';

type QuickAddModalProps = {
  type: QuickAddType;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, slug: string) => Promise<void>;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const QuickAddModal = ({ type, isOpen, onClose, onSubmit }: QuickAddModalProps) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCategory = type === 'category';
  const title = isCategory ? 'Quick Add Category' : 'Quick Add Tag';
  const Icon = isCategory ? HiFolder : HiTag;
  const accentColor = isCategory ? 'violet' : 'amber';

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(name.trim(), slug.trim());
      // Reset form
      setName('');
      setSlug('');
      setSlugTouched(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSlug('');
    setSlugTouched(false);
    setError(null);
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={handleClose} size="md">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${isCategory ? 'from-violet-500 to-purple-600' : 'from-amber-500 to-orange-600'} shadow-md`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <span>{title}</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quick-add-name">Name</Label>
            <TextInput
              id="quick-add-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={isCategory ? 'e.g., Technology' : 'e.g., JavaScript'}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-add-slug">Slug</Label>
            <TextInput
              id="quick-add-slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder={isCategory ? 'e.g., technology' : 'e.g., javascript'}
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500">
              URL-friendly identifier. Auto-generated from name.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex w-full justify-end gap-2">
          <Button color="light" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className={`${isCategory ? '!bg-violet-600 hover:!bg-violet-700' : '!bg-amber-500 hover:!bg-amber-600'} !text-white`}
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !slug.trim()}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <HiPlus className="mr-1 h-4 w-4" />
                Create {isCategory ? 'Category' : 'Tag'}
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default QuickAddModal;
