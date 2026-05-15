import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { OrderCountReportItem } from '../types/api';
import { usePageTitle } from '../hooks/usePageTitle';

export default function StoreOrderReportPage() {
  usePageTitle('Order Count Report');
  const [data, setData] = useState<OrderCountReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStoreOrderCountReport()
      .then((res) => setData(res ?? []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load report'))
      .finally(() => setLoading(false));
  }, []);

  const dates = data[0]?.reports.map((r) => r.date) ?? [];

  return (
    <Box sx={{ p: 2, maxWidth: 1800, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Order Count Report
        </Typography>
        {!loading && (
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            최근 7일 · {data.length} 매장
          </Typography>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table size="small" sx={{ '& .MuiTableHead-root': { position: 'sticky', top: 0, bgcolor: 'grey.50' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', minWidth: 160 }}>
                  store name
                </TableCell>
                {dates.map((date) => (
                  <TableCell
                    key={date}
                    align="center"
                    sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', minWidth: 80 }}
                  >
                    {date}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={dates.length + 1}
                    sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}
                  >
                    No data.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((store) => (
                  <TableRow key={store.storeName} hover>
                    <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{store.storeName}</TableCell>
                    {store.reports.map((r) => (
                      <TableCell
                        key={r.date}
                        align="center"
                        sx={{
                          fontSize: 12,
                          color: r.orderCount === 0 ? 'text.disabled' : 'text.primary',
                        }}
                      >
                        {r.orderCount === 0 ? '-' : r.orderCount}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
