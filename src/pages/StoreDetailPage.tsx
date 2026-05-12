import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import StoreDetail from '../components/StoreDetail';
import AuditLogs from '../components/AuditLogs';
import OrderTickets from '../components/OrderTickets';
import Checks from '../components/Checks';
import OrderSessions from '../components/OrderSessions';
import PrintJobs from '../components/PrintJobs';
import PaymentIntents from '../components/PaymentIntents';
import Transactions from '../components/Transactions';
import StoreDetailNav, { menuItems, type StoreMenu } from '../components/StoreDetailNav';
import { api } from '../lib/api';
import type { StoreAdminDetail } from '../types/api';
import { usePageTitle } from '../hooks/usePageTitle';

const VALID_TABS = menuItems.map((m) => m.key);
const TAB_LABEL: Record<StoreMenu, string> = Object.fromEntries(
  menuItems.map((m) => [m.key, m.label])
) as Record<StoreMenu, string>;

function parseTab(raw: string | null): StoreMenu {
  return VALID_TABS.includes(raw as StoreMenu) ? (raw as StoreMenu) : 'STORE_INFO';
}

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMenu = parseTab(searchParams.get('tab'));
  const [navOpen, setNavOpen] = useState(true);

  const setActiveMenu = (menu: StoreMenu) => {
    setSearchParams({ tab: menu }, { replace: true });
  };
  const [store, setStore] = useState<StoreAdminDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(store ? `${store.storeName} · ${TAB_LABEL[activeMenu]}` : null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .getStoreAdminById(Number(id))
      .then(setStore)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load store'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !store) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error ?? 'Store not found.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
      <StoreDetailNav
        store={store}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.100' }}>
        {activeMenu === 'STORE_INFO' && <StoreDetail store={store} />}
        {activeMenu === 'ORDER_TICKETS' && <OrderTickets storeId={store.storeId} />}
        {activeMenu === 'ORDER_SESSIONS' && <OrderSessions storeId={store.storeId} />}
        {activeMenu === 'CHECK' && <Checks storeId={store.storeId} />}
        {activeMenu === 'PRINT_JOB' && <PrintJobs storeId={store.storeId} />}
        {activeMenu === 'PAYMENT_INTENT' && <PaymentIntents storeId={store.storeId} />}
        {activeMenu === 'TRANSACTIONS' && <Transactions storeId={store.storeId} />}
        {activeMenu === 'STORE_AUDIT' && <AuditLogs storeId={store.storeId} />}
      </Box>
    </Box>
  );
}
