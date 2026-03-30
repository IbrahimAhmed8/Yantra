'use client';

import { startTransition, useEffect, useState } from 'react';

export function useScrollThreshold(threshold: number) {
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  useEffect(() => {
    let frame: number | null = null;
    let lastValue = false;

    const updateThreshold = () => {
      frame = null;

      const nextValue = window.scrollY > threshold;

      if (nextValue === lastValue) {
        return;
      }

      lastValue = nextValue;
      startTransition(() => {
        setIsPastThreshold(nextValue);
      });
    };

    const queueThresholdUpdate = () => {
      if (frame !== null) {
        return;
      }

      frame = window.requestAnimationFrame(updateThreshold);
    };

    lastValue = window.scrollY > threshold;
    setIsPastThreshold(lastValue);

    window.addEventListener('scroll', queueThresholdUpdate, { passive: true });
    window.addEventListener('resize', queueThresholdUpdate, { passive: true });

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener('scroll', queueThresholdUpdate);
      window.removeEventListener('resize', queueThresholdUpdate);
    };
  }, [threshold]);

  return isPastThreshold;
}
