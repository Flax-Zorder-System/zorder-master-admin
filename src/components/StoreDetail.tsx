import {
  Box,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import FlagIcon from '@mui/icons-material/Flag';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import type { Store } from '../types/store';

interface Props {
  store: Store;
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      {icon}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8 }}>
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

function Section({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2, mb: 2 }}>
      {children}
    </Box>
  );
}

export default function StoreDetail({ store }: Props) {
  return (
    <Box sx={{ p: 2, overflow: 'auto', maxWidth: 800, margin: '0 auto' }}>
      {/* Info */}
      <Section>
        <SectionHeader icon={<StorefrontIcon fontSize="small" color="action" />} title="Info" />
        <InfoRow label="이름" value={store.name} />
        <InfoRow label="스토어아이디" value={store.userid} />
        <InfoRow label="매니저" value={store.manager} />
        <InfoRow label="type" value={store.type} />
        <InfoRow label="status" value={
          <Chip label={store.status} size="small" color={store.status === 'active' ? 'success' : 'default'} sx={{ fontSize: 11, height: 20 }} />
        } />
        <InfoRow label="timezone" value={store.timezone} />
        <InfoRow label="생성일" value={store.createdDate} />
        <InfoRow label="수정일" value={store.updatedDate} />
        {store.memo && <InfoRow label="메모" value={store.memo} />}
      </Section>

      {/* POS Configuration */}
      <Section>
        <SectionHeader icon={<PointOfSaleIcon fontSize="small" color="action" />} title="Pos configuration" />
        <InfoRow label="포스유형" value={store.posConfig.type} />
        <InfoRow label="GUID" value={
          <Typography variant="body2"  sx={{ fontFamily: 'monospace', fontWeight: 500, wordBreak: 'break-all' }}>
            {store.posConfig.guid}
          </Typography>
        } />
        <InfoRow label="status" value={
          <Chip label={store.posConfig.status} size="small" color={store.posConfig.status === 'active' ? 'success' : 'default'} sx={{ fontSize: 11, height: 20 }} />
        } />
      </Section>

      {/* Feature Flags */}
      <Section>
        <SectionHeader icon={<FlagIcon fontSize="small" color="action" />} title="Feature Flags" />
        <FlagRow label="Age Verification" value={store.featureFlags.ageVerification} />
        <FlagRow label="isAyce" value={store.featureFlags.isAyce} />
        <FlagRow label="Low Branded Menu" value={store.featureFlags.lowBrandedMenu} />
        <FlagRow label="Payment" value={store.featureFlags.payment} />
        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" color="text.disabled">deprecated</Typography>
        </Divider>
        <FlagRow label="is Menuboss" value={store.featureFlags.isMenuboss ?? false} />
        <FlagRow label="Allow Employee" value={store.featureFlags.allowEmployee ?? false} />
        <FlagRow label="Zurypty" value={store.featureFlags.zurypty ?? false} />
      </Section>

      {/* CS Information */}
      <Section>
        <SectionHeader icon={<SupportAgentIcon fontSize="small" color="action" />} title="CS Information" />
        <InfoRow label="table count" value={store.csInfo.tableCount} />
        <InfoRow label="ZUser versions" value={store.csInfo.userAppVersions.join(', ')} />
        <InfoRow label="ZPos versions" value={store.csInfo.opsAppVersions.join(', ')} />
        <InfoRow label="ZLauncher versions" value={store.csInfo.launcherAppVersions.join(', ')} />
      </Section>
    </Box>
  );
}
