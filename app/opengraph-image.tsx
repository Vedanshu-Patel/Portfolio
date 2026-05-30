import { ImageResponse } from 'next/og';
import { profile, SITE_URL } from '@/lib/data';

export const runtime = 'edge';
export const alt = 'Vedanshu Patel — Data Engineer & ML Practitioner';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const displayDomain = new URL(SITE_URL).host;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #14092a 70%, #2a0f4a 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          color: '#e6e6f0',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, rgba(124, 58, 237, 0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, rgba(167, 139, 250, 0) 70%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#a78bfa',
            fontFamily: 'ui-monospace, monospace',
            fontSize: 24,
            letterSpacing: '0.25em',
          }}
        >
          <span>./PORTFOLIO</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 128,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              background: 'linear-gradient(to right, #a78bfa 0%, #7c3aed 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 44,
              color: '#e6e6f0',
              fontWeight: 500,
            }}
          >
            {profile.tagline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 24,
            color: '#9ca3af',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          <span>{profile.location}</span>
          <span style={{ color: '#7c3aed' }}>·</span>
          <span>{displayDomain}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
