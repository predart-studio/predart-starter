import type { ReactNode } from 'react'
import {
  TextScramble,
  Magnetic,
  DrawPath,
  VelocitySkew,
  ImageFollowList,
  Typewriter,
  CharacterAppear,
  TextReveal,
  DualScramble,
  TextSplitZoom,
  VelocityClip,
  Counter,
  Marquee,
  Parallax,
  RectangleTextReveal,
  PoppingText,
  MaskReveal,
  FoldingText,
  ElementReveal,
  CinematicText,
  MultiFlip,
  ScrollProgress,
  HideHeader,
  FlipZone,
  RandomRotate,
  AnimatedGrid,
  TextShimmerWave,
  TextUnderline,
  BackgroundColor,
  InfiniteParallaxSlider,
  ImageTrail,
  CircularSlider,
  MotionTooltip,
  MorphingDialog,
  MotionAccordion,
  HoverableList,
  Card3DFlip,
  CustomCursor,
  RainbowButton,
  IconButton,
  CurveFillButton,
  CircleFillButton,
  BackgroundFillButton,
  InfiniteDraggableGrid,
  GooeyMenu,
  MegaMenu,
  MultiLevelDrawerMenu,
  FullscreenSlideMenu,
  TextMorph,
  GooeyHoverReveal,
  MeshGradient,
  ImageDissolveScroll,
} from '@/components/animations'

/**
 * Single source of truth for the /lab gallery.
 *
 * Each motion component is one LabEntry. The launcher grid (`/lab`) renders a
 * clickable tile per entry; `/lab/<slug>` opens it in the isolation playground;
 * `/lab/<slug>/frame` renders ONLY `render()` in a bare scrollable document so
 * the component gets a real viewport (real media queries, real scroll context
 * for ScrollTrigger, isolated position:fixed). Keep this the only place demos
 * live — both the grid and the frame read from here.
 */
export interface LabEntry {
  /** URL slug — `/lab/<slug>`. */
  slug: string
  /** Display name in the chrome + tile footer. */
  name: string
  /** One-word bucket (text / scroll / pointer / button / menu / layout …). */
  category: string
  /** Short "how to interact" hint shown on the tile. */
  hint?: string
  /** Full-bleed in the frame (and a label tile, not a live preview, on the grid). */
  full?: boolean
  /** Scroll-driven — the frame adds lead-in + trailing room so it can be triggered. */
  scroll?: boolean
  /** The actual demo. Rendered server-side inside the isolated frame. */
  render: () => ReactNode
}

/** Monochrome SVG data-URI placeholder (no network dependency, on-brand). */
export function ph(label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#141414'/><text x='50%' y='50%' fill='#eeeeee' font-family='monospace' font-size='30' letter-spacing='2' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const followItems = [
  { label: 'Project One', image: ph('ONE') },
  { label: 'Project Two', image: ph('TWO') },
  { label: 'Project Three', image: ph('THREE') },
  { label: 'Project Four', image: ph('FOUR') },
]

