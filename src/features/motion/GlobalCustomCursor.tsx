'use client';

import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

type GlobalCustomCursorProps = {
  reducedMotion: boolean;
};

const interactiveSelector =
  'a, button, input, textarea, select, summary, label, [role="button"], [data-cursor-hover="true"]';

function isCursorEnabledForPath(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  if (
    pathname.startsWith('/editor') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/classroom') ||
    pathname.startsWith('/api')
  ) {
    return false;
  }

  return true;
}

export default function GlobalCustomCursor({ reducedMotion }: GlobalCustomCursorProps) {
  const pathname = usePathname();
  const enabledForRoute = isCursorEnabledForPath(pathname);
  const pointerFineQuery = useMemo(() => '(pointer: fine) and (hover: hover)', []);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 520, damping: 38, mass: 0.38 });
  const smoothY = useSpring(y, { stiffness: 520, damping: 38, mass: 0.38 });
  const frame = useRef<number | null>(null);
  const pending = useRef({ x: -100, y: -100 });
  const cursorX = useTransform(smoothX, (value) => value - (isHovering ? 32 : 12));
  const cursorY = useTransform(smoothY, (value) => value - (isHovering ? 32 : 12));
  const enabled = enabledForRoute && hasFinePointer && !reducedMotion;

  useEffect(() => {
    const media = window.matchMedia(pointerFineQuery);

    const syncPointerMode = () => {
      setHasFinePointer(media.matches);
    };

    syncPointerMode();
    media.addEventListener('change', syncPointerMode);

    return () => {
      media.removeEventListener('change', syncPointerMode);
    };
  }, [pointerFineQuery]);

  useEffect(() => {
    const body = document.body;

    if (enabled) {
      body.dataset.yantraCursor = 'custom';
    } else {
      delete body.dataset.yantraCursor;
    }

    return () => {
      delete body.dataset.yantraCursor;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const flushFrame = () => {
      x.set(pending.current.x);
      y.set(pending.current.y);
      frame.current = null;
    };

    const updatePosition = (event: PointerEvent) => {
      pending.current = { x: event.clientX, y: event.clientY };

      if (frame.current == null) {
        frame.current = window.requestAnimationFrame(flushFrame);
      }
    };

    const updateHovering = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      setIsHovering(Boolean(target.closest(interactiveSelector)));
    };

    const handlePointerLeave = () => {
      setIsHovering(false);
      pending.current = { x: -100, y: -100 };

      if (frame.current == null) {
        frame.current = window.requestAnimationFrame(flushFrame);
      }
    };

    window.addEventListener('pointermove', updatePosition, { passive: true });
    document.addEventListener('pointerover', updateHovering, { passive: true });
    document.addEventListener('pointerdown', updateHovering, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', updatePosition);
      document.removeEventListener('pointerover', updateHovering);
      document.removeEventListener('pointerdown', updateHovering);
      document.removeEventListener('pointerleave', handlePointerLeave);

      if (frame.current != null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [enabled, x, y]);

  if (!enabled) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden items-center justify-center mix-blend-difference md:flex"
      animate={{
        width: isHovering ? 64 : 24,
        height: isHovering ? 64 : 24,
        opacity: 1,
      }}
      style={{
        x: cursorX,
        y: cursorY,
        willChange: 'transform,width,height',
        contain: 'layout style paint',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <div
        className={`h-full w-full rounded-full border-2 border-white transition-all duration-300 ${
          isHovering ? 'scale-110 bg-white' : 'bg-transparent'
        }`}
      />
    </motion.div>
  );
}
