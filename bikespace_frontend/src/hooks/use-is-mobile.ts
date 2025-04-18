import {useState, useEffect} from 'react';

// sync with $wrapper-full-width in /src/styles/variables.module.scss
const WRAPPER_FULL_WIDTH = 1024;

export function useIsMobile() {
  const isMobile = useMediaQuery(`(max-width: ${WRAPPER_FULL_WIDTH}px)`, {
    defaultValue: false,
  });

  return isMobile;
}

type UseMediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === 'undefined';

export function useMediaQuery(
  query: string,
  {defaultValue = false, initializeWithValue = true}: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query);
    }
    return defaultValue;
  });

  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    handleChange();

    matchMedia.addEventListener('change', handleChange);

    return () => {
      matchMedia.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
