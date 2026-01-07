import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';
import RoleGuard from './guards/RoleGuard';
import adminRoutes from './app/admin/routes';
import authorRoutes from './app/author/routes';
import publicRoutes from './app/public/routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & User/Author Layout */}
        <Route path="/" element={<AppLayout />}>
          {publicRoutes}
          <Route
            path="author"
            element={
              <RoleGuard roles={['AUTHOR', 'ADMIN', 'SUPERADMIN']}>
                <Outlet />
              </RoleGuard>
            }
          >
            {authorRoutes}
          </Route>
        </Route>

        {/* Admin Layout - Separate with fixed sidebar */}
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
