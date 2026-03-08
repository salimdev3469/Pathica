import { ImageResponse } from 'next/og';

type OgImageProps = {
  params: { id: string };
  searchParams: { title?: string | string[]; score?: string | string[] };
};

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function normalizeTitle(raw: string): string {
  const value = raw.trim();
  if (!value) return 'Resume';
  return value.slice(0, 90);
}

function normalizeScore(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (!value || value === 'pending') return 'Pending';

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 'Pending';

  return `${Math.max(0, Math.min(100, Math.round(parsed)))}/100`;
}

export default function OpenGraphImage({ searchParams }: OgImageProps) {
  const title = normalizeTitle(firstValue(searchParams.title));
  const score = normalizeScore(firstValue(searchParams.score));

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: '36px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#0f172a',
          boxSizing: 'border-box',
          gap: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: '22px',
            border: '1px solid #dbe3ef',
            padding: '28px',
            boxShadow: '0 14px 34px rgba(15, 23, 42, 0.10)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>CV Preview</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#1d4ed8',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 999,
                padding: '8px 14px',
              }}
            >
              ATS {score}
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              fontSize: 42,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              maxWidth: '95%',
            }}
          >
            {title}
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ height: 4, width: '74%', backgroundColor: '#0f172a', borderRadius: 999 }} />
            <div style={{ height: 3, width: '90%', backgroundColor: '#cbd5e1', borderRadius: 999 }} />
            <div style={{ height: 3, width: '86%', backgroundColor: '#cbd5e1', borderRadius: 999 }} />
            <div style={{ height: 3, width: '88%', backgroundColor: '#cbd5e1', borderRadius: 999 }} />
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 3, width: '82%', backgroundColor: '#cbd5e1', borderRadius: 999 }} />
            <div style={{ height: 3, width: '78%', backgroundColor: '#cbd5e1', borderRadius: 999 }} />
            <div style={{ height: 3, width: '84%', backgroundColor: '#cbd5e1', borderRadius: 999 }} />
          </div>
        </div>

        <div
          style={{
            width: 360,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            borderRadius: '22px',
            padding: '28px 24px',
            color: '#ffffff',
            boxShadow: '0 14px 34px rgba(15, 23, 42, 0.16)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em' }}>Pathica</div>
            <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}>ATS-Friendly CV Preview</div>
            <div style={{ fontSize: 22, lineHeight: 1.4, color: '#cbd5e1' }}>
              I built an ATS-ready CV with Pathica. See the preview and create yours in minutes.
            </div>
          </div>

          <div
            style={{
              fontSize: 18,
              color: '#93c5fd',
              borderTop: '1px solid rgba(148, 163, 184, 0.4)',
              paddingTop: 16,
            }}
          >
            pathica.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
