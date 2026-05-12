import { Box, CircularProgress, Collapse, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { PaymentDetail } from '../types/payment';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { usePageTitle } from '../hooks/usePageTitle';

// ── 상태 색상 ──────────────────────────────────────────────────

const PAYMENT_STATUS_BG: Record<string, string> = {
  SALE: '#e8f5e9', VOID: '#ffebee', REFUND: '#fff3e0',
};
const PAYMENT_STATUS_COLOR: Record<string, string> = {
  SALE: '#2e7d32', VOID: '#c62828', REFUND: '#e65100',
};

const TXN_STATUS_BG: Record<string, string> = {
  PENDING: '#fff8e1', APPROVED: '#e8f5e9', VOIDED: '#ffebee', CLEARED: '#e3f2fd', ERROR: '#fce4ec',
};
const TXN_STATUS_COLOR: Record<string, string> = {
  PENDING: '#f57f17', APPROVED: '#2e7d32', VOIDED: '#c62828', CLEARED: '#1565c0', ERROR: '#880e4f',
};

const METHOD_LABEL: Record<string, string> = {
  CARD: 'Card', CASH: 'Cash', GIFT_CARD: 'Gift Card', OTHER: 'Other',
};

const PG_BG: Record<string, string> = {
  CODEPAY: '#e8f5e9', DATACAPE: '#e3f2fd', STRIPE: '#f3e5f5', SQUARE: '#fff8e1',
};
const PG_COLOR: Record<string, string> = {
  CODEPAY: '#1b5e20', DATACAPE: '#0d47a1', STRIPE: '#4a148c', SQUARE: '#e65100',
};

// ── 공통 컴포넌트 ──────────────────────────────────────────────

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
      <Typography sx={{ color: 'text.secondary', minWidth: 180, fontSize: 13 }}>{label}</Typography>
      <Box sx={{ fontSize: 13, fontWeight: 500 }}>{value ?? <Typography component="span" sx={{ fontSize: 13, color: 'text.disabled' }}>—</Typography>}</Box>
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

function highlightJson(json: string): React.ReactNode[] {
  const tokens = json.split(/("(?:\\.|[^"\\])*"(?:\s*:)?|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}[\],])/);
  return tokens.map((token, i) => {
    if (!token) return null;
    let color = '#d4d4d4';
    if (/^".*":$/.test(token.trim())) color = '#9cdcfe';           // key
    else if (/^"/.test(token)) color = '#ce9178';                  // string value
    else if (/^-?\d/.test(token)) color = '#b5cea8';               // number
    else if (token === 'true' || token === 'false') color = '#569cd6'; // boolean
    else if (token === 'null') color = '#569cd6';                   // null
    else if (/^[{}[\],]$/.test(token)) color = '#808080';          // punctuation
    return <span key={i} style={{ color }}>{token}</span>;
  });
}

function RawResBody({ raw }: { raw: string }) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  let formatted = raw;
  let isJson = false;
  try { formatted = JSON.stringify(JSON.parse(raw), null, 2); isJson = true; } catch { /* not JSON */ }

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Raw Response Body
        </Typography>
        <IconButton size="small" onClick={() => setOpen((v) => !v)} sx={{ p: 0.25 }}>
          {open ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </IconButton>
        <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="right">
          <IconButton size="small" onClick={handleCopy} sx={{ p: 0.25 }}>
            <ContentCopyIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse in={open}>
        <Box
          component="pre"
          sx={{
            mt: 0.75, p: 1.5,
            bgcolor: '#1e1e1e',
            borderRadius: 1,
            fontSize: 11,
            fontFamily: 'monospace',
            lineHeight: 1.6,
            overflowX: 'auto',
            maxHeight: 480,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            m: 0,
          }}
        >
          {isJson ? highlightJson(formatted) : <span style={{ color: '#d4d4d4' }}>{formatted}</span>}
        </Box>
      </Collapse>
    </Box>
  );
}

function MonoText({ children }: { children: React.ReactNode }) {
  return <Typography component="span" sx={{ fontSize: 13, fontFamily: 'monospace' }}>{children}</Typography>;
}

function Dollar({ cents }: { cents: number | null }) {
  if (cents == null) return <Typography component="span" sx={{ fontSize: 13, color: 'text.disabled' }}>—</Typography>;
  return <Typography component="span" sx={{ fontSize: 13, fontWeight: 500 }}>${(cents / 100).toFixed(2)}</Typography>;
}

// ── Page ──────────────────────────────────────────────────────

export default function PaymentDetailPage() {
  const { storeId, paymentId } = useParams<{ storeId: string; paymentId: string }>();
  const { timezone } = useTimezone();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(payment ? `Payment · ${payment.id.slice(0, 8)}` : null);

  useEffect(() => {
    if (!storeId || !paymentId) return;
    setLoading(true);
    api
      .getPaymentDetail(Number(storeId), paymentId)
      .then(setPayment)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [storeId, paymentId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !payment) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error ?? 'Payment not found.'}</Typography>
      </Box>
    );
  }

  const fmt = (iso: string | null) => iso ? formatWithTimezone(iso, timezone) : null;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, bgcolor: 'white', mt: 5 , mb: 5}}>

      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>Payment</Typography>
        <Badge
          label={payment.status}
          bg={PAYMENT_STATUS_BG[payment.status] ?? '#f5f5f5'}
          color={PAYMENT_STATUS_COLOR[payment.status] ?? '#616161'}
        />
        <Typography variant="caption" sx={{ px: 0.75, py: 0.2, borderRadius: 0.5, bgcolor: '#e8eaf6', color: '#283593', fontWeight: 600 }}>
          {METHOD_LABEL[payment.method] ?? payment.method}
        </Typography>
        {payment.transaction?.pgProvider && (
          <Typography
            variant="caption"
            sx={{
              px: 0.75, py: 0.2, borderRadius: 0.5, fontWeight: 700, fontSize: 12,
              bgcolor: PG_BG[payment.transaction.pgProvider] ?? '#f5f5f5',
              color: PG_COLOR[payment.transaction.pgProvider] ?? '#616161',
            }}
          >
            {payment.transaction.pgProvider}
          </Typography>
        )}
      </Box>
      <Typography sx={{ fontSize: 12, fontFamily: 'monospace', color: 'text.secondary', mb: 2 }}>{payment.id}</Typography>

      <Divider sx={{ mb: 2.5 }} />

      {/* Payment Info */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle>Payment Info</SectionTitle>
        <InfoRow label="Payment ID" value={<MonoText>{payment.id}</MonoText>} />
        <InfoRow label="Check ID" value={payment.checkId} />
        <InfoRow
          label=""
          value={
            <Typography
              component="a"
              href={`/stores/${storeId}/checks/${payment.checkId}`}
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
              → Check #{payment.checkId}
            </Typography>
          }
        />
        <InfoRow label="Method" value={METHOD_LABEL[payment.method] ?? payment.method} />
        <InfoRow label="Currency" value={payment.currency} />
        {payment.originalPaymentId && (
          <InfoRow label="Original Payment ID" value={<MonoText>{payment.originalPaymentId}</MonoText>} />
        )}
        {payment.reason && (
          <InfoRow label="Reason" value={payment.reason} />
        )}
        {payment.detail && (
          <InfoRow label="Detail" value={<Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{payment.detail}</Typography>} />
        )}
        <Divider sx={{ my: 1.5 }} />
        <SectionTitle>Amounts</SectionTitle>
        <InfoRow label="Amount" value={<Dollar cents={payment.amount} />} />
        <InfoRow label="Tax" value={<Dollar cents={payment.taxAmount} />} />
        <InfoRow label="Tip" value={<Dollar cents={payment.tipAmount} />} />
        <Divider sx={{ my: 1.5 }} />
        <SectionTitle>Timestamps</SectionTitle>
        <InfoRow label="Created" value={fmt(payment.createdAt)} />
        <InfoRow label="Paid At" value={fmt(payment.paidAt)} />
        <InfoRow label="Voided At" value={fmt(payment.voidedAt)} />
        <InfoRow label="Refunded At" value={fmt(payment.refundedAt)} />
      </Box>

      {/* Transaction */}
      <Divider sx={{ my: 2.5 }} />
      <SectionTitle>Transaction</SectionTitle>

      {!payment.transaction ? (
        <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            연결된 트랜잭션이 없습니다. (CASH 등 PG를 사용하지 않은 결제입니다.)
          </Typography>
        </Box>
      ) : (
        <Box>
          <InfoRow label="Transaction ID" value={<MonoText>{payment.transaction.id}</MonoText>} />
          <InfoRow label="Type" value={payment.transaction.type} />
          <InfoRow
            label="Status"
            value={
              <Badge
                label={payment.transaction.status}
                bg={TXN_STATUS_BG[payment.transaction.status] ?? '#f5f5f5'}
                color={TXN_STATUS_COLOR[payment.transaction.status] ?? '#616161'}
              />
            }
          />
          <InfoRow label="PG Provider" value={payment.transaction.pgProvider} />
          <InfoRow label="Auth Code" value={payment.transaction.authCode} />
          <InfoRow label="PG Transaction Ref" value={<MonoText>{payment.transaction.pgTransactionRef ?? '—'}</MonoText>} />
          <InfoRow label="PG Order Ref" value={<MonoText>{payment.transaction.pgOrderRef ?? '—'}</MonoText>} />
          {payment.transaction.originalTransactionId && (
            <InfoRow label="Original Txn ID" value={<MonoText>{payment.transaction.originalTransactionId}</MonoText>} />
          )}
          <InfoRow label="Message" value={payment.transaction.message} />
          <Divider sx={{ my: 1 }} />
          <InfoRow label="Amount" value={<Dollar cents={payment.transaction.amount} />} />
          <InfoRow label="Tip" value={<Dollar cents={payment.transaction.tipAmount} />} />
          <InfoRow label="Tax" value={<Dollar cents={payment.transaction.taxAmount} />} />
          <InfoRow label="Currency" value={payment.transaction.currency} />
          <Divider sx={{ my: 1 }} />
          <InfoRow label="Card Brand" value={payment.transaction.cardBrand} />
          <InfoRow label="Card Type" value={payment.transaction.cardType} />
          <InfoRow label="Card Last 4" value={payment.transaction.cardLast4} />
          <InfoRow label="Card Masked Account" value={<MonoText>{payment.transaction.cardMaskedAccount ?? '—'}</MonoText>} />
          <InfoRow label="Card Entry Mode" value={payment.transaction.cardEntryMode} />
          <InfoRow label="Card Ref" value={<MonoText>{payment.transaction.cardRef ?? '—'}</MonoText>} />
          <Divider sx={{ my: 1 }} />
          <InfoRow label="Transacted At" value={fmt(payment.transaction.transactedAt)} />
          <InfoRow label="Created At" value={fmt(payment.transaction.createdAt)} />
          {payment.transaction.signatureUrl && (
            <InfoRow
              label="Signature"
              value={
                <Box
                  component="img"
                  src={`${import.meta.env.VITE_RECIEPT_MEDIA_HOST ?? ''}${payment.transaction.signatureUrl}`}
                  alt="signature"
                  sx={{ maxWidth: 240, maxHeight: 80, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'white', display: 'block' }}
                />
              }
            />
          )}
          {payment.transaction.rawResBody && (
            <>
              <Divider sx={{ my: 1 }} />
              <RawResBody raw={payment.transaction.rawResBody} />
            </>
          )}

          
        </Box>
      )}
    </Box>
  );
}
