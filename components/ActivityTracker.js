'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

function track(action, data = {}) {
  fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
    keepalive: true,
  }).catch(() => {});
}

export function trackAction(action, data = {}) {
  track(action, data);
}

export default function ActivityTracker() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const lastPath = useRef(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (pathname === lastPath.current) return;

    lastPath.current = pathname;
    track('page_view', { path: pathname });
  }, [pathname, session?.user?.id]);

  return null;
}
