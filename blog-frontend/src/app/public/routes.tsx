import { Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import RoleGuard from '../../guards/RoleGuard';
import Profile from '../user/pages/Profile';
import ArticleDetailPage from './pages/ArticleDetailPage';
import CategoryPage from './pages/CategoryPage';
import TagPage from './pages/TagPage';
import SearchPage from './pages/SearchPage';

const publicRoutes = [
  <Route index element={<HomePage />} key="public-home" />,
  <Route path="landing" element={<LandingPage />} key="public-landing" />,
  <Route path="articles/:slug" element={<ArticleDetailPage />} key="public-article-detail" />,
  <Route path="category/:slug" element={<CategoryPage />} key="public-category" />,
  <Route path="tag/:slug" element={<TagPage />} key="public-tag" />,
  <Route path="search" element={<SearchPage />} key="public-search" />,
  <Route path="login" element={<LoginPage />} key="public-login" />,
  <Route path="register" element={<RegisterPage />} key="public-register" />,
  <Route
    path="profile"
    element={
      <RoleGuard roles={['USER', 'AUTHOR', 'ADMIN', 'SUPERADMIN']}>
        <Profile />
      </RoleGuard>
    }
    key="public-profile"
  />,
  <Route path="unauthorized" element={<UnauthorizedPage />} key="public-unauthorized" />,
  <Route path="*" element={<NotFoundPage />} key="public-not-found" />,
];

export default publicRoutes;
