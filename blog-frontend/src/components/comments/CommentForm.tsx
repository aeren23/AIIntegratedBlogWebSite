import { type FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Textarea } from 'flowbite-react';

type CommentFormProps = {
  onSubmit: (content: string) => Promise<void> | void;
  onCancel?: () => void;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  helperText?: string;
  disabled?: boolean;
  resetOnSubmit?: boolean;
};

const MAX_LENGTH = 1000;

const CommentForm = ({
  onSubmit,
  onCancel,
  initialValue = '',
  placeholder = 'Share your thoughts...',
  submitLabel = 'Post comment',
  cancelLabel = 'Cancel',
  helperText,
  disabled = false,
  resetOnSubmit = true,
}: CommentFormProps) => {
  const [content, setContent] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || isSubmitting) {
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }

    if (trimmed.length > MAX_LENGTH) {
      setError(`Keep comments under ${MAX_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      if (resetOnSubmit) {
        setContent('');
      }
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to submit comment.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <Alert color="failure">
          <span className="font-medium">Comment error.</span> {error}
        </Alert>
      )}
      {helperText && <p className="text-sm text-slate-500">{helperText}</p>}
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={disabled || isSubmitting}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          {content.trim().length}/{MAX_LENGTH}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              color="light"
              size="sm"
              className="border-slate-200 text-slate-600"
              onClick={onCancel}
              disabled={disabled || isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            className="!border-teal-200 !bg-teal-500 !text-white hover:!bg-teal-600"
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? 'Sending...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
