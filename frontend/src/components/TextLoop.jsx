import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './TextLoop.css';

const VIEW_W = 1600;
const VIEW_H = 260;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const EDGE_PAD = 8;

const buildPath = (shape, curviness, ribbonWidth) => {
  const c = Math.max(0, curviness);
  const room = Math.max(20, CY - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

  switch (shape) {
    case 'circle': {
      const r = Math.min(80 + c * 0.6, room);
      return `M ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} Z`;
    }
    case 'infinity': {
      const r = 150 + c * 1.0;
      const h = Math.min(50 + c * 0.6, room);
      return [
        `M ${CX} ${CY}`,
        `C ${CX + r * 0.55} ${CY - h} ${CX + r} ${CY - h} ${CX + r} ${CY}`,
        `C ${CX + r} ${CY + h} ${CX + r * 0.55} ${CY + h} ${CX} ${CY}`,
        `C ${CX - r * 0.55} ${CY - h} ${CX - r} ${CY - h} ${CX - r} ${CY}`,
        `C ${CX - r} ${CY + h} ${CX - r * 0.55} ${CY + h} ${CX} ${CY}`,
        'Z'
      ].join(' ');
    }
    case 'arch': {
      const rise = Math.min(80 + c * 0.7, room * 1.5);
      return `M 100 ${CY + rise / 2} Q ${CX} ${CY - rise * 1.2} ${VIEW_W - 100} ${CY + rise / 2}`;
    }
    case 'line':
      return `M -400 ${CY} L ${VIEW_W + 400} ${CY}`;
    case 'wave':
    default: {
      // Pronounced sinusoidal wave undulating up and down across the viewBox
      const a = Math.min(Math.max(50, c * 0.95), room);
      return `M -400 ${CY} C -250 ${CY - a} -150 ${CY - a} 0 ${CY} S 250 ${CY + a} 400 ${CY} S 650 ${CY - a} 800 ${CY} S 1050 ${CY + a} 1200 ${CY} S 1450 ${CY - a} 1600 ${CY} S 1850 ${CY + a} 2000 ${CY}`;
    }
  }
};

const TextLoop = ({
  text = 'Goa ✦ Manali ✦ Jaipur ✦ Udaipur ✦ Varanasi ✦ Leh-Ladakh ✦ Rishikesh ✦ Amritsar ✦ Agra ✦ Munnar ✦ Shimla',
  shape = 'wave',
  path,
  speed = 85,
  direction = 'forward',
  separator = '✦',
  curviness = 75,
  fontSize = 20,
  fontWeight = 800,
  charSpacing = 2, // Space between characters inside each city
  uppercase = true,
  color = '#ffffff',
  ribbon = true,
  ribbonColor = '#c45838', // Orange brand theme
  ribbonWidth = 46,
  pauseOnHover = true,
  className = '',
  style = {}
}) => {
  const rootRef = useRef(null);
  const pathRef = useRef(null);
  const measureRef = useRef(null);
  const headRef = useRef(null);
  const tailRef = useRef(null);

  const [metrics, setMetrics] = useState({ length: 0, reps: 1 });

  const rawId = useId();
  const pathId = `text-loop-${rawId.replace(/:/g, '')}`;

  const d = useMemo(() => path || buildPath(shape, curviness, ribbonWidth), [path, shape, curviness, ribbonWidth]);

  // Format unit with generous city-to-city gaps AND character-to-character spacing
  const unit = useMemo(() => {
    let items = [];
    if (Array.isArray(text)) {
      items = text;
    } else if (typeof text === 'string') {
      if (separator && text.includes(separator)) {
        items = text.split(separator).map(s => s.trim()).filter(Boolean);
      } else {
        items = [text.trim()];
      }
    }

    // Space between individual characters inside each city name
    const charPad = '\u00A0'.repeat(Math.max(1, charSpacing));
    const formatCity = (name) => {
      const clean = uppercase ? String(name).toUpperCase() : String(name);
      return clean.split('').join(charPad);
    };

    // Wide gap between cities
    const cityGapPad = '\u00A0'.repeat(16);
    const gap = separator ? `${cityGapPad}${separator}${cityGapPad}` : '\u00A0'.repeat(32);

    const formattedCities = items.map(formatCity);
    return formattedCities.join(gap) + gap;
  }, [text, separator, uppercase, charSpacing]);

  const textStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }),
    [fontSize, fontWeight]
  );

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    const measureEl = measureRef.current;
    if (!pathEl || !measureEl) return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      let length = 0;
      let unitWidth = 0;
      try {
        length = pathEl.getTotalLength();
        unitWidth = measureEl.getComputedTextLength();
      } catch {
        return;
      }
      if (!length) return;

      const reps = unitWidth > 0 ? Math.max(1, Math.round(length / unitWidth)) : 1;
      setMetrics(prev => (prev.length === length && prev.reps === reps ? prev : { length, reps }));
    };

    measure();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [d, unit, fontSize, fontWeight, charSpacing]);

  useEffect(() => {
    const { length } = metrics;
    const head = headRef.current;
    const tail = tailRef.current;
    if (!head || !tail || !length) return undefined;

    const apply = offset => {
      const partner = offset >= 0 ? offset - length : offset + length;
      head.setAttribute('startOffset', String(offset));
      tail.setAttribute('startOffset', String(partner));
    };

    apply(0);

    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || speed <= 0) return undefined;

    const state = { offset: 0 };
    const tween = gsap.to(state, {
      offset: direction === 'reverse' ? -length : length,
      duration: length / speed,
      ease: 'none',
      repeat: -1,
      onUpdate: () => apply(state.offset)
    });

    const root = rootRef.current;
    const pause = () => tween.pause();
    const resume = () => tween.resume();

    if (pauseOnHover && root) {
      root.addEventListener('pointerenter', pause);
      root.addEventListener('pointerleave', resume);
    }

    return () => {
      tween.kill();
      if (pauseOnHover && root) {
        root.removeEventListener('pointerenter', pause);
        root.removeEventListener('pointerleave', resume);
      }
    };
  }, [metrics, speed, direction, pauseOnHover]);

  const loopText = unit.repeat(metrics.reps);
  const fitLength = metrics.length || undefined;

  return (
    <div ref={rootRef} className={`text-loop ${className}`.trim()} style={style}>
      <svg
        className="text-loop-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={text}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={d}
          fill="none"
          stroke={ribbon ? ribbonColor : 'none'}
          strokeWidth={ribbon ? ribbonWidth : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text ref={measureRef} className="text-loop-measure" style={textStyle} aria-hidden="true">
          {unit}
        </text>

        <text className="text-loop-text" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={headRef} href={`#${pathId}`} startOffset={0} textLength={fitLength} lengthAdjust="spacing">
            {loopText}
          </textPath>
        </text>

        <text className="text-loop-text" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={tailRef} href={`#${pathId}`} startOffset={0} textLength={fitLength} lengthAdjust="spacing">
            {loopText}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default TextLoop;
