import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import StoresPage from './pages/StoresPage';
import StoreDetailPage from './pages/StoreDetailPage';
import LoginPage from './pages/LoginPage';
import { TimezoneProvider } from './contexts/TimezoneContext';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    background: { default: '#f5f5f5' },
  },
  typography: {
    htmlFontSize: 16,
    fontSize: 16,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TimezoneProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/stores" replace />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/stores/:id" element={<StoreDetailPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </TimezoneProvider>
    </ThemeProvider>
  );
}
