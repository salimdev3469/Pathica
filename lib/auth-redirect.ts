const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function isLocalhostUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname;
    return LOCALHOST_HOSTNAMES.has(hostname);
  } catch {
    return false;
  }
}

function isRenderSubdomain(value: string): boolean {
  try {
    return new URL(value).hostname.endsWith('.onrender.com');
  } catch {
    return false;
  }
}

function getPreferredAuthBaseUrl(): string {
  const configuredBaseUrl = trimTrailingSlash((process.env.NEXT_PUBLIC_APP_URL || 'https://pathica.tech').trim());
  const browserOrigin = typeof window !== 'undefined' ? trimTrailingSlash(window.location.origin) : '';

  if (browserOrigin) {
    const originIsLocalhost = isLocalhostUrl(browserOrigin);
    const configIsLocalhost = isLocalhostUrl(configuredBaseUrl);
    const originIsRender = isRenderSubdomain(browserOrigin);
    const configIsRender = isRenderSubdomain(configuredBaseUrl);

    // Keep localhost redirect targets during local development.
    if (originIsLocalhost && !configIsLocalhost) {
      return browserOrigin;
    }

    // If users open the old Render subdomain, force the canonical configured URL.
    if (originIsRender && configuredBaseUrl && !configIsRender) {
      return configuredBaseUrl;
    }

    return browserOrigin;
  }

  return configuredBaseUrl || 'https://pathica.tech';
}

export function buildAuthCallbackUrl(next: string, includeWelcome = false): string {
  const baseUrl = getPreferredAuthBaseUrl();
  if (!baseUrl) {
    return '/auth/callback';
  }

  const callbackUrl = new URL('/auth/callback', baseUrl);
  callbackUrl.searchParams.set('next', next || '/dashboard');
  if (includeWelcome) {
    callbackUrl.searchParams.set('welcome', '1');
  }

  return callbackUrl.toString();
}
