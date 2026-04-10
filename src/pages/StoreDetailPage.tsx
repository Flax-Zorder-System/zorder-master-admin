import {
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HistoryIcon from '@mui/icons-material/History';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import StoreDetail from '../components/StoreDetail';
import AuditLogs from '../components/AuditLogs';
import { mockStores } from '../mocks/stores';

type StoreMenu = 'store info' | 'audit logs';

const menuItems: { key: StoreMenu; label: string; icon: React.ReactNode }[] = [
  { key: 'store info', label: 'store info', icon: <InfoOutlinedIcon fontSize="small" /> },
  { key: 'audit logs', label: 'audit logs', icon: <HistoryIcon fontSize="small" /> },
];

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeMenu, setActiveMenu] = useState<StoreMenu>('store info');
  const [navOpen, setNavOpen] = useState(true);

  const store = mockStores.find((s) => s.id === Number(id));

  if (!store) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Store not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left Side Navigation */}
      <Box
        sx={{
          width: navOpen ? 200 : 48,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Toggle + store name header */}
        <Box
          sx={{
            px: 1,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minHeight: 48,
          }}
        >
          <IconButton size="small" onClick={() => setNavOpen((v) => !v)} sx={{ flexShrink: 0 }}>
            {navOpen ? <MenuOpenIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </IconButton>
        </Box>


        {navOpen ? 
        
      
       (
        <Box sx={{ 
          overflow: 'hidden' ,
          px: 1,
          py: 1,
        }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} title={store.name} noWrap>
                {store.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.4, flexWrap: 'wrap' }}>
                <Chip
                  label={store.status}
                  size="small"
                  color={store.status === 'active' ? 'success' : 'default'}
                  sx={{ fontSize: 10, height: 18 }}
                />
                <Chip
                  label={store.type}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 10, height: 18 }}
                />
              </Box>
            </Box>
      ) : null}

       


        <Divider />

        {/* Menu items */}

        <List dense disablePadding sx={{ pt: 0.5 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.key}
              selected={activeMenu === item.key}
              onClick={() => setActiveMenu(item.key)}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                minHeight: 36,
                justifyContent: navOpen ? 'flex-start' : 'center',
                px: navOpen ? 1 : 0,
                '&.Mui-selected': {
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: navOpen ? 32 : 'unset' }}>{item.icon}</ListItemIcon>
              {navOpen && (
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: 13 } } }}
                />
              )}
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.100' }}>
        {activeMenu === 'store info' && <StoreDetail store={store} />}
        {activeMenu === 'audit logs' && <AuditLogs storeId={store.id} />}
      </Box>
    </Box>
  );
}
