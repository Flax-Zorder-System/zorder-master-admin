import {
  Box,
  CircularProgress,
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
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { OrderSessionSummary } from '../types/orderSession';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { DateRangeFilter, toISODate, useDateRangeFilter } from './ui/DateRangeFilter';

// ── 상태 배지 ──────────────────────────────────────────────────

const STATUS_BG: Record<string, string> = {
  OPEN: '#f5f5f5',
  SEATED: '#e3f2fd',
  ORDERED: '#e8f5e9',
  CONFIRMED_ALL: '#ede7f6',
  CHECK_REQUESTED: '#fff8e1',
  POS_INTEGRATION_FAILED: '#ffebee',
  CLOSED: '#f3e5f5',
  CANCELLED: '#fafafa',
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: '#9e9e9e',
  SEATED: '#1565c0',
  ORDERED: '#2e7d32',
  CONFIRMED_ALL: '#4527a0',
  CHECK_REQUESTED: '#f57f17',
  POS_INTEGRATION_FAILED: '#c62828',
  CLOSED: '#6a1b9a',
  CANCELLED: '#bdbdbd',
};

const ORDER_TYPE_BG: Record<string, string> = {
  DINE_IN: '#e8eaf6',
  TO_GO: '#e0f2f1',
};
const ORDER_TYPE_COLOR: Record<string, string> = {
  DINE_IN: '#283593',
  TO_GO: '#00695c',
};

function StatusBadge({ label }: { label: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 0.75, py: 0.2, borderRadius: 0.5,
        bgcolor: STATUS_BG[label] ?? '#f5f5f5',
        color: STATUS_COLOR[label] ?? '#616161',
        fontWeight: 600, whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>
  );
}

function OrderTypeBadge({ label }: { label: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 0.75, py: 0.2, borderRadius: 0.5,
        bgcolor: ORDER_TYPE_BG[label] ?? '#f5f5f5',
        color: ORDER_TYPE_COLOR[label] ?? '#616161',
        fontWeight: 600, whiteSpace: 'nowrap', fontSize: 10,
      }}
    >
      {label}
    </Typography>
  );
}

// ── 행 ─────────────────────────────────────────────────────────

function SessionRow({ session, storeId }: { session: OrderSessionSummary; storeId: number }) {
  const { timezone } = useTimezone();

  const guestTierLabel = session.guestTiers.length > 0
    ? session.guestTiers.map((t) => `${t.tierName}: ${t.guestCount}`).join(', ')
    : null;

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => window.open(`/stores/${storeId}/sessions/${session.id}`, '_blank')}>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session.id}
      </TableCell>
      <TableCell>
        <StatusBadge label={session.statusLabel} />
      </TableCell>
      <TableCell>
        <OrderTypeBadge label={session.orderTypeLabel} />
      </TableCell>
      <TableCell sx={{ fontSize: 12 }}>{session.tableName ?? '—'}</TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'center' }}>{session.totalGuestCount}</TableCell>
      <TableCell sx={{ fontSize: 12 }}>
        {guestTierLabel ? (
          <Tooltip title={guestTierLabel} placement="top">
            <Typography sx={{ fontSize: 11, color: 'text.secondary', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {guestTierLabel}
            </Typography>
          </Tooltip>
        ) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'center' }}>
        {session.ayceMenuId != null ? (
          <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}>
            Y
          </Typography>
        ) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'center' }}>
        {session.isAgeVerified ? (
          <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}>
            {session.ageVerifiedGuestCount}
          </Typography>
        ) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {formatWithTimezone(session.createdAt, timezone)}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {session.closedAt ? formatWithTimezone(session.closedAt, timezone) : '—'}
      </TableCell>
    </TableRow>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export default function OrderSessions({ storeId }: { storeId: number }) {
  const [sessions, setSessions] = useState<OrderSessionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const dateFilter = useDateRangeFilter(() => setPage(0));

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getOrderSessions(storeId, {
        page: page + 1,
        pageSize: rowsPerPage,
        startDate: dateFilter.startDate ? toISODate(dateFilter.startDate) : undefined,
        endDate: dateFilter.endDate ? toISODate(dateFilter.endDate) : undefined,
      })
      .then((res) => {
        setSessions(res.orderSessions);
        setTotal(res.total);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load order sessions'))
      .finally(() => setLoading(false));
  }, [storeId, page, rowsPerPage, dateFilter.startDate, dateFilter.endDate]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Order Sessions</Typography>
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
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 120 }}>id</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 150 }}>status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90 }}>type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80 }}>table</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>guests</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 160 }}>tiers</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>ayce</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 70, textAlign: 'center' }}>age ver.</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>createdAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>closedAt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                      No sessions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s) => <SessionRow key={s.id} session={s} storeId={storeId} />)
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
