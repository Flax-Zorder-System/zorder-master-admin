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
import type { CheckDetail, CheckItem, CheckModifier, CheckPayment } from '../types/check';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';

// ── 상태 배지 ──────────────────────────────────────────────────
const STATUS_BG: Record<string, string> = {
  OPEN: '#e3f2fd', PAID: '#e8f5e9', CLOSED: '#f3e5f5',
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: '#1565c0', PAID: '#2e7d32', CLOSED: '#6a1b9a',
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CARD: 'Card', CASH: 'Cash', GIFT_CARD: 'Gift Card', OTHER: 'Other',
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
      {children}
    </Typography>
  );
}

// ── Modifier 재귀 렌더 ────────────────────────────────────────
function ModifierRows({ modifiers, depth = 0 }: { modifiers: CheckModifier[]; depth?: number }) {
  if (!modifiers.length) return null;
  return (
    <>
      {modifiers.map((m) => (
        <Box key={m.id}>
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
              {m.lineSubtotalAmount !== 0 ? `$${m.lineSubtotalAmountDollar}` : ''}
            </Typography>
          </Box>
          {m.children?.length > 0 && <ModifierRows modifiers={m.children} depth={depth + 1} />}
        </Box>
      ))}
    </>
  );
}

// ── Check item ────────────────────────────────────────────────
function CheckItemCard({ item, timezone }: { item: CheckItem; timezone: string }) {
  const isDeleted = !!item.deletedAt;
  return (
    <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', opacity: isDeleted ? 0.45 : 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, textDecoration: isDeleted ? 'line-through' : 'none' }}>
          {item.quantity}× {item.itemName}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600, ml: 2, whiteSpace: 'nowrap' }}>
          ${item.subtotalAmountDollar}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        unit ${item.itemPriceDollar}
        {item.taxAmount > 0 && <> · tax ${item.taxAmountDollar}</>}
        {isDeleted && <Typography component="span" sx={{ ml: 1, fontSize: 11, color: 'error.main' }}>voided</Typography>}
      </Typography>
      <Typography sx={{ fontSize: 11, color: item.paidAt ? 'success.dark' : 'text.disabled', mt: 0.25 }}>
        paidAt: {item.paidAt ? formatWithTimezone(item.paidAt, timezone) : '—'}
      </Typography>
      {item.modifiers?.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <ModifierRows modifiers={item.modifiers} />
        </Box>
      )}
    </Box>
  );
}

// ── Payments table ────────────────────────────────────────────
const PAYMENT_STATUS_BG: Record<string, string> = {
  SALE: '#e8f5e9', VOID: '#ffebee', REFUND: '#fff3e0',
};
const PAYMENT_STATUS_COLOR: Record<string, string> = {
  SALE: '#2e7d32', VOID: '#c62828', REFUND: '#e65100',
};

