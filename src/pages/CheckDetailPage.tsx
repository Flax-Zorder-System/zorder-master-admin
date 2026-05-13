import React from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { CheckBalance, CheckDetail, CheckItem, CheckItemTaxEntry, CheckModifier, CheckPayment, CheckServiceChargeTaxEntry, MasterCheckSummary } from '../types/check';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { usePageTitle } from '../hooks/usePageTitle';

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


// ── Check items table ─────────────────────────────────────────

const centsToDisplay = (...cents: number[]) => `$${(cents.reduce((a, b) => a + b, 0) / 100).toFixed(2)}`;

const CELL = { fontSize: 12, borderBottom: 'none', py: 0.75 } as const;
const HEAD_CELL = { ...CELL, fontWeight: 700, color: 'text.secondary', fontSize: 11, pb: 0.5, bgcolor: 'grey.50' } as const;

function HeadWithTip({ children, tip, align = 'left' }: { children: React.ReactNode; tip: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start', width: '100%' }}>
      {children}
      <Tooltip title={tip} arrow placement="top">
        <HelpOutlineIcon sx={{ fontSize: 11, color: 'text.disabled', cursor: 'default', flexShrink: 0 }} />
      </Tooltip>
    </Box>
  );
}

function taxRateLabel(entry: CheckItemTaxEntry | CheckServiceChargeTaxEntry): string {
  if (entry.rate != null) return `${(entry.rate * 100).toFixed(4).replace(/\.?0+$/, '')}%`;
  if (entry.fixedAmount != null) return `$${(entry.fixedAmount / 100).toFixed(2)} fixed`;
  return '';
}

function ItemTaxRows({ taxes }: { taxes: CheckItemTaxEntry[] }) {
  if (!taxes?.length) return null;
  return (
    <>
      {taxes.map((t, i) => (
        <TableRow key={t.taxId ?? i} sx={{ bgcolor: '#fffde7' }}>
          <TableCell sx={CELL} />
          <TableCell sx={{ ...CELL, pl: 2 }}>
            <Typography sx={{ fontSize: 11, color: '#b45309' }}>
              {'└ '}{t.name}
              {taxRateLabel(t) && (
                <Typography component="span" sx={{ fontSize: 10, color: 'text.disabled', ml: 0.5 }}>
                  ({taxRateLabel(t)})
                </Typography>
              )}
            </Typography>
          </TableCell>
          <TableCell sx={CELL} />
          <TableCell sx={CELL} />
          <TableCell sx={CELL} />
          <TableCell sx={{ ...CELL, textAlign: 'right' }}>
            <Typography sx={{ fontSize: 11, color: '#b45309' }}>${(t.taxAmount / 100).toFixed(2)}</Typography>
          </TableCell>
          <TableCell sx={CELL} />
          <TableCell sx={CELL} />
        </TableRow>
      ))}
    </>
  );
}

function ModifierTableRows({ modifiers, depth = 0 }: { modifiers: CheckModifier[]; depth?: number }) {
  if (!modifiers.length) return null;
  return (
    <>
      {modifiers.map((m) => (
        <React.Fragment key={m.id}>
          <TableRow sx={{ opacity: 0.8, bgcolor: depth === 0 ? 'transparent' : '#f9f9f9' }}>
            <TableCell sx={CELL} />
            <TableCell sx={{ ...CELL, pl: 2 + depth * 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.1 }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>
                  {'└ '}{m.modifierName}
                </Typography>
                {m.modifierGroupName && (
                  <Typography sx={{ fontSize: 10, color: 'text.disabled', pl: 1.5, lineHeight: 1.3 }}>
                    {m.modifierGroupName}
                  </Typography>
                )}
              </Box>
            </TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'right', verticalAlign: 'top', pt: 0.75 }}>
              {m.modifierPrice !== 0 ? (
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>${m.modifierPriceDollar}</Typography>
              ) : (
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>—</Typography>
              )}
            </TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'center', verticalAlign: 'top', pt: 0.75 }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{m.quantity}</Typography>
            </TableCell>
            <TableCell sx={{ ...CELL, textAlign: 'right', verticalAlign: 'top', pt: 0.75 }}>
              {m.lineSubtotalAmount !== 0 ? (
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>${m.lineSubtotalAmountDollar}</Typography>
              ) : (
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>—</Typography>
              )}
            </TableCell>
            <TableCell sx={CELL} />
            <TableCell sx={CELL} />
            <TableCell sx={CELL} />
          </TableRow>
          {m.children?.length > 0 && (
            <ModifierTableRows modifiers={m.children} depth={depth + 1} />
          )}
        </React.Fragment>
      ))}
    </>
  );
}

