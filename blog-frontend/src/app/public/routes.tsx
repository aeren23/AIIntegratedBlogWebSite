import { Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import RoleGuard from '../../guards/RoleGuard';
import AuthOnlyGuard from '../../guards/AuthOnlyGuard';
import Profile from './pages/Profile';
import ArticleDetailPage from './pages/ArticleDetailPage';
import CategoryPage from './pages/CategoryPage';
import TagPage from './pages/TagPage';
import SearchPage from './pages/SearchPage';

const publicRoutes = [
  <Route index element={<LandingPage />} key="public-home" />,
  <Route path="landing" element={<LandingPage />} key="public-landing" />,
  <Route path="not-found" element={<NotFoundPage />} key="public-not-found-explicit" />,
  <Route
    path="articles"
    element={
      <AuthOnlyGuard>
        <HomePage />
      </AuthOnlyGuard>
    }
    key="public-articles"
  />,
  <Route
    path="categories"
    element={
      <AuthOnlyGuard>
        <CategoriesPage />
      </AuthOnlyGuard>
    }
    key="public-categories"
  />,
  <Route
    path="articles/:slug"
    element={
      <AuthOnlyGuard>
        <ArticleDetailPage />
      </AuthOnlyGuard>
    }
    key="public-article-detail"
  />,
  <Route
    path="category/:slug"
    element={
      <AuthOnlyGuard>
        <CategoryPage />
      </AuthOnlyGuard>
    }
    key="public-category"
  />,
  <Route
    path="tag/:slug"
    element={
      <AuthOnlyGuard>
        <TagPage />
      </AuthOnlyGuard>
    }
    key="public-tag"
  />,
  <Route
    path="search"
    element={
      <AuthOnlyGuard>
        <SearchPage />
      </AuthOnlyGuard>
    }
    key="public-search"
  />,
  <Route path="login" element={<LoginPage />} key="public-login" />,
  <Route path="register" element={<RegisterPage />} key="public-register" />,
  <Route path="verify-email" element={<VerifyEmailPage />} key="public-verify-email" />,
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
