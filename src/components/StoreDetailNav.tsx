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
import PaymentIcon from '@mui/icons-material/Payment';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import type { StoreAdminDetail } from '../types/api';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CreditCardIcon from '@mui/icons-material/CreditCard';

export type StoreMenu = 'STORE_INFO' | 'STORE_AUDIT' | 'ORDER_TICKETS' | 'ORDER_SESSIONS' | 'CHECK' | 'PRINT_JOB' | 'PAYMENT_INTENT' | 'TRANSACTIONS';

export const menuItems: { key: StoreMenu; label: string; icon: React.ReactNode }[] = [
  { key: 'STORE_INFO', label: 'store info', icon: <InfoOutlinedIcon fontSize="small" /> },
  { key: 'ORDER_TICKETS', label: 'Tickets', icon: <LocalOfferIcon fontSize="small" /> },
  { key: 'ORDER_SESSIONS', label: 'Order Sessions', icon: <RoomServiceIcon fontSize="small" /> },
  { key: 'CHECK', label: 'Checks', icon: <ReceiptLongIcon fontSize="small" /> },
  { key: 'PRINT_JOB', label: 'Print jobs', icon: <PrintIcon fontSize="small" /> },
  { key: 'PAYMENT_INTENT', label: 'Payment Intents', icon: <PaymentIcon fontSize="small" /> },
  { key: 'TRANSACTIONS', label: 'Transactions', icon: <CreditCardIcon fontSize="small" /> },
  { key: 'STORE_AUDIT', label: 'Audit logs', icon: <HistoryIcon fontSize="small" /> },
];

interface StoreDetailNavProps {
  store: StoreAdminDetail;
  navOpen: boolean;
  setNavOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  activeMenu: StoreMenu;
  setActiveMenu: (menu: StoreMenu) => void;
}

export default function StoreDetailNav({
  store,
  navOpen,
  setNavOpen,
  activeMenu,
  setActiveMenu,
}: StoreDetailNavProps) {
  return (
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

      {navOpen ? (
        <Box sx={{ overflow: 'hidden', px: 1, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} title={store.storeName} noWrap>
            {store.storeName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.4, flexWrap: 'wrap' }}>
            <Chip
              label={store.isActive ? 'active' : 'inactive'}
              size="small"
              color={store.isActive ? 'success' : 'default'}
              sx={{ fontSize: 10, height: 18 }}
            />
            {store.posName && (
              <Chip
                label={store.posName}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10, height: 18 }}
              />
            )}
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
  );
}
