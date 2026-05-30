import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          fontSize: 18,
          letterSpacing: '-0.06em',
          fontFamily: 'system-ui, sans-serif',
          borderRadius: 6,
        }}
      >
        VP
      </div>
    ),
    { ...size },
  );
}