export const entries: LabEntry[] = [
  {
    slug: 'text-scramble',
    name: 'Text Scramble',
    category: 'text',
    hint: 'hover',
    render: () => (
      <TextScramble
        text="SCRAMBLE"
        trigger="hover"
        className="cursor-pointer font-mono text-4xl uppercase tracking-tight md:text-6xl"
      />
    ),
  },
  {
    slug: 'magnetic',
    name: 'Magnetic',
    category: 'pointer',
    hint: 'move cursor',
    render: () => (
      <Magnetic strength={40}>
        <button className="rounded-full bg-foreground px-8 py-4 font-sans text-base font-medium text-background">
          Hire me
        </button>
      </Magnetic>
    ),
  },
  {
    slug: 'draw-path',
    name: 'SVG Draw Path',
    category: 'svg',
    hint: 'refresh / replay',
    render: () => (
      <DrawPath trigger="load" className="text-foreground">
        <svg
          width="360"
          height="160"
          viewBox="0 0 180 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M8 56 C 40 8, 70 8, 90 40 S 140 72, 172 24" />
        </svg>
      </DrawPath>
    ),
  },
  {
    slug: 'velocity-skew',
    name: 'Velocity Skew',
    category: 'scroll',
    hint: 'scroll the frame',
    scroll: true,
    render: () => (
      <VelocitySkew>
        <span className="font-sans text-6xl font-semibold tracking-tight">SKEW</span>
      </VelocitySkew>
    ),
  },
  {
    slug: 'typewriter',
    name: 'Typewriter',
    category: 'text',
    hint: 'auto-loops',
    render: () => (
      <span className="font-mono text-3xl tracking-tight md:text-4xl">
        <Typewriter
          phrases={['Built for speed.', 'Every mile counts.', 'Ship in minutes.']}
        />
      </span>
    ),
  },
  {
    slug: 'character-appear',
    name: 'Character Appear',
    category: 'scroll',
    hint: 'scroll into view',
    scroll: true,
    render: () => (
      <CharacterAppear
        text="Every Mile Counts"
        className="font-sans text-4xl font-semibold tracking-tight md:text-6xl"
      />
    ),
  },
  {
    slug: 'text-reveal',
    name: 'Text Reveal',
    category: 'scroll',
    hint: 'scroll into view',
    scroll: true,
    render: () => (
      <TextReveal
        text="Outrun expectations"
        className="font-sans text-4xl font-semibold tracking-tight md:text-6xl"
      />
    ),
  },
  {
    slug: 'dual-scramble',
    name: 'Dual Scramble',
    category: 'text',
    hint: 'hover',
    render: () => (
      <DualScramble
        text="RUNNING"
        trigger="hover"
        className="cursor-pointer font-mono text-4xl uppercase tracking-tight md:text-6xl"
      />
    ),
  },
  {
    slug: 'text-split-zoom',
    name: 'Text Split Zoom',
    category: 'scroll',
    hint: 'scroll the frame',
    scroll: true,
    render: () => (
      <TextSplitZoom
        before="Att"
        after="ack"
        src={ph('ZOOM')}
        maxWidth={160}
        className="font-sans text-5xl font-semibold tracking-tight md:text-7xl"
      />
    ),
  },
  {
    slug: 'velocity-clip',
    name: 'Velocity Clip',
    category: 'scroll',
    hint: 'scroll fast',
    scroll: true,
    render: () => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={ph('CLIP')} alt="" className="h-40 w-64 object-cover" />
    ),
  },
  {
    slug: 'counter',
    name: 'Counter',
    category: 'scroll',
    hint: 'scroll into view',
    scroll: true,
    render: () => (
      <Counter
        value={10482}
        className="font-sans text-6xl font-semibold tracking-tight md:text-8xl"
      />
    ),
  },
  {
    slug: 'parallax',
    name: 'Parallax',
    category: 'scroll',
    hint: 'scroll the frame',
    scroll: true,
    render: () => (
      <Parallax speed={-0.4}>
        <span className="font-sans text-6xl font-semibold tracking-tight">DEPTH</span>
      </Parallax>
    ),
  },
  {
    slug: 'popping-text',
    name: 'Popping Text',
    category: 'scroll',
    hint: 'scroll down',
    scroll: true,
    render: () => (
      <PoppingText
        lines={['BUILT', 'FOR', 'SPEED']}
        className="text-center font-sans text-5xl font-bold tracking-tight md:text-7xl"
      />
    ),
  },
  {
    slug: 'mask-reveal',
    name: 'Mask Reveal',
    category: 'scroll',
    hint: 'scroll into view',
    scroll: true,
    render: () => <MaskReveal src={ph('REVEAL')} trigger="scroll" className="h-48 w-72" />,
  },
  {
    slug: 'folding-text',
    name: 'Folding Text',
    category: 'scroll',
    hint: 'scroll the frame',
    scroll: true,
    render: () => (
      <FoldingText
        text="RUNNING SHOES"
        as="h2"
        className="font-sans text-4xl font-bold tracking-tight md:text-6xl"
      />
    ),
  },
  {
    slug: 'element-reveal',
    name: 'Element Reveal',
    category: 'scroll',
    hint: 'scroll into view',
    scroll: true,
    render: () => (
      <ElementReveal direction="up" distance={50}>
        <span className="font-sans text-4xl font-semibold tracking-tight md:text-6xl">
          REVEAL
        </span>
      </ElementReveal>
    ),
  },
  {
    slug: 'random-rotate',
    name: 'Random Rotate',
    category: 'pointer',
    hint: 'hover the tiles',
    render: () => (
      <RandomRotate min={-10} max={10} className="flex gap-4">
        {['A', 'B', 'C'].map((l) => (
          <span
            key={l}
            className="grid size-20 place-items-center rounded-lg bg-foreground font-sans text-2xl font-semibold text-background"
          >
            {l}
          </span>
        ))}
      </RandomRotate>
    ),
  },
  {
    slug: 'text-shimmer-wave',
    name: 'Text Shimmer Wave',
    category: 'text',
    hint: 'auto-loops',
    render: () => (
      <TextShimmerWave
        text="Every Mile Counts."
        className="font-sans text-3xl font-semibold tracking-tight md:text-5xl"
      />
    ),
  },
  {
    slug: 'text-underline',
    name: 'Text Underline',
    category: 'pointer',
    hint: 'hover the link',
    render: () => (
      <TextUnderline
        trigger="hover"
        className="cursor-pointer font-sans text-3xl font-semibold tracking-tight md:text-4xl"
      >
        Shop the collection
      </TextUnderline>
    ),
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'pointer',
    hint: 'hover the button',
    render: () => (
      <MotionTooltip content="Browse running shoes" side="top">
        <button className="rounded-full border border-foreground/20 px-7 py-3 font-sans text-base font-medium">
          Running
        </button>
      </MotionTooltip>
    ),
  },
  {
    slug: 'morphing-dialog',
    name: 'Morphing Dialog',
    category: 'layout',
    hint: 'click the card',
    render: () => <MorphingDialog />,
  },
  {
    slug: 'card-3d-flip',
    name: '3D Card Flip',
    category: 'pointer',
    hint: 'hover / move cursor',
    render: () => (
      <Card3DFlip
        front={
          <div className="grid size-44 place-items-center rounded-xl bg-foreground font-sans text-base font-semibold text-background">
            TILT ME
          </div>
        }
      />
    ),
  },
  {
    slug: 'rainbow-button',
    name: 'Rainbow Button',
    category: 'button',
    hint: 'auto-loops',
    render: () => <RainbowButton>Get Started</RainbowButton>,
  },
  {
    slug: 'icon-button',
    name: 'Icon Button',
    category: 'button',
    hint: 'hover',
    render: () => <IconButton>Shop Now</IconButton>,
  },
  {
    slug: 'curve-fill-button',
    name: 'Curve Fill Button',
    category: 'button',
    hint: 'hover',
    render: () => <CurveFillButton>Discover</CurveFillButton>,
  },
  {
    slug: 'circle-fill-button',
    name: 'Circle Fill Button',
    category: 'button',
    hint: 'hover',
    render: () => <CircleFillButton>Explore</CircleFillButton>,
  },
  {
    slug: 'background-fill-button',
    name: 'Background Fill Button',
    category: 'button',
    hint: 'hover',
    render: () => <BackgroundFillButton>Contact Us</BackgroundFillButton>,
  },
  {
    slug: 'gooey-menu',
    name: 'Gooey Menu',
    category: 'menu',
    hint: 'click the +',
    render: () => <GooeyMenu />,
  },
  {
    slug: 'text-morph',
    name: 'Text Morph',
    category: 'text',
    hint: 'auto-cycles',
    render: () => (
      <TextMorph
        prefix="Search for "
        phrases={['Running Shoes', 'Trail Boots', 'Tennis Rackets', 'Yoga Mats']}
        className="font-sans text-2xl font-semibold tracking-tight md:text-4xl"
      />
    ),
  },
  {
    slug: 'gooey-hover-reveal',
    name: 'Gooey Hover Reveal',
    category: 'pointer',
    hint: 'draw across it',
    render: () => <GooeyHoverReveal src={ph('GOOEY')} className="h-48 w-72" />,
  },
  {
    slug: 'multi-level-drawer-menu',
    name: 'Drawer Menu',
    category: 'menu',
    hint: 'click Menu',
    render: () => <MultiLevelDrawerMenu />,
  },
  {
    slug: 'fullscreen-slide-menu',
    name: 'Fullscreen Menu',
    category: 'menu',
    hint: 'click Menu',
    render: () => <FullscreenSlideMenu />,
  },

  // ── Page-chrome components ────────────────────────────────────────────────
  {
    slug: 'hide-header',
    name: 'Hide Header',
    category: 'page-chrome',
    hint: 'scroll down hides · up shows',
    full: true,
    render: () => (
      <>
        <HideHeader className="border-b border-foreground/10 bg-background/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em]">HIDE-HEADER</span>
            <span className="font-mono text-[10px] uppercase tracking-tight text-muted-foreground">
              scroll down hides · up shows
            </span>
          </nav>
        </HideHeader>
        <div className="mx-auto max-w-3xl space-y-6 px-6 pb-24 pt-32 text-muted-foreground md:px-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <p key={i} className="text-lg leading-relaxed">
              Scroll this frame down and the bar tucks away; scroll up and it returns. The
              header reacts only to scroll direction, never to position — a classic premium
              navbar behavior. Keep scrolling to feel the threshold.
            </p>
          ))}
        </div>
      </>
    ),
  },
  {
    slug: 'scroll-progress',
    name: 'Scroll Progress',
    category: 'page-chrome',
    hint: 'scroll the frame',
    scroll: true,
    render: () => (
      <>
        <ScrollProgress className="fixed bottom-6 right-6 z-50 size-16" />
        <span className="font-sans text-3xl font-semibold tracking-tight">
          Scroll — watch the ring fill ↘
        </span>
      </>
    ),
  },

  // ── Full-bleed feature components ─────────────────────────────────────────
  {
    slug: 'marquee',
    name: 'Marquee',
    category: 'scroll',
    hint: 'infinite ticker · hover to pause',
    full: true,
    render: () => (
      <div className="w-full overflow-hidden py-10">
        <Marquee speed={3} pauseOnHover>
          {['EYEWEAR', 'APPAREL', 'RUNNING', 'SHOES', 'CYCLING'].map((w) => (
            <span key={w} className="mx-6 font-sans text-3xl font-semibold tracking-tight">
              {w} <span className="text-muted-foreground">·</span>
            </span>
          ))}
        </Marquee>
      </div>
    ),
  },
  {
    slug: 'rectangle-text-reveal',
    name: 'Rectangle Text Reveal',
    category: 'scroll',
    hint: 'scroll into view',
    full: true,
    scroll: true,
    render: () => (
      <div className="mx-auto max-w-4xl p-8 md:p-16">
        <RectangleTextReveal
          text={
            'Every rep pushes you closer to your limit.\nEvery limit broken becomes your new baseline.\nThis is where champions are made.'
          }
          className="font-sans text-3xl font-semibold tracking-tight md:text-5xl"
        />
      </div>
    ),
  },
  {
    slug: 'cinematic-text',
    name: 'Cinematic Text',
    category: 'scroll',
    hint: 'scroll-scrub',
    full: true,
    scroll: true,
    render: () => (
      <div className="mx-auto max-w-5xl p-8 md:p-16">
        <CinematicText
          lines={['Every', 'Single', 'Mile', 'Counts.']}
          as="h2"
          className="font-sans text-6xl font-semibold tracking-tight md:text-8xl"
        />
      </div>
    ),
  },
  {
    slug: 'animated-grid',
    name: 'Animated Grid',
    category: 'scroll',
    hint: 'scroll into view · diagonal stagger',
    full: true,
    scroll: true,
    render: () => (
      <div className="p-8 md:p-16">
        <AnimatedGrid cols={4} rows={3} />
      </div>
    ),
  },
  {
    slug: 'multi-flip',
    name: 'Multi Flip',
    category: 'scroll',
    hint: 'pinned · scroll to scatter',
    full: true,
    render: () => <MultiFlip />,
  },
  {
    slug: 'flip-zone',
    name: 'Flip Zone',
    category: 'scroll',
    hint: 'pinned · scroll to morph',
    full: true,
    render: () => (
      <FlipZone firstLabel="Every mile counts." secondLabel="Built for speed." />
    ),
  },
  {
    slug: 'infinite-parallax-slider',
    name: 'Infinite Parallax Slider',
    category: 'interactive',
    hint: 'prev / next · inner-image parallax',
    full: true,
    render: () => (
      <InfiniteParallaxSlider
        slides={['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'].map((l) => ({
          src: ph(l),
          alt: l,
        }))}
      />
    ),
  },
  {
    slug: 'image-trail',
    name: 'Image Trail',
    category: 'pointer',
    hint: 'move the cursor across the area',
    full: true,
    render: () => (
      <ImageTrail
        images={['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'].map((l) => ph(l))}
        className="grid min-h-screen w-full place-items-center"
      >
        <p className="pointer-events-none font-sans text-5xl font-bold tracking-tight">
          Move fast. Leave a mark.
        </p>
      </ImageTrail>
    ),
  },
  {
    slug: 'circular-slider',
    name: 'Circular Slider',
    category: 'interactive',
    hint: 'prev / next rotates the wheel',
    full: true,
    render: () => (
      <div className="relative h-screen overflow-hidden">
        <CircularSlider
          items={['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'].map((l) => ({
            src: ph(l),
            label: l,
          }))}
        />
      </div>
    ),
  },
  {
    slug: 'background-color',
    name: 'Background Color',
    category: 'scroll',
    hint: 'scroll · per-zone crossfade',
    full: true,
    render: () => (
      <BackgroundColor stops={['#0a0a0a', '#fafafa']}>
        <div className="grid min-h-screen place-items-center text-3xl font-semibold text-white">
          Shop by Sport
        </div>
        <div className="grid min-h-screen place-items-center text-3xl font-semibold text-black">
          Shop by Product
        </div>
      </BackgroundColor>
    ),
  },
  {
    slug: 'motion-accordion',
    name: 'Motion Accordion',
    category: 'layout',
    hint: 'click the headers',
    full: true,
    render: () => (
      <div className="mx-auto max-w-3xl p-8 md:p-16">
        <MotionAccordion
          items={[
            {
              title: 'What makes the gear different?',
              content:
                'Engineered for performance — every material is chosen for speed, breathability, and durability.',
            },
            {
              title: 'How do I find my size?',
              content:
                'Use the size guide on each product page, or measure against our printable chart.',
            },
            {
              title: 'What is the return policy?',
              content:
                'Unworn items can be returned within 30 days for a full refund, no questions asked.',
            },
          ]}
        />
      </div>
    ),
  },
  {
    slug: 'hoverable-list',
    name: 'Hoverable List',
    category: 'pointer',
    hint: 'hover the rows',
    full: true,
    render: () => (
      <div className="mx-auto max-w-3xl p-8 md:p-16">
        <HoverableList
          items={[
            { label: 'Running Collection' },
            { label: 'Cycling Gear' },
            { label: 'Performance Apparel' },
            { label: 'Eyewear' },
          ]}
        />
      </div>
    ),
  },
  {
    slug: 'custom-cursor',
    name: 'Custom Cursor',
    category: 'pointer',
    hint: 'move the cursor inside the area',
    full: true,
    render: () => (
      <CustomCursor className="grid min-h-screen w-full place-items-center">
        <button
          data-cursor-hover
          data-cursor-text="View"
          className="rounded-full bg-foreground px-10 py-5 font-sans text-xl font-semibold text-background"
        >
          Hover me
        </button>
      </CustomCursor>
    ),
  },
  {
    slug: 'infinite-draggable-grid',
    name: 'Infinite Draggable Grid',
    category: 'pointer',
    hint: 'drag to pan · wraps infinitely',
    full: true,
    render: () => (
      <InfiniteDraggableGrid
        images={['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'].map(
          (l) => ph(l),
        )}
      />
    ),
  },
  {
    slug: 'mega-menu',
    name: 'Mega Menu',
    category: 'menu',
    hint: 'hover the nav items',
    full: true,
    render: () => (
      <div className="min-h-screen">
        <MegaMenu />
      </div>
    ),
  },
  {
    slug: 'mesh-gradient',
    name: 'Mesh Gradient',
    category: 'background',
    hint: 'auto-animates',
    full: true,
    render: () => (
      <MeshGradient className="min-h-screen">
        <div className="grid min-h-screen place-items-center">
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-tight text-white/70">
              Mesh Gradient · auto-animates
            </p>
            <p className="mt-2 font-sans text-5xl font-semibold tracking-tight text-white">
              Every Mile Counts
            </p>
          </div>
        </div>
      </MeshGradient>
    ),
  },
  {
    slug: 'image-dissolve-scroll',
    name: 'Image Dissolve Scroll',
    category: 'scroll',
    hint: 'scroll to disintegrate (DOM approximation of a WebGL shader)',
    full: true,
    render: () => <ImageDissolveScroll src={ph('DISSOLVE')} />,
  },
  {
    slug: 'image-follow-list',
    name: 'Image Follow List',
    category: 'pointer',
    hint: 'hover the rows',
    full: true,
    render: () => (
      <div className="mx-auto max-w-4xl p-8 md:p-16">
        <ImageFollowList items={followItems} />
      </div>
    ),
  },
]

const bySlug = new Map(entries.map((e) => [e.slug, e]))

export function getEntry(slug: string): LabEntry | undefined {
  return bySlug.get(slug)
}

export const entrySlugs = entries.map((e) => e.slug)
