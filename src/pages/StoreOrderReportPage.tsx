import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { OrderCountReportItem } from '../types/api';
import { usePageTitle } from '../hooks/usePageTitle';

// ── 히트맵 색상 (0 → 최댓값 기준 5단계) ──────────────────────
const HEAT_TIERS = [
  { maxRatio: 0,    bg: '#f5f5f5', fg: '#bdbdbd' }, // 0건
  { maxRatio: 0.25, bg: '#e8f5e9', fg: '#2e7d32' }, // 1 ~ 25%
  { maxRatio: 0.5,  bg: '#a5d6a7', fg: '#1b5e20' }, // 25 ~ 50%
  { maxRatio: 0.75, bg: '#66bb6a', fg: '#fff'     }, // 50 ~ 75%
  { maxRatio: 0.9,  bg: '#388e3c', fg: '#fff'     }, // 75 ~ 90%
  { maxRatio: 1,    bg: '#1b5e20', fg: '#fff'     }, // 90 ~ 100%
] as const;

function heatColor(count: number, max: number): { bg: string; fg: string } {
  if (count === 0 || max === 0) return { bg: '#f5f5f5', fg: '#bdbdbd' };
  const ratio = count / max;
  for (const tier of HEAT_TIERS) {
    if (ratio <= tier.maxRatio) return { bg: tier.bg, fg: tier.fg };
  }
  return { bg: '#1b5e20', fg: '#fff' };
}

