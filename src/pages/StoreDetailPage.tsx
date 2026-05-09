import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StoreDetail from '../components/StoreDetail';
import AuditLogs from '../components/AuditLogs';
import StoreDetailNav, { type StoreMenu } from '../components/StoreDetailNav';
import { api } from '../lib/api';
import type { StoreAdminDetail } from '../types/api';

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeMenu, setActiveMenu] = useState<StoreMenu>('store info');
  const [navOpen, setNavOpen] = useState(true);
  const [store, setStore] = useState<StoreAdminDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <StoreDetailNav
        store={store}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.100' }}>
        {activeMenu === 'store info' && <StoreDetail store={store} />}
        {activeMenu === 'audit logs' && <AuditLogs storeId={store.storeId} />}
      </Box>
    </Box>
  );
}
