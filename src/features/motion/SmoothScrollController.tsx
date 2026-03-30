'use client';

import Lenis, { type LenisOptions } from 'lenis';
import { useEffect, useRef } from 'react';

type SmoothScrollControllerProps = {
  reducedMotion: boolean;
  isOverlayActive: boolean;
};

const smoothEase = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
const touchPointerQuery = '(pointer: coarse), (hover: none)';
const anchorOffset = 112;
const desktopLerp = 0.1;
const touchLerp = 0.12;

function createLenisOptions(isTouchLike: boolean): LenisOptions {
  const baseOptions: LenisOptions = {
    autoRaf: true,
    autoResize: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    overscroll: false,
    anchors: {
      offset: anchorOffset,
      duration: isTouchLike ? 0.8 : 1,
      easing: smoothEase,
    },
    stopInertiaOnNavigate: true,
    prevent: (node) => node instanceof HTMLElement && Boolean(node.closest('[data-lenis-prevent]')),
    virtualScroll: ({ event }) => !(event instanceof WheelEvent && event.ctrlKey),
  };

  if (isTouchLike) {
    return {
      ...baseOptions,
      syncTouch: true,
      lerp: touchLerp,
      syncTouchLerp: 0.09,
      touchInertiaExponent: 1.5,
      wheelMultiplier: 0.9,
      touchMultiplier: 0.92,
    };
  }

  return {
    ...baseOptions,
    syncTouch: false,
    lerp: desktopLerp,
    wheelMultiplier: 0.82,
    touchMultiplier: 0.96,
  };
}

export default function SmoothScrollController({
  reducedMotion,
  isOverlayActive,
}: SmoothScrollControllerProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const overlayActiveRef = useRef(isOverlayActive);

  useEffect(() => {
    overlayActiveRef.current = isOverlayActive;

    if (!lenisRef.current) {
      return;
    }

    if (isOverlayActive) {
      lenisRef.current.stop();
      return;
    }

    lenisRef.current.start();
  }, [isOverlayActive]);

  useEffect(() => {
    if (reducedMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const pointerMedia = window.matchMedia(touchPointerQuery);
    const viewport = window.visualViewport;

    const rebuildLenis = () => {
      lenisRef.current?.destroy();

      const lenis = new Lenis(createLenisOptions(pointerMedia.matches));
      lenisRef.current = lenis;

      if (overlayActiveRef.current) {
        lenis.stop();
      }
    };

    const handleViewportChange = () => {
      lenisRef.current?.resize();
    };

    rebuildLenis();
    pointerMedia.addEventListener('change', rebuildLenis);
    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('orientationchange', handleViewportChange);
    viewport?.addEventListener('resize', handleViewportChange);

    return () => {
      pointerMedia.removeEventListener('change', rebuildLenis);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      viewport?.removeEventListener('resize', handleViewportChange);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return null;
}
