import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, DeleteOutlined as DeleteOutlineIcon } from '@mui/icons-material';
import { usePageTitle } from '../hooks/usePageTitle';

// ── Rounding ────────────────────────────────────────────────────────────────

type RoundingOption = 'HALF_UP' | 'HALF_EVEN' | 'ALWAYS_UP' | 'ALWAYS_DOWN';

const ROUNDING_OPTIONS: { value: RoundingOption; label: string }[] = [
  { value: 'HALF_UP',    label: 'HALF_UP — 일반 반올림' },
  { value: 'HALF_EVEN',  label: 'HALF_EVEN — 은행 반올림' },
  { value: 'ALWAYS_UP',  label: 'ALWAYS_UP — 올림' },
  { value: 'ALWAYS_DOWN',label: 'ALWAYS_DOWN — 내림' },
];

function bankersRound(value: number): number {
  const floor = Math.floor(value);
  const frac = value - floor;
  if (Math.abs(frac - 0.5) < 1e-10) return floor % 2 === 0 ? floor : floor + 1;
  return Math.round(value);
}

function applyRounding(value: number, option: RoundingOption): number {
  switch (option) {
    case 'HALF_UP':    return Math.round(value);
    case 'HALF_EVEN':  return bankersRound(value);
    case 'ALWAYS_UP':  return Math.ceil(value);
    case 'ALWAYS_DOWN':return Math.floor(value);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const toDollar = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const parseDollar = (s: string) => Math.round(parseFloat(s.replace(/[^0-9.]/g, '') || '0') * 100);
const parseRate = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '') || '0') / 100;

// ── Tax row type ─────────────────────────────────────────────────────────────

type TaxRow = { id: number; name: string; rate: string; rounding: RoundingOption };

let nextId = 2;

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultBox({ label, cents, highlight }: { label: string; cents: number; highlight?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.6, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography sx={{ fontSize: 13, color: highlight ? 'text.primary' : 'text.secondary', fontWeight: highlight ? 700 : 400 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'monospace' }}>
          {cents} cents
        </Typography>
        <Typography sx={{ fontSize: 13, fontFamily: 'monospace', fontWeight: highlight ? 700 : 500, color: highlight ? 'primary.main' : 'text.primary', minWidth: 70, textAlign: 'right' }}>
          {toDollar(cents)}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  usePageTitle('Calculator');

  const [amountStr, setAmountStr] = useState('');
  const [taxRows, setTaxRows] = useState<TaxRow[]>([
    { id: 1, name: 'Tax 1', rate: '', rounding: 'HALF_UP' },
  ]);

  const addRow = useCallback(() => {
    setTaxRows(prev => [...prev, { id: nextId++, name: `Tax ${nextId - 1}`, rate: '', rounding: 'HALF_UP' }]);
  }, []);

  const removeRow = useCallback((id: number) => {
    setTaxRows(prev => prev.filter(r => r.id !== id));
  }, []);

  const updateRow = useCallback((id: number, patch: Partial<TaxRow>) => {
    setTaxRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  // ── Calculation ──────────────────────────────────────────────────────────

  const subCents = parseDollar(amountStr);

  const taxResults = taxRows.map(row => {
    const rate = parseRate(row.rate);
    const taxCents = applyRounding(subCents * rate, row.rounding);
    return { id: row.id, name: row.name || `Tax ${row.id}`, rate, taxCents };
  });

  const totalTaxCents = taxResults.reduce((s, r) => s + r.taxCents, 0);
  const totalCents = subCents + totalTaxCents;

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', mt: 5, mb: 5, p: 5, bgcolor: 'white', borderRadius: 2}}>

      {/* Header */}
      <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 0.5 }}>계산기</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 3 }}>
        백엔드와 동일한 applyRounding 로직으로 Tax 금액을 미리 계산합니다.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, alignItems: 'start' }}>

        {/* ── 입력 패널 ── */}
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
            입력
          </Typography>

          {/* 기준 금액 */}
          <TextField
            label="기준 금액 (달러)"
            value={amountStr}
            onChange={e => setAmountStr(e.target.value)}
            placeholder="0.00"
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mb: 3 }}
            helperText={subCents > 0 ? `${subCents} cents` : ' '}
          />

          <Divider sx={{ mb: 2 }} />

          {/* Tax 행들 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Tax 항목
            </Typography>
            <Tooltip title="항목 추가">
              <IconButton size="small" onClick={addRow} sx={{ color: 'primary.main' }}>
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {taxRows.map((row, idx) => (
            <Box key={row.id} sx={{ mb: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: '#fafafa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                  {row.name}
                </Typography>
                {taxRows.length > 1 && (
                  <Tooltip title="삭제">
                    <IconButton size="small" onClick={() => removeRow(row.id)} sx={{ color: 'text.disabled' }}>
                      <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Rate (%)"
                  value={row.rate}
                  onChange={e => updateRow(row.id, { rate: e.target.value })}
                  placeholder="8.25"
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ width: 90 }}
                  helperText={row.rate ? `${parseRate(row.rate).toFixed(6)}` : ' '}
                />
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel shrink>Rounding</InputLabel>
                  <Select
                    value={row.rounding}
                    onChange={e => updateRow(row.id, { rounding: e.target.value as RoundingOption })}
                    label="Rounding"
                    notched
                    sx={{ fontSize: 12 }}
                  >
                    {ROUNDING_OPTIONS.map(o => (
                      <MenuItem key={o.value} value={o.value} sx={{ fontSize: 12 }}>
                        {o.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {idx < taxRows.length - 1 && <Box />}
            </Box>
          ))}
        </Box>

        {/* ── 결과 패널 ── */}
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
            계산 결과
          </Typography>

          <ResultBox label="Subtotal" cents={subCents} />

          {taxResults.map(r => (
            <Box key={r.id}>
              <ResultBox
                label={`${r.name} (×${(r.rate * 100).toFixed(4).replace(/\.?0+$/, '')}%)`}
                cents={r.taxCents}
              />
              {subCents > 0 && r.rate > 0 && (
                <Typography sx={{ fontSize: 10, color: 'text.disabled', pl: 1, pb: 0.5, fontFamily: 'monospace' }}>
                  applyRounding({subCents} × {r.rate.toFixed(6)}) = {(subCents * r.rate).toFixed(4)} → {r.taxCents} cents
                </Typography>
              )}
            </Box>
          ))}

          <Box sx={{ mt: 1 }}>
            <ResultBox label="Tax 합계" cents={totalTaxCents} />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <ResultBox label="Total (Subtotal + Tax)" cents={totalCents} highlight />

          {/* 공식 출처 */}
          <Box sx={{ mt: 2.5, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 10, color: 'text.disabled', fontWeight: 700, mb: 0.5 }}>
              적용 공식
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: 'monospace', lineHeight: 1.7 }}>
              taxAmount = applyRounding(subAmount_cents × rate, roundingOption)
            </Typography>
            <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 0.5 }}>
              백엔드 item-tax-calculator.service.ts 동일 로직
            </Typography>
          </Box>

          {/* Rounding 옵션 설명 */}
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 10, color: 'text.disabled', fontWeight: 700, mb: 0.75 }}>
              Rounding 옵션
            </Typography>
            {ROUNDING_OPTIONS.map(o => (
              <Box key={o.value} sx={{ display: 'flex', gap: 1, mb: 0.4 }}>
                <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.primary', minWidth: 90 }}>
                  {o.value}
                </Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                  {o.label.split(' — ')[1]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
