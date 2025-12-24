import { Alert, Label, Spinner } from 'flowbite-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor as ToastEditor } from '@toast-ui/react-editor';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';
import { uploadArticleImage } from '../../api/article.api';

type ArticleEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  articleId?: string;
  disabled?: boolean;
};

const CODE_LANGUAGES = [
  'plaintext',
  'bash',
  'csharp',
  'css',
  'html',
  'javascript',
  'typescript',
  'json',
  'markdown',
  'sql',
  'yaml',
];

const ArticleEditor = ({ value, onChange, articleId, disabled }: ArticleEditorProps) => {
  const editorRef = useRef<ToastEditor>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(() => {
    const instance = editorRef.current?.getInstance();
    if (!instance) {
      return;
    }
    const markdown = instance.getMarkdown();
    onChange(markdown);
  }, [onChange]);

  const handleImageUpload = useCallback(
    async (blob: Blob, callback: (url: string, altText?: string) => void) => {
      setError(null);

      if (disabled) {
        setError('Editor is read-only.');
        return false;
      }

      if (!articleId) {
        setError('Save the article before uploading images.');
        return false;
      }

      setIsUploading(true);
      try {
        const file =
          blob instanceof File
            ? blob
            : new File([blob], 'image', { type: blob.type || 'application/octet-stream' });
        const response = await uploadArticleImage(articleId, file);
        callback(response.url, file.name);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Image upload failed.';
        setError(message);
      } finally {
        setIsUploading(false);
      }

      return false;
    },
    [articleId, disabled],
  );

  useEffect(() => {
    const instance = editorRef.current?.getInstance();
    if (!instance) {
      return;
    }
    const currentMarkdown = instance.getMarkdown();
    if (currentMarkdown !== value) {
      instance.setMarkdown(value ?? '', false);
    }
  }, [value]);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-sm font-semibold text-slate-700">
          Content (Toast UI Markdown)
        </Label>
        {isUploading && (
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <Spinner size="sm" />
            Uploading...
          </span>
        )}
      </div>

      <ToastEditor
        ref={editorRef}
        initialValue={value || ''}
        previewStyle="vertical"
        height="520px"
        initialEditType="markdown"
        useCommandShortcut
        readOnly={disabled}
        onChange={handleChange}
        plugins={[[codeSyntaxHighlight, { highlighter: Prism }]]}
        hooks={{ addImageBlobHook: handleImageUpload }}
        codeBlockLanguages={CODE_LANGUAGES}
      />

      {error && (
        <Alert color="failure">
          <span className="font-medium">Image upload failed.</span> {error}
        </Alert>
      )}

      <p className="text-xs text-slate-500">
        Markdown is converted to HTML on save. Images are uploaded from the editor and
        stored on the server.
      </p>
    </div>
  );
};

export default ArticleEditor;
