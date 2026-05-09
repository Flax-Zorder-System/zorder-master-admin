import {
  Box,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { CheckBrief, OrderSessionDetail, OrderTicketBrief } from '../types/orderSession';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { usePageTitle } from '../hooks/usePageTitle';

// ── 배지 ──────────────────────────────────────────────────────

const SESSION_STATUS_BG: Record<string, string> = {
  OPEN: '#f5f5f5', SEATED: '#e3f2fd', ORDERED: '#e8f5e9',
  CONFIRMED_ALL: '#ede7f6', CHECK_REQUESTED: '#fff8e1',
  POS_INTEGRATION_FAILED: '#ffebee', CLOSED: '#f3e5f5', CANCELLED: '#fafafa',
};
const SESSION_STATUS_COLOR: Record<string, string> = {
  OPEN: '#9e9e9e', SEATED: '#1565c0', ORDERED: '#2e7d32',
  CONFIRMED_ALL: '#4527a0', CHECK_REQUESTED: '#f57f17',
  POS_INTEGRATION_FAILED: '#c62828', CLOSED: '#6a1b9a', CANCELLED: '#bdbdbd',
};
const CHECK_STATUS_BG: Record<string, string> = {
  OPEN: '#e3f2fd', PAID: '#e8f5e9', CLOSED: '#f3e5f5',
};
const CHECK_STATUS_COLOR: Record<string, string> = {
  OPEN: '#1565c0', PAID: '#2e7d32', CLOSED: '#6a1b9a',
};

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <Typography
      variant="caption"
      sx={{ px: 1, py: 0.4, borderRadius: 0.75, bgcolor: bg, color, fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}
    >
      {label}
    </Typography>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
      <Typography sx={{ color: 'text.secondary', minWidth: 160, fontSize: 13 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{value ?? '—'}</Typography>
    </Box>
  );
}

// ── 테이블 스타일 ──────────────────────────────────────────────

const CELL = { fontSize: 12, py: 0.75 } as const;
const HEAD_CELL = { ...CELL, fontWeight: 700, color: 'text.secondary', fontSize: 11, bgcolor: 'grey.50' } as const;

// ── Order Tickets 테이블 ───────────────────────────────────────

function OrderTicketsTable({ tickets, storeId }: { tickets: OrderTicketBrief[]; storeId: string }) {
  const { timezone } = useTimezone();
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...HEAD_CELL, width: '35%' }}>ticket id</TableCell>
          <TableCell sx={{ ...HEAD_CELL, width: 60 }}>#</TableCell>
          <TableCell sx={{ ...HEAD_CELL, width: 100 }}>channel</TableCell>
          <TableCell sx={{ ...HEAD_CELL, width: 60, textAlign: 'center' }}>read</TableCell>
          <TableCell sx={HEAD_CELL}>createdAt</TableCell>
          <TableCell sx={HEAD_CELL}>confirmedAt</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tickets.map((t) => (
          <TableRow
            key={t.id}
            hover
            sx={{ cursor: 'pointer' }}
            onClick={() => window.open(`/stores/${storeId}/tickets/${t.id}`, '_blank')}
          >
            <TableCell sx={{ ...CELL, fontFamily: 'monospace', fontSize: 11 }}>{t.id}</TableCell>
            <TableCell sx={CELL}>{t.dailyOrderNo ?? '—'}</TableCell>
            <TableCell sx={CELL}>{t.orderChannelLabel}</TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'center' }}>
              {t.isRead ? (
                <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}>Y</Typography>
              ) : (
                <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }}>N</Typography>
              )}
            </TableCell>
            <TableCell sx={{ ...CELL, whiteSpace: 'nowrap' }}>{formatWithTimezone(t.createdAt, timezone)}</TableCell>
            <TableCell sx={{ ...CELL, whiteSpace: 'nowrap' }}>{t.confirmedAt ? formatWithTimezone(t.confirmedAt, timezone) : '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Checks 테이블 ─────────────────────────────────────────────

function ChecksTable({ checks }: { checks: CheckBrief[] }) {
  const { timezone } = useTimezone();
  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...HEAD_CELL, width: '25%' }}>check id</TableCell>
          <TableCell sx={{ ...HEAD_CELL, width: '20%' }}>parent id</TableCell>
          <TableCell sx={{ ...HEAD_CELL, width: 80 }}>status</TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 80 }}>subtotal</TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 70 }}>tax</TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 80 }}>svc charge</TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 80 }}>gratuity</TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 70 }}>tip</TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 80, fontWeight: 700 }}>total</TableCell>
          <TableCell sx={HEAD_CELL}>createdAt</TableCell>
          <TableCell sx={HEAD_CELL}>closedAt</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {checks.map((c) => (
          <TableRow
            key={c.id}
            hover
            sx={{ cursor: 'pointer' }}
            onClick={() => window.open(`/checks/${c.id}`, '_blank')}
          >
            <TableCell sx={{ ...CELL, fontFamily: 'monospace', fontSize: 11 }}>{c.id}</TableCell>
            <TableCell sx={{ ...CELL, fontFamily: 'monospace', fontSize: 11 }}>{c.parentId ?? '—'}</TableCell>
            <TableCell sx={CELL}>
              <Typography
                variant="caption"
                sx={{
                  px: 0.75, py: 0.2, borderRadius: 0.5,
                  bgcolor: CHECK_STATUS_BG[c.statusLabel] ?? '#f5f5f5',
                  color: CHECK_STATUS_COLOR[c.statusLabel] ?? '#616161',
                  fontWeight: 600,
                }}
              >
                {c.statusLabel}
              </Typography>
            </TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'right' }}>{fmt(c.subtotal)}</TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'right' }}>{c.taxAmount > 0 ? fmt(c.taxAmount) : '—'}</TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'right' }}>{c.serviceChargeAmount > 0 ? fmt(c.serviceChargeAmount) : '—'}</TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'right' }}>{c.gratuityAmount > 0 ? fmt(c.gratuityAmount) : '—'}</TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'right' }}>{c.tipAmount > 0 ? fmt(c.tipAmount) : '—'}</TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'right', fontWeight: 700 }}>{fmt(c.totalAmount)}</TableCell>
            <TableCell sx={{ ...CELL, whiteSpace: 'nowrap' }}>{formatWithTimezone(c.createdAt, timezone)}</TableCell>
            <TableCell sx={{ ...CELL, whiteSpace: 'nowrap' }}>{c.closedAt ? formatWithTimezone(c.closedAt, timezone) : '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── 섹션 제목 ──────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
      {children}
    </Typography>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function OrderSessionDetailPage() {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const { timezone } = useTimezone();
  const [detail, setDetail] = useState<OrderSessionDetail | null>(null);
  usePageTitle(detail ? `Session · ${detail.tableName ?? detail.id.slice(0, 8)}` : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !sessionId) return;
    setLoading(true);
    api
      .getOrderSessionDetail(Number(id), sessionId)
      .then(setDetail)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, sessionId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !detail) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error ?? 'Session not found.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3, bgcolor: 'white', mt: 3 }}>
      {/* Title */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
            {detail.tableName ?? 'Order Session'}
          </Typography>
          <Badge
            label={detail.statusLabel}
            bg={SESSION_STATUS_BG[detail.statusLabel] ?? '#f5f5f5'}
            color={SESSION_STATUS_COLOR[detail.statusLabel] ?? '#616161'}
          />
          <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#e8eaf6', color: '#283593', fontWeight: 600 }}>
            {detail.orderTypeLabel}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Info */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
        <Box>
          <SectionTitle>Info</SectionTitle>
          <InfoRow label="Session ID" value={<Typography component="span" sx={{ fontSize: 13, fontFamily: 'monospace' }}>{detail.id}</Typography>} />
          {detail.orderId && <InfoRow label="Order ID" value={<Typography component="span" sx={{ fontSize: 13, fontFamily: 'monospace' }}>{detail.orderId}</Typography>} />}
          <InfoRow label="Table" value={detail.tableName} />
          <InfoRow label="Total Guests" value={detail.totalGuestCount} />
          {detail.guestTiers.length > 0 && (
            <InfoRow
              label="Guest Tiers"
              value={detail.guestTiers.map((t) => `${t.tierName}: ${t.guestCount}`).join(', ')}
            />
          )}
          <InfoRow label="AYCE Menu" value={detail.ayceMenuId != null ? `ID ${detail.ayceMenuId}` : null} />
          <InfoRow
            label="Age Verified"
            value={detail.isAgeVerified ? `${detail.ageVerifiedGuestCount} guests` : 'No'}
          />
        </Box>
        <Box>
          <SectionTitle>Timestamps</SectionTitle>
          <InfoRow label="Created" value={formatWithTimezone(detail.createdAt, timezone)} />
          <InfoRow label="Updated" value={formatWithTimezone(detail.updatedAt, timezone)} />
          <InfoRow label="Closed" value={detail.closedAt ? formatWithTimezone(detail.closedAt, timezone) : '—'} />
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Order Tickets */}
      <SectionTitle>Order Tickets ({detail.orderTickets.length})</SectionTitle>
      {detail.orderTickets.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>No tickets.</Typography>
      ) : (
        <Box sx={{ mb: 3 }}>
          <OrderTicketsTable tickets={detail.orderTickets} storeId={id!} />
        </Box>
      )}

      <Divider sx={{ mb: 2.5 }} />

      {/* Checks */}
      <SectionTitle>Checks ({detail.checks.length})</SectionTitle>
      {detail.checks.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>No checks.</Typography>
      ) : (
        <ChecksTable checks={detail.checks} />
      )}
    </Box>
  );
}
