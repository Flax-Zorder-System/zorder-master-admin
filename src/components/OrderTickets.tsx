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
import type { OrderTicket } from '../types/orderTicket';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { DateRangeFilter, useDateRangeFilter } from './ui/DateRangeFilter';

// ── 상태 배지 ──────────────────────────────────────────

const PAYMENT_COLOR: Record<string, string> = {
  Open: '#e3f2fd',
  Paid: '#e8f5e9',
  Closed: '#f3e5f5',
  Voided: '#ffebee',
  Refunded: '#fff3e0',
  'Partially paid': '#e8f5e9',
  'Partially refunded': '#fff3e0',
};

const PAYMENT_TEXT_COLOR: Record<string, string> = {
  Open: '#1565c0',
  Paid: '#2e7d32',
  Closed: '#6a1b9a',
  Voided: '#c62828',
  Refunded: '#e65100',
  'Partially paid': '#388e3c',
  'Partially refunded': '#bf360c',
};

const PREP_COLOR: Record<string, string> = {
  '': '#f5f5f5',
  'On hold': '#fff8e1',
  Fired: '#e8f5e9',
};

const PREP_TEXT_COLOR: Record<string, string> = {
  '': '#9e9e9e',
  'On hold': '#f57f17',
  Fired: '#2e7d32',
};

function StatusBadge({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <Typography
      variant="caption"
      sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: bg, color, fontWeight: 600, whiteSpace: 'nowrap' }}
    >
      {label || '—'}
    </Typography>
  );
}

// ── 행 ─────────────────────────────────────────────────

function TicketRow({ ticket, onClick }: { ticket: OrderTicket; onClick: () => void }) {
  const { timezone } = useTimezone();

  return (
    <TableRow hover onClick={onClick} sx={{ cursor: 'pointer' }}>
      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{ticket.orderTicketId}</TableCell>
      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{ticket.dailyOrderNo}</TableCell>
      <TableCell sx={{ fontSize: 12 }}>{ticket.tableName}</TableCell>
      <TableCell sx={{ fontSize: 12 }}>{ticket.orderChannelName}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <StatusBadge
            label={ticket.paymentStatus}
            bg={PAYMENT_COLOR[ticket.paymentStatus] ?? '#f5f5f5'}
            color={PAYMENT_TEXT_COLOR[ticket.paymentStatus] ?? '#616161'}
          />
          {ticket.prepStatus && (
            <StatusBadge
              label={ticket.prepStatus}
              bg={PREP_COLOR[ticket.prepStatus] ?? '#f5f5f5'}
              color={PREP_TEXT_COLOR[ticket.prepStatus] ?? '#616161'}
            />
          )}
        </Box>
      </TableCell>
      <TableCell sx={{ fontSize: 12 }}>
        <Tooltip title={ticket.firstItemName} placement="top">
          <Typography variant="body2" sx={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ticket.firstItemQty} × {ticket.firstItemName}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>
        ${(ticket.totalAmount / 100).toFixed(2)}
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'center' }}>{ticket.totalGuestCount}</TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'center' }}>
        {ticket.receiptRequested ? (
          <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}>
            pending
          </Typography>
        ) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {formatWithTimezone(ticket.createdAt, timezone)}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {ticket.confirmedAt ? formatWithTimezone(ticket.confirmedAt, timezone) : '—'}
      </TableCell>
    </TableRow>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export default function OrderTickets({ storeId }: { storeId: number }) {
  const [tickets, setTickets] = useState<OrderTicket[]>([]);
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
      .getOrderTickets(storeId, {
        page: page + 1,
        pageSize: rowsPerPage,
        startDate: dateFilter.startDate ? dateFilter.startISO : undefined,
        endDate: dateFilter.endDate ? dateFilter.endISO : undefined,
      })
      .then((res) => {
        setTickets(res.orderTickets);
        setTotal(res.total);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load tickets'))
      .finally(() => setLoading(false));
  }, [storeId, page, rowsPerPage, dateFilter.startDate, dateFilter.endDate, tick]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Order Tickets</Typography>
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
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80 }}>id</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80 }}>table</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90 }}>channel</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 180 }}>status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 180 }}>first item</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80, textAlign: 'right' }}>amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>guests</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 70, textAlign: 'center' }}>receipt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>createdAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>confirmedAt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                      No tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((t) => (
                    <TicketRow
                      key={t.orderTicketId}
                      ticket={t}
                      onClick={() => window.open(`/stores/${storeId}/tickets/${t.orderTicketId}`, '_blank')}
                    />
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
