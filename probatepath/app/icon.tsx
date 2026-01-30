import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // Document icon with folded corner
      <div
        style={{
          background: '#FFFFFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '24px',
            background: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '1px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '3px',
            gap: '2px',
          }}
        >
          {/* Document text lines */}
          <div style={{ width: '100%', height: '1.5px', background: '#000000', opacity: 0.6 }} />
          <div style={{ width: '100%', height: '1.5px', background: '#000000', opacity: 0.6 }} />
          <div style={{ width: '70%', height: '1.5px', background: '#000000', opacity: 0.6 }} />

          {/* Folded corner */}
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderTop: '6px solid #000000',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-1px',
              right: '-1px',
              width: '0',
              height: '0',
              borderLeft: '5px solid transparent',
              borderTop: '5px solid #FFFFFF',
            }}
          />
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
