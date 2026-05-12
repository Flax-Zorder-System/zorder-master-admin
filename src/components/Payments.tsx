import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { PaymentListItem } from '../types/payment';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { DateRangeFilter, useDateRangeFilter } from './ui/DateRangeFilter';

// ── 배지 색상 ──────────────────────────────────────────────────

const STATUS_BG: Record<string, string> = {
  SALE: '#e8f5e9', VOID: '#ffebee', REFUND: '#fff3e0',
};
const STATUS_COLOR: Record<string, string> = {
  SALE: '#2e7d32', VOID: '#c62828', REFUND: '#e65100',
};
const METHOD_BG: Record<string, string> = {
  CARD: '#e3f2fd', CASH: '#e8f5e9', GIFT_CARD: '#f3e5f5', OTHER: '#f5f5f5',
};
const METHOD_COLOR: Record<string, string> = {
  CARD: '#1565c0', CASH: '#2e7d32', GIFT_CARD: '#6a1b9a', OTHER: '#616161',
};
const METHOD_LABEL: Record<string, string> = {
  CARD: 'Card', CASH: 'Cash', GIFT_CARD: 'Gift Card', OTHER: 'Other',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, fontWeight: 600, whiteSpace: 'nowrap', bgcolor: STATUS_BG[status] ?? '#f5f5f5', color: STATUS_COLOR[status] ?? '#616161' }}>
      {status}
    </Typography>
  );
}

function MethodBadge({ method }: { method: string }) {
  return (
    <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, fontWeight: 600, whiteSpace: 'nowrap', bgcolor: METHOD_BG[method] ?? '#f5f5f5', color: METHOD_COLOR[method] ?? '#616161' }}>
      {METHOD_LABEL[method] ?? method}
    </Typography>
  );
}

const fmt$ = (cents: number | null) => cents != null ? `$${(cents / 100).toFixed(2)}` : '—';

// ── 행 ─────────────────────────────────────────────────────────

function PaymentRow({ p, storeId, timezone }: { p: PaymentListItem; storeId: number; timezone: string }) {
  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      onClick={() => window.open(`/stores/${storeId}/payments/${p.id}`, '_blank')}
    >
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.id}
      </TableCell>
      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{p.checkId}</TableCell>
      <TableCell><StatusBadge status={p.status} /></TableCell>
      <TableCell><MethodBadge method={p.method} /></TableCell>
      <TableCell sx={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{fmt$(p.amount)}</TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right', color: 'text.secondary' }}>{fmt$(p.taxAmount)}</TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right', color: 'text.secondary' }}>{fmt$(p.tipAmount)}</TableCell>
      <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{p.currency}</TableCell>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.transactionId ?? '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, color: 'text.secondary', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Tooltip title={p.detail ?? ''} placement="top" disableHoverListener={!p.detail}>
          <span>{p.detail ?? '—'}</span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatWithTimezone(p.createdAt, timezone)}</TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap', color: p.paidAt ? 'success.dark' : 'text.disabled' }}>
        {p.paidAt ? formatWithTimezone(p.paidAt, timezone) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap', color: p.voidedAt ? 'error.main' : 'text.disabled' }}>
        {p.voidedAt ? formatWithTimezone(p.voidedAt, timezone) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap', color: p.refundedAt ? 'warning.dark' : 'text.disabled' }}>
        {p.refundedAt ? formatWithTimezone(p.refundedAt, timezone) : '—'}
      </TableCell>
    </TableRow>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export default function Payments({ storeId }: { storeId: number }) {
  const { timezone } = useTimezone();
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [tick, setTick] = useState(0);

  const dateFilter = useDateRangeFilter(() => setPage(0));

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getPayments(storeId, {
        page: page + 1,
        pageSize: rowsPerPage,
        startDate: dateFilter.startDate ? dateFilter.startISO : undefined,
        endDate: dateFilter.endDate ? dateFilter.endISO : undefined,
      })
      .then((res) => {
        setPayments(res.items);
        setTotal(res.total);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load payments'))
      .finally(() => setLoading(false));
  }, [storeId, page, rowsPerPage, dateFilter.startDate, dateFilter.endDate, tick]);

  return (
    <Box sx={{ p: 2}}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Payments</Typography>
          <Tooltip title="새로고침">
            <IconButton size="small" onClick={() => setTick((t) => t + 1)} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <DateRangeFilter
          quickRange={dateFilter.quickRange}
          startDate={dateFilter.startDate}
          endDate={dateFilter.endDate}
          onQuickRange={dateFilter.applyQuickRange}
          onStartDate={dateFilter.handleStartDate}
          onEndDate={dateFilter.handleEndDate}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 200 }}>id</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 70 }}>check#</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80 }}>status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90 }}>method</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90, textAlign: 'right' }}>amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 70, textAlign: 'right' }}>tax</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 70, textAlign: 'right' }}>tip</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 60 }}>currency</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 160 }}>transactionId</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 160 }}>detail</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>createdAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>paidAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>voidedAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>refundedAt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <PaymentRow key={p.id} p={p} storeId={storeId} timezone={timezone} />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={PAGE_SIZE_OPTIONS}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        </Paper>
      )}
    </Box>
  );
}