function CheckItemsTable({ items, timezone }: { items: CheckItem[]; timezone: string }) {
  return (
    <Table size="small" sx={{ tableLayout: 'fixed' }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...HEAD_CELL, width: 100 }}>
            <HeadWithTip tip="Check Item ID입니다.">checkItemId</HeadWithTip>
          </TableCell>
          <TableCell sx={{ ...HEAD_CELL, width: '30%' }}>
            <HeadWithTip tip="메뉴 아이템 이름입니다. 취소(void)된 항목은 흐리게 표시됩니다.">item</HeadWithTip>
          </TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 70 }}>
            <HeadWithTip tip="해당 아이템의 개당 단가입니다." align="right">unit</HeadWithTip>
          </TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'center', width: 40 }}>
            <HeadWithTip tip="주문 수량입니다." align="center">qty</HeadWithTip>
          </TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 90 }}>
            <HeadWithTip tip="단가 × 수량으로 계산한 세금 전 소계입니다. (unit × qty)" align="right">subtotal</HeadWithTip>
          </TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 70 }}>
            <HeadWithTip tip="이 아이템에 부과된 세금 금액입니다. 세금이 없으면 —로 표시됩니다." align="right">tax</HeadWithTip>
          </TableCell>
          <TableCell sx={{ ...HEAD_CELL, textAlign: 'right', width: 90 }}>
            <HeadWithTip tip="subtotal + tax를 합산한 아이템의 최종 금액입니다." align="right">total</HeadWithTip>
          </TableCell>
          <TableCell sx={{ ...HEAD_CELL, width: 150 }}>
            <HeadWithTip tip="이 아이템이 실제 결제 완료된 시각입니다. 아직 미결제 상태이면 —로 표시됩니다.">paidAt</HeadWithTip>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => {
          const isDeleted = !!item.deletedAt;
          return (
            <>
              <TableRow
                key={item.id}
                sx={{ opacity: isDeleted ? 0.45 : 1, '&:hover': { bgcolor: 'grey.50' } }}
              >
                <TableCell sx={{ ...CELL, fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                  {item.id}
                </TableCell>
                <TableCell sx={CELL}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography
                      sx={{ fontSize: 12, fontWeight: 600, textDecoration: isDeleted ? 'line-through' : 'none' }}
                    >
                      {item.itemName}
                    </Typography>
                    {isDeleted && (
                      <Typography variant="caption" sx={{ fontSize: 10, px: 0.6, py: 0.1, borderRadius: 0.5, bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }}>
                        voided
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ ...CELL, textAlign: 'right', color: 'text.secondary' }}>
                  ${item.itemPriceDollar}
                </TableCell>
                <TableCell sx={{ ...CELL, textAlign: 'center', color: 'text.secondary' }}>
                  {item.quantity}
                </TableCell>
                <TableCell sx={{ ...CELL, textAlign: 'right' }}>
                  ${item.lineSubtotalAmountDollar}
                </TableCell>
                <TableCell sx={{ ...CELL, textAlign: 'right', color: item.taxAmount > 0 ? 'warning.dark' : 'text.disabled' }}>
                  {item.taxAmount > 0 ? `$${item.taxAmountDollar}` : '—'}
                </TableCell>
                <TableCell sx={{ ...CELL, textAlign: 'right', fontWeight: 600 }}>
                  {centsToDisplay(item.subtotalAmount, item.taxAmount)}
                </TableCell>
                <TableCell sx={{ ...CELL, color: item.paidAt ? 'success.dark' : 'text.disabled', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {item.paidAt ? formatWithTimezone(item.paidAt, timezone) : '—'}
                </TableCell>
              </TableRow>
              {item.modifiers?.length > 0 && (
                <ModifierTableRows modifiers={item.modifiers} />
              )}
              {item.checkItemTaxes?.length > 0 && (
                <ItemTaxRows taxes={item.checkItemTaxes} />
              )}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ── Service Charges table ─────────────────────────────────────

const SC_HEAD = { fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' } as const;

function ServiceChargesTable({ serviceCharges }: { serviceCharges: CheckDetail['serviceCharges'] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...SC_HEAD, width: '35%' }}>name</TableCell>
          <TableCell sx={{ ...SC_HEAD, width: 80 }}>gratuity</TableCell>
          <TableCell sx={{ ...SC_HEAD, textAlign: 'right', width: 90 }}>amount</TableCell>
          <TableCell sx={{ ...SC_HEAD, textAlign: 'right', width: 80 }}>tax</TableCell>
          <TableCell sx={{ ...SC_HEAD, textAlign: 'right', width: 90 }}>total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {serviceCharges.map((sc) => (
          <React.Fragment key={sc.id}>
            <TableRow sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
              <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{sc.serviceCharge?.name ?? sc.name ?? '—'}</TableCell>
              <TableCell sx={{ fontSize: 12 }}>
                {sc.isGratuity ? (
                  <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#e8eaf6', color: '#283593', fontWeight: 600 }}>
                    gratuity
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>—</Typography>
                )}
              </TableCell>
              <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>${sc.totalAmountDollar}</TableCell>
              <TableCell sx={{ fontSize: 12, textAlign: 'right', color: sc.taxAmount > 0 ? 'warning.dark' : 'text.disabled' }}>
                {sc.taxAmount > 0 ? `$${sc.taxAmountDollar}` : '—'}
              </TableCell>
              <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 600 }}>
                ${((sc.appliedAmount + sc.taxAmount) / 100).toFixed(2)}
              </TableCell>
            </TableRow>
            {sc.taxes?.map((t, i) => (
              <TableRow key={t.taxId ?? i} sx={{ bgcolor: '#fffde7' }}>
                <TableCell sx={{ ...CELL, pl: 2.5 }}>
                  <Typography sx={{ fontSize: 11, color: '#b45309' }}>
                    {'└ '}{t.name}
                    {taxRateLabel(t) && (
                      <Typography component="span" sx={{ fontSize: 10, color: 'text.disabled', ml: 0.5 }}>
                        ({taxRateLabel(t)})
                      </Typography>
                    )}
                  </Typography>
                </TableCell>
                <TableCell sx={CELL} />
                <TableCell sx={CELL} />
                <TableCell sx={{ ...CELL, textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 11, color: '#b45309' }}>${(t.taxAmount / 100).toFixed(2)}</Typography>
                </TableCell>
                <TableCell sx={CELL} />
              </TableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Service Fees table ────────────────────────────────────────

function ServiceFeesTable({ serviceFees }: { serviceFees: CheckDetail['serviceFees'] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...SC_HEAD, width: '50%' }}>name</TableCell>
          <TableCell sx={{ ...SC_HEAD, textAlign: 'right' }}>amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {serviceFees.map((sf) => (
          <TableRow key={sf.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
            <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{sf.name}</TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>${sf.appliedAmountDollar}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Payments table ────────────────────────────────────────────
const PAYMENT_STATUS_BG: Record<string, string> = {
  SALE: '#e8f5e9', VOID: '#ffebee', REFUND: '#fff3e0',
};
const PAYMENT_STATUS_COLOR: Record<string, string> = {
  SALE: '#2e7d32', VOID: '#c62828', REFUND: '#e65100',
};

function PaymentsTable({ payments, timezone, storeId }: { payments: CheckPayment[]; timezone: string; storeId: string }) {
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
          <TableRow
            key={p.id}
            hover
            sx={{ cursor: 'pointer' }}
            onClick={() => window.open(`/stores/${storeId}/payments/${p.id}`, '_blank')}
          >
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

// ── Split Checks table ────────────────────────────────────────
const SPLIT_HEAD = { fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' } as const;

function SplitChecksTable({ checks, storeId, rootCheck }: { checks: MasterCheckSummary[]; storeId: string; rootCheck: CheckDetail }) {
  const { timezone } = useTimezone();
  const fmt = (dollar: string) => `$${dollar}`;
  const ROOT_BG = '#e8f4fd';

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={SPLIT_HEAD}>check id</TableCell>
          <TableCell sx={{ ...SPLIT_HEAD, width: 80 }}>status</TableCell>
          <TableCell sx={{ ...SPLIT_HEAD, textAlign: 'right', width: 80 }}>subtotal</TableCell>
          <TableCell sx={{ ...SPLIT_HEAD, textAlign: 'right', width: 70 }}>tax</TableCell>
          <TableCell sx={{ ...SPLIT_HEAD, textAlign: 'right', width: 80 }}>svc charge</TableCell>
          <TableCell sx={{ ...SPLIT_HEAD, textAlign: 'right', width: 70 }}>gratuity</TableCell>
          <TableCell sx={{ ...SPLIT_HEAD, textAlign: 'right', width: 70 }}>svc fee</TableCell>
          <TableCell sx={{ ...SPLIT_HEAD, textAlign: 'right', width: 70 }}>tip</TableCell>
          <TableCell sx={{ ...SPLIT_HEAD, textAlign: 'right', width: 80 }}>total</TableCell>
          <TableCell sx={SPLIT_HEAD}>createdAt</TableCell>
          <TableCell sx={SPLIT_HEAD}>closedAt</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {/* Root check row */}
        <TableRow sx={{ bgcolor: ROOT_BG, cursor: 'default' }}>
          <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {rootCheck.id}
              <Typography variant="caption" sx={{ px: 0.6, py: 0.1, borderRadius: 0.5, bgcolor: '#1565c0', color: '#fff', fontWeight: 700, fontSize: 10 }}>
                root
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, fontWeight: 600, bgcolor: STATUS_BG[rootCheck.status] ?? '#f5f5f5', color: STATUS_COLOR[rootCheck.status] ?? '#616161' }}>
              {rootCheck.status}
            </Typography>
          </TableCell>
          <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{fmt(rootCheck.subtotalDollar)}</TableCell>
          <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{rootCheck.taxAmount > 0 ? fmt(rootCheck.taxAmountDollar) : '—'}</TableCell>
          <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{rootCheck.serviceChargeAmount > 0 ? fmt(rootCheck.serviceChargeAmountDollar) : '—'}</TableCell>
          <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{rootCheck.gratuityAmount > 0 ? fmt(rootCheck.gratuityAmountDollar) : '—'}</TableCell>
          <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{rootCheck.serviceFeeAmount > 0 ? fmt(rootCheck.serviceFeeAmountDollar) : '—'}</TableCell>
          <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{rootCheck.tipAmount > 0 ? fmt(rootCheck.tipAmountDollar) : '—'}</TableCell>
          <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 700 }}>{fmt(rootCheck.totalAmountDollar)}</TableCell>
          <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatWithTimezone(rootCheck.createAt, timezone)}</TableCell>
          <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{rootCheck.closedAt ? formatWithTimezone(rootCheck.closedAt, timezone) : '—'}</TableCell>
        </TableRow>

        {/* Child check rows */}
        {checks.map((c) => (
          <TableRow
            key={c.id}
            hover
            sx={{ cursor: 'pointer' }}
            onClick={() => window.open(`/stores/${storeId}/checks/${c.id}`, '_blank')}
          >
            <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{c.id}</TableCell>
            <TableCell>
              <Typography
                variant="caption"
                sx={{
                  px: 0.75, py: 0.2, borderRadius: 0.5, fontWeight: 600,
                  bgcolor: STATUS_BG[c.status] ?? '#f5f5f5',
                  color: STATUS_COLOR[c.status] ?? '#616161',
                }}
              >
                {c.status}
              </Typography>
            </TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{fmt(c.subtotalDollar)}</TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{c.taxAmount > 0 ? fmt(c.taxAmountDollar) : '—'}</TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{c.serviceChargeAmount > 0 ? fmt(c.serviceChargeAmountDollar) : '—'}</TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{c.gratuityAmount > 0 ? fmt(c.gratuityAmountDollar) : '—'}</TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{c.serviceFeeAmount > 0 ? fmt(c.serviceFeeAmountDollar) : '—'}</TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{c.tipAmount > 0 ? fmt(c.tipAmountDollar) : '—'}</TableCell>
            <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 700 }}>{fmt(c.totalAmountDollar)}</TableCell>
            <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatWithTimezone(c.createdAt, timezone)}</TableCell>
            <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{c.closedAt ? formatWithTimezone(c.closedAt, timezone) : '—'}</TableCell>
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
  const { storeId, checkId } = useParams<{ storeId: string; checkId: string }>();
  const { timezone } = useTimezone();
  const [check, setCheck] = useState<CheckDetail | null>(null);
  usePageTitle(check ? `Check #${check.id}${check.table ? ` · ${check.table.tableName}` : ''}` : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childChecks, setChildChecks] = useState<MasterCheckSummary[]>([]);
  const [balance, setBalance] = useState<CheckBalance | null>(null);
  const [groupItems, setGroupItems] = useState(false);

  useEffect(() => {
    if (!checkId) return;
    setLoading(true);
    Promise.all([
      api.getCheckDetail(Number(storeId), checkId, groupItems),
      api.getCheckBalance(checkId),
    ])
      .then(([detailRes, balanceRes]) => {
        setCheck(detailRes.check);
        setBalance(balanceRes);
        if (!detailRes.check.parentId && storeId) {
          api.getChildChecks(Number(storeId), checkId)
            .then((r) => setChildChecks(r.checks))
            .catch(() => {});
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [checkId, storeId, groupItems]);

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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, bgcolor: 'white', mt: 5, mb: 5}}>
      {/* Title */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>Check</Typography>
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
              href={`/stores/${storeId}/checks/${check.parentId}`}
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

      {/* Balance Status */}
      {balance && (
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 1,
            border: '1px solid #eee',
            bgcolor: balance.isComplete ? '#f1f8e9' : '#fffde7',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: balance.detail || balance.childChecks.length > 0 ? 1.5 : 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Balance
            </Typography>
            <Tooltip
              arrow
              placement="right"
              title={
                <Box sx={{ p: 0.5, maxWidth: 320 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1 }}>결제 완결 상태란?</Typography>
                  <Typography sx={{ fontSize: 12, mb: 1, lineHeight: 1.6 }}>
                    이 테이블의 모든 주문 금액이 빠짐없이 결제되었는지 확인하는 섹션입니다.
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 0.5 }}>✅ COMPLETE</Typography>
                  <Typography sx={{ fontSize: 12, mb: 1, lineHeight: 1.6 }}>
                    모든 아이템이 결제 완료되고, 체크가 정상적으로 마감된 상태입니다.
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 0.5 }}>⚠️ INCOMPLETE — 주요 사유</Typography>
                  {[
                    ['UNPAID_ROOT_ITEMS', '결제되지 않은 아이템이 남아 있습니다'],
                    ['OPEN_CHILD_CHECKS', '분할된 체크 중 아직 마감되지 않은 것이 있습니다'],
                    ['UNPAID_CLOSED_CHILD_ITEMS', '마감된 분할 체크 안에 미결제 아이템이 있습니다'],
                    ['ROOT_CHECK_NOT_CLOSED', '결제는 완료됐으나 체크가 아직 공식 마감 처리되지 않았습니다'],
                    ['PENDING_SPLITS(n/m)', '금액 분할 결제 중 n/m건이 아직 미결제입니다'],
                    ['CHECK_NOT_CLOSED', '체크 자체가 아직 결제되지 않은 상태입니다'],
                  ].map(([code, desc]) => (
                    <Box key={code} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      <Typography sx={{ fontSize: 12, lineHeight: 1.6 }}>•</Typography>
                      <Typography sx={{ fontSize: 12, lineHeight: 1.6 }}>
                        <strong>{code}</strong> — {desc}
                      </Typography>
                    </Box>
                  ))}
                  <Typography sx={{ fontSize: 12, mt: 1, color: 'grey.300', lineHeight: 1.6 }}>
                    💡 <em>splits</em> 항목을 클릭하면 분할된 개별 체크 상세로 이동할 수 있습니다.
                  </Typography>
                </Box>
              }
            >
              <HelpOutlineIcon sx={{ fontSize: 16, color: 'text.disabled', cursor: 'help' }} />
            </Tooltip>
            <Typography
              variant="caption"
              sx={{
                px: 1, py: 0.4, borderRadius: 0.75, fontWeight: 700, fontSize: 12,
                bgcolor: balance.isComplete ? '#e8f5e9' : '#fff3e0',
                color: balance.isComplete ? '#2e7d32' : '#e65100',
              }}
            >
              {balance.isComplete ? 'COMPLETE' : 'INCOMPLETE'}
            </Typography>
            {parseFloat(balance.inflightAmountDollar) > 0 && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                in-flight: <strong>${balance.inflightAmountDollar}</strong>
              </Typography>
            )}
          </Box>

          {/* 미완결 사유 */}
          {!balance.isComplete && balance.detail && (
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: balance.childChecks.length > 0 ? 1 : 0 }}>
              {balance.detail.split(',').map((code) => code.trim()).filter(Boolean).map((code) => (
                <Typography
                  key={code}
                  variant="caption"
                  sx={{ px: 0.75, py: 0.3, borderRadius: 0.5, bgcolor: '#ffebee', color: '#c62828', fontWeight: 600, fontSize: 11 }}
                >
                  {code}
                </Typography>
              ))}
            </Box>
          )}

          {/* Child check 상태 목록 */}
          {balance.childChecks.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', mr: 0.5 }}>splits:</Typography>
              {balance.childChecks.map((c) => (
                <Typography
                  key={c.id}
                  component="a"
                  href={`/stores/${storeId}/checks/${c.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="caption"
                  sx={{
                    px: 0.75, py: 0.3, borderRadius: 0.5, fontWeight: 600, fontSize: 11,
                    textDecoration: 'none',
                    bgcolor: STATUS_BG[c.status] ?? '#f5f5f5',
                    color: STATUS_COLOR[c.status] ?? '#616161',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  #{c.id} {c.status}
                </Typography>
              ))}
            </Box>
          )}

          {/* split-by-amount splits */}
          {balance.splits.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center', mt: balance.childChecks.length > 0 ? 0.75 : 0 }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', mr: 0.5 }}>amount splits:</Typography>
              {balance.splits.map((s) => (
                <Typography
                  key={s.index}
                  variant="caption"
                  sx={{ px: 0.75, py: 0.3, borderRadius: 0.5, bgcolor: '#e8eaf6', color: '#283593', fontWeight: 600, fontSize: 11 }}
                >
                  {s.index}. ${s.amountDollar}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* 2-column: info + amounts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
        {/* Left: basic info */}
        <Box>
          <SectionTitle>Info</SectionTitle>
          <InfoRow label="Check ID" value={<Typography component="span" sx={{ fontSize: 13, fontFamily: 'monospace' }}>#{check.id}</Typography>} />
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
          <InfoRow
            label="Deleted"
            value={check.deletedAt
              ? <Typography component="span" sx={{ fontSize: 13, color: 'error.main', fontWeight: 600 }}>{formatWithTimezone(check.deletedAt, timezone)}</Typography>
              : '—'
            }
          />
        </Box>

        {/* Right: amounts */}
        <Box>
          <SectionTitle>Amount Summary</SectionTitle>

          {/* 합계 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Subtotal</Typography>
              <Tooltip
                arrow
                placement="right"
                title={
                  <Box sx={{ fontSize: 12, lineHeight: 1.9, p: 0.5 }}>
                    <Box>· 주문한 아이템 가격의 순수 합산액입니다.</Box>
                    <Box>· 세금(Tax), 서비스 차지(Service Charge),</Box>
                    <Box>{"  "}서비스 피(Service Fee), 팁(Tip) 등은</Box>
                    <Box>{"  "}포함되지 않은 금액입니다.</Box>
                  </Box>
                }
              >
                <HelpOutlineIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help', mt: '1px' }} />
              </Tooltip>
            </Box>
            <Typography sx={{ fontSize: 13 }}>${check.subtotalDollar}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Tax</Typography>
              <Tooltip
                arrow
                placement="right"
                title={
                  <Box sx={{ fontSize: 12, lineHeight: 1.9, p: 0.5 }}>
                    <Box>· 아이템에 부과된 세금</Box>
                    <Box>+ 서비스 차지(Service Charge)에 부과된 세금의 합산액입니다.</Box>
                  </Box>
                }
              >
                <HelpOutlineIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help', mt: '1px' }} />
              </Tooltip>
            </Box>
            <Typography sx={{ fontSize: 13 }}>${check.taxAmountDollar}</Typography>
          </Box>
          <AmountRow label="Service Charge" value={check.serviceChargeAmountDollar} />
          <AmountRow label="Gratuity" value={check.gratuityAmountDollar} />
          <AmountRow label="Service Fee" value={check.serviceFeeAmountDollar} />
          <AmountRow label="Tip" value={check.tipAmountDollar} />
          <Divider sx={{ my: 0.75 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Total</Typography>
              <Tooltip
                arrow
                placement="right"
                title={
                  <Box sx={{ fontSize: 12, lineHeight: 1.9, p: 0.5 }}>
                    <Box sx={{ fontWeight: 700, mb: 0.25 }}>totalAmount — 팁 제외 청구 합산</Box>
                    <Box>= subtotal + tax + SC + fee + gratuity − discount</Box>
                    <Box>· 팁(tip)은 포함되지 않습니다.</Box>
                    <Box sx={{ mt: 0.5, borderTop: '1px solid rgba(255,255,255,0.2)', pt: 0.5 }}>
                      <Box sx={{ fontWeight: 700, mb: 0.25 }}>실제 결제 금액</Box>
                      <Box>= totalAmount + tipAmount</Box>
                    </Box>
                    <Box sx={{ mt: 0.5, borderTop: '1px solid rgba(255,255,255,0.2)', pt: 0.5 }}>
                      <Box sx={{ fontWeight: 700, mb: 0.25 }}>Percent Tip 계산 기준 (설정에 따라 다름)</Box>
                      <Box>· subtotal 기준: 순수 주문액에서 % 계산</Box>
                      <Box>· tax + subtotal 기준: 세금 포함 금액에서 % 계산</Box>
                    </Box>
                  </Box>
                }
              >
                <HelpOutlineIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help', mt: '1px' }} />
              </Tooltip>
            </Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>${check.totalAmountDollar}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Paid</Typography>
              <Tooltip
                arrow
                placement="right"
                title={
                  <Box sx={{ fontSize: 12, lineHeight: 1.9, p: 0.5 }}>
                    <Box>팁(tip)까지 포함한 실제 결제 금액입니다.</Box>
                    <Box>= totalAmount + tipAmount</Box>
                  </Box>
                }
              >
                <HelpOutlineIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help', mt: '1px' }} />
              </Tooltip>
            </Box>
            <Typography sx={{ fontSize: 13 }}>${check.paidAmountDollar}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
            <Typography sx={{ fontSize: 13, color: check.balanceAmount > 0 ? 'error.main' : 'text.secondary', fontWeight: check.balanceAmount > 0 ? 600 : 400 }}>Balance due</Typography>
            <Typography sx={{ fontSize: 13, color: check.balanceAmount > 0 ? 'error.main' : 'text.primary', fontWeight: check.balanceAmount > 0 ? 600 : 400 }}>${check.balanceAmountDollar}</Typography>
          </Box>

          {/* 세부 내역 */}
          {check.taxes.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.6, mb: 0.5 }}>
                세부 내역
              </Typography>
              {check.taxes.map((t) => (
                <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Tax · {t.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>${t.totalAmountDollar}</Typography>
                </Box>
              ))}
              {check.serviceCharges.map((sc) => (
                <Box key={sc.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                    {sc.isGratuity ? 'Gratuity' : 'Svc Charge'} · {sc.serviceCharge?.name ?? sc.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>${sc.totalAmountDollar}</Typography>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Service Charges */}
      {check.serviceCharges.length > 0 && (
        <>
          <Typography sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5, mb: 1 }}>
            Service Charges
          </Typography>
          <ServiceChargesTable serviceCharges={check.serviceCharges} />
          <Divider sx={{ my: 2.5 }} />
        </>
      )}

      {/* Service Fees */}
      {check.serviceFees.length > 0 && (
        <>
          <Typography sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5, mb: 1 }}>
            Service Fees
          </Typography>
          <ServiceFeesTable serviceFees={check.serviceFees} />
          <Divider sx={{ my: 2.5 }} />
        </>
      )}

      {/* Items */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>Items</Typography>
        <Tooltip title="동일 아이템+모디파이어 조합을 하나로 합산하여 표시합니다." arrow placement="left">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 12, color: groupItems ? 'primary.main' : 'text.disabled', fontWeight: groupItems ? 600 : 400 }}>
              Group Items
            </Typography>
            <Switch
              size="small"
              checked={groupItems}
              onChange={(e) => setGroupItems(e.target.checked)}
            />
          </Box>
        </Tooltip>
      </Box>
      {check.checkItems.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>No items.</Typography>
      ) : (
        <CheckItemsTable items={check.checkItems} timezone={timezone} />
      )}

      {/* Payments */}
      <Divider sx={{ my: 2.5 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
          Payments
        </Typography>
        <Tooltip
          title={
            <Box sx={{ fontSize: 12, lineHeight: 1.8, p: 0.5 }}>
              <strong>결제 방식 안내</strong>
              <br />
              • 결제 내역이 <strong>1건</strong>이면 → 전체 금액을 한 번에 결제한 것입니다 (Pay in Full).
              <br />
              • 결제 내역이 <strong>2건 이상</strong>이면 → 금액을 나눠서 결제한 것입니다 (Split by Amount). 예: 여러 명이 각자 자신의 몫만큼 따로 결제하는 경우입니다.
            </Box>
          }
          arrow
          placement="right"
        >
          <HelpOutlineIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'default', mt: '1px' }} />
        </Tooltip>
      </Box>
      <PaymentsTable payments={check.payments} timezone={timezone} storeId={storeId!} />

      {/* Split Checks */}
      {childChecks.length > 0 && (
        <>
          <Divider sx={{ my: 2.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
              Split Checks ({childChecks.length})
            </Typography>
            <Tooltip
              title={
                <Box sx={{ fontSize: 12, lineHeight: 1.8, p: 0.5 }}>
                  <strong>체크 분할(Split Check) 안내</strong>
                  <br />
                  테이블 손님들이 각자 따로 계산하고 싶을 때, 하나의 체크를 여러 개로 분할할 수 있습니다.
                  <br />
                  • 이 체크는 <strong>원본(Root) 체크</strong>입니다. 분할이 이루어지면 실제 결제는 각 분할 체크에서 진행되므로, <strong>이 원본 체크에는 결제 내역(Payments)이 없습니다.</strong>
                  <br />
                  • 아래 목록의 각 분할 체크를 클릭하면 해당 체크의 상세 내역과 결제 정보를 확인할 수 있습니다.
                </Box>
              }
              arrow
              placement="right"
            >
              <HelpOutlineIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'default', mt: '1px' }} />
            </Tooltip>
          </Box>
          <SplitChecksTable checks={childChecks} storeId={storeId!} rootCheck={check} />
        </>
      )}
    </Box>
  );
}
