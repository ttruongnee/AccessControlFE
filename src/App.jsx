import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main pages
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import UserList from './pages/users/UserList';
import RoleList from './pages/roles/RoleList';
import FunctionList from './pages/functions/FunctionList';

// Assignment pages
import AssignRolesToUser from './pages/users/AssignRoles';
import AssignFunctionsToUser from './pages/users/AssignFunctions';
import AssignFunctionsToRole from './pages/roles/AssignFunctions';
import UserPermissions from './pages/users/UserPermissions';

import './App.css';

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route component
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Users */}
            <Route path="users" element={<UserList />} />
            <Route path="users/:userId/assign-roles" element={<AssignRolesToUser />} />
            <Route path="users/:userId/assign-functions" element={<AssignFunctionsToUser />} />
            <Route path="users/:userId/permissions" element={<UserPermissions />} />

            {/* Roles */}
            <Route path="roles" element={<RoleList />} />
            <Route path="roles/:roleId/assign-functions" element={<AssignFunctionsToRole />} />

            {/* Functions */}
            <Route path="functions" element={<FunctionList />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;