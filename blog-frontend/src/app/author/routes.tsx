import { Route } from 'react-router-dom';
import AuthorDashboard from './pages/AuthorDashboard';
import AuthorArticlesPage from './pages/AuthorArticlesPage';
import AuthorArticleEditorPage from './pages/AuthorArticleEditorPage';

const authorRoutes = [
  <Route index element={<AuthorDashboard />} key="author-dashboard" />,
  <Route path="articles" element={<AuthorArticlesPage />} key="author-articles" />,
  <Route path="articles/new" element={<AuthorArticleEditorPage />} key="author-article-new" />,
  <Route
    path="articles/:articleId/edit"
    element={<AuthorArticleEditorPage />}
    key="author-article-edit"
  />,
];

export default authorRoutes;
