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
import type { PrintJobSummary, PrintJobStatus, PrintJobSourceType } from '../types/printJob';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { DateRangeFilter, toISODate, useDateRangeFilter } from './ui/DateRangeFilter';

// ── 상태 배지 ──────────────────────────────────────────────────

const STATUS_BG: Record<PrintJobStatus, string> = {
  PENDING: '#f5f5f5',
  ENQUEUED: '#e3f2fd',
  PRINTING: '#fff8e1',
  COMPLETED: '#e8f5e9',
  FAILED: '#ffebee',
  EXPIRED: '#fafafa',
};
const STATUS_COLOR: Record<PrintJobStatus, string> = {
  PENDING: '#9e9e9e',
  ENQUEUED: '#1565c0',
  PRINTING: '#f57f17',
  COMPLETED: '#2e7d32',
  FAILED: '#c62828',
  EXPIRED: '#bdbdbd',
};

const SOURCE_BG: Record<PrintJobSourceType, string> = {
  ORDER_TICKET: '#ede7f6',
  ORDER: '#e8eaf6',
  PAYMENT: '#e0f2f1',
  RECEIPT: '#fce4ec',
};
const SOURCE_COLOR: Record<PrintJobSourceType, string> = {
  ORDER_TICKET: '#4527a0',
  ORDER: '#283593',
  PAYMENT: '#00695c',
  RECEIPT: '#880e4f',
};

function StatusBadge({ label }: { label: string }) {
  const key = label as PrintJobStatus;
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
      {label}
    </Typography>
  );
}

function SourceBadge({ label }: { label: string }) {
  const key = label as PrintJobSourceType;
  return (
    <Typography
      variant="caption"
      sx={{
        px: 0.75, py: 0.2, borderRadius: 0.5,
        bgcolor: SOURCE_BG[key] ?? '#f5f5f5',
        color: SOURCE_COLOR[key] ?? '#616161',
        fontWeight: 600, whiteSpace: 'nowrap', fontSize: 10,
      }}
    >
      {label}
    </Typography>
  );
}

// ── 행 ─────────────────────────────────────────────────────────

function PrintJobRow({ job }: { job: PrintJobSummary }) {
  const { timezone } = useTimezone();

  return (
    <TableRow hover>
      <TableCell sx={{ fontSize: 12 }}>{job.id}</TableCell>
      <TableCell sx={{ fontSize: 12 }}>
        <SourceBadge label={job.sourceTypeLabel} />
      </TableCell>
      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{job.sourceId}</TableCell>
      <TableCell>
        <StatusBadge label={job.statusLabel} />
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'center' }}>{job.retryCount}</TableCell>
      <TableCell sx={{ fontSize: 12 }}>{job.printerId}</TableCell>
      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>
        {job.printerMacAddress ?? '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12 }}>
        {job.message ? (
          <Tooltip title={job.message} placement="top">
            <Typography
              sx={{
                fontSize: 11, color: 'error.main',
                maxWidth: 160, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {job.message}
            </Typography>
          </Tooltip>
        ) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12 }}>
        {job.printImageBase64Url ? (
          <Typography
            component="a"
            href={job.printImageBase64Url.replace(/\.base64$/, '.png')}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontSize: 12, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            이미지보기
          </Typography>
        ) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {formatWithTimezone(job.createdAt, timezone)}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {job.completedAt ? formatWithTimezone(job.completedAt, timezone) : '—'}
      </TableCell>
      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {job.failedAt ? formatWithTimezone(job.failedAt, timezone) : '—'}
      </TableCell>
    </TableRow>
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export default function PrintJobs({ storeId }: { storeId: number }) {
  const [jobs, setJobs] = useState<PrintJobSummary[]>([]);
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
      .getPrintJobs(storeId, {
        page: page + 1,
        pageSize: rowsPerPage,
        startDate: dateFilter.startDate ? toISODate(dateFilter.startDate) : undefined,
        endDate: dateFilter.endDate ? toISODate(dateFilter.endDate) : undefined,
      })
      .then((res) => {
        setJobs(res.jobs);
        setTotal(res.total);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load print jobs'))
      .finally(() => setLoading(false));
  }, [storeId, page, rowsPerPage, dateFilter.startDate, dateFilter.endDate, tick]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Print Jobs</Typography>
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
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 70 }}>id</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 120 }}>source type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 100 }}>source id</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 100 }}>status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>retry</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 70 }}>printer</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 140 }}>mac</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 160 }}>message</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 160 }}>url</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>createdAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>completedAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>failedAt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                      No print jobs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => <PrintJobRow key={job.id} job={job} />)
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
