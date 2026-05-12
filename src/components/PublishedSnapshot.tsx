import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type {
  PublishedSnapshotResponse,
  ServiceChargeSnapshotEntry,
  TaxSnapshotEntry,
  ServiceFeeSnapshotEntry,
} from '../types/publishedSnapshot';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';

// ── 공통 ──────────────────────────────────────────────────────

function SectionCard({
  title,
  publishedAt,
  timezone,
  children,
}: {
  title: string;
  publishedAt: string | null;
  timezone: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, cursor: 'pointer', bgcolor: 'grey.50' }}
        onClick={() => setOpen((v) => !v)}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 13, flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        {publishedAt && (
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: 'monospace' }}>
            published: {formatWithTimezone(publishedAt, timezone)}
          </Typography>
        )}
        <IconButton size="small" sx={{ p: 0.25 }}>
          {open ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 2 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
}

function BoolChip({ value }: { value: boolean }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 0.6, py: 0.15, borderRadius: 0.5, fontWeight: 600, fontSize: 11,
        bgcolor: value ? '#e8f5e9' : '#f5f5f5',
        color: value ? '#2e7d32' : '#9e9e9e',
      }}
    >
      {value ? 'Y' : 'N'}
    </Typography>
  );
}

function NullText({ children }: { children: React.ReactNode }) {
  if (children == null) return <Typography component="span" sx={{ color: 'text.disabled', fontSize: 12 }}>—</Typography>;
  return <>{children}</>;
}

const fmtRate = (rate: number | null) => rate != null ? `${(rate * 100).toFixed(2)}%` : null;
const fmtCents = (cents: number | null) => cents != null ? `$${(cents / 100).toFixed(2)}` : null;

// ── Metadata ──────────────────────────────────────────────────

function MetadataSection({ data, timezone }: { data: PublishedSnapshotResponse['metadata']; timezone: string }) {
  if (!data) {
    return (
      <Box sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>미publish 상태 — 캐시 없음</Typography>
      </Box>
    );
  }
  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Metadata</Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', minWidth: 100 }}>Version</Typography>
          <Typography sx={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>{data.version}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', minWidth: 100 }}>Store ID</Typography>
          <Typography sx={{ fontSize: 12 }}>{data.storeId}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', minWidth: 100 }}>Updated At</Typography>
          <Typography sx={{ fontSize: 12, fontFamily: 'monospace' }}>{formatWithTimezone(data.updatedAt, timezone)}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ── Tax ───────────────────────────────────────────────────────

function TaxRow({ t }: { t: TaxSnapshotEntry }) {
  return (
    <TableRow hover>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Tooltip title={t.id} placement="top"><span>{t.id}</span></Tooltip>
      </TableCell>
      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{t.name}</TableCell>
      <TableCell>
        <Typography variant="caption" sx={{ px: 0.6, py: 0.15, borderRadius: 0.5, bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}>
          {t.type}
        </Typography>
      </TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}><NullText>{fmtRate(t.rate)}</NullText></TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}><NullText>{fmtCents(t.fixedAmount)}</NullText></TableCell>
      <TableCell sx={{ textAlign: 'center' }}><BoolChip value={t.isDefault} /></TableCell>
      <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}><NullText>{t.rateRoundingOption}</NullText></TableCell>
      <TableCell sx={{ textAlign: 'center' }}><BoolChip value={t.enableTakeoutRate} /></TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}><NullText>{fmtRate(t.takeoutRate)}</NullText></TableCell>
    </TableRow>
  );
}

function TaxSection({ data, timezone }: { data: PublishedSnapshotResponse['tax']; timezone: string }) {
  if (!data) return (
    <SectionCard title="Tax" publishedAt={null} timezone={timezone}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>스냅샷 없음</Typography>
    </SectionCard>
  );

  const customCount = Object.keys(data.customTaxesByItem).length;

  return (
    <SectionCard title="Tax" publishedAt={data.publishedAt} timezone={timezone}>
      {data.taxes.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>세금 항목 없음</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 120 }}>id</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50' }}>name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 100 }}>type</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 80, textAlign: 'right' }}>rate</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 80, textAlign: 'right' }}>fixed</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 70, textAlign: 'center' }}>default</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 120 }}>rounding</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 80, textAlign: 'center' }}>takeout</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 90, textAlign: 'right' }}>takeout rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.taxes.map((t) => <TaxRow key={t.id} t={t} />)}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {customCount > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            커스텀 세금 매핑 아이템: <strong>{customCount}개</strong>
          </Typography>
        </Box>
      )}
    </SectionCard>
  );
}

