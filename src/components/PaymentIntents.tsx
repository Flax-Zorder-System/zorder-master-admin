import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
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
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { PaymentIntentSummary, PaymentIntentStatus } from '../types/paymentIntent';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { DateRangeFilter, useDateRangeFilter } from './ui/DateRangeFilter';

// ── 상태 배지 ──────────────────────────────────────────────────

const STATUS_BG: Record<PaymentIntentStatus, string> = {
  PENDING: '#fff8e1',
  SUCCESS: '#e8f5e9',
  FAILED: '#ffebee',
  EXPIRED: '#f5f5f5',
};
const STATUS_COLOR: Record<PaymentIntentStatus, string> = {
  PENDING: '#f57f17',
  SUCCESS: '#2e7d32',
  FAILED: '#c62828',
  EXPIRED: '#9e9e9e',
};

function StatusBadge({ status }: { status: string }) {
  const key = status as PaymentIntentStatus;
  return (
    <Typography
      variant="caption"
      sx={{
        px: 0.75, py: 0.2, borderRadius: 0.5,
        bgcolor: STATUS_BG[key] ?? '#f5f5f5',
        color: STATUS_COLOR[key] ?? '#616161',
        fontWeight: 600, whiteSpace: 'nowrap',
      }}
    >
      {status}
    </Typography>
  );
}

// ── 상세 팝업 ───────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
      <Typography sx={{ color: 'text.secondary', minWidth: 160, fontSize: 13, flexShrink: 0 }}>{label}</Typography>
      <Box sx={{ fontSize: 13, fontWeight: 500, wordBreak: 'break-all' }}>{value ?? <Typography component="span" sx={{ fontSize: 13, color: 'text.disabled' }}>—</Typography>}</Box>
    </Box>
  );
}

function NavButton({ href, label }: { href: string; label: string }) {
  return (
    <Typography
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        fontSize: 11,
        color: 'primary.main',
        textDecoration: 'none',
        border: '1px solid',
        borderColor: 'primary.main',
        borderRadius: 0.75,
        px: 0.75,
        py: 0.2,
        whiteSpace: 'nowrap',
        '&:hover': { bgcolor: 'primary.50' },
      }}
    >
      {label} →
    </Typography>
  );
}

function PaymentIntentDetailDialog({ intent, storeId, onClose }: { intent: PaymentIntentSummary; storeId: number; onClose: () => void }) {
  const { timezone } = useTimezone();
  const fmt = (iso: string | null) => iso ? formatWithTimezone(iso, timezone) : null;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Payment Intent</Typography>
          <StatusBadge status={intent.status} />
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <InfoRow label="ID" value={<Typography component="span" sx={{ fontSize: 12, fontFamily: 'monospace' }}>{intent.id}</Typography>} />
        <InfoRow
          label="Order Session ID"
          value={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography component="span" sx={{ fontSize: 12, fontFamily: 'monospace' }}>{intent.orderSessionId}</Typography>
              <NavButton href={`/stores/${storeId}/sessions/${intent.orderSessionId}`} label="Session 상세" />
            </Box>
          }
        />
        <InfoRow
          label="Order Ticket ID"
          value={
            intent.orderTicketId ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography component="span" sx={{ fontSize: 12, fontFamily: 'monospace' }}>{intent.orderTicketId}</Typography>
                <NavButton href={`/stores/${storeId}/tickets/${intent.orderTicketId}`} label="Ticket 상세" />
              </Box>
            ) : null
          }
        />
        <InfoRow label="Table ID" value={intent.tableId} />
        <InfoRow label="Build Num" value={<Typography component="span" sx={{ fontSize: 12, fontFamily: 'monospace' }}>{intent.buildNum}</Typography>} />
        {intent.reason && (
          <InfoRow
            label="Reason"
            value={
              <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }}>
                {intent.reason}
              </Typography>
            }
          />
        )}
        {intent.detail && <InfoRow label="Detail" value={<Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{intent.detail}</Typography>} />}
        <Divider sx={{ my: 1.5 }} />
        <InfoRow label="Created At" value={fmt(intent.createdAt)} />
        <InfoRow label="Expires At" value={fmt(intent.expiresAt)} />
        <InfoRow label="Finalized At" value={fmt(intent.finalizedAt)} />
      </DialogContent>
    </Dialog>
  );
}

