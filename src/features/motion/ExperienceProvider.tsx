'use client';

import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ROUTE_TRANSITION_START_EVENT } from './route-transition';

type ExperienceContextValue = {
  isOverlayActive: boolean;
  reducedMotion: boolean;
  setOverlayState: (name: string, active: boolean) => void;
  startPageTransition: () => void;
};

type RouteTransitionDetail = {
  href?: string | null;
  label?: string | null;
};

type RouteTransitionOverlayProps = {
  reducedMotion: boolean;
  onVisibilityChange: (active: boolean) => void;
};

type SmoothScrollControllerProps = {
  reducedMotion: boolean;
  isOverlayActive: boolean;
};

type GlobalCustomCursorProps = {
  reducedMotion: boolean;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const RouteTransitionOverlay = dynamic<RouteTransitionOverlayProps>(
  () => import('./RouteTransitionOverlay'),
  {
    ssr: false,
    loading: () => null,
  },
);

const SmoothScrollController = dynamic<SmoothScrollControllerProps>(
  () => import('./SmoothScrollController'),
  {
    ssr: false,
    loading: () => null,
  },
);

const GlobalCustomCursor = dynamic<GlobalCustomCursorProps>(
  () => import('./GlobalCustomCursor'),
  {
    ssr: false,
    loading: () => null,
  },
);

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

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(true);
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

  const startPageTransition = useCallback(() => {
    startRouteTransition();
  }, []);

  const handleRouteTransitionVisibilityChange = useCallback(
    (active: boolean) => {
      setOverlayState('route-transition', active);
    },
    [setOverlayState],
  );

  useEffect(() => {
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updatePreferences = () => {
      setReducedMotion(reducedMotionMedia.matches);
    };

    updatePreferences();
    reducedMotionMedia.addEventListener('change', updatePreferences);

    return () => {
      reducedMotionMedia.removeEventListener('change', updatePreferences);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;

    html.dataset.yantraMotion = reducedMotion ? 'reduced' : 'smooth';

    return () => {
      delete html.dataset.yantraMotion;
    };
  }, [reducedMotion]);

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

  const value = useMemo(
    () => ({
      isOverlayActive,
      reducedMotion,
      setOverlayState,
      startPageTransition,
    }),
    [isOverlayActive, reducedMotion, setOverlayState, startPageTransition],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
      <GlobalCustomCursor reducedMotion={reducedMotion} />
      <SmoothScrollController isOverlayActive={isOverlayActive} reducedMotion={reducedMotion} />
      <RouteTransitionOverlay
        reducedMotion={reducedMotion}
        onVisibilityChange={handleRouteTransitionVisibilityChange}
      />
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

export function usePageTransition() {
  const { startPageTransition } = useExperience();

  return {
    startPageTransition,
  };
}
