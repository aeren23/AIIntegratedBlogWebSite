import { Route } from 'react-router-dom';
import MyArticlesPage from './pages/MyArticlesPage';
import ArticleEditorPage from './pages/ArticleEditorPage';

const authorRoutes = [
  <Route index element={<MyArticlesPage />} key="author-my-articles" />,
  <Route path="editor" element={<ArticleEditorPage />} key="author-editor" />,
];

export default authorRoutes;
