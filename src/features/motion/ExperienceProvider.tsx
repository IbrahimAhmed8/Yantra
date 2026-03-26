'use client';

import Lenis from 'lenis';
import { motion, useMotionValue, useSpring } from 'motion/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ExperienceContextValue = {
  isOverlayActive: boolean;
  reducedMotion: boolean;
  setOverlayState: (name: string, active: boolean) => void;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const smoothEase = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

function SharedCursor({ enabled }: { enabled: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const innerX = useSpring(cursorX, { damping: 28, stiffness: 420, mass: 0.45 });
  const innerY = useSpring(cursorY, { damping: 28, stiffness: 420, mass: 0.45 });
  const outerX = useSpring(cursorX, { damping: 22, stiffness: 250, mass: 0.7 });
  const outerY = useSpring(cursorY, { damping: 22, stiffness: 250, mass: 0.7 });

  useEffect(() => {
    if (!enabled) {
      setIsVisible(false);
      setIsHovered(false);
      return;
    }

    const updatePosition = (event: PointerEvent) => {
      cursorX.set(event.clientX - 7);
      cursorY.set(event.clientY - 7);
      setIsVisible(true);
    };

    const updateHoverState = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      setIsHovered(Boolean(target?.closest('a, button, input, textarea, select, label, .hoverable, [role="button"]')));
    };

    const hideCursor = () => setIsVisible(false);
    const cursorBoundary = document.documentElement;

    window.addEventListener('pointermove', updatePosition);
    window.addEventListener('blur', hideCursor);
    cursorBoundary.addEventListener('mouseleave', hideCursor);
    window.addEventListener('mouseover', updateHoverState);

    return () => {
      window.removeEventListener('pointermove', updatePosition);
      window.removeEventListener('blur', hideCursor);
      cursorBoundary.removeEventListener('mouseleave', hideCursor);
      window.removeEventListener('mouseover', updateHoverState);
    };
  }, [enabled, cursorX, cursorY]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[120] hidden h-3.5 w-3.5 rounded-full bg-white mix-blend-difference md:block"
        style={{ x: innerX, y: innerY }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovered ? 2.8 : isVisible ? 1 : 0.7,
        }}
        transition={{
          opacity: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
          scale: { type: 'spring', stiffness: 300, damping: 24 },
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[119] hidden rounded-full border border-white/20 md:block"
        style={{
          x: outerX,
          y: outerY,
          translateX: -18,
          translateY: -18,
          width: 44,
          height: 44,
        }}
        animate={{
          opacity: isVisible ? (isHovered ? 0.82 : 0.28) : 0,
          scale: isHovered ? 1.08 : 1,
        }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      />
    </>
  );
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const [overlayStates, setOverlayStates] = useState<Record<string, boolean>>({});

  const isOverlayActive = Object.values(overlayStates).some(Boolean);

  const setOverlayState = useCallback((name: string, active: boolean) => {
    setOverlayStates((current) => {
      const alreadyActive = Boolean(current[name]);

      if (alreadyActive === active) {
        return current;
      }

      if (!active) {
        const next = { ...current };
        delete next[name];
        return next;
      }

      return {
        ...current,
        [name]: true,
      };
    });
  }, []);

  useEffect(() => {
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverMedia = window.matchMedia('(hover: hover)');
    const finePointerMedia = window.matchMedia('(pointer: fine)');

    const updatePreferences = () => {
      const shouldReduceMotion = reducedMotionMedia.matches;
      const supportsCursor = hoverMedia.matches && finePointerMedia.matches && window.innerWidth >= 768;

      setReducedMotion(shouldReduceMotion);
      setCursorEnabled(!shouldReduceMotion && supportsCursor);
    };

    updatePreferences();
    reducedMotionMedia.addEventListener('change', updatePreferences);
    hoverMedia.addEventListener('change', updatePreferences);
    finePointerMedia.addEventListener('change', updatePreferences);
    window.addEventListener('resize', updatePreferences);

    return () => {
      reducedMotionMedia.removeEventListener('change', updatePreferences);
      hoverMedia.removeEventListener('change', updatePreferences);
      finePointerMedia.removeEventListener('change', updatePreferences);
      window.removeEventListener('resize', updatePreferences);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.dataset.yantraMotion = reducedMotion ? 'reduced' : 'smooth';

    if (cursorEnabled) {
      body.dataset.yantraCursor = 'custom';
    } else {
      delete body.dataset.yantraCursor;
    }

    return () => {
      delete html.dataset.yantraMotion;
      delete body.dataset.yantraCursor;
    };
  }, [cursorEnabled, reducedMotion]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (isOverlayActive) {
      html.dataset.yantraOverlay = 'true';
      body.dataset.yantraOverlay = 'true';
    } else {
      delete html.dataset.yantraOverlay;
      delete body.dataset.yantraOverlay;
    }

    return () => {
      delete html.dataset.yantraOverlay;
      delete body.dataset.yantraOverlay;
    };
  }, [isOverlayActive]);

  useEffect(() => {
    if (reducedMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.05,
      easing: smoothEase,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.05,
      anchors: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => node instanceof HTMLElement && Boolean(node.closest('[data-lenis-prevent]')),
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!lenisRef.current) {
      return;
    }

    if (isOverlayActive) {
      lenisRef.current.stop();
      return;
    }

    lenisRef.current.start();
  }, [isOverlayActive]);

  const value = useMemo(
    () => ({
      isOverlayActive,
      reducedMotion,
      setOverlayState,
    }),
    [isOverlayActive, reducedMotion, setOverlayState],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
      <SharedCursor enabled={cursorEnabled} />
    </ExperienceContext.Provider>
  );
}

export function useOverlayLock(name: string, active: boolean) {
  const context = useContext(ExperienceContext);

  if (!context) {
    throw new Error('useOverlayLock must be used inside ExperienceProvider.');
  }

  const { setOverlayState } = context;

  useEffect(() => {
    setOverlayState(name, active);

    return () => {
      setOverlayState(name, false);
    };
  }, [active, name, setOverlayState]);

  return context;
}

export function useExperience() {
  const context = useContext(ExperienceContext);

  if (!context) {
    throw new Error('useExperience must be used inside ExperienceProvider.');
  }

  return context;
}
