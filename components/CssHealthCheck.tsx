'use client';

import { useEffect } from 'react';

const RELOAD_KEY = 'css_guard_reloaded_once';

export default function CssHealthCheck() {
  useEffect(() => {
    const hasTailwindStyles = () => {
      const probe = document.createElement('div');
      probe.className = 'hidden';
      document.body.appendChild(probe);
      const isApplied = window.getComputedStyle(probe).display === 'none';
      probe.remove();
      return isApplied;
    };

    const ok = hasTailwindStyles();

    if (ok) {
      sessionStorage.removeItem(RELOAD_KEY);
      return;
    }

    if (!sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, '1');
      window.location.reload();
    }
  }, []);

  return null;
}
