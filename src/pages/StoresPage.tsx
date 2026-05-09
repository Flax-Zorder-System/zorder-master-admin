import {
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { StoreAdminListItem } from '../types/api';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { usePageTitle } from '../hooks/usePageTitle';

const columns = [
  { id: 'id', label: 'no', width: 40 },
  { id: 'storeName', label: 'store name', width: 180 },
  { id: 'userid', label: 'userid', width: 90 },
  { id: 'userName', label: 'manager', width: 100 },
  { id: 'isAyce', label: 'ayce', width: 60 },
  { id: 'isActive', label: 'status', width: 70 },
  { id: 'posName', label: 'pos', width: 80 },
  { id: 'timezone', label: 'timezone', width: 150 },
  { id: 'startAt', label: 'start date', width: 180 },
  { id: 'expireAt', label: 'expire date', width: 180 },
] as const;

export default function StoresPage() {
  usePageTitle('Stores');
  const navigate = useNavigate();
  const { timezone } = useTimezone();
  const [stores, setStores] = useState<StoreAdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = q
    ? stores.filter(
        (s) =>
          s.storeName.toLowerCase().includes(q) ||
          s.userid.toLowerCase().includes(q) ||
          s.userName.toLowerCase().includes(q) ||
          (s.posName ?? '').toLowerCase().includes(q) ||
          s.timezone.toLowerCase().includes(q),
      )
    : stores;

  useEffect(() => {
    api
      .getStoreAdmins()
      .then(setStores)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load stores'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto', maxWidth: 1800, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Stores
        </Typography>
        <TextField
          size="small"
          placeholder="store name, userid, manager, pos, timezone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ width: 360 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error">{error}</Typography>
      )}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table size="small" sx={{ '& .MuiTableHead-root': { position: 'sticky', top: 0, bgcolor: 'grey.50' } }}>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      whiteSpace: 'nowrap',
                      width: col.width,
                      bgcolor: 'grey.50',
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                    No stores found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((store) => (
                <TableRow
                  key={store.id}
                  hover
                  onClick={() => navigate(`/stores/${store.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontSize: 12 }}>{store.id}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{store.storeName}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{store.userid}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{store.userName}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    <Chip
                      label={store.isAyce ? 'Y' : 'N'}
                      size="small"
                      color={store.isAyce ? 'primary' : 'default'}
                      sx={{ fontSize: 10, height: 18 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    <Chip
                      label={store.isActive ? 'active' : 'inactive'}
                      size="small"
                      color={store.isActive ? 'success' : 'default'}
                      sx={{ fontSize: 10, height: 18 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{store.posName ?? '-'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{store.timezone}</TableCell>
                  <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {formatWithTimezone(store.startAt, timezone)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {formatWithTimezone(store.expireAt, timezone)}
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
