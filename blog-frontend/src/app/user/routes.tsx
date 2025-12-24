import { Navigate, Route } from 'react-router-dom';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Profile from './pages/Profile';

const userRoutes = [
  <Route index element={<Home />} key="user-home" />,
  <Route path="articles/:id" element={<ArticleDetail />} key="user-article-detail" />,
  <Route path="profile" element={<Navigate to="/profile" replace />} key="user-profile" />,
];

export default userRoutes;
