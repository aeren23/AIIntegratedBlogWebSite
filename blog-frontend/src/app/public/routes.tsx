import { Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

const publicRoutes = [
  <Route index element={<LandingPage />} key="public-home" />,
  <Route path="login" element={<LoginPage />} key="public-login" />,
  <Route path="register" element={<RegisterPage />} key="public-register" />,
  <Route path="unauthorized" element={<UnauthorizedPage />} key="public-unauthorized" />,
  <Route path="*" element={<NotFoundPage />} key="public-not-found" />,
];

export default publicRoutes;