export default function StoreOrderReportPage() {
  usePageTitle('Order Count Report');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [data, setData] = useState<OrderCountReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStoreOrderCountReport()
      .then((res) => setData(res ?? []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load report'))
      .finally(() => setLoading(false));
  }, []);

  const dates = data[0]?.reports.map((r) => r.date) ?? [];

  // 전체 최댓값 (히트맵 기준)
  const maxCount = data.length > 0
    ? Math.max(...data.flatMap((s) => s.reports.map((r) => r.orderCount)))
    : 0;

  // 7일 합계 기준 내림차순 정렬
  const sorted = [...data].sort((a, b) => {
    const sumA = a.reports.reduce((s, r) => s + r.orderCount, 0);
    const sumB = b.reports.reduce((s, r) => s + r.orderCount, 0);
    return sumB - sumA;
  });

  // ── 범례 컴포넌트 ────────────────────────────────────────────
  const Legend = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography sx={{ fontSize: 11, color: 'text.disabled', mr: 0.5 }}>주문량</Typography>
      {[
        { label: '0',    bg: '#f5f5f5', fg: '#bdbdbd' },
        { label: '낮음', bg: '#e8f5e9', fg: '#2e7d32' },
        { label: '',     bg: '#a5d6a7', fg: '#1b5e20' },
        { label: '보통', bg: '#66bb6a', fg: '#fff'    },
        { label: '',     bg: '#388e3c', fg: '#fff'    },
        { label: '높음', bg: '#1b5e20', fg: '#fff'    },
      ].map((t, i) => (
        <Box key={i} sx={{ width: 26, height: 16, borderRadius: 0.5, bgcolor: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {t.label && <Typography sx={{ fontSize: 8, color: t.fg, fontWeight: 700, lineHeight: 1 }}>{t.label}</Typography>}
        </Box>
      ))}
      <Typography sx={{ fontSize: 11, color: 'text.disabled', ml: 0.5 }}>(max {maxCount})</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, maxWidth: 1800, margin: '0 auto' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 16, md: 20 } }}>
          Order Count Report
        </Typography>
        {!loading && (
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            최근 7일 · {data.length} 매장
          </Typography>
        )}
        {!loading && maxCount > 0 && !isMobile && (
          <Box sx={{ ml: 'auto' }}><Legend /></Box>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && isMobile && (
        /* ── 모바일: 매장별 카드 ─────────────────────────────── */
        <Box>
          {/* 범례 */}
          {maxCount > 0 && (
            <Box sx={{ mb: 1.5 }}><Legend /></Box>
          )}
          {sorted.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center', pt: 4 }}>No data.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sorted.map((store) => {
                const total = store.reports.reduce((s, r) => s + r.orderCount, 0);
                const totalColor = heatColor(total, maxCount * dates.length);
                return (
                  <Paper key={store.storeName} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1.5, overflow: 'hidden' }}>
                    {/* 카드 헤더: 매장명 + 합계 배지 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{store.storeName}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>7일</Typography>
                        <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: totalColor.bg }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: totalColor.fg, lineHeight: 1.4 }}>
                            {total === 0 ? '0' : total}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {/* 날짜별 히트맵 셀 */}
                    <Box sx={{ display: 'flex' }}>
                      {store.reports.map((r) => {
                        const { bg, fg } = heatColor(r.orderCount, maxCount);
                        return (
                          <Box
                            key={r.date}
                            sx={{
                              flex: 1, bgcolor: bg,
                              display: 'flex', flexDirection: 'column', alignItems: 'center',
                              py: 0.75, px: 0.25,
                              borderRight: '1px solid rgba(255,255,255,0.5)',
                              '&:last-child': { borderRight: 'none' },
                            }}
                          >
                            <Typography sx={{ fontSize: 9, color: r.orderCount > 0 ? fg : '#9e9e9e', lineHeight: 1.2, textAlign: 'center', mb: 0.25 }}>
                              {r.date.replace(/\(.*\)/, '')}
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: r.orderCount > 0 ? 700 : 400, color: fg, lineHeight: 1 }}>
                              {r.orderCount === 0 ? '·' : r.orderCount}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {!loading && !error && !isMobile && (
        /* ── 데스크톱: 히트맵 테이블 ────────────────────────── */
        <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 12, width: 180, position: 'sticky', left: 0, bgcolor: '#fafafa', zIndex: 1, borderRight: '1px solid #e0e0e0' }}>
                  store
                </TableCell>
                {dates.map((date) => (
                  <TableCell key={date} align="center" sx={{ fontWeight: 700, fontSize: 11, width: 80, color: 'text.secondary' }}>
                    {date}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: 11, width: 64, bgcolor: '#f0f4ff', color: '#1a237e' }}>
                  7일 합계
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={dates.length + 2} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontSize: 13 }}>
                    No data.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((store, rowIdx) => {
                  const total = store.reports.reduce((s, r) => s + r.orderCount, 0);
                  const totalColor = heatColor(total, maxCount * dates.length);
                  return (
                    <TableRow key={store.storeName} sx={{ '&:hover td': { filter: 'brightness(0.93)' } }}>
                      <TableCell
                        sx={{
                          fontSize: 12, fontWeight: 500,
                          position: 'sticky', left: 0,
                          bgcolor: rowIdx % 2 === 0 ? '#fff' : '#fafafa',
                          zIndex: 1,
                          borderRight: '1px solid #e0e0e0',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}
                      >
                        {store.storeName}
                      </TableCell>
                      {store.reports.map((r) => {
                        const { bg, fg } = heatColor(r.orderCount, maxCount);
                        return (
                          <Tooltip key={r.date} title={`${store.storeName} · ${r.date}: ${r.orderCount}건`} placement="top" arrow>
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: 12, fontWeight: r.orderCount > 0 ? 600 : 400,
                                bgcolor: bg, color: fg,
                                border: '1px solid rgba(255,255,255,0.6)',
                                p: '6px 4px', cursor: 'default',
                              }}
                            >
                              {r.orderCount === 0 ? '·' : r.orderCount}
                            </TableCell>
                          </Tooltip>
                        );
                      })}
                      <TableCell
                        align="center"
                        sx={{ fontSize: 12, fontWeight: 700, bgcolor: totalColor.bg, color: totalColor.fg, border: '1px solid rgba(255,255,255,0.6)' }}
                      >
                        {total === 0 ? '·' : total}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
