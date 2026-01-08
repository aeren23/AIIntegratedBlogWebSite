import { useCallback, useEffect, useState } from 'react';
import { Alert, Button } from 'flowbite-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AdminTableWrapper from '../components/AdminTableWrapper';
import CommentSkeleton from '../../../components/comments/CommentSkeleton';
import CommentTree from '../../../components/comments/CommentTree';
import { useToast } from '../../../contexts/ToastContext';
import {
  deleteComment,
  fetchCommentsByArticle,
  hardDeleteComment,
  type Comment,
} from '../../../api/comment.api';

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
  return 'Unable to load comments.';
};

const ArticleCommentsPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { showSuccess, showError } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (!articleId) {
      setError('Missing article id.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchCommentsByArticle(articleId);
      setComments(response);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert color="failure">
          <span className="font-medium">Comment error.</span> {error}
        </Alert>
      )}

      <AdminTableWrapper
        title="Article Comments"
        description="Moderate discussion threads for this article."
        actions={
          <Button color="purple" onClick={loadComments} disabled={isLoading}>
            Refresh
          </Button>
        }
      >
        {isLoading ? (
          <CommentSkeleton rows={4} />
        ) : (
          <CommentTree
            comments={comments}
            mode="admin"
            emptyMessage="No comments found."
            onSoftDelete={async (commentId) => {
              try {
                await deleteComment(commentId);
                await loadComments();
                showSuccess('Comment deleted successfully!');
              } catch (err) {
                const errorMsg = resolveErrorMessage(err);
                setError(errorMsg);
                showError(errorMsg);
              }
            }}
            onHardDelete={async (commentId) => {
              try {
                await hardDeleteComment(commentId);
                await loadComments();
                showSuccess('Comment permanently deleted!');
              } catch (err) {
                const errorMsg = resolveErrorMessage(err);
                setError(errorMsg);
                showError(errorMsg);
              }
            }}
          />
        )}
      </AdminTableWrapper>
    </div>
  );
};

export default ArticleCommentsPage;
