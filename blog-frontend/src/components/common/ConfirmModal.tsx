import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'flowbite-react';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'failure' | 'purple' | 'warning' | 'gray' | 'dark' | 'info' | 'success';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'failure',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const toneStyles: Record<
    NonNullable<ConfirmModalProps['confirmColor']>,
    { ring: string; text: string; bg: string }
  > = {
    failure: { ring: 'ring-red-200', text: 'text-red-600', bg: 'bg-red-100' },
    warning: { ring: 'ring-amber-200', text: 'text-amber-700', bg: 'bg-amber-100' },
    success: { ring: 'ring-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-100' },
    info: { ring: 'ring-cyan-200', text: 'text-cyan-700', bg: 'bg-cyan-100' },
    gray: { ring: 'ring-slate-200', text: 'text-slate-600', bg: 'bg-slate-100' },
    dark: { ring: 'ring-slate-300', text: 'text-slate-700', bg: 'bg-slate-200' },
    purple: { ring: 'ring-violet-200', text: 'text-violet-700', bg: 'bg-violet-100' },
  };
  const tone = toneStyles[confirmColor] ?? toneStyles.failure;

  return (
    <Modal show={open} onClose={onCancel} size="md">
      <ModalHeader className="border-b border-slate-200/70 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ${tone.bg} ${tone.ring}`}>
            <span className={`text-sm font-semibold ${tone.text}`}>!</span>
          </div>
          <span className="text-base font-semibold text-slate-900">{title}</span>
        </div>
      </ModalHeader>
      <ModalBody className="bg-white">
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </ModalBody>
      <ModalFooter className="border-t border-slate-200/70 bg-slate-50/70">
        <Button
          color={confirmColor}
          onClick={onConfirm}
          disabled={isLoading}
          className="min-w-[110px] shadow-sm cursor-pointer"
        >
          {isLoading ? 'Working...' : confirmLabel}
        </Button>
        <Button
          color="light"
          onClick={onCancel}
          disabled={isLoading}
          className="min-w-[110px] border-slate-200 text-slate-600 shadow-sm cursor-pointer"
        >
          {cancelLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmModal;
