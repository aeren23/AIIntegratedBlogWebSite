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
  return (
    <Modal show={open} onClose={onCancel} size="md">
      <ModalHeader className="border-b border-slate-200/70">{title}</ModalHeader>
      <ModalBody>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </ModalBody>
      <ModalFooter className="border-t border-slate-200/70">
        <Button color={confirmColor} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Working...' : confirmLabel}
        </Button>
        <Button color="light" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmModal;
