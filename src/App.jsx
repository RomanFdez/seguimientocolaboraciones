import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import theme from './theme';
import './styles/main.css';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import GanttView from './pages/GanttView';
import CollaborationList from './pages/CollaborationList';
import CollaborationView from './pages/CollaborationView';
import CollaborationEdit from './pages/CollaborationEdit';
import UserManagement from './pages/UserManagement';
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Root layout that includes providers
const RootProviders = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <DataProvider>
        <Outlet />
      </DataProvider>
    </AuthProvider>
  </ThemeProvider>
);

const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Home /> },
          { path: "gantt", element: <GanttView /> },
          { path: "colaboraciones", element: <CollaborationList /> },
          { path: "colaboraciones/nuevo", element: <CollaborationEdit /> },
          { path: "colaboraciones/:id", element: <CollaborationView /> },
          { path: "colaboraciones/:id/editar", element: <CollaborationEdit /> },
          { path: "usuarios", element: <UserManagement /> },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
