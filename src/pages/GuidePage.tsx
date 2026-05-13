import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

// ── 서브 페이지 정의 ──────────────────────────────────────────

type GuideSection = 'order-concepts' | 'payment-calculation';

const sections: { key: GuideSection; label: string; icon: React.ReactNode }[] = [
  { key: 'order-concepts',      label: '주문 개념 가이드',   icon: <MenuBookIcon fontSize="small" /> },
  { key: 'payment-calculation', label: '결제 계산 정의서',   icon: <CalculateIcon fontSize="small" /> },
];

const SECTION_LABEL: Record<GuideSection, string> = {
  'order-concepts':      '주문 개념 가이드',
  'payment-calculation': '결제 계산 정의서',
};

function parseSection(raw: string | null): GuideSection {
  const valid: GuideSection[] = ['order-concepts', 'payment-calculation'];
  return valid.includes(raw as GuideSection) ? (raw as GuideSection) : 'order-concepts';
}

// ── 서브 페이지 콘텐츠 ────────────────────────────────────────

function OrderConceptsContent() {
  return (
    <iframe
      src="/order-concepts.html"
      style={{ width: '100%', height: 'calc(100vh - 48px)', border: 'none', display: 'block' }}
      title="주문 개념 가이드"
    />
  );
}

function PaymentCalculationContent() {
  return (
    <iframe
      src="/payment-calculation-guide.html"
      style={{ width: '100%', height: 'calc(100vh - 48px)', border: 'none', display: 'block' }}
      title="결제 계산 정의서"
    />
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────

export default function GuidePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = parseSection(searchParams.get('section'));

  usePageTitle(`Guide · ${SECTION_LABEL[activeSection]}`);

  const setSection = (key: GuideSection) =>
    setSearchParams({ section: key }, { replace: true });

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
      {/* 사이드 네비 */}
      <Box
        sx={{
          width: 240,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Guide</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>개념 & 운영 안내</Typography>
        </Box>

        <Divider />

        <List dense disablePadding sx={{ pt: 0.5 }}>
          {sections.map((s) => (
            <ListItemButton
              key={s.key}
              selected={activeSection === s.key}
              onClick={() => setSection(s.key)}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                minHeight: 40,
                '&.Mui-selected': {
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>{s.icon}</ListItemIcon>
              <ListItemText
                primary={s.label}
                slotProps={{ primary: { sx: { fontSize: 14 } } }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* 콘텐츠 영역 */}
      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'white' }}>
        {activeSection === 'order-concepts'      && <OrderConceptsContent />}
        {activeSection === 'payment-calculation' && <PaymentCalculationContent />}
      </Box>
    </Box>
  );
}
