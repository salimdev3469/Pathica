import { useState, useEffect } from 'react';
import fpPromise from '@fingerprintjs/fingerprintjs';

export function useAnonymousLimit() {
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [hasReachedLimit, setHasReachedLimit] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function initFp() {
            try {
                const fp = await fpPromise.load();
                const result = await fp.get();
                setFingerprint(result.visitorId);

                // Check current limit
                const response = await fetch('/api/anonymous/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fingerprint: result.visitorId })
                });

                if (response.ok) {
                    const data = await response.json();
                    setHasReachedLimit(data.used_count >= 1);
                }
            } catch (error) {
                console.error('Error generating fingerprint or checking limit:', error);
            } finally {
                setIsLoading(false);
            }
        }

        initFp();
    }, []);

    return { fingerprint, hasReachedLimit, isLoading, setHasReachedLimit };
}
