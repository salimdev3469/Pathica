export function getPasswordPolicyError(password: string, locale: 'en' | 'tr'): string | null {
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

  if (password.length < 12) {
    return t('Use at least 12 characters.', 'En az 12 karakter kullanın.');
  }

  if (!/[a-z]/.test(password)) {
    return t('Add at least one lowercase letter.', 'En az bir küçük harf ekleyin.');
  }

  if (!/[A-Z]/.test(password)) {
    return t('Add at least one uppercase letter.', 'En az bir büyük harf ekleyin.');
  }

  if (!/[0-9]/.test(password)) {
    return t('Add at least one number.', 'En az bir rakam ekleyin.');
  }

  return null;
}

async function sha1UpperHex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export async function isPasswordCompromised(password: string): Promise<boolean | null> {
  try {
    const hash = await sha1UpperHex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);

    if (!response.ok) {
      return null;
    }

    const body = await response.text();
    const lines = body.split('\n');

    for (const line of lines) {
      const [candidate] = line.trim().split(':');
      if (candidate?.toUpperCase() === suffix) {
        return true;
      }
    }

    return false;
  } catch {
    return null;
  }
}
