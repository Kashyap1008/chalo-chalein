import React, { useRef, useEffect } from 'react';

const ClickSpark = ({
  planeColor = '#c45838',
  planeCount = 5,
  flightDistance = 75,
  duration = 650,
  children
}) => {
  const canvasRef = useRef(null);
  const planesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;

    const draw = timestamp => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      planesRef.current = planesRef.current.filter(plane => {
        const elapsed = timestamp - plane.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        // Ease out quadratic
        const ease = 1 - Math.pow(1 - progress, 2);
        const alpha = Math.max(0, 1 - progress);

        const currentDist = ease * flightDistance * plane.speedMultiplier;
        const px = plane.originX + currentDist * Math.cos(plane.angle);
        const py = plane.originY + currentDist * Math.sin(plane.angle);

        ctx.save();

        // 1. Draw dashed flight trail / vapor trail behind each plane
        ctx.beginPath();
        ctx.setLineDash([3, 4]);
        ctx.moveTo(plane.originX, plane.originY);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `rgba(196, 88, 56, ${alpha * 0.45})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Draw Aeroplane
        const size = plane.size * (1 - progress * 0.25);
        ctx.translate(px, py);
        ctx.rotate(plane.angle + Math.PI / 2); // orient plane along flight trajectory
        ctx.globalAlpha = alpha;

        // Plane Body
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.2);
        ctx.lineTo(size * 0.8, size * 0.9);
        ctx.lineTo(0, size * 0.4);
        ctx.lineTo(-size * 0.8, size * 0.9);
        ctx.closePath();

        ctx.fillStyle = planeColor;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Center spine / fold of paper aeroplane
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.2);
        ctx.lineTo(0, size * 0.4);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [planeColor, flightDistance, duration]);

  useEffect(() => {
    const handlePointerDown = e => {
      const now = performance.now();
      const clickX = e.clientX;
      const clickY = e.clientY;

      // Base starting angle with slight random jitter
      const startAngle = Math.random() * Math.PI * 2;
      const count = planeCount;

      const newPlanes = Array.from({ length: count }, (_, i) => ({
        originX: clickX,
        originY: clickY,
        angle: startAngle + (2 * Math.PI * i) / count + (Math.random() * 0.2 - 0.1),
        speedMultiplier: 0.8 + Math.random() * 0.4,
        size: 7 + Math.random() * 3,
        startTime: now
      }));

      planesRef.current.push(...newPlanes);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [planeCount]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 99999
        }}
      />
      {children}
    </>
  );
};

export default ClickSpark;
