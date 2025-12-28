import {useState, useEffect} from 'react';

// sync with $wrapper-full-width in /src/styles/variables.module.scss
const WRAPPER_FULL_WIDTH = 1024;

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${WRAPPER_FULL_WIDTH}px)`);
}

export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}
