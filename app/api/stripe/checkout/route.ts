import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?next=/dashboard`);
        }

        const url = new URL(req.url);
        const planType = url.searchParams.get('plan') || 'monthly';
        const priceId = planType === 'annual'
            ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID
            : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

        if (!priceId) {
            // Graceful fallback for local dev if keys not set
            console.warn('STRIPE_PRO_MONTHLY_PRICE_ID is not configured');
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=stripe_not_configured`);
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer_email: user.email,
            client_reference_id: user.id,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
        });

        if (checkoutSession.url) {
            return NextResponse.redirect(checkoutSession.url);
        }

        return NextResponse.json({ error: 'Failed to create session URL' }, { status: 500 });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=checkout_failed`);
    }
}

