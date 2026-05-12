import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { TransactionDetail } from '../types/transaction';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';

const VITE_RECIEPT_MEDIA_HOST = import.meta.env.VITE_RECIEPT_MEDIA_HOST ?? '';

// ── 배지 색상 ──────────────────────────────────────────────────

const TX_TYPE_BG: Record<string, string> = { SALE: '#e8f5e9', VOID: '#ffebee', REFUND: '#fff3e0' };
const TX_TYPE_COLOR: Record<string, string> = { SALE: '#2e7d32', VOID: '#c62828', REFUND: '#e65100' };
const TX_STATUS_BG: Record<string, string> = {
  PENDING: '#fff8e1', APPROVED: '#e8f5e9', VOIDED: '#ffebee', CLEARED: '#e3f2fd', ERROR: '#ffebee',
};
const TX_STATUS_COLOR: Record<string, string> = {
  PENDING: '#f57f17', APPROVED: '#2e7d32', VOIDED: '#c62828', CLEARED: '#1565c0', ERROR: '#c62828',
};
const TENDER_BG: Record<string, string> = {
  CARD: '#e3f2fd', CASH: '#e8f5e9', GIFT_CARD: '#f3e5f5', OTHER: '#f5f5f5',
};
const TENDER_COLOR: Record<string, string> = {
  CARD: '#1565c0', CASH: '#2e7d32', GIFT_CARD: '#6a1b9a', OTHER: '#616161',
};
const TENDER_LABEL: Record<string, string> = {
  CARD: 'Card', CASH: 'Cash', GIFT_CARD: 'Gift Card', OTHER: 'Other',
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
    <Box sx={{ display: 'flex', gap: 1, py: 0.4 }}>
      <Typography sx={{ color: 'text.secondary', minWidth: 180, fontSize: 12, flexShrink: 0 }}>{label}</Typography>
      <Typography component="div" sx={{ fontSize: 12, fontWeight: 500, wordBreak: 'break-all' }}>
        {value ?? <Typography component="span" sx={{ fontSize: 12, color: 'text.disabled' }}>—</Typography>}
      </Typography>
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: 11, mb: 0.75, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
      {children}
    </Typography>
  );
}

function AmountRow({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
      <Typography sx={{ fontSize: bold ? 13 : 12, fontWeight: bold ? 700 : 400, color: muted ? 'text.disabled' : 'text.secondary' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: bold ? 13 : 12, fontWeight: bold ? 700 : 400, color: muted ? 'text.disabled' : 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}

function MonoText({ children }: { children: React.ReactNode }) {
  return <Typography component="span" sx={{ fontSize: 11, fontFamily: 'monospace' }}>{children}</Typography>;
}

const centsToDisplay = (cents: number) => `$${(cents / 100).toFixed(2)}`;

// ── Dialog 컴포넌트 ────────────────────────────────────────────

interface TransactionDetailDialogProps {
  open: boolean;
  storeId: number;
  transactionId: string;
  onClose: () => void;
}

export function TransactionDetailDialog({ open, storeId, transactionId, onClose }: TransactionDetailDialogProps) {
  const { timezone } = useTimezone();
  const fmt = (iso: string | null | undefined) => iso ? formatWithTimezone(iso, timezone) : null;

  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !transactionId) return;
    setLoading(true);
    setTx(null);
    setError(null);
    api.getTransactionDetail(storeId, transactionId)
      .then(setTx)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [open, storeId, transactionId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, pr: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Transaction</Typography>
          {tx && (
            <>
              <Badge label={tx.transactionType} bg={TX_TYPE_BG[tx.transactionType] ?? '#f5f5f5'} color={TX_TYPE_COLOR[tx.transactionType] ?? '#616161'} />
              <Badge label={tx.transactionStatus} bg={TX_STATUS_BG[tx.transactionStatus] ?? '#f5f5f5'} color={TX_STATUS_COLOR[tx.transactionStatus] ?? '#616161'} />
              <Badge label={TENDER_LABEL[tx.tender] ?? tx.tender} bg={TENDER_BG[tx.tender] ?? '#f5f5f5'} color={TENDER_COLOR[tx.tender] ?? '#616161'} />
            </>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Typography color="error">{error}</Typography>}

        {!loading && tx && (
          <>
            {/* Transaction — 2-col */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 2 }}>
              {/* Left: Info */}
              <Box>
                <SectionTitle>Info</SectionTitle>
                <InfoRow label="Transaction ID" value={<MonoText>{tx.transactionId}</MonoText>} />
                <InfoRow
                  label="Payment ID"
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MonoText>{tx.paymentId}</MonoText>
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
                        onClick={() => window.open(`/stores/${storeId}/payments/${tx.paymentId}`, '_blank')}
                        sx={{ fontSize: 11, textTransform: 'none', py: 0.2, px: 0.75, minWidth: 'unset' }}
                      >
                        Payment 상세
                      </Button>
                    </Box>
                  }
                />
                <InfoRow
                  label="Check ID"
                  value={
                    <Typography
                      component="a"
                      href={`/stores/${storeId}/checks/${tx.checkId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontSize: 12, fontFamily: 'monospace', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      #{tx.checkId}
                    </Typography>
                  }
                />
                <InfoRow label="Invoice#" value={tx.invoiceNo ? <MonoText>{tx.invoiceNo}</MonoText> : null} />
                <InfoRow label="Auth Code" value={tx.authCode ? <MonoText>{tx.authCode}</MonoText> : null} />
                <InfoRow label="Table" value={tx.tableName} />
                <InfoRow label="Guests" value={tx.guestCount > 0 ? String(tx.guestCount) : null} />
                <InfoRow label="Employee" value={tx.employeeName} />
                <InfoRow label="PG Provider" value={tx.pgProvider} />
                <InfoRow label="Paid At" value={fmt(tx.paidAt)} />
              </Box>

              {/* Right: Amounts + Card */}
              <Box>
                <SectionTitle>Amount</SectionTitle>
                <AmountRow label="Subtotal" value={centsToDisplay(tx.subtotal)} />
                <AmountRow label="Tax" value={centsToDisplay(tx.tax)} />
                <AmountRow label="Tip" value={centsToDisplay(tx.tip)} />
                <Divider sx={{ my: 0.5 }} />
                <AmountRow label="Total" value={centsToDisplay(tx.total)} bold />
                <Box sx={{ mt: 1 }}>
                  <AmountRow label="Total Qty" value={String(tx.totalQuantity)} muted />
                </Box>

                {tx.tender === 'CARD' && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <SectionTitle>Card</SectionTitle>
                    <InfoRow label="Brand" value={tx.cardBrand} />
                    <InfoRow label="Type" value={tx.cardType} />
                    <InfoRow label="Last 4" value={tx.cardLast4
                      ? <Typography component="span" sx={{ fontSize: 12, fontFamily: 'monospace', letterSpacing: 1 }}>···· {tx.cardLast4}</Typography>
                      : null
                    } />
                  </>
                )}
              </Box>
            </Box>

            {/* Signature */}
            {tx.signatureUrl && (
              <>
                <Divider sx={{ mb: 1.5 }} />
                <SectionTitle>Signature</SectionTitle>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, display: 'inline-block', bgcolor: 'grey.50', mb: 1 }}>
                  <Box component="img" src={VITE_RECIEPT_MEDIA_HOST + tx.signatureUrl} alt="Signature" sx={{ maxWidth: 280, maxHeight: 100, display: 'block' }} />
                </Box>
              </>
            )}

          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
