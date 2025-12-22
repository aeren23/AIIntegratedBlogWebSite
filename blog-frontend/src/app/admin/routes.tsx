import { Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ArticlesPage from './pages/ArticlesPage';
import ArticleEditorPage from './pages/ArticleEditorPage';
import ArticleCommentsPage from './pages/ArticleCommentsPage';
import UsersPage from './pages/UsersPage';
import CategoriesPage from './pages/CategoriesPage';
import TagsPage from './pages/TagsPage';
import LogsPage from './pages/LogsPage';

const adminRoutes = [
  <Route index element={<Dashboard />} key="admin-dashboard" />,
  <Route path="articles" element={<ArticlesPage />} key="admin-articles" />,
  <Route path="articles/:articleId/edit" element={<ArticleEditorPage />} key="admin-article-edit" />,
  <Route
    path="articles/:articleId/comments"
    element={<ArticleCommentsPage />}
    key="admin-article-comments"
  />,
  <Route path="categories" element={<CategoriesPage />} key="admin-categories" />,
  <Route path="tags" element={<TagsPage />} key="admin-tags" />,
  <Route path="users" element={<UsersPage />} key="admin-users" />,
  <Route path="logs" element={<LogsPage />} key="admin-logs" />,
];

export default adminRoutes;
