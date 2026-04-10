import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import StoresPage from './pages/StoresPage';
import StoreDetailPage from './pages/StoreDetailPage';
import { TimezoneProvider } from './contexts/TimezoneContext';

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
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/stores" replace />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/stores/:id" element={<StoreDetailPage />} />
        </Route>
      </Routes>
      </TimezoneProvider>
    </ThemeProvider>
  );
}
