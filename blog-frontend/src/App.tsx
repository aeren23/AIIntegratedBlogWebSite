import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AuthorLayout from './layouts/AuthorLayout';
import UserLayout from './layouts/UserLayout';
import PublicLayout from './layouts/PublicLayout';
import RoleGuard from './guards/RoleGuard';
import adminRoutes from './app/admin/routes';
import authorRoutes from './app/author/routes';
import userRoutes from './app/user/routes';
import publicRoutes from './app/public/routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          {publicRoutes}
        </Route>

        <Route
          path="/user"
          element={
            <RoleGuard roles={['USER', 'AUTHOR', 'ADMIN', 'SUPERADMIN']}>
              <UserLayout />
            </RoleGuard>
          }
        >
          {userRoutes}
        </Route>

        <Route
          path="/author"
          element={
            <RoleGuard roles={['AUTHOR', 'ADMIN', 'SUPERADMIN']}>
              <AuthorLayout />
            </RoleGuard>
          }
        >
          {authorRoutes}
        </Route>

        <Route
          path="/admin"
          element={
            <RoleGuard roles={['ADMIN', 'SUPERADMIN']}>
              <AdminLayout />
            </RoleGuard>
          }
        >
          {adminRoutes}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