// ── 행 ─────────────────────────────────────────────────────────

function PaymentIntentRow({ intent, onClick }: { intent: PaymentIntentSummary; onClick: () => void }) {
  const { timezone } = useTimezone();

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={onClick}>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {intent.id}
      </TableCell>
      <TableCell>
        <StatusBadge status={intent.status} />
      </TableCell>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{intent.orderSessionId}</TableCell>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{intent.orderTicketId ?? '—'}</TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'center' }}>{intent.tableId}</TableCell>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>{intent.buildNum}</TableCell>
      <TableCell sx={{ fontSize: 12 }}>
        {intent.reason ? (
          <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }}>
            {intent.reason}
          </Typography>
        ) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12 }}>
        {intent.detail ? (
          <Tooltip title={intent.detail} placement="top">
            <Typography sx={{ fontSize: 11, color: 'text.secondary', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {intent.detail}
            </Typography>
          </Tooltip>
        ) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatWithTimezone(intent.expiresAt, timezone)}</TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{intent.finalizedAt ? formatWithTimezone(intent.finalizedAt, timezone) : '—'}</TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatWithTimezone(intent.createdAt, timezone)}</TableCell>
    </TableRow>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export default function PaymentIntents({ storeId }: { storeId: number }) {
  const [intents, setIntents] = useState<PaymentIntentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<PaymentIntentSummary | null>(null);

  const dateFilter = useDateRangeFilter(() => setPage(0));

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getPaymentIntents(storeId, {
        page: page + 1,
        pageSize: rowsPerPage,
        startDate: dateFilter.startDate ? dateFilter.startISO : undefined,
        endDate: dateFilter.endDate ? dateFilter.endISO : undefined,
      })
      .then((res) => {
        setIntents(res.paymentIntents);
        setTotal(res.total);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load payment intents'))
      .finally(() => setLoading(false));
  }, [storeId, page, rowsPerPage, dateFilter.startDate, dateFilter.endDate, tick]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment Intents</Typography>
          <Tooltip
            title={
              <Box sx={{ fontSize: 12, lineHeight: 1.9, p: 0.5 }}>
                <strong>Payment Intent란?</strong>
                <br />
                손님이 태블릿에서 결제 버튼을 누른 순간 생성되는 <strong>결제 시도 기록</strong>입니다.
                <br />
                실제 카드 승인이 완료되기 전까지의 과정을 추적합니다.
                <br /><br />
                • <strong>PENDING</strong> — 결제가 진행 중입니다. 아직 완료되지 않았습니다.
                <br />
                • <strong>SUCCESS</strong> — 결제가 성공적으로 완료됐습니다.
                <br />
                • <strong>FAILED</strong> — 결제 시도가 실패했습니다. reason/detail에서 원인을 확인할 수 있습니다.
                <br />
                • <strong>EXPIRED</strong> — 일정 시간 내 완료되지 않아 자동으로 만료됐습니다.
                <br /><br />
                💡 결제가 실패하거나 이중 청구 문제가 발생했을 때 이 목록에서 원인을 추적할 수 있습니다.
              </Box>
            }
            arrow
            placement="right"
          >
            <HelpOutlineIcon sx={{ fontSize: 16, color: 'text.disabled', cursor: 'default' }} />
          </Tooltip>
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
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90 }}>status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>session id</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>ticket id</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>table</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 140 }}>buildNum</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 100 }}>reason</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 160 }}>detail</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>expiresAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>finalizedAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>createdAt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {intents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                      No payment intents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  intents.map((intent) => <PaymentIntentRow key={intent.id} intent={intent} onClick={() => setSelected(intent)} />)
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

      {selected && (
        <PaymentIntentDetailDialog intent={selected} storeId={storeId} onClose={() => setSelected(null)} />
      )}
    </Box>
  );
}
