import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mockStores } from '../mocks/stores';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';

const columns = [
  { id: 'id', label: 'no', width: 40 },
  { id: 'name', label: 'store name', width: 180 },
  { id: 'userid', label: 'userid', width: 90 },
  { id: 'manager', label: 'manager', width: 80 },
  { id: 'type', label: 'type', width: 80 },
  { id: 'ayce', label: 'ayce', width: 60 },
  { id: 'status', label: 'status', width: 70 },
  { id: 'pos', label: 'pos', width: 70 },
  { id: 'timezone', label: 'timezone', width: 150 },
  { id: 'createdDate', label: 'created date', width: 180 },
  { id: 'updatedDate', label: 'updated date', width: 180 },
] as const;

export default function StoresPage() {
  const navigate = useNavigate();

  const { timezone } = useTimezone();


  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto', maxWidth: 1800, margin: '0 auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Stores
      </Typography>
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
            {mockStores.map((store) => (
              <TableRow
                key={store.id}
                hover
                onClick={() => navigate(`/stores/${store.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ fontSize: 12 }}>{store.id}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{store.name}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{store.userid}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{store.manager}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{store.type}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  <Chip
                    label={store.ayce ? 'Y' : 'N'}
                    size="small"
                    color={store.ayce ? 'primary' : 'default'}
                    sx={{ fontSize: 10, height: 18 }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  <Chip
                    label={store.status}
                    size="small"
                    color={store.status === 'active' ? 'success' : 'default'}
                    sx={{ fontSize: 10, height: 18 }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{store.pos}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{store.timezone}</TableCell>
                <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  {formatWithTimezone(store.createdDate, timezone)}
                </TableCell>
                <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  {formatWithTimezone(store.updatedDate, timezone)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
