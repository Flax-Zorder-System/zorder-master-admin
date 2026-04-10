import {
  Box,
  Chip,
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
  Tooltip,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useState } from 'react';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { mockAuditLogs } from '../mocks/auditLogs';
import type { AuditLog } from '../types/auditLog';

const PAGE_SIZE_OPTIONS = [10, 20, 50];


function MetadataCell({ metadata }: { metadata: Record<string, unknown> }) {
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
        {/* expand toggle */}
        <TableCell sx={{ width: 32, p: 0, pl: 0.5 }}>
          <IconButton size="small" onClick={() => setOpen((v) => !v)}>
            {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{log.id}</TableCell>

        <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{log.action}</TableCell>

        <TableCell>
          <Chip
            label={log.status}
            size="small"
            color={log.status === 'SUCCESS' ? 'success' : 'error'}
            sx={{ fontSize: 11, height: 20 }}
          />
        </TableCell>

        <TableCell sx={{ fontSize: 12 }}>{log.triggeredBy}</TableCell>

        <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{log.ipAddress}</TableCell>

        <TableCell sx={{ fontSize: 12, textAlign: 'right', pr: 2 }}>
          {log.durationMs.toLocaleString()}
          <Typography component="span" variant="caption" color="text.secondary"> ms</Typography>
        </TableCell>

        <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
          {formatWithTimezone(log.createdAt, timezone)}
        </TableCell>
      </TableRow>

      {/* Expanded detail row */}
      <TableRow sx={{ bgcolor: isFailed ? 'error.50' : 'grey.50' }}>
        <TableCell colSpan={8} sx={{ py: 0, borderBottom: open ? undefined : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {/* Metadata */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  METADATA
                </Typography>
                <MetadataCell metadata={log.metadata} />
              </Box>

              {/* message (FAILED only) */}
              {isFailed && log.message && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'error', display: 'block', mb: 0.5 }}>
                    ERROR
                  </Typography>
                  <Typography variant="caption" color="error.dark" sx={{ fontFamily: 'monospace' }}>
                    {log.message}
                  </Typography>
                </Box>
              )}

              {/* posId / userId if present */}
              {(log.posId || log.userId) && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    IDs
                  </Typography>
                  {log.posId && (
                    <Typography variant="caption" sx={{ display: 'block' }}>posId: <b>{log.posId}</b></Typography>
                  )}
                  {log.userId && (
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
  void storeId; // 실제 API 연동 시 사용
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { timezone } = useTimezone();

  const total = mockAuditLogs.length;
  const paged = mockAuditLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Audit Logs
        </Typography>
        <Tooltip title={`Displaying times in ${timezone}`}>
          <Typography variant="caption" color="text.secondary">
            TZ: {timezone}
          </Typography>
        </Tooltip>
      </Box>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
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
              {paged.map((log) => (
                <AuditLogRow key={log.id} log={log} />
              ))}
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
    </Box>
  );
}
