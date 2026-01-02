import { type FormEvent, useEffect, useState } from 'react';
import { Alert } from 'flowbite-react';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert color="failure" className="rounded-xl">
          <span className="font-medium">Comment error.</span> {error}
        </Alert>
      )}
      {helperText && <p className="text-sm text-slate-500">{helperText}</p>}
      
      <div className="relative">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={placeholder}
          rows={3}
          disabled={disabled || isSubmitting}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
          {content.trim().length}/{MAX_LENGTH}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled || isSubmitting}
            className="rounded-full px-5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
