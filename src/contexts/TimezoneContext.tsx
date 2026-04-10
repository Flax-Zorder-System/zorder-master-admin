import { createContext, useContext, useState } from 'react';

export const TIMEZONE_OPTIONS = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Seoul (KST, UTC+9)', value: 'Asia/Seoul' },
  { label: 'Hawaii (HST, UTC-10, DST 없음)', value: 'Pacific/Honolulu' },
  { label: 'Alaska (AKST/AKDT, UTC-9/-8)', value: 'America/Anchorage' },
  { label: 'Los Angeles (PST/PDT, UTC-8/-7)', value: 'America/Los_Angeles' },
  { label: 'Phoenix (MST, UTC-7, DST 없음)', value: 'America/Phoenix' },
  { label: 'Denver (MST/MDT, UTC-7/-6)', value: 'America/Denver' },
  { label: 'Chicago (CST/CDT, UTC-6/-5)', value: 'America/Chicago' },
  { label: 'New York (EST/EDT, UTC-5/-4)', value: 'America/New_York' },
  { label: 'Halifax (AST/ADT, UTC-4/-3)', value: 'America/Halifax' },
  { label: "St. John's (NST/NDT, UTC-3:30/-2:30)", value: 'America/St_Johns' }
];

interface TimezoneContextValue {
  timezone: string;
  setTimezone: (tz: string) => void;
}

const TimezoneContext = createContext<TimezoneContextValue>({
  timezone: 'UTC',
  setTimezone: () => {},
});

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezone] = useState('UTC');
  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  return useContext(TimezoneContext);
}

export function formatWithTimezone(isoString: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      hour12: false,
    }).format(new Date(isoString)).replace('T', ' ');
  } catch {
    return isoString;
  }
}
