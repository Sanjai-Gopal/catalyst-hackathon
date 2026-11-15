import React, { useEffect, useRef } from 'react';

interface Interactive3DGlobeProps {
  className?: string;
  size?: number;
  accentColor?: string;
}

export const Interactive3DGlobe: React.FC<Interactive3DGlobeProps> = ({
  className = '',
  size = 320,
  accentColor = '#0284c7', // Sky blue default
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotationX = 0.2;
    let rotationY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Generate 3D sphere particles
    const particleCount = 380;
    const radius = size * 0.38;
    const particles: Array<{ x: number; y: number; z: number }> = [];

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      particles.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
      });
    }

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - size / 2;
        const mouseY = e.clientY - rect.top - size / 2;
        targetRotationY += mouseX * 0.0001;
        targetRotationX += mouseY * 0.0001;
        return;
      }
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const render = () => {
      // Smooth inertia rotation
      rotationX += (targetRotationX - rotationX) * 0.08;
      rotationY += (targetRotationY - rotationY) * 0.08;
      targetRotationY += 0.004; // Gentle auto-spin

      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;

      // Draw subtle orbital ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(1, 0.35);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.restore();

      // Project and draw particles
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      const sortedParticles = particles
        .map((p) => {
          // Rotate around Y axis
          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.z * cosY + p.x * sinY;

          // Rotate around X axis
          const y2 = p.y * cosX - z1 * sinX;
          const z2 = z1 * cosX + p.y * sinX;

          return { x: x1, y: y2, z: z2 };
        })
        .sort((a, b) => a.z - b.z);

      for (const p of sortedParticles) {
        const perspective = 400 / (400 - p.z);
        const px = centerX + p.x * perspective;
        const py = centerY + p.y * perspective;

        // Depth alpha and scale
        const normalizedZ = (p.z + radius) / (2 * radius);
        const alpha = Math.max(0.12, Math.min(0.95, normalizedZ));
        const dotSize = Math.max(1, 1.8 * perspective);

        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);

        if (normalizedZ > 0.8) {
          ctx.fillStyle = accentColor;
          ctx.shadowBlur = 6;
          ctx.shadowColor = accentColor;
        } else {
          ctx.fillStyle = `rgba(120, 113, 108, ${alpha * 0.6})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [size, accentColor]);

  return (
    <div className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-auto max-w-[340px]"
      />
      <div className="absolute bottom-2 text-[10px] font-mono text-stone-400 bg-white/70 dark:bg-stone-900/70 px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-800 pointer-events-none">
        3D Interactive • Drag to Rotate
      </div>
    </div>
  );
};
export default Interactive3DGlobe;
