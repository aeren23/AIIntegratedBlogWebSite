import { Alert, Button, Label, Spinner, Textarea } from 'flowbite-react';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { marked } from 'marked';
import { uploadArticleImage } from '../../api/article.api';

type ArticleEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  articleId?: string;
  disabled?: boolean;
};

marked.setOptions({
  breaks: true,
  gfm: true,
});

const ArticleEditor = ({ value, onChange, articleId, disabled }: ArticleEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insertMarkdown = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${snippet}`);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + snippet.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const wrapSelection = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${before}${placeholder}${after}`);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(
      end,
    )}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + selected.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const insertBlock = (prefix: string, placeholder: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}\n${prefix}${placeholder}${suffix}\n`);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const nextValue = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(
      end,
    )}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + selected.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const handleSelectImage = () => {
    if (disabled) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError(null);

    if (!file) {
      return;
    }

    if (!articleId) {
      setError('Save the article before uploading images.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadArticleImage(articleId, file);
      insertMarkdown(`\n![image](${response.url})\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const previewHtml = useMemo(() => marked.parse(value) as string, [value]);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor="article-content" className="text-sm font-semibold text-slate-700">
          Content (Markdown)
        </Label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              color="light"
              size="xs"
              className="!rounded-lg !border-slate-200 !bg-white !px-2.5 !py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:!bg-slate-100"
              onClick={() => wrapSelection('**', '**', 'bold text')}
              disabled={disabled}
            >
              Bold
            </Button>
            <Button
              color="light"
              size="xs"
              className="!rounded-lg !border-slate-200 !bg-white !px-2.5 !py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:!bg-slate-100"
              onClick={() => wrapSelection('*', '*', 'italic text')}
              disabled={disabled}
            >
              Italic
            </Button>
            <Button
              color="light"
              size="xs"
              className="!rounded-lg !border-slate-200 !bg-white !px-2.5 !py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:!bg-slate-100"
              onClick={() => insertBlock('## ', 'Heading')}
              disabled={disabled}
            >
              H2
            </Button>
            <Button
              color="light"
              size="xs"
              className="!rounded-lg !border-slate-200 !bg-white !px-2.5 !py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:!bg-slate-100"
              onClick={() => insertBlock('> ', 'Quote')}
              disabled={disabled}
            >
              Quote
            </Button>
            <Button
              color="light"
              size="xs"
              className="!rounded-lg !border-slate-200 !bg-white !px-2.5 !py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:!bg-slate-100"
              onClick={() => insertBlock('- ', 'List item')}
              disabled={disabled}
            >
              List
            </Button>
            <Button
              color="light"
              size="xs"
              className="!rounded-lg !border-slate-200 !bg-white !px-2.5 !py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:!bg-slate-100"
              onClick={() => insertBlock('```\n', 'code', '\n```')}
              disabled={disabled}
            >
              Code
            </Button>
            <Button
              color="light"
              size="xs"
              className="!rounded-lg !border-slate-200 !bg-white !px-2.5 !py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:!bg-slate-100"
              onClick={() => wrapSelection('[', '](https://)', 'link text')}
              disabled={disabled}
            >
              Link
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
          <Button
            color="light"
            size="xs"
            className="!rounded-lg !border-slate-200 !bg-white !px-3 !py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:!bg-slate-100"
            onClick={handleSelectImage}
            disabled={disabled || isUploading}
          >
            Insert image
          </Button>
          {isUploading && (
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <Spinner size="sm" />
              Uploading...
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Textarea
          id="article-content"
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={14}
          disabled={disabled}
          className="min-h-[320px] font-mono text-sm text-slate-700"
          placeholder="Write your article in markdown..."
        />
        <div className="min-h-[320px] rounded-xl border border-slate-200/60 bg-slate-50/70 p-4 text-sm text-slate-700">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Preview
          </div>
          <div
            className="space-y-3"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Image upload failed.</span> {error}
        </Alert>
      )}

      <p className="text-xs text-slate-500">
        Markdown is converted to HTML on save. Images are inserted as markdown and stored
        on the server.
      </p>
    </div>
  );
};

export default ArticleEditor;
