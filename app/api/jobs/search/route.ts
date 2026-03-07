import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan')
            .eq('user_id', user.id)
            .single();

        if (!subscription || subscription.plan === 'free') {
            return NextResponse.json({ error: 'Upgrade to Pro to search jobs.' }, { status: 403 });
        }

        const url = new URL(req.url);
        const q = url.searchParams.get('q') || 'developer';
        const location = url.searchParams.get('location') || 'London'; // Default or empty
        const page = url.searchParams.get('page') || '1';
        const country = url.searchParams.get('country') || 'gb'; // uk default

        const appId = process.env.ADZUNA_APP_ID;
        const apiKey = process.env.ADZUNA_API_KEY;

        if (!appId || !apiKey) {
            return NextResponse.json({ error: 'Job search API not configured' }, { status: 500 });
        }

        // Using next fetch cache for 1 hour to reduce Adzuna API calls effectively 
        const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${apiKey}&what=${encodeURIComponent(q)}&where=${encodeURIComponent(location)}&results_per_page=20`;

        const response = await fetch(adzunaUrl, { next: { revalidate: 3600 } });

        if (!response.ok) {
            throw new Error(`Adzuna API returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Job search error:', error);
        return NextResponse.json({ error: 'Failed to search jobs' }, { status: 500 });
    }
}
