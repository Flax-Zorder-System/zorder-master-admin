import { Box, Chip, Divider, Typography } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import FlagIcon from '@mui/icons-material/Flag';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import type { StoreAdminDetail } from '../types/api';
import { formatWithTimezone, useTimezone } from '../contexts/TimezoneContext';

interface Props {
  store: StoreAdminDetail;
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      {icon}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          fontSize: 11,
          letterSpacing: 0.8,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, flexShrink: 0 }}>
        {label}
      </Typography>
      <Box>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
}

function FlagRow({ label, value }: { label: string; value: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Chip
        label={value ? 'on' : 'off'}
        size="small"
        color={value ? 'success' : 'default'}
        sx={{ fontSize: 11, height: 20 }}
      />
    </Box>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
}

export default function StoreDetail({ store }: Props) {
  const { timezone } = useTimezone();

  return (
    <Box sx={{ p: 2, overflow: 'auto', maxWidth: 800, margin: '0 auto' }}>
      {/* Info */}
      <Section>
        <SectionHeader icon={<StorefrontIcon fontSize="small" color="action" />} title="Info" />
        <InfoRow label="store name" value={store.storeName} />
        <InfoRow label="userid" value={store.userid} />
        <InfoRow label="manager" value={store.userName} />
        <InfoRow label="email" value={store.email} />
        <InfoRow
          label="status"
          value={
            <Chip
              label={store.isActive ? 'active' : 'inactive'}
              size="small"
              color={store.isActive ? 'success' : 'default'}
              sx={{ fontSize: 11, height: 20 }}
            />
          }
        />
        <InfoRow label="timezone" value={`${store.timezone} (${store.timezoneOffset})`} />
        <InfoRow label="start date" value={formatWithTimezone(store.startAt, timezone)} />
        <InfoRow label="expire date" value={formatWithTimezone(store.expireAt, timezone)} />
        {store.managerPin && <InfoRow label="manager PIN" value={store.managerPin} />}
      </Section>

      {/* POS */}
      <Section>
        <SectionHeader
          icon={<PointOfSaleIcon fontSize="small" color="action" />}
          title="POS"
        />
        <InfoRow label="pos" value={store.posName ?? '-'} />
        <InfoRow label="pos id" value={store.posId ?? '-'} />
      </Section>

      {/* Feature Flags */}
      <Section>
        <SectionHeader icon={<FlagIcon fontSize="small" color="action" />} title="Feature Flags" />
        <FlagRow label="isAyce" value={store.isAyce} />
        <FlagRow label="Age Verification" value={store.useAgeVerification} />
        <FlagRow label="Use Employee" value={store.useEmployee} />
        <FlagRow label="Branded Menu" value={store.useBrandedMenu} />
        <FlagRow label="View Mode" value={store.viewMode} />
        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" color="text.disabled">
            deprecated
          </Typography>
        </Divider>
        <FlagRow label="isMenubook" value={store.isMenubook} />
        <InfoRow label="printer count" value={store.printerCount} />
      </Section>

      {/* ZLoyalty */}
      <Section>
        <SectionHeader
          icon={<LoyaltyIcon fontSize="small" color="action" />}
          title="ZLoyalty"
        />
        <InfoRow label="id" value={store.zloyaltyId ?? '-'} />
        <InfoRow label="status" value={store.zloyaltyStatus ?? '-'} />
        <InfoRow
          label="use display"
          value={
            store.zloyaltyUseDisplay !== null ? (
              <Chip
                label={store.zloyaltyUseDisplay ? 'on' : 'off'}
                size="small"
                color={store.zloyaltyUseDisplay ? 'success' : 'default'}
                sx={{ fontSize: 11, height: 20 }}
              />
            ) : (
              '-'
            )
          }
        />
      </Section>
    </Box>
  );
}
