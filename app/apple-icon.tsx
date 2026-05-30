import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: 'white',
          fontSize: 96,
          letterSpacing: '-0.06em',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        VP
      </div>
    ),
    { ...size },
  );
}