// ── Service Charge ────────────────────────────────────────────

function ServiceChargeRow({ sc }: { sc: ServiceChargeSnapshotEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover sx={{ cursor: sc.taxes.length > 0 ? 'pointer' : 'default' }} onClick={() => sc.taxes.length > 0 && setOpen((v) => !v)}>
        <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Tooltip title={sc.id} placement="top"><span>{sc.id}</span></Tooltip>
        </TableCell>
        <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {sc.name}
            {sc.isGratuity && (
              <Typography variant="caption" sx={{ px: 0.5, py: 0.1, borderRadius: 0.5, bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, fontSize: 10 }}>
                gratuity
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="caption" sx={{ px: 0.6, py: 0.15, borderRadius: 0.5, bgcolor: '#f3e5f5', color: '#6a1b9a', fontWeight: 600 }}>
            {sc.chargeType}
          </Typography>
        </TableCell>
        <TableCell sx={{ fontSize: 12, textAlign: 'right' }}><NullText>{fmtRate(sc.rate)}</NullText></TableCell>
        <TableCell sx={{ fontSize: 12, textAlign: 'right' }}><NullText>{fmtCents(sc.fixedAmount)}</NullText></TableCell>
        <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}><NullText>{sc.chargeCalculationType}</NullText></TableCell>
        <TableCell sx={{ fontSize: 12, textAlign: 'right' }}><NullText>{sc.minCheckAmount != null ? fmtCents(sc.minCheckAmount) : null}</NullText></TableCell>
        <TableCell sx={{ textAlign: 'center' }}><BoolChip value={sc.isTaxable} /></TableCell>
        <TableCell sx={{ textAlign: 'center' }}><BoolChip value={sc.isDineIn} /></TableCell>
        <TableCell sx={{ textAlign: 'center' }}><BoolChip value={sc.isTakeout} /></TableCell>
        <TableCell sx={{ textAlign: 'center' }}><BoolChip value={sc.isDelivery} /></TableCell>
        <TableCell sx={{ fontSize: 11, color: 'text.secondary', textAlign: 'center' }}>
          {sc.taxes.length > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
              {sc.taxes.length}
              {open ? <ExpandLessIcon sx={{ fontSize: 14 }} /> : <ExpandMoreIcon sx={{ fontSize: 14 }} />}
            </Box>
          ) : '—'}
        </TableCell>
      </TableRow>
      {sc.taxes.length > 0 && (
        <TableRow>
          <TableCell colSpan={12} sx={{ p: 0, border: 0 }}>
            <Collapse in={open}>
              <Box sx={{ bgcolor: '#fafafa', px: 3, py: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: 10, color: 'text.secondary', width: 120 }}>taxId</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 10, color: 'text.secondary' }}>name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 10, color: 'text.secondary', width: 90 }}>type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 10, color: 'text.secondary', width: 70, textAlign: 'right' }}>rate</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 10, color: 'text.secondary', width: 70, textAlign: 'right' }}>fixed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sc.taxes.map((tx) => (
                      <TableRow key={tx.serviceChargeTaxId}>
                        <TableCell sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.secondary' }}>{tx.taxId}</TableCell>
                        <TableCell sx={{ fontSize: 11 }}>{tx.name}</TableCell>
                        <TableCell sx={{ fontSize: 11 }}>{tx.type}</TableCell>
                        <TableCell sx={{ fontSize: 11, textAlign: 'right' }}><NullText>{fmtRate(tx.rate)}</NullText></TableCell>
                        <TableCell sx={{ fontSize: 11, textAlign: 'right' }}><NullText>{fmtCents(tx.fixedAmount)}</NullText></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ServiceChargeSection({ data, timezone }: { data: PublishedSnapshotResponse['serviceCharge']; timezone: string }) {
  if (!data) return (
    <SectionCard title="Service Charge" publishedAt={null} timezone={timezone}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>스냅샷 없음</Typography>
    </SectionCard>
  );
  return (
    <SectionCard title="Service Charge" publishedAt={data.publishedAt} timezone={timezone}>
      {data.serviceCharges.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>서비스 차지 없음</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 120 }}>id</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50' }}>name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 100 }}>chargeType</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 80, textAlign: 'right' }}>rate</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 80, textAlign: 'right' }}>fixed</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 110 }}>calcType</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 90, textAlign: 'right' }}>minCheck</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>taxable</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>dine-in</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>takeout</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>delivery</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 60, textAlign: 'center' }}>taxes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.serviceCharges.map((sc) => <ServiceChargeRow key={sc.id} sc={sc} />)}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
}

// ── Service Fee ───────────────────────────────────────────────

function ServiceFeeRow({ sf }: { sf: ServiceFeeSnapshotEntry }) {
  return (
    <TableRow hover>
      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Tooltip title={sf.id} placement="top"><span>{sf.id}</span></Tooltip>
      </TableCell>
      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{sf.name}</TableCell>
      <TableCell>
        <Typography variant="caption" sx={{ px: 0.6, py: 0.15, borderRadius: 0.5, bgcolor: '#e8eaf6', color: '#283593', fontWeight: 600 }}>
          {sf.chargeType}
        </Typography>
      </TableCell>
      <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{sf.chargeCalculationType}</TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}><NullText>{fmtRate(sf.rate)}</NullText></TableCell>
      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}><NullText>{fmtCents(sf.fixedAmount)}</NullText></TableCell>
      <TableCell sx={{ textAlign: 'center' }}><BoolChip value={sf.isDineIn} /></TableCell>
      <TableCell sx={{ textAlign: 'center' }}><BoolChip value={sf.isTakeout} /></TableCell>
      <TableCell sx={{ textAlign: 'center' }}><BoolChip value={sf.isDelivery} /></TableCell>
    </TableRow>
  );
}

