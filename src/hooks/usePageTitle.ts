import { useEffect } from 'react';

const SUFFIX = 'Zorder Master';

export function usePageTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : SUFFIX;
    return () => {
      document.title = SUFFIX;
    };
  }, [title]);
}
