'use client';

import Lenis from 'lenis';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
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
const ROUTE_TRANSITION_START_EVENT = 'yantra:route-transition-start';
const ROUTE_TRANSITION_MIN_DURATION_MS = 720;

type RouteTransitionDetail = {
  href?: string | null;
  label?: string | null;
};

export function startRouteTransition(detail: RouteTransitionDetail = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<RouteTransitionDetail>(ROUTE_TRANSITION_START_EVENT, {
      detail,
    }),
  );
}

function buildRouteKey(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

function normalizeInternalHref(href?: string | null) {
  if (!href || typeof window === 'undefined') {
    return null;
  }

  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null;
  }

  try {
    const url = new URL(href, window.location.href);

    if (url.origin !== window.location.origin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function toRouteKeyFromHref(href?: string | null) {
  const normalizedHref = normalizeInternalHref(href);

  if (!normalizedHref || typeof window === 'undefined') {
    return null;
  }

  const url = new URL(normalizedHref, window.location.origin);
  return buildRouteKey(url.pathname, url.search);
}

function getInternalHrefFromClick(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest('a[href]');

  if (!(anchor instanceof HTMLAnchorElement)) {
    return null;
  }

  if (anchor.dataset.noRouteLoader === 'true' || anchor.hasAttribute('download')) {
    return null;
  }

  if (anchor.target && anchor.target !== '_self') {
    return null;
  }

  const href = normalizeInternalHref(anchor.getAttribute('href'));

  if (!href) {
    return null;
  }

  const currentUrl = new URL(window.location.href);
  const nextUrl = new URL(href, window.location.origin);
  const currentRoute = buildRouteKey(currentUrl.pathname, currentUrl.search);
  const nextRoute = buildRouteKey(nextUrl.pathname, nextUrl.search);

  if (currentRoute === nextRoute) {
    return null;
  }

  return href;
}

function SharedCursor({ enabled }: { enabled: boolean }) {
  const innerSize = 8;
  const outerSize = 26;
  const outerOffset = (outerSize - innerSize) / 2;
  const interactiveSelector =
    'a, button, input, textarea, select, label, summary, .hoverable, [role="button"]';
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const innerOpacity = useMotionValue(0);
  const outerOpacity = useMotionValue(0);
  const innerScale = useMotionValue(0.7);
  const outerScale = useMotionValue(1);
  const innerOpacitySpring = useSpring(innerOpacity, { damping: 32, stiffness: 520, mass: 0.2 });
  const outerOpacitySpring = useSpring(outerOpacity, { damping: 28, stiffness: 320, mass: 0.3 });
  const innerScaleSpring = useSpring(innerScale, { damping: 30, stiffness: 460, mass: 0.28 });
  const outerScaleSpring = useSpring(outerScale, { damping: 26, stiffness: 320, mass: 0.42 });

  useEffect(() => {
    const resetCursor = () => {
      cursorX.set(-100);
      cursorY.set(-100);
      innerOpacity.set(0);
      outerOpacity.set(0);
      innerScale.set(0.7);
      outerScale.set(1);
    };

    if (!enabled) {
      resetCursor();
      return;
    }

    let isVisible = false;
    let isHovered = false;

    const syncAppearance = () => {
      innerOpacity.set(isVisible ? 1 : 0);
      outerOpacity.set(isVisible ? (isHovered ? 0.24 : 0.12) : 0);
      innerScale.set(isVisible ? (isHovered ? 1.15 : 1) : 0.7);
      outerScale.set(isHovered ? 1.03 : 1);
    };

    const updatePosition = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        return;
      }

      cursorX.set(event.clientX - innerSize / 2);
      cursorY.set(event.clientY - innerSize / 2);

      const target = event.target;
      const nextHovered = target instanceof Element ? Boolean(target.closest(interactiveSelector)) : false;

      if (!isVisible || nextHovered !== isHovered) {
        isVisible = true;
        isHovered = nextHovered;
        syncAppearance();
      }
    };

    const hideCursor = () => {
      if (!isVisible) {
        return;
      }

      isVisible = false;
      syncAppearance();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hideCursor();
      }
    };

    const cursorBoundary = document.documentElement;

    window.addEventListener('pointermove', updatePosition, { passive: true });
    window.addEventListener('blur', hideCursor);
    cursorBoundary.addEventListener('mouseleave', hideCursor);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointermove', updatePosition);
      window.removeEventListener('blur', hideCursor);
      cursorBoundary.removeEventListener('mouseleave', hideCursor);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resetCursor();
    };
  }, [cursorX, cursorY, enabled, innerOpacity, innerScale, interactiveSelector, outerOpacity, outerScale]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[120] hidden rounded-full bg-white/88 md:block"
        style={{
          x: cursorX,
          y: cursorY,
          width: innerSize,
          height: innerSize,
          opacity: innerOpacitySpring,
          scale: innerScaleSpring,
          willChange: 'transform, opacity',
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[119] hidden rounded-full border border-white/16 md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: -outerOffset,
          translateY: -outerOffset,
          width: outerSize,
          height: outerSize,
          opacity: outerOpacitySpring,
          scale: outerScaleSpring,
          willChange: 'transform, opacity',
        }}
      />
    </>
  );
}

function RouteTransitionOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { reducedMotion } = useExperience();
  const currentRouteKey = buildRouteKey(pathname, searchParams.toString());
  const [isVisible, setIsVisible] = useState(false);
  const lastRouteKeyRef = useRef(currentRouteKey);
  const startedAtRef = useRef(0);
  const hideTimeoutRef = useRef<number | null>(null);

  useOverlayLock('route-transition', isVisible);

  const openTransition = useCallback((detail?: RouteTransitionDetail) => {
    const nextRouteKey = toRouteKeyFromHref(detail?.href);

    if (nextRouteKey && nextRouteKey === lastRouteKeyRef.current) {
      return;
    }

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    startedAtRef.current = Date.now();
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleRouteTransitionStart = (event: Event) => {
      const customEvent = event as CustomEvent<RouteTransitionDetail>;
      openTransition(customEvent.detail);
    };

    window.addEventListener(ROUTE_TRANSITION_START_EVENT, handleRouteTransitionStart);

    return () => {
      window.removeEventListener(ROUTE_TRANSITION_START_EVENT, handleRouteTransitionStart);
    };
  }, [openTransition]);

  useEffect(() => {
    const handleClickCapture = (event: MouseEvent) => {
      const href = getInternalHrefFromClick(event);

      if (!href) {
        return;
      }

      openTransition({ href });
    };

    const handlePopState = () => {
      openTransition({
        href: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      });
    };

    document.addEventListener('click', handleClickCapture, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClickCapture, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [openTransition]);

  useEffect(() => {
    if (!isVisible) {
      lastRouteKeyRef.current = currentRouteKey;
      return;
    }

    if (currentRouteKey === lastRouteKeyRef.current) {
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, ROUTE_TRANSITION_MIN_DURATION_MS - elapsed);

    hideTimeoutRef.current = window.setTimeout(() => {
      lastRouteKeyRef.current = currentRouteKey;
      setIsVisible(false);
    }, remaining);

    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [currentRouteKey, isVisible]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="route-transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.18 : 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto fixed inset-0 z-[140] overflow-hidden bg-black"
        >
          <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
            <motion.div
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.98 }}
              transition={{ duration: reducedMotion ? 0.18 : 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-12 w-12 sm:h-14 sm:w-14"
            >
              <div className="absolute inset-0 rounded-full border border-white/12" />
              <div className="absolute inset-[3px] rounded-full border border-white/[0.08]" />
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-transparent border-t-white/80 border-r-white/32"
                animate={reducedMotion ? undefined : { rotate: -360 }}
                transition={reducedMotion ? undefined : { duration: 0.9, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute inset-[6px] rounded-full border border-transparent border-b-white/40 border-l-white/14"
                animate={reducedMotion ? undefined : { rotate: 360 }}
                transition={reducedMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute left-1/2 top-[4px] h-px w-1.5 -translate-x-1/2 bg-white/28 sm:top-[5px]" />
              <div className="absolute bottom-[4px] left-1/2 h-px w-1.5 -translate-x-1/2 bg-white/18 sm:bottom-[5px]" />
              <div className="absolute left-[4px] top-1/2 h-1.5 w-px -translate-y-1/2 bg-white/18 sm:left-[5px]" />
              <div className="absolute right-[4px] top-1/2 h-1.5 w-px -translate-y-1/2 bg-white/28 sm:right-[5px]" />
              <motion.div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-white/52 bg-black"
                animate={reducedMotion ? undefined : { opacity: [0.72, 1, 0.72] }}
                transition={reducedMotion ? undefined : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/58" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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
      <RouteTransitionOverlay />
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
