import { Box, Chip, CircularProgress, Divider, Typography } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import FlagIcon from '@mui/icons-material/Flag';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import PaymentIcon from '@mui/icons-material/Payment';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEffect, useState } from 'react';
import type { StoreAdminDetail, PosStoreIntegration, StorePaymentConfig, StoreCustomizeTerms } from '../types/api';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';
import { api } from '../lib/api';

interface Props {
  store: StoreAdminDetail;
}

// ── 공용 UI ───────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      {icon}
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8 }}
      >
        {title}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180, flexShrink: 0 }}>
        {label}
      </Typography>
      <Box>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
        ) : value}
      </Box>
    </Box>
  );
}

function FlagRow({ label, value }: { label: string; value: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Chip
        label={value ? 'on' : 'off'}
        size="small"
        color={value ? 'success' : 'default'}
        sx={{ fontSize: 11, height: 20 }}
      />
    </Box>
  );
}

function Section({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2, mb: 2, position: 'relative' }}>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1, zIndex: 1 }}>
          <CircularProgress size={20} />
        </Box>
      )}
      {children}
    </Box>
  );
}

function MonoText({ children }: { children: React.ReactNode }) {
  return <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, wordBreak: 'break-all' }}>{children}</Typography>;
}

// ── 메인 ─────────────────────────────────────────────

