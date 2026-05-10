import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import StoresPage from './pages/StoresPage';
import StoreDetailPage from './pages/StoreDetailPage';
import OrderTicketDetailPage from './pages/OrderTicketDetailPage';
import OrderSessionDetailPage from './pages/OrderSessionDetailPage';
import CheckDetailPage from './pages/CheckDetailPage';
import PaymentDetailPage from './pages/PaymentDetailPage';
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
      '"Pretendard Variable"',
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
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
              <Route path="/stores/:id/tickets/:ticketId" element={<OrderTicketDetailPage />} />
              <Route path="/stores/:id/sessions/:sessionId" element={<OrderSessionDetailPage />} />
              <Route path="/stores/:storeId/checks/:checkId" element={<CheckDetailPage />} />
              <Route path="/stores/:storeId/payments/:paymentId" element={<PaymentDetailPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </TimezoneProvider>
    </ThemeProvider>
  );
}
