import { NextRequest, NextResponse } from 'next/server';
import { isBillingAdminEmail, listAdminPayments, type BillingPaymentStatus } from '@/lib/billing';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES: BillingPaymentStatus[] = ['pending', 'paid', 'credited', 'review_required', 'rejected', 'failed'];

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isBillingAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const statusesParam = String(req.nextUrl.searchParams.get('statuses') || '').trim();
    const statuses = statusesParam
      ? statusesParam
          .split(',')
          .map((value) => value.trim())
          .filter((value): value is BillingPaymentStatus => ALLOWED_STATUSES.includes(value as BillingPaymentStatus))
      : undefined;

    const payments = await listAdminPayments(statuses);

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Failed to list admin payments:', error);
    return NextResponse.json({ error: 'Failed to list payments' }, { status: 500 });
  }
}
