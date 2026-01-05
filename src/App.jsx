import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const [presentationMode, setPresentationMode] = useState(false);
  const { currentUser } = useAuth();

  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode);
  };

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout
              presentationMode={presentationMode}
              onTogglePresentation={togglePresentationMode}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="gantt" element={<GanttView />} />
        <Route path="colaboraciones" element={<CollaborationList />} />
        <Route path="colaboraciones/nuevo" element={<CollaborationEdit />} />
        <Route path="colaboraciones/:id" element={<CollaborationView />} />
        <Route path="colaboraciones/:id/editar" element={<CollaborationEdit />} />
        <Route path="usuarios" element={<UserManagement />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