function PaymentsTable({ payments, timezone }: { payments: CheckPayment[]; timezone: string }) {
  if (!payments.length) return <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>No payments.</Typography>;
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>method</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>status</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', textAlign: 'right' }}>amount</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', textAlign: 'right' }}>tax</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', textAlign: 'right' }}>tip</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>paidAt</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell sx={{ fontSize: 12 }}>{PAYMENT_METHOD_LABEL[p.method] ?? p.method}</TableCell>
            <TableCell sx={{ fontSize: 12 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 0.75, py: 0.2, borderRadius: 0.5, fontWeight: 600,
                  bgcolor: PAYMENT_STATUS_BG[p.status] ?? '#f5f5f5',
                  color: PAYMENT_STATUS_COLOR[p.status] ?? '#616161',
                }}
              >
                {p.status}
              </Typography>
            </TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>${p.amountDollar}</TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{p.tax > 0 ? `$${p.taxDollar}` : '—'}</TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{p.tip > 0 ? `$${p.tipDollar}` : '—'}</TableCell>
            <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              {p.paidAt ? formatWithTimezone(p.paidAt, timezone) : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Amount summary ────────────────────────────────────────────
function AmountRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
      <Typography sx={{ fontSize: bold ? 14 : 13, fontWeight: bold ? 700 : 400, color: bold ? 'text.primary' : 'text.secondary' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: bold ? 14 : 13, fontWeight: bold ? 700 : 400 }}>${value}</Typography>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function CheckDetailPage() {
  const { checkId } = useParams<{ checkId: string }>();
  const { timezone } = useTimezone();
  const [check, setCheck] = useState<CheckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkId) return;
    setLoading(true);
    api
      .getCheckDetail(checkId)
      .then((res) => setCheck(res.check))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [checkId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !check) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error ?? 'Check not found.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      {/* Title */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>Check</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: 'monospace' }}>
            #{check.id}
          </Typography>
          {check.parentId && (
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              (split from #{check.parentId})
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Badge
            label={check.status}
            bg={STATUS_BG[check.status] ?? '#f5f5f5'}
            color={STATUS_COLOR[check.status] ?? '#616161'}
          />
          <Badge label={check.orderType} bg="#f5f5f5" color="#616161" />
          {check.balanceAmount > 0 && (
            <Badge label={`balance $${check.balanceAmountDollar}`} bg="#ffebee" color="#c62828" />
          )}
          {check.parentId && (
            <Typography
              component="a"
              href={`/checks/${check.parentId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: 12,
                color: 'primary.main',
                textDecoration: 'none',
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: 0.75,
                px: 1,
                py: 0.3,
                '&:hover': { bgcolor: 'primary.50' },
              }}
            >
              → parent check #{check.parentId}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* 2-column: info + amounts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
        {/* Left: basic info */}
        <Box>
          <SectionTitle>Info</SectionTitle>
          {check.table && (
            <InfoRow
              label="Table"
              value={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {check.table.tableName}
                  {check.table.isKioskMode && (
                    <Typography
                      variant="caption"
                      sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#e8eaf6', color: '#283593', fontWeight: 600, fontSize: 11 }}
                    >
                      kiosk
                    </Typography>
                  )}
                </Box>
              }
            />
          )}
          {check.contact?.name && <InfoRow label="Customer" value={check.contact.name} />}
          {check.contact?.phone && <InfoRow label="Phone" value={check.contact.phone} />}
          {check.contact?.email && <InfoRow label="Email" value={check.contact.email} />}
          <InfoRow label="Created" value={formatWithTimezone(check.createAt, timezone)} />
          <InfoRow label="Closed" value={check.closedAt ? formatWithTimezone(check.closedAt, timezone) : '—'} />
        </Box>

        {/* Right: amounts */}
        <Box>
          <SectionTitle>Amount Summary</SectionTitle>
          <AmountRow label="Subtotal" value={check.subtotalDollar} />
          {check.taxes.map((t) => (
            <AmountRow key={t.id} label={`Tax: ${t.name}`} value={t.totalAmountDollar} />
          ))}
          {check.serviceCharges.map((sc) => (
            <AmountRow
              key={sc.id}
              label={`${sc.isGratuity ? 'Gratuity' : 'Svc Charge'}: ${sc.name}`}
              value={sc.totalAmountDollar}
            />
          ))}
          {check.serviceFees.map((sf) => (
            <AmountRow key={sf.id} label={`Svc Fee: ${sf.name}`} value={sf.appliedAmountDollar} />
          ))}
          {check.tipAmount > 0 && <AmountRow label="Tip" value={check.tipAmountDollar} />}
          <Divider sx={{ my: 0.75 }} />
          <AmountRow label="Total" value={check.totalAmountDollar} bold />
          {check.paidAmount > 0 && <AmountRow label="Paid" value={check.paidAmountDollar} />}
          {check.balanceAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
              <Typography sx={{ fontSize: 13, color: 'error.main', fontWeight: 600 }}>Balance due</Typography>
              <Typography sx={{ fontSize: 13, color: 'error.main', fontWeight: 600 }}>${check.balanceAmountDollar}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Items */}
      <SectionTitle>Items</SectionTitle>
      {check.checkItems.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>No items.</Typography>
      ) : (
        check.checkItems.map((item) => <CheckItemCard key={item.id} item={item} timezone={timezone} />)
      )}

      {/* Payments */}
      <Divider sx={{ my: 2.5 }} />
      <SectionTitle>Payments</SectionTitle>
      <PaymentsTable payments={check.payments} timezone={timezone} />
    </Box>
  );
}
