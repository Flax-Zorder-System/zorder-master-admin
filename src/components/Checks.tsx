import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { MasterCheckSummary } from '../types/check';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';

// ── 상태 배지 ──────────────────────────────────────────────────
const STATUS_BG: Record<string, string> = {
  OPEN: '#e3f2fd',
  PAID: '#e8f5e9',
  CLOSED: '#f3e5f5',
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: '#1565c0',
  PAID: '#2e7d32',
  CLOSED: '#6a1b9a',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 0.75, py: 0.2, borderRadius: 0.5,
        bgcolor: STATUS_BG[status] ?? '#f5f5f5',
        color: STATUS_COLOR[status] ?? '#616161',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </Typography>
  );
}

// ── 행 ─────────────────────────────────────────────────────────
function CheckRow({ check }: { check: MasterCheckSummary }) {
  const { timezone } = useTimezone();

  return (
    <TableRow hover onClick={() => window.open(`/checks/${check.id}`, '_blank')} sx={{ cursor: 'pointer' }}>
      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{check.id}</TableCell>
      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{check.parentId}</TableCell>
      <TableCell sx={{ fontSize: 12 }}>{check.tableName ?? '—'}</TableCell>
      <TableCell>
        <StatusBadge status={check.status} />
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>${check.subtotalDollar}</TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>
        {check.taxAmount > 0 ? `$${check.taxAmountDollar}` : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>
        {check.serviceChargeAmount > 0 ? `$${check.serviceChargeAmountDollar}` : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>
        {check.gratuityAmount > 0 ? `$${check.gratuityAmountDollar}` : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>
        {check.serviceFeeAmount > 0 ? `$${check.serviceFeeAmountDollar}` : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>
        {check.tipAmount > 0 ? `$${check.tipAmountDollar}` : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 600 }}>
        ${check.totalAmountDollar}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {formatWithTimezone(check.createdAt, timezone)}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {check.closedAt ? formatWithTimezone(check.closedAt, timezone) : '—'}
      </TableCell>
    </TableRow>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100];

type QuickRange = 'today' | 'yesterday' | 'this week';

function getToday() {
  return new Date().toLocaleDateString('sv-SE');
}

function getRange(range: QuickRange): { start: string; end: string } {
  const now = new Date();
  if (range === 'today') {
    const d = now.toLocaleDateString('sv-SE');
    return { start: d, end: d };
  }
  if (range === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const d = y.toLocaleDateString('sv-SE');
    return { start: d, end: d };
  }
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  return { start: mon.toLocaleDateString('sv-SE'), end: now.toLocaleDateString('sv-SE') };
}

export default function Checks({ storeId }: { storeId: number }) {
  const { timezone } = useTimezone();
  const [checks, setChecks] = useState<MasterCheckSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [quickRange, setQuickRange] = useState<QuickRange>('today');
  const [startDate, setStartDate] = useState(getToday);
  const [endDate, setEndDate] = useState(getToday);

  const applyQuickRange = (range: QuickRange) => {
    const { start, end } = getRange(range);
    setQuickRange(range);
    setStartDate(start);
    setEndDate(end);
    setPage(0);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getChecks(storeId, {
        page: page + 1,
        pageSize: rowsPerPage,
        startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined,
        endDate: endDate ? `${endDate}T00:00:00.000Z` : undefined,
      })
      .then((res) => {
        setChecks(res.checks);
        setTotal(res.total);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load checks'))
      .finally(() => setLoading(false));
  }, [storeId, page, rowsPerPage, startDate, endDate]);

  const handleStartDate = (v: string) => { setQuickRange('today'); setStartDate(v); setPage(0); };
  const handleEndDate = (v: string) => { setQuickRange('today'); setEndDate(v); setPage(0); };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Checks</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <ButtonGroup size="small" variant="outlined">
            {(['today', 'yesterday', 'this week'] as QuickRange[]).map((r) => (
              <Button
                key={r}
                onClick={() => applyQuickRange(r)}
                variant={quickRange === r ? 'contained' : 'outlined'}
                disableElevation
              >
                {r}
              </Button>
            ))}
          </ButtonGroup>

          <TextField
            label="start date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => handleStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          <TextField
            label="end date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => handleEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          <Tooltip title={`Displaying times in ${timezone}`}>
            <Typography variant="caption" color="text.secondary">TZ: {timezone}</Typography>
          </Tooltip>
        </Box>
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
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>id</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>pid</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90 }}>table</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80 }}>status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90, textAlign: 'right' }}>subtotal</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80, textAlign: 'right' }}>tax</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 100, textAlign: 'right' }}>svc charge</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90, textAlign: 'right' }}>gratuity</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80, textAlign: 'right' }}>svc fee</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 70, textAlign: 'right' }}>tip</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90, textAlign: 'right' }}>total</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>createdAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>closedAt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                      No checks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  checks.map((c) => <CheckRow key={c.id} check={c} />)
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
