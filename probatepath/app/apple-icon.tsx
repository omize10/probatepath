import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      // Document icon with folded corner (optimized for 180x180)
      <div
        style={{
          background: '#FFFFFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '24px',
        }}
      >
        <div
          style={{
            width: '110px',
            height: '140px',
            background: '#FFFFFF',
            border: '8px solid #000000',
            borderRadius: '4px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '18px',
            gap: '12px',
          }}
        >
          {/* Document text lines */}
          <div style={{ width: '100%', height: '6px', background: '#000000', opacity: 0.6, borderRadius: '1px' }} />
          <div style={{ width: '100%', height: '6px', background: '#000000', opacity: 0.6, borderRadius: '1px' }} />
          <div style={{ width: '85%', height: '6px', background: '#000000', opacity: 0.6, borderRadius: '1px' }} />
          <div style={{ width: '100%', height: '6px', background: '#000000', opacity: 0.4, borderRadius: '1px' }} />
          <div style={{ width: '75%', height: '6px', background: '#000000', opacity: 0.4, borderRadius: '1px' }} />

          {/* Folded corner */}
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '0',
              height: '0',
              borderLeft: '32px solid transparent',
              borderTop: '32px solid #000000',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '0',
              height: '0',
              borderLeft: '28px solid transparent',
              borderTop: '28px solid #FFFFFF',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
