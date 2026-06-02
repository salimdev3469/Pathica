export function isMissingTableInSchemaCache(error: unknown, tableName: string): boolean {
  const asRecord = error as { code?: string; message?: string } | null;
  if (!asRecord) return false;

  const message = String(asRecord.message || '');
  return asRecord.code === 'PGRST205' && message.includes(`public.${tableName}`);
}
