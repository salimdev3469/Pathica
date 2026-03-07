import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error: any) {
        console.error('Webhook signature verification failed.', error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id;
                const subscriptionId = session.subscription as string;
                const customerId = session.customer as string;

                if (!userId) break;

                // Fetch subscription to get period end
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                // Upsert subscription table
                await supabaseAdmin.from('subscriptions').upsert({
                    user_id: userId,
                    plan: 'pro',
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                }, { onConflict: 'user_id' });

                break;
            }

            case 'customer.subscription.deleted':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                // Find user by customer ID
                const { data: userData } = await supabaseAdmin
                    .from('subscriptions')
                    .select('user_id')
                    .eq('stripe_customer_id', subscription.customer as string)
                    .single();

                if (userData?.user_id) {
                    const isCanceled = subscription.status === 'canceled';
                    await supabaseAdmin.from('subscriptions').update({
                        plan: isCanceled ? 'free' : 'pro', // Simplifying plan status
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        stripe_subscription_id: isCanceled ? null : subscription.id
                    }).eq('user_id', userData.user_id);
                }

                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook handler failed:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
