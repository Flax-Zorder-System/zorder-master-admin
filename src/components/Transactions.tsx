import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import type { TransactionListItem, TransactionSummary } from '../types/transaction';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { TransactionDetailDialog } from '../pages/TransactionDetailPage';

// ── 상수 ───────────────────────────────────────────────────────

type DateRange = 'today' | 'yesterday' | 'last7days' | 'custom';
const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'custom', label: 'Custom' },
];

const TENDER_OPTIONS = ['', 'CARD', 'CASH', 'GIFT_CARD', 'OTHER'] as const;
const TENDER_LABEL: Record<string, string> = {
  '': 'All',
  CARD: 'Card',
  CASH: 'Cash',
  GIFT_CARD: 'Gift Card',
  OTHER: 'Other',
};

const TX_TYPE_BG: Record<string, string> = {
  SALE: '#e8f5e9',
  VOID: '#ffebee',
  REFUND: '#fff3e0',
};
const TX_TYPE_COLOR: Record<string, string> = {
  SALE: '#2e7d32',
  VOID: '#c62828',
  REFUND: '#e65100',
};

const TENDER_BG: Record<string, string> = {
  CARD: '#e3f2fd',
  CASH: '#e8f5e9',
  GIFT_CARD: '#f3e5f5',
  OTHER: '#f5f5f5',
};
const TENDER_COLOR: Record<string, string> = {
  CARD: '#1565c0',
  CASH: '#2e7d32',
  GIFT_CARD: '#6a1b9a',
  OTHER: '#616161',
};

const centsToDisplay = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const PAGE_SIZE = 30;

// ── 배지 ───────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 0.75, py: 0.2, borderRadius: 0.5, fontWeight: 600, whiteSpace: 'nowrap',
        bgcolor: TX_TYPE_BG[type] ?? '#f5f5f5',
        color: TX_TYPE_COLOR[type] ?? '#616161',
      }}
    >
      {type}
    </Typography>
  );
}

function TenderBadge({ tender }: { tender: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 0.75, py: 0.2, borderRadius: 0.5, fontWeight: 600, whiteSpace: 'nowrap',
        bgcolor: TENDER_BG[tender] ?? '#f5f5f5',
        color: TENDER_COLOR[tender] ?? '#616161',
      }}
    >
      {TENDER_LABEL[tender] ?? tender}
    </Typography>
  );
}

// ── 요약 바 ────────────────────────────────────────────────────

