import { Box, Button, ButtonGroup, TextField, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useTimezone } from '../../contexts/TimezoneContext';

// ── 유틸 ──────────────────────────────────────────────────────

export type QuickRange = 'today' | 'yesterday' | 'this week';

function getToday() {
  return new Date().toLocaleDateString('sv-SE');
}

function getRange(range: QuickRange): { start: string; end: string } {
  const now = new Date();
  if (range === 'today') {
    const d = now.toLocaleDateString('sv-SE');
    return { start: d, end: d };
  }
  if (range === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const d = y.toLocaleDateString('sv-SE');
    return { start: d, end: d };
  }
  // this week: Mon–today
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  return { start: mon.toLocaleDateString('sv-SE'), end: now.toLocaleDateString('sv-SE') };
}

/** API에 넘길 ISO 문자열로 변환 */
export function toISODate(date: string): string {
  return `${date}T00:00:00.000Z`;
}

// ── 훅 ───────────────────────────────────────────────────────

export interface DateRangeState {
  startDate: string;
  endDate: string;
  quickRange: QuickRange;
  applyQuickRange: (range: QuickRange) => void;
  handleStartDate: (v: string) => void;
  handleEndDate: (v: string) => void;
}

export function useDateRangeFilter(onReset: () => void): DateRangeState {
  const [quickRange, setQuickRange] = useState<QuickRange>('today');
  const [startDate, setStartDate] = useState(getToday);
  const [endDate, setEndDate] = useState(getToday);

  const applyQuickRange = (range: QuickRange) => {
    const { start, end } = getRange(range);
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

  return { startDate, endDate, quickRange, applyQuickRange, handleStartDate, handleEndDate };
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
