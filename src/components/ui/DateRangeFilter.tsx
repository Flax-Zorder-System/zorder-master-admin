import { Box, Button, ButtonGroup, TextField, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useTimezone } from '../../contexts/TimezoneContext';

// ── 유틸 ──────────────────────────────────────────────────────

export type QuickRange = 'today' | 'yesterday' | 'this week';

/**
 * YYYY-MM-DD + time 문자열을 특정 timezone 기준으로 해석해 UTC Date로 변환한다.
 * 예) '2026-05-10', '00:00:00.000', 'Asia/Seoul' → 2026-05-09T15:00:00.000Z
 */
function tzToUTC(dateStr: string, time: string, tz: string): Date {
  const nominal = new Date(`${dateStr}T${time}Z`);
  const localStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(nominal).replace(' ', 'T') + 'Z';
  const offsetMs = nominal.getTime() - new Date(localStr).getTime();
  return new Date(nominal.getTime() + offsetMs);
}

/** 주어진 timezone에서 오늘 날짜를 YYYY-MM-DD로 반환 */
function getTodayInTz(tz: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(new Date());
}

/** 주어진 timezone 기준으로 quick range의 start/end 날짜(YYYY-MM-DD)를 반환 */
function getRange(range: QuickRange, tz: string): { start: string; end: string } {
  const today = getTodayInTz(tz);
  if (range === 'today') return { start: today, end: today };

  if (range === 'yesterday') {
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yest = new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(d);
    return { start: yest, end: yest };
  }

  // this week: Mon–today (timezone 기준)
  const dayShort = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(new Date());
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const day = dayMap[dayShort] ?? 1;
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(Date.now() + diffToMon * 24 * 60 * 60 * 1000);
  const monStr = new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(mon);
  return { start: monStr, end: today };
}

/** startDate용: 해당 TZ 자정 → UTC ISO */
export function toISODate(dateStr: string, tz: string): string {
  return tzToUTC(dateStr, '00:00:00.000', tz).toISOString();
}

/** endDate용: 해당 TZ 자정 직전 → UTC ISO */
export function toISODateEnd(dateStr: string, tz: string): string {
  return tzToUTC(dateStr, '23:59:59.999', tz).toISOString();
}

// ── 훅 ───────────────────────────────────────────────────────

export interface DateRangeState {
  startDate: string;
  endDate: string;
  startISO: string;
  endISO: string;
  quickRange: QuickRange;
  applyQuickRange: (range: QuickRange) => void;
  handleStartDate: (v: string) => void;
  handleEndDate: (v: string) => void;
}

export function useDateRangeFilter(onReset: () => void): DateRangeState {
  const { timezone } = useTimezone();
  const [quickRange, setQuickRange] = useState<QuickRange>('today');
  const [startDate, setStartDate] = useState(() => getTodayInTz(timezone));
  const [endDate, setEndDate] = useState(() => getTodayInTz(timezone));

  const applyQuickRange = (range: QuickRange) => {
    const { start, end } = getRange(range, timezone);
    setQuickRange(range);
    setStartDate(start);
    setEndDate(end);
    onReset();
  };

  const handleStartDate = (v: string) => {
    setQuickRange('today');
    setStartDate(v);
    onReset();
  };

  const handleEndDate = (v: string) => {
    setQuickRange('today');
    setEndDate(v);
    onReset();
  };

  const startISO = startDate ? toISODate(startDate, timezone) : '';
  const endISO = endDate ? toISODateEnd(endDate, timezone) : '';

  return { startDate, endDate, startISO, endISO, quickRange, applyQuickRange, handleStartDate, handleEndDate };
}

// ── UI 컴포넌트 ───────────────────────────────────────────────

interface DateRangeFilterProps {
  quickRange: QuickRange;
  startDate: string;
  endDate: string;
  onQuickRange: (range: QuickRange) => void;
  onStartDate: (v: string) => void;
  onEndDate: (v: string) => void;
}

export function DateRangeFilter({
  quickRange,
  startDate,
  endDate,
  onQuickRange,
  onStartDate,
  onEndDate,
}: DateRangeFilterProps) {
  const { timezone } = useTimezone();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      <ButtonGroup size="small" variant="outlined">
        {(['today', 'yesterday', 'this week'] as QuickRange[]).map((r) => (
          <Button
            key={r}
            onClick={() => onQuickRange(r)}
            variant={quickRange === r ? 'contained' : 'outlined'}
            disableElevation
          >
            {r}
          </Button>
        ))}
      </ButtonGroup>

      <TextField
        label="start date"
        type="date"
        size="small"
        value={startDate}
        onChange={(e) => onStartDate(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 150, '* > input': { font: 'initial' } }}
      />
      <TextField
        label="end date"
        type="date"
        size="small"
        value={endDate}
        onChange={(e) => onEndDate(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 150, '* > input': { font: 'initial' } }}
      />

      <Tooltip title={`Displaying times in ${timezone}`}>
        <Typography variant="caption" color="text.secondary">TZ: {timezone}</Typography>
      </Tooltip>
    </Box>
  );
}
