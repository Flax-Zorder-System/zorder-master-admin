import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useEffect, useState } from 'react';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { api } from '../lib/api';
import type { AuditLog } from '../types/auditLog';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function MetadataCell({ metadata }: { metadata: Record<string, unknown> | null }) {
  if (!metadata) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const entries = Object.entries(metadata);
  if (entries.length === 0) return <Typography variant="caption" color="text.disabled">—</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
      {entries.map(([k, v]) => (
        <Box key={k} sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline' }}>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{k}:</Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', wordBreak: 'break-all', color: 'text.primary' }}
          >
            {String(v)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function AuditLogRow({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);
  const { timezone } = useTimezone();
  const isFailed = log.status === 'FAILED';

  return (
    <>
      <TableRow
        hover
        sx={{
          '& > td': { borderBottom: open ? 'none' : undefined },
          bgcolor: isFailed ? 'error.50' : undefined,
        }}
      >
        <TableCell sx={{ width: 32, p: 0, pl: 0.5 }}>
          <IconButton size="small" onClick={() => setOpen((v) => !v)}>
            {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{log.id}</TableCell>
        <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{log.action}</TableCell>
        <TableCell>
          <Typography
            variant="caption"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: isFailed ? 'error.100' : 'success.100',
              color: isFailed ? 'error.dark' : 'success.dark',
              fontWeight: 600,
            }}
          >
            {log.status}
          </Typography>
        </TableCell>
        <TableCell sx={{ fontSize: 12 }}>{log.triggeredBy}</TableCell>
        <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{log.ipAddress ?? '—'}</TableCell>
        <TableCell sx={{ fontSize: 12, textAlign: 'right', pr: 2 }}>
          {log.durationMs != null ? (
            <>
              {log.durationMs.toLocaleString()}
              <Typography component="span" variant="caption" color="text.secondary"> ms</Typography>
            </>
          ) : '—'}
        </TableCell>
        <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
          {formatWithTimezone(log.createdAt, timezone)}
        </TableCell>
      </TableRow>

      <TableRow sx={{ bgcolor: isFailed ? 'error.50' : 'grey.50' }}>
        <TableCell colSpan={8} sx={{ py: 0, borderBottom: open ? undefined : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  METADATA
                </Typography>
                <MetadataCell metadata={log.metadata} />
              </Box>

              {isFailed && log.message && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main', display: 'block', mb: 0.5 }}>
                    ERROR
                  </Typography>
                  <Typography variant="caption" color="error.dark" sx={{ fontFamily: 'monospace' }}>
                    {log.message}
                  </Typography>
                </Box>
              )}

              {(log.posId != null || log.userId != null) && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    IDs
                  </Typography>
                  {log.posId != null && (
                    <Typography variant="caption" sx={{ display: 'block' }}>posId: <b>{log.posId}</b></Typography>
                  )}
                  {log.userId != null && (
                    <Typography variant="caption" sx={{ display: 'block' }}>userId: <b>{log.userId}</b></Typography>
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function AuditLogs({ storeId }: { storeId: number }) {
  const { timezone } = useTimezone();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(0);
    api
      .getAuditLogs(storeId, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      .then(setLogs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, [storeId, startDate, endDate]);

  const paged = logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Audit Logs
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="start date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          <TextField
            label="end date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          <Tooltip title={`Displaying times in ${timezone}`}>
            <Typography variant="caption" color="text.secondary">
              TZ: {timezone}
            </Typography>
          </Tooltip>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error">{error}</Typography>
      )}

      {!loading && !error && (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 32, p: 0, bgcolor: 'grey.50' }} />
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 40 }}>id</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 120 }}>action</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 90 }}>status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 100 }}>triggeredBy</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 130 }}>ipAddress</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50', width: 100, textAlign: 'right', pr: 2 }}>duration</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'grey.50' }}>createdAt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((log) => <AuditLogRow key={log.id} log={log} />)
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={logs.length}
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
