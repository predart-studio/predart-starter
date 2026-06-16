import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia; usePrefersReducedMotion relies on it.
// Default: motion allowed (matches: false). Tests override per-case.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
