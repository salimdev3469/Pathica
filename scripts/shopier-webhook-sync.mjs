#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const REQUIRED_EVENTS = ['order.created'];

function parseEnv(text) {
  const out = new Map();
  for (const line of text.split('\n')) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"(.*)"$/, '$1');
    out.set(key, value);
  }
  return out;
}

function normalizeUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function readWebhookTokens(value) {
  return String(value || '')
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
}

function parseWebhookSubscriptions(raw) {
  const toItem = (item) => {
    if (!item || typeof item !== 'object') return null;
    const id = String(item.id || '').trim();
    const event = String(item.event || '').trim();
    const url = String(item.url || '').trim();
    const token = String(item.token || '').trim();
    if (!id || !event || !url) return null;
    return token ? { id, event, url, token } : { id, event, url };
  };

  if (Array.isArray(raw)) {
    return raw.map((item) => toItem(item)).filter(Boolean);
  }

  if (raw && typeof raw === 'object') {
    const direct = toItem(raw);
    if (direct) return [direct];

    for (const key of ['data', 'items', 'results', 'webhooks']) {
      if (Array.isArray(raw[key])) {
        return raw[key].map((item) => toItem(item)).filter(Boolean);
      }
    }
  }

  return [];
}

async function requestShopier(pat, method, apiPath, body) {
  const response = await fetch(`https://api.shopier.com/v1${apiPath}`, {
    method,
    headers: {
      authorization: `Bearer ${pat}`,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  if (response.ok) {
    return payload;
  }

  const message =
    String(payload?.message || '') || String(payload?.error || '') || `Shopier API failed (${response.status}).`;
  const err = new Error(message);
  err.status = response.status;
  throw err;
}

function upsertEnvLine(envText, key, value) {
  const lines = envText.split('\n');
  const nextLines = [];
  let replaced = false;

  for (const line of lines) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) {
      nextLines.push(line);
      continue;
    }

    const eq = line.indexOf('=');
    const currentKey = line.slice(0, eq).trim();
    if (currentKey === key) {
      nextLines.push(`${key}=${value}`);
      replaced = true;
    } else {
      nextLines.push(line);
    }
  }

  if (!replaced) {
    if (nextLines.length > 0 && nextLines[nextLines.length - 1] !== '') nextLines.push('');
    nextLines.push(`${key}=${value}`);
  }

  return nextLines.join('\n');
}

async function main() {
  const cwd = process.cwd();
  const envPath = path.join(cwd, '.env.local');
  const envText = await fs.readFile(envPath, 'utf8');
  const env = parseEnv(envText);

  const pat = String(process.env.SHOPIER_PAT || env.get('SHOPIER_PAT') || '').trim();
  if (!pat) {
    console.error('SHOPIER_PAT is missing. Update .env.local first.');
    process.exit(1);
  }

  const appUrl = normalizeUrl(
    process.env.NEXT_PUBLIC_APP_URL || env.get('NEXT_PUBLIC_APP_URL') || process.env.APP_URL || env.get('APP_URL') || '',
  );
  if (!appUrl || !/^https?:\/\//i.test(appUrl)) {
    console.error('NEXT_PUBLIC_APP_URL (or APP_URL) must be a valid absolute URL.');
    process.exit(1);
  }

  const expectedWebhookUrl = `${appUrl}/api/shopier/webhook`;
  const subscriptions = parseWebhookSubscriptions(await requestShopier(pat, 'GET', '/webhooks?limit=50'));

  const created = [];
  for (const event of REQUIRED_EVENTS) {
    const matched = subscriptions.some(
      (item) => item.event === event && normalizeUrl(item.url) === normalizeUrl(expectedWebhookUrl),
    );
    if (matched) continue;

    const createdRaw = await requestShopier(pat, 'POST', '/webhooks', {
      event,
      url: expectedWebhookUrl,
    });
    const createdItems = parseWebhookSubscriptions(createdRaw);
    if (createdItems.length === 0) {
      throw new Error(`Webhook created but response could not be parsed for event ${event}.`);
    }
    created.push(createdItems[0]);
    subscriptions.push(createdItems[0]);
  }

  const newTokens = created.map((item) => String(item.token || '').trim()).filter(Boolean);
  const existingTokens = readWebhookTokens(env.get('SHOPIER_WEBHOOK_TOKEN') || '');
  const mergedTokens = Array.from(new Set([...existingTokens, ...newTokens]));

  let updatedEnvText = envText;
  if (mergedTokens.length > 0) {
    updatedEnvText = upsertEnvLine(updatedEnvText, 'SHOPIER_WEBHOOK_TOKEN', mergedTokens.join(','));
    await fs.writeFile(envPath, updatedEnvText, 'utf8');
  }

  const coverage = REQUIRED_EVENTS.map((event) => ({
    event,
    matched: subscriptions.some(
      (item) => item.event === event && normalizeUrl(item.url) === normalizeUrl(expectedWebhookUrl),
    ),
    conflictingIds: subscriptions
      .filter((item) => item.event === event && normalizeUrl(item.url) !== normalizeUrl(expectedWebhookUrl))
      .map((item) => item.id),
  }));

  console.log('Shopier webhook sync complete.');
  console.log(`Expected URL: ${expectedWebhookUrl}`);
  console.log(`Created subscriptions: ${created.length}`);
  console.log(`New tokens received: ${newTokens.length}`);
  console.log(`SHOPIER_WEBHOOK_TOKEN count (.env.local): ${mergedTokens.length}`);
  console.log('Coverage:', JSON.stringify(coverage, null, 2));
}

main().catch((error) => {
  const status = Number(error?.status || 0);
  const message = error instanceof Error ? error.message : 'Unknown error';

  if (status === 401 && /revoked/i.test(message)) {
    console.error('Shopier API rejected SHOPIER_PAT: token is revoked.');
  } else if (status === 401) {
    console.error('Shopier API returned 401. Validate SHOPIER_PAT scopes and account.');
  } else {
    console.error(message);
  }

  process.exit(1);
});
