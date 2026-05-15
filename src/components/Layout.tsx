import {
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { TIMEZONE_OPTIONS, useTimezone } from '../contexts/TimezoneContext';
import { useAuth } from '../contexts/AuthContext';

const ENV = (import.meta.env.VITE_APP_ENV ?? 'local') as string;

const envColor: Record<string, 'default' | 'warning' | 'error' | 'success'> = {
  local: 'default',
  dev: 'success',
  stage: 'warning',
  prod: 'error',
};

const NAV_ITEMS = [
  { key: 'stores', label: 'Stores', icon: <StorefrontIcon fontSize="small" />, path: '/stores' },
  { key: 'report', label: 'Order Count Report', icon: <BarChartIcon fontSize="small" />, path: '/report/order-count' },
  { key: 'guide', label: 'Guide', icon: <MenuBookIcon fontSize="small" />, path: '/guide' },
];

const APPBAR_HEIGHT = 48;
const SIDEBAR_OPEN = 200;
const SIDEBAR_CLOSED = 48;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { timezone, setTimezone } = useTimezone();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeKey = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.key ?? '';
  const isStoreDetail = /^\/stores\/\d+/.test(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top AppBar */}
      <AppBar position="sticky" color="transparent" elevation={1} sx={{ bgcolor: 'white', zIndex: 20, top: 0, height: APPBAR_HEIGHT }}>
        <Toolbar variant="dense" sx={{ gap: 1, minHeight: `${APPBAR_HEIGHT}px !important` }}>
          <Tooltip title="홈으로">
            <IconButton size="small" onClick={() => navigate('/stores')} sx={{ mr: 0.5 }}>
              <HomeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, mr: 1, minWidth: 'fit-content', display: { xs: 'none', sm: 'block' } }}
          >
            Zorder Master
          </Typography>

          <Chip
            label={ENV.toUpperCase()}
            size="small"
            color={envColor[ENV] ?? 'default'}
            sx={{ fontSize: 10, height: 18, fontWeight: 700 }}
          />

          <Box sx={{ flex: 1 }} />

          {/* Timezone selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              size="small"
              variant="standard"
              disableUnderline
              renderValue={(val) => {
                const opt = TIMEZONE_OPTIONS.find((tz) => tz.value === val);
                if (!opt) return val;
                const match = opt.label.match(/\(([A-Z]{2,5})/);
                return isMobile ? (match?.[1] ?? opt.label) : opt.label;
              }}
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

          <Box sx={{ width: 1, bgcolor: 'white', alignSelf: 'stretch', mx: { xs: 0.5, sm: 1 } }} />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mr: 1, fontSize: '0.8rem', display: { xs: 'none', sm: 'block' } }}
          >
            {user?.userid ?? ''}
          </Typography>

          {isMobile ? (
            <Tooltip title={`logout (${user?.userid ?? ''})`}>
              <IconButton size="small" onClick={() => void logout()} color="inherit">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Button size="small" variant="text" color="inherit" onClick={() => void logout()} sx={{ minWidth: 'fit-content', fontSize: '0.8rem' }}>
              logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Body: sidebar + content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Global Sidebar — StoreDetail에서는 숨김 (자체 사이드바 사용) */}
        {!isStoreDetail && <Box
          sx={{
            width: sidebarOpen ? SIDEBAR_OPEN : SIDEBAR_CLOSED,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.2s ease',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {/* Toggle button */}
          <Box
            sx={{
              px: 1,
              py: 0.75,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-end' : 'center',
              minHeight: 40,
            }}
          >
            <IconButton size="small" onClick={() => setSidebarOpen((v) => !v)}>
              {sidebarOpen ? <MenuOpenIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
            </IconButton>
          </Box>

          <Divider />

          <List dense disablePadding sx={{ pt: 0.5 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.key}
                selected={activeKey === item.key}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                  minHeight: 36,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  px: sidebarOpen ? 1 : 0,
                  '&.Mui-selected': {
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: sidebarOpen ? 32 : 'unset' }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && (
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { sx: { fontSize: 13 } } }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>}

        {/* Main content */}
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
