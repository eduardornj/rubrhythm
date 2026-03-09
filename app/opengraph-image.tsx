import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RubRhythm - Body Rubs & Massage Directory';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(78,205,196,0.1) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #ff6b6b)',
            display: 'flex',
          }}
        />

        {/* Logo / Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(255,107,107,0.3)',
            }}
          >
            <span style={{ fontSize: '40px', color: 'white', fontWeight: 900 }}>R</span>
          </div>
          <span
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-2px',
            }}
          >
            RubRhythm
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 600,
            marginBottom: '40px',
            textAlign: 'center',
            maxWidth: '700px',
          }}
        >
          Body Rubs & Massage Directory
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {[
            { label: 'Verified Providers', color: '#3b82f6' },
            { label: '50+ Cities', color: '#4ecdc4' },
            { label: 'Safe & Trusted', color: '#22c55e' },
          ].map((badge) => (
            <div
              key={badge.label}
              style={{
                background: `${badge.color}22`,
                border: `2px solid ${badge.color}44`,
                borderRadius: '50px',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: badge.color,
                  display: 'flex',
                }}
              />
              <span
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                {badge.label}
              </span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '1px',
            display: 'flex',
          }}
        >
          rubrhythm.bubblesenterprise.com
        </div>
      </div>
    ),
    { ...size }
  );
}