export default function StoreDetail({ store }: Props) {
  const { timezone } = useTimezone();

  const [pos, setPos] = useState<PosStoreIntegration | null>(null);
  const [posLoading, setPosLoading] = useState(true);

  const [payment, setPayment] = useState<StorePaymentConfig | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);

  const [customize, setCustomize] = useState<StoreCustomizeTerms | null>(null);
  const [customizeLoading, setCustomizeLoading] = useState(true);

  useEffect(() => {
    const sid = store.storeId;

    api.getPosStoreIntegration(sid)
      .then(setPos)
      .catch(() => setPos(null))
      .finally(() => setPosLoading(false));

    api.getStorePaymentConfig(sid)
      .then(setPayment)
      .catch(() => setPayment(null))
      .finally(() => setPaymentLoading(false));

    api.getCustomizeDesignTerms(sid)
      .then(setCustomize)
      .catch(() => setCustomize(null))
      .finally(() => setCustomizeLoading(false));
  }, [store.storeId]);

  return (
    <Box sx={{ p: 2, overflow: 'auto', maxWidth: 860, margin: '0 auto' }}>

      {/* ── Info ── */}
      <Section>
        <SectionHeader icon={<StorefrontIcon fontSize="small" color="action" />} title="Info" />
        <InfoRow label="store name" value={store.storeName} />
        <InfoRow label="store id" value={store.storeId} />
        <InfoRow label="userid" value={store.userid} />
        <InfoRow label="manager" value={store.userName} />
        <InfoRow label="email" value={store.email} />
        <InfoRow label="status" value={
          <Chip label={store.isActive ? 'active' : 'inactive'} size="small"
            color={store.isActive ? 'success' : 'default'} sx={{ fontSize: 11, height: 20 }} />
        } />
        <InfoRow label="timezone" value={`${store.timezone} (${store.timezoneOffset})`} />
        <InfoRow label="start date" value={formatWithTimezone(store.startAt, timezone)} />
        <InfoRow label="expire date" value={formatWithTimezone(store.expireAt, timezone)} />
        {store.managerPin && <InfoRow label="manager PIN" value={store.managerPin} />}
      </Section>

      {/* ── POS ── */}
      <Section loading={posLoading}>
        <SectionHeader icon={<PointOfSaleIcon fontSize="small" color="action" />} title="POS" />
        <InfoRow label="pos name" value={store.posName ?? '—'} />
        {pos ? (
          <>
            <InfoRow label="pos store id" value={<MonoText>{pos.posStoreId}</MonoText>} />
            <InfoRow label="integration type" value={pos.integrationType ?? '—'} />
            <InfoRow label="dining option id" value={pos.diningOptionId ? <MonoText>{pos.diningOptionId}</MonoText> : '—'} />
            <InfoRow label="server host" value={pos.serverHost ?? '—'} />
            <InfoRow label="server port" value={pos.serverPort ?? '—'} />
            <InfoRow label="server key" value={pos.serverKey ?? '—'} />
            <InfoRow label="credential" value={pos.credential ?? '—'} />
            <InfoRow label="future check delay" value={pos.futureCheckDelayMinutes != null ? `${pos.futureCheckDelayMinutes} min` : '—'} />
            <InfoRow label="auto sync" value={
              <Chip label={pos.useAutoSync ? 'on' : 'off'} size="small"
                color={pos.useAutoSync ? 'success' : 'default'} sx={{ fontSize: 11, height: 20 }} />
            } />
            <InfoRow label="pos active" value={
              <Chip label={pos.isActive ? 'active' : 'inactive'} size="small"
                color={pos.isActive ? 'success' : 'default'} sx={{ fontSize: 11, height: 20 }} />
            } />
          </>
        ) : !posLoading && (
          <Typography variant="body2" color="text.disabled">POS integration not found.</Typography>
        )}
      </Section>

      {/* ── Settings ── */}
      <Section>
        <SectionHeader icon={<SettingsIcon fontSize="small" color="action" />} title="Settings" />
        <InfoRow label="printer count" value={store.printerCount} />
      </Section>

      {/* ── Feature Flags ── */}
      <Section>
        <SectionHeader icon={<FlagIcon fontSize="small" color="action" />} title="Feature Flags" />
        <FlagRow label="isAyce" value={store.isAyce} />
        <FlagRow label="Age Verification" value={store.useAgeVerification} />
        <FlagRow label="Use Employee" value={store.useEmployee} />
        <FlagRow label="Branded Menu" value={store.useBrandedMenu} />
        <FlagRow label="View Mode" value={store.viewMode} />
        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" color="text.disabled">deprecated</Typography>
        </Divider>
        <FlagRow label="isMenubook" value={store.isMenubook} />
      </Section>

      {/* ── Payment ── */}
      <Section loading={paymentLoading}>
        <SectionHeader icon={<PaymentIcon fontSize="small" color="action" />} title="Payment" />
        {payment ? (
          <>
            <InfoRow label="split max count" value={payment.splitMaxCount} />
            {payment.providers.length === 0 ? (
              <Typography variant="body2" color="text.disabled">No payment providers configured.</Typography>
            ) : (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {payment.providers.map((p) => (
                  <Box key={p.type} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.type}</Typography>
                      <Chip label={p.isActive ? 'active' : 'inactive'} size="small"
                        color={p.isActive ? 'success' : 'default'} sx={{ fontSize: 10, height: 18 }} />
                    </Box>
                    {Object.entries(p.config).map(([k, v]) => (
                      <Box key={k} sx={{ display: 'flex', gap: 1, py: 0.2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 160, flexShrink: 0 }}>{k}</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{String(v)}</Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}
          </>
        ) : !paymentLoading && (
          <Typography variant="body2" color="text.disabled">Payment config not found.</Typography>
        )}
      </Section>

      {/* ── ZLoyalty ── */}
      <Section>
        <SectionHeader icon={<LoyaltyIcon fontSize="small" color="action" />} title="ZLoyalty" />
        <InfoRow label="id" value={store.zloyaltyId ?? '—'} />
        <InfoRow label="status" value={store.zloyaltyStatus ?? '—'} />
        <InfoRow label="use display" value={
          store.zloyaltyUseDisplay !== null ? (
            <Chip label={store.zloyaltyUseDisplay ? 'on' : 'off'} size="small"
              color={store.zloyaltyUseDisplay ? 'success' : 'default'} sx={{ fontSize: 11, height: 20 }} />
          ) : '—'
        } />
      </Section>

      {/* ── Customize ── */}
      <Section loading={customizeLoading}>
        <SectionHeader icon={<PaletteIcon fontSize="small" color="action" />} title="Customize" />
        {customize?.terms && Object.keys(customize.terms).length > 0 ? (
          Object.entries(customize.terms).map(([locale, kvMap]) => (
            <Box key={locale} sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                {locale.toUpperCase()}
              </Typography>
              {Object.entries(kvMap).map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', gap: 1, py: 0.2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 180, flexShrink: 0 }}>{k}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          ))
        ) : !customizeLoading && (
          <Typography variant="body2" color="text.disabled">No customize terms configured.</Typography>
        )}
      </Section>

    </Box>
  );
}