function SummaryBar({ summary }: { summary: TransactionSummary }) {
  return (
    <Box
      sx={{
        display: 'flex', gap: 3, mb: 2, px: 2, py: 1.25,
        bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 1,
        flexWrap: 'wrap',
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Transactions
        </Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{summary.numberOfPayments.toLocaleString()}</Typography>
      </Box>
      <Box sx={{ width: '1px', bgcolor: 'divider', alignSelf: 'stretch' }} />
      <Box>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Total
        </Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{centsToDisplay(summary.paymentsTotal)}</Typography>
      </Box>
      <Box sx={{ width: '1px', bgcolor: 'divider', alignSelf: 'stretch' }} />
      <Box>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Tips
        </Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{centsToDisplay(summary.tipTotal)}</Typography>
      </Box>
    </Box>
  );
}

// ── 행 ─────────────────────────────────────────────────────────

function TransactionRow({ tx, timezone, onSelect }: { tx: TransactionListItem; timezone: string; onSelect: (id: string) => void }) {
  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      onClick={() => onSelect(tx.transactionId)}
    >
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{tx.checkId}</TableCell>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {tx.transactionId}
      </TableCell>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>{tx.invoiceNo ?? '—'}</TableCell>
      <TableCell><TypeBadge type={tx.transactionType} /></TableCell>
      <TableCell sx={{ fontSize: 12 }}>{tx.channel ?? '—'}</TableCell>
      <TableCell sx={{ fontSize: 11, color: 'text.secondary', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Tooltip title={tx.orderedItems ?? ''} placement="top" disableHoverListener={!tx.orderedItems}>
          <span>{tx.orderedItems ?? '—'}</span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{centsToDisplay(tx.total)}</TableCell>
      <TableCell sx={{ fontSize: 12 }}>{tx.employeeName ?? '—'}</TableCell>
      <TableCell><TenderBadge tender={tx.tender} /></TableCell>
      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{tx.cardLast4 ? `···· ${tx.cardLast4}` : '—'}</TableCell>
      <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{tx.pgProvider ?? '—'}</TableCell>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {tx.transactedAt ? formatWithTimezone(tx.transactedAt, timezone) : '—'}
      </TableCell>
    </TableRow>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────

export default function Transactions({ storeId }: { storeId: number }) {
  const { timezone } = useTimezone();
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [tender, setTender] = useState('');

  // cursor pagination
  const [cursors, setCursors] = useState<number[]>([]); // stack of cursors for pages > 0
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(true);

  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const currentCursor = cursors.length > 0 ? cursors[cursors.length - 1] : undefined;
  const pageNum = cursors.length;

  // filter 변경 시 커서 초기화
  const resetCursors = () => setCursors([]);

  // search 입력 debounce
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      resetCursors();
    }, 400);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getTransactions(storeId, {
        dateRange,
        startDate: dateRange === 'custom' && startDate ? startDate : undefined,
        endDate: dateRange === 'custom' && endDate ? endDate : undefined,
        search: search || undefined,
        tender: tender || undefined,
        cursor: currentCursor,
        pageSize: PAGE_SIZE,
      })
      .then((res) => {
        setTransactions(res.transactions);
        setSummary(res.summary);
        setNextCursor(res.nextCursor);
        setIsLastPage(res.isLastPage);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [storeId, dateRange, startDate, endDate, search, tender, cursors, tick]);

  const handleDateRange = (range: DateRange) => {
    setDateRange(range);
    resetCursors();
  };

  const handleTender = (value: string) => {
    setTender(value);
    resetCursors();
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Transactions</Typography>
          <Tooltip title="새로고침">
            <IconButton size="small" onClick={() => setTick((t) => t + 1)} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* Date range */}
          <ButtonGroup size="small" variant="outlined">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={dateRange === opt.value ? 'contained' : 'outlined'}
                onClick={() => handleDateRange(opt.value)}
                sx={{ fontSize: 12, textTransform: 'none' }}
              >
                {opt.label}
              </Button>
            ))}
          </ButtonGroup>

          {/* Custom date inputs */}
          {dateRange === 'custom' && (
            <>
              <TextField
                type="date"
                size="small"
                label="Start"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); resetCursors(); }}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 150 }}
              />
              <TextField
                type="date"
                size="small"
                label="End"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); resetCursors(); }}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 150 }}
              />
            </>
          )}

          {/* Search */}
          <TextField
            size="small"
            placeholder="Check#, Invoice#, last 4"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 200 }}
          />

          {/* Tender filter */}
          <ButtonGroup size="small" variant="outlined">
            {TENDER_OPTIONS.map((t) => (
              <Button
                key={t}
                variant={tender === t ? 'contained' : 'outlined'}
                onClick={() => handleTender(t)}
                sx={{ fontSize: 12, textTransform: 'none' }}
              >
                {TENDER_LABEL[t]}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Box>

      {/* Summary */}
      {summary && !loading && !error && <SummaryBar summary={summary} />}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}

      {selectedTxId && (
        <TransactionDetailDialog
          open
          storeId={storeId}
          transactionId={selectedTxId}
          onClose={() => setSelectedTxId(null)}
        />
      )}

      {!loading && !error && (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 70 }}>check#</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 320 }}>transactionId</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>invoice#</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80 }}>type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 100 }}>channel</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 180 }}>items</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90, textAlign: 'right' }}>total</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 110 }}>employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90 }}>tender</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 160 }}>card</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 80 }}>pg</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>transactedAt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TransactionRow key={tx.transactionId} tx={tx} timezone={timezone} onSelect={setSelectedTxId} />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Cursor pagination */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mr: 1 }}>
              Page {pageNum + 1}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              disabled={pageNum === 0}
              onClick={() => setCursors((prev) => prev.slice(0, -1))}
              sx={{ fontSize: 12, textTransform: 'none' }}
            >
              ← Prev
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={isLastPage || nextCursor == null}
              onClick={() => {
                if (nextCursor != null) setCursors((prev) => [...prev, nextCursor]);
              }}
              sx={{ fontSize: 12, textTransform: 'none' }}
            >
              Next →
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
