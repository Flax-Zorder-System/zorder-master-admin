import {
  Box,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { CheckOther, OrderItemDetail, OrderModifierDetail, OrderTicketDetail } from '../types/orderTicket';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';

// ── 색상 맵 ────────────────────────────────────────────────────
const PAYMENT_COLOR: Record<string, string> = {
  Open: '#e3f2fd', Paid: '#e8f5e9', Closed: '#f3e5f5',
  Voided: '#ffebee', Refunded: '#fff3e0',
  'Partially paid': '#e8f5e9', 'Partially refunded': '#fff3e0',
};
const PAYMENT_TEXT_COLOR: Record<string, string> = {
  Open: '#1565c0', Paid: '#2e7d32', Closed: '#6a1b9a',
  Voided: '#c62828', Refunded: '#e65100',
  'Partially paid': '#388e3c', 'Partially refunded': '#bf360c',
};
const PREP_COLOR: Record<string, string> = {
  '': '#f5f5f5', 'On hold': '#fff8e1', Fired: '#e8f5e9',
};
const PREP_TEXT_COLOR: Record<string, string> = {
  '': '#9e9e9e', 'On hold': '#f57f17', Fired: '#2e7d32',
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

// ── Modifier 재귀 렌더 ────────────────────────────────────────
function ModifierRows({ modifiers, depth = 0 }: { modifiers: OrderModifierDetail[]; depth?: number }) {
  if (!modifiers.length) return null;
  return (
    <>
      {modifiers.map((m, i) => (
        <Box key={m.id ?? i}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pl: 2 + depth * 2, py: 0.25 }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {'└ '}
              {m.quantity > 1 ? `${m.quantity}× ` : ''}
              {m.modifierName}
              {m.modifierGroupName && (
                <Typography component="span" sx={{ fontSize: 11, color: 'text.disabled', ml: 0.5 }}>
                  ({m.modifierGroupName})
                </Typography>
              )}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {m.lineSubtotalAmount !== 0 ? `$${(m.lineSubtotalAmount / 100).toFixed(2)}` : ''}
            </Typography>
          </Box>
          {m.orderModifiers?.length > 0 && <ModifierRows modifiers={m.orderModifiers} depth={depth + 1} />}
        </Box>
      ))}
    </>
  );
}

// ── Order item ────────────────────────────────────────────────
function OrderItemCard({ item }: { item: OrderItemDetail }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          {item.quantity}× {item.itemName}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600, ml: 2, whiteSpace: 'nowrap' }}>
          ${(item.subtotalAmount / 100).toFixed(2)}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        unit ${(item.itemPrice / 100).toFixed(2)}
      </Typography>
      {item.specialRequest && (
        <Typography sx={{ fontSize: 12, color: 'warning.dark', mt: 0.25 }}>
          * {item.specialRequest}
        </Typography>
      )}
      {item.orderModifiers?.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <ModifierRows modifiers={item.orderModifiers} />
        </Box>
      )}
    </Box>
  );
}

// ── Check others ──────────────────────────────────────────────
const KIND_LABEL: Record<string, string> = {
  tax: 'Tax', fee: 'Fee', serviceCharge: 'Service Charge',
};

function CheckOtherRow({ item }: { item: CheckOther }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
        {KIND_LABEL[item.kind] ?? item.kind}{item.isGratuity ? ' (gratuity)' : ''}: {item.name}
      </Typography>
      <Typography sx={{ fontSize: 13 }}>${item.amountDollar}</Typography>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function OrderTicketDetailPage() {
  const { id, ticketId } = useParams<{ id: string; ticketId: string }>();
  const { timezone } = useTimezone();
  const [detail, setDetail] = useState<OrderTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !ticketId) return;
    setLoading(true);
    api
      .getOrderTicketDetail(Number(id), ticketId)
      .then(setDetail)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, ticketId]);

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
        <Typography color="error">{error ?? 'Ticket not found.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Title */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
            Order #{detail.dailyOrderNo}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: 'monospace' }}>
            {detail.orderTicketId}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          <Badge
            label={detail.paymentStatus}
            bg={PAYMENT_COLOR[detail.paymentStatus] ?? '#f5f5f5'}
            color={PAYMENT_TEXT_COLOR[detail.paymentStatus] ?? '#616161'}
          />
          {detail.prepStatus && (
            <Badge
              label={detail.prepStatus}
              bg={PREP_COLOR[detail.prepStatus] ?? '#f5f5f5'}
              color={PREP_TEXT_COLOR[detail.prepStatus] ?? '#616161'}
            />
          )}
          {detail.receiptRequested && (
            <Badge label="receipt pending" bg="#fff3e0" color="#e65100" />
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* 2-column layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
        {/* Left: basic info */}
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
            Info
          </Typography>
          <InfoRow label="Table" value={detail.tableName} />
          <InfoRow label="Channel" value={detail.orderChannelName} />
          <InfoRow label="Guests" value={detail.totalGuest} />
          {detail.customerName && <InfoRow label="Customer" value={detail.customerName} />}
          <InfoRow label="POS Status" value={detail.posStatus} />
          {detail.tablePaymentType && <InfoRow label="Payment Type" value={detail.tablePaymentType} />}
        </Box>

        {/* Right: timestamps */}
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
            Timestamps
          </Typography>
          <InfoRow label="Created" value={formatWithTimezone(detail.createdAt, timezone)} />
          <InfoRow label="Confirmed" value={detail.confirmedAt ? formatWithTimezone(detail.confirmedAt, timezone) : '—'} />
          <InfoRow label="Printed" value={detail.printedAt ? formatWithTimezone(detail.printedAt, timezone) : '—'} />
          <InfoRow label="Completed" value={detail.completedAt ? formatWithTimezone(detail.completedAt, timezone) : '—'} />
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Items */}
      <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
        Items
      </Typography>
      {detail.orderItems.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>No items.</Typography>
      ) : (
        detail.orderItems.map((item) => <OrderItemCard key={item.id} item={item} />)
      )}

      {/* Payment summary */}
      {detail.checkSubtotalDollar != null && (
        <>
          <Divider sx={{ my: 2.5 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
            Payment Summary
          </Typography>
          <Box sx={{ maxWidth: 360 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Subtotal</Typography>
              <Typography sx={{ fontSize: 13 }}>${detail.checkSubtotalDollar}</Typography>
            </Box>
            {detail.checkOthers.map((o) => <CheckOtherRow key={`${o.kind}-${o.id}`} item={o} />)}
            {detail.checkTipAmountDollar && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Tip</Typography>
                <Typography sx={{ fontSize: 13 }}>${detail.checkTipAmountDollar}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 0.75 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Total</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                ${detail.checkTotalAmountDollar ?? (detail.totalAmount / 100).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
