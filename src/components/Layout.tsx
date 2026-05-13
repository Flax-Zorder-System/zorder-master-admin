import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { TIMEZONE_OPTIONS, useTimezone } from '../contexts/TimezoneContext';
import { useAuth } from '../contexts/AuthContext';

const ENV = (import.meta.env.VITE_APP_ENV ?? 'local') as string;

const envColor: Record<string, 'default' | 'warning' | 'error' | 'success'> = {
  local: 'default',
  dev: 'success',
  stage: 'warning',
  prod: 'error',
};

export default function Layout() {
  const navigate = useNavigate();
  const { timezone, setTimezone } = useTimezone();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="transparent" elevation={1} sx={{ bgcolor: 'white', zIndex: 10, top: 0 }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Tooltip title="홈으로">
            <IconButton size="small" onClick={() => navigate('/stores')} sx={{ mr: 0.5 }}>
              <HomeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

    
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 1, minWidth: 'fit-content' }} >
            Zorder Master Page
          </Typography>

          <Chip
            label={ENV.toUpperCase()}
            size="small"
            color={envColor[ENV] ?? 'default'}
            sx={{ fontSize: 10, height: 18, fontWeight: 700 }}
          />

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Calculator">
            <IconButton size="small" onClick={() => navigate('/calculator')}>
              <CalculateIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Guide">
            <IconButton size="small" onClick={() => navigate('/guide')}>
              <MenuBookIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Timezone selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                size="small"
                variant="standard"
                disableUnderline
                sx={{
                  fontSize: 12,
                  color: 'text.secondary',
                  '& .MuiSelect-select': { py: 0, pr: '20px !important' },
                  '& .MuiSelect-icon': { fontSize: 16 },
                }}
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value} sx={{ fontSize: 13 }}>
                    {tz.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

          <Box sx={{ width: 1, bgcolor: 'white', alignSelf: 'stretch', mx: 1 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mr: 1,  fontSize: '0.8rem' }}>
            {user?.userid ?? ''}
          </Typography>
          <Button size="small" variant="text" color="inherit" onClick={() => void logout()} sx={{minWidth: 'fit-content', fontSize: '0.8rem'}}>
            logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: 'background.default' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