function ServiceFeeSection({ data, timezone }: { data: PublishedSnapshotResponse['serviceFee']; timezone: string }) {
  if (!data) return (
    <SectionCard title="Service Fee" publishedAt={null} timezone={timezone}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>스냅샷 없음</Typography>
    </SectionCard>
  );
  return (
    <SectionCard title="Service Fee" publishedAt={data.publishedAt} timezone={timezone}>
      {data.serviceFees.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>서비스 피 없음</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 120 }}>id</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50' }}>name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 100 }}>chargeType</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 110 }}>calcType</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 80, textAlign: 'right' }}>rate</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 80, textAlign: 'right' }}>fixed</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 65, textAlign: 'center' }}>dine-in</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 65, textAlign: 'center' }}>takeout</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'grey.50', width: 65, textAlign: 'center' }}>delivery</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.serviceFees.map((sf) => <ServiceFeeRow key={sf.id} sf={sf} />)}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </SectionCard>
  );
}

// ── Main ──────────────────────────────────────────────────────

export default function PublishedSnapshot({ storeId }: { storeId: number }) {
  const { timezone } = useTimezone();
  const [data, setData] = useState<PublishedSnapshotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getPublishedSnapshot(storeId)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load snapshot'))
      .finally(() => setLoading(false));
  }, [storeId, tick]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Published Snapshot</Typography>
        <Chip label="Redis cache" size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
        <Tooltip title="새로고침">
          <IconButton size="small" onClick={() => setTick((t) => t + 1)} disabled={loading}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && data && (
        <>
          <MetadataSection data={data.metadata} timezone={timezone} />
          <TaxSection data={data.tax} timezone={timezone} />
          <ServiceChargeSection data={data.serviceCharge} timezone={timezone} />
          <ServiceFeeSection data={data.serviceFee} timezone={timezone} />
        </>
      )}
    </Box>
  );
}
