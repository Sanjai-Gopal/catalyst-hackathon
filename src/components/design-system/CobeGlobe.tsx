import { useEffect, useRef } from 'react'
import createGlobe, { type Globe } from 'cobe'

interface CobeGlobeProps {
  className?: string
  size?: number
}

export function CobeGlobe({ className = '', size = 300 }: CobeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let phi = 0
    let animId: number
    let globe: Globe | null = null

    if (!canvasRef.current) return

    try {
      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: size * 2,
        height: size * 2,
        phi: 0,
        theta: 0.25,
        dark: 0,
        diffuse: 1.2,
        mapSamples: 12000,
        mapBrightness: 4.5,
        baseColor: [0.95, 0.92, 0.88],
        markerColor: [0.1, 0.6, 0.8],
        glowColor: [0.98, 0.95, 0.9],
        markers: [
          { location: [13.0827, 80.2707], size: 0.08 }, // Chennai (Patient & Apollo)
          { location: [12.9716, 77.5946], size: 0.05 }, // Bangalore Partner
          { location: [37.7749, -122.4194], size: 0.06 }, // San Francisco (Family)
        ],
      })

      const animate = () => {
        phi += 0.004
        if (globe) {
          globe.update({ phi })
        }
        animId = requestAnimationFrame(animate)
      }
      animId = requestAnimationFrame(animate)
    } catch (err) {
      console.warn('[CobeGlobe] WebGL init skipped:', err)
    }

    return () => {
      if (globe && typeof globe.destroy === 'function') {
        globe.destroy()
      }
      if (animId) {
        cancelAnimationFrame(animId)
      }
    }
  }, [size])

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          maxWidth: '100%',
          aspectRatio: '1',
        }}
      />
    </div>
  )
}
