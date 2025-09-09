import { useState, useEffect } from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const useResponsive = (breakpoints: BreakpointConfig = defaultBreakpoints) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < breakpoints.sm;
  const isTablet = windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;
  
  const isSmallScreen = windowSize.width < breakpoints.md;
  const isMediumScreen = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.xl;
  const isLargeScreen = windowSize.width >= breakpoints.xl;

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    breakpoints,
  };
};

export const useIsMobile = () => {
  const { isMobile } = useResponsive();
  return isMobile;
};

export const useIsDesktop = () => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

export const useBreakpoint = (breakpoint: keyof BreakpointConfig) => {
  const { windowSize, breakpoints } = useResponsive();
  return windowSize.width >= breakpoints[breakpoint];
};

// Hook for media query-like behavior
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};