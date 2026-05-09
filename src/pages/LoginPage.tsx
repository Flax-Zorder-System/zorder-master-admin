import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';

const ENV = (import.meta.env.VITE_APP_ENV ?? 'local') as string;
const envColor: Record<string, 'default' | 'warning' | 'error' | 'success'> = {
  local: 'default',
  dev: 'success',
  stage: 'warning',
  prod: 'error',
};

export default function LoginPage() {
  usePageTitle('Login');
  const { login } = useAuth();
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(userid, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.100' }}>
      {/* ENV badge */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5 }}>
        <Chip
          label={ENV.toUpperCase()}
          size="small"
          color={envColor[ENV] ?? 'default'}
          sx={{ fontSize: 10, height: 18, fontWeight: 700 }}
        />
      </Box>

      {/* Login card */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, width: 360 }} elevation={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
            Zorder Master
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="userid"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              size="small"
              autoComplete="username"
              required
              fullWidth
            />
            <TextField
              label="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              autoComplete="current-password"
              required
              fullWidth
            />
            {error && (
              <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : '로그인'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
