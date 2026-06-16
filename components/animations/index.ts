// Shared animation infra (predart-starter).
// Import the GSAP motion wrappers from here.
//
// All GSAP-based, scroll/pointer-driven, and respect prefers-reduced-motion
// (render the final, static state instantly):
//   - TextScramble     (ScrambleText)
//   - Magnetic         (pointer-follow)
//   - DrawPath         (DrawSVG draw-on-scroll)
//   - VelocitySkew     (scroll-velocity skew)
//   - ImageFollowList  (cursor-follow thumbnail list)
//
// Pure, framework-free math for these lives in `lib/motion/*` (unit-tested).
// NEVER bind Framer Motion to the same property a GSAP wrapper drives.

export { LenisProvider } from './lenis-provider'
export { TextScramble } from './text-scramble'
export { Magnetic } from './magnetic'
export { DrawPath } from './draw-path'
export { VelocitySkew } from './velocity-skew'
export { ImageFollowList, type FollowItem } from './image-follow-list'
