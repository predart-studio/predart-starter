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
 * /lab — live catalog of the in-house GSAP motion kit.
 *
 * Every project cloned from predart-starter ships with this gallery: run
 * `pnpm dev` and open /lab to see each motion component running and decide
 * which to use. Remove this route (`rm -rf app/lab`) before launching a
 * client site if you don't want it publicly reachable.
 */

// Monochrome SVG data-URI placeholder (no network dependency, on-brand).
function ph(label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#141414'/><text x='50%' y='50%' fill='#eeeeee' font-family='monospace' font-size='30' letter-spacing='2' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function Card({
  name,
  category,
  hint,
  children,
}: {
  name: string
  category: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30 p-6">
      <div className="flex w-full items-center justify-center">{children}</div>
      {hint ? (
        <span className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-tight text-muted-foreground/60">
          {hint}
        </span>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-foreground/10 bg-background/70 px-4 py-3 font-mono text-[11px] uppercase tracking-tight text-muted-foreground backdrop-blur">
        <span className="text-foreground">{name}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-foreground/60" aria-hidden />
          {category}
        </span>
      </div>
    </div>
  )
}

const followItems = [
  { label: 'Project One', image: ph('ONE') },
  { label: 'Project Two', image: ph('TWO') },
  { label: 'Project Three', image: ph('THREE') },
  { label: 'Project Four', image: ph('FOUR') },
]

export default function MotionLab() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-24 md:px-10">
      {/* Page-chrome demos: a direction-aware header and a scroll progress ring. */}
      <HideHeader className="border-b border-foreground/10 bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em]">
            HIDE-HEADER
          </span>
          <span className="font-mono text-[10px] uppercase tracking-tight text-muted-foreground">
            scroll down hides · up shows
          </span>
        </nav>
      </HideHeader>
      <ScrollProgress className="fixed bottom-6 right-6 z-50 size-14" />

      <header className="mb-16 flex flex-col gap-4">
        <TextScramble
          as="p"
          text="MOTION LIBRARY"
          trigger="load"
          className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
        />
        <h1 className="font-sans text-5xl font-semibold tracking-tight md:text-6xl">
          In-house GSAP kit
        </h1>
        <p className="max-w-prose text-muted-foreground">
          The motion components every project inherits. Hover, scroll, and
          refresh to feel each one. All are prefers-reduced-motion safe.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card name="Text Scramble" category="text" hint="hover">
          <TextScramble
            text="SCRAMBLE"
            trigger="hover"
            className="cursor-pointer font-mono text-3xl uppercase tracking-tight"
          />
        </Card>

        <Card name="Magnetic" category="pointer" hint="move cursor">
          <Magnetic strength={40}>
            <button className="rounded-full bg-foreground px-7 py-3 font-sans text-sm font-medium text-background">
              Hire me
            </button>
          </Magnetic>
        </Card>

        <Card name="SVG Draw Path" category="svg" hint="refresh">
          <DrawPath trigger="load" className="text-foreground">
            <svg
              width="180"
              height="80"
              viewBox="0 0 180 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M8 56 C 40 8, 70 8, 90 40 S 140 72, 172 24" />
            </svg>
          </DrawPath>
        </Card>

        <Card name="Velocity Skew" category="scroll" hint="scroll page">
          <VelocitySkew>
            <span className="font-sans text-4xl font-semibold tracking-tight">
              SKEW
            </span>
          </VelocitySkew>
        </Card>

        <Card name="Typewriter" category="text" hint="auto-loops">
          <span className="font-mono text-2xl tracking-tight">
            <Typewriter
              phrases={['Built for speed.', 'Every mile counts.', 'Ship in minutes.']}
            />
          </span>
        </Card>

        <Card name="Character Appear" category="scroll" hint="scroll into view">
          <CharacterAppear
            text="Every Mile Counts"
            className="font-sans text-3xl font-semibold tracking-tight"
          />
        </Card>

        <Card name="Text Reveal" category="scroll" hint="scroll into view">
          <TextReveal
            text="Outrun expectations"
            className="font-sans text-3xl font-semibold tracking-tight"
          />
        </Card>

        <Card name="Dual Scramble" category="text" hint="hover">
          <DualScramble
            text="RUNNING"
            trigger="hover"
            className="cursor-pointer font-mono text-3xl uppercase tracking-tight"
          />
        </Card>

        <Card name="Text Split Zoom" category="scroll" hint="scroll page">
          <TextSplitZoom
            before="Att"
            after="ack"
            src={ph('ZOOM')}
            maxWidth={120}
            className="font-sans text-3xl font-semibold tracking-tight"
          />
        </Card>

        <Card name="Velocity Clip" category="scroll" hint="scroll fast">
          <VelocityClip>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ph('CLIP')} alt="" className="h-28 w-44 object-cover" />
          </VelocityClip>
        </Card>

        <Card name="Counter" category="scroll" hint="scroll into view">
          <Counter
            value={10482}
            className="font-sans text-5xl font-semibold tracking-tight"
          />
        </Card>

        <Card name="Parallax" category="scroll" hint="scroll page">
          <Parallax speed={-0.4}>
            <span className="font-sans text-4xl font-semibold tracking-tight">
              DEPTH
            </span>
          </Parallax>
        </Card>

        <Card name="Popping Text" category="scroll" hint="scroll down">
          <PoppingText
            lines={['BUILT', 'FOR', 'SPEED']}
            className="text-center font-sans text-4xl font-bold tracking-tight"
          />
        </Card>

        <Card name="Mask Reveal" category="scroll" hint="scroll into view">
          <MaskReveal
            src={ph('REVEAL')}
            trigger="scroll"
            className="h-32 w-44"
          />
        </Card>

        <Card name="Folding Text" category="scroll" hint="scroll page">
          <FoldingText
            text="RUNNING SHOES"
            as="h2"
            className="font-sans text-3xl font-bold tracking-tight"
          />
        </Card>

        <Card name="Element Reveal" category="scroll" hint="scroll into view">
          <ElementReveal direction="up" distance={50}>
            <span className="font-sans text-3xl font-semibold tracking-tight">
              REVEAL
            </span>
          </ElementReveal>
        </Card>

        <Card name="Random Rotate" category="pointer" hint="hover the tiles">
          <RandomRotate min={-10} max={10} className="flex gap-3">
            {['A', 'B', 'C'].map((l) => (
              <span
                key={l}
                className="grid size-14 place-items-center rounded-lg bg-foreground font-sans text-xl font-semibold text-background"
              >
                {l}
              </span>
            ))}
          </RandomRotate>
        </Card>

        <Card name="Text Shimmer Wave" category="text" hint="auto-loops">
          <TextShimmerWave
            text="Every Mile Counts."
            className="font-sans text-2xl font-semibold tracking-tight"
          />
        </Card>

        <Card name="Text Underline" category="pointer" hint="hover the link">
          <TextUnderline
            trigger="hover"
            className="cursor-pointer font-sans text-2xl font-semibold tracking-tight"
          >
            Shop the collection
          </TextUnderline>
        </Card>

        <Card name="Tooltip" category="pointer" hint="hover the button">
          <MotionTooltip content="Browse running shoes" side="top">
            <button className="rounded-full border border-foreground/20 px-6 py-2.5 font-sans text-sm font-medium">
              Running
            </button>
          </MotionTooltip>
        </Card>

        <Card name="Morphing Dialog" category="layout" hint="click the card">
          <MorphingDialog />
        </Card>

        <Card name="3D Card Flip" category="pointer" hint="hover / move cursor">
          <Card3DFlip
            front={
              <div className="grid size-32 place-items-center rounded-xl bg-foreground font-sans text-sm font-semibold text-background">
                TILT ME
              </div>
            }
          />
        </Card>

        <Card name="Rainbow Button" category="button" hint="auto-loops">
          <RainbowButton>Get Started</RainbowButton>
        </Card>

        <Card name="Icon Button" category="button" hint="hover">
          <IconButton>Shop Now</IconButton>
        </Card>

        <Card name="Curve Fill Button" category="button" hint="hover">
          <CurveFillButton>Discover</CurveFillButton>
        </Card>

        <Card name="Circle Fill Button" category="button" hint="hover">
          <CircleFillButton>Explore</CircleFillButton>
        </Card>

        <Card name="Background Fill Button" category="button" hint="hover">
          <BackgroundFillButton>Contact Us</BackgroundFillButton>
        </Card>

        <Card name="Gooey Menu" category="menu" hint="click the +">
          <GooeyMenu />
        </Card>

        <Card name="Text Morph" category="text" hint="auto-cycles">
          <TextMorph
            prefix="Search for "
            phrases={['Running Shoes', 'Trail Boots', 'Tennis Rackets', 'Yoga Mats']}
            className="font-sans text-xl font-semibold tracking-tight"
          />
        </Card>

        <Card name="Gooey Hover Reveal" category="pointer" hint="draw across it">
          <GooeyHoverReveal src={ph('GOOEY')} className="h-32 w-44" />
        </Card>

        <Card name="Drawer Menu" category="menu" hint="click Menu">
          <MultiLevelDrawerMenu />
        </Card>

        <Card name="Fullscreen Menu" category="menu" hint="click Menu">
          <FullscreenSlideMenu />
        </Card>
      </section>

      {/* Full-width feature: Marquee */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30 py-6">
        <div className="mb-4 px-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Marquee</span> · infinite ticker
        </div>
        <Marquee speed={3} pauseOnHover>
          {['EYEWEAR', 'APPAREL', 'RUNNING', 'SHOES', 'CYCLING'].map((w) => (
            <span
              key={w}
              className="mx-6 font-sans text-2xl font-semibold tracking-tight"
            >
              {w} <span className="text-muted-foreground">·</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* Full-width feature: Rectangle Text Reveal (multi-line headline) */}
      <section className="mt-5 rounded-xl border border-foreground/10 bg-secondary/30 p-8 md:p-12">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Rectangle Text Reveal</span> · scroll
          into view
        </div>
        <RectangleTextReveal
          text={'Every rep pushes you closer to your limit.\nEvery limit broken becomes your new baseline.\nThis is where champions are made.'}
          className="font-sans text-2xl font-semibold tracking-tight md:text-3xl"
        />
      </section>

      {/* Full-width feature: Cinematic Text (per-line scrub reveal) */}
      <section className="mt-5 rounded-xl border border-foreground/10 bg-secondary/30 p-8 md:p-12">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Cinematic Text</span> · scroll-scrub
        </div>
        <CinematicText
          lines={['Every', 'Single', 'Mile', 'Counts.']}
          as="h2"
          className="font-sans text-5xl font-semibold tracking-tight md:text-7xl"
        />
      </section>

      {/* Full-width feature: Animated Grid (grid-aware staggered entrance) */}
      <section className="mt-5 rounded-xl border border-foreground/10 bg-secondary/30 p-8 md:p-12">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Animated Grid</span> · scroll into
          view · diagonal stagger
        </div>
        <AnimatedGrid cols={4} rows={3} />
      </section>

      {/* Full-width feature: Multi Flip (pinned, scrubbed card scatter) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30">
        <div className="px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Multi Flip</span> · pinned · scroll to
          scatter
        </div>
        <MultiFlip />
      </section>

      {/* Full-width feature: Flip Zone (shared-element Flip between two zones) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30">
        <div className="px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Flip Zone</span> · pinned · scroll to
          morph
        </div>
        <FlipZone firstLabel="Every mile counts." secondLabel="Built for speed." />
      </section>

      {/* Full-width feature: Infinite Parallax Slider (buttons advance) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30">
        <div className="px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Infinite Parallax Slider</span> ·
          prev/next · inner-image parallax
        </div>
        <InfiniteParallaxSlider
          slides={['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'].map((l) => ({
            src: ph(l),
            alt: l,
          }))}
        />
      </section>

      {/* Full-width feature: Image Trail (move cursor over the area) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30">
        <div className="px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Image Trail</span> · move the cursor
          across the area
        </div>
        <ImageTrail
          images={['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'].map((l) => ph(l))}
          className="grid min-h-[50vh] w-full place-items-center"
        >
          <p className="pointer-events-none font-sans text-4xl font-bold tracking-tight">
            Move fast. Leave a mark.
          </p>
        </ImageTrail>
      </section>

      {/* Full-width feature: Circular Slider (buttons rotate the wheel) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30">
        <div className="px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Circular Slider</span> · prev/next
          rotates the wheel
        </div>
        <div className="relative h-[60vh] overflow-hidden">
          <CircularSlider
            items={['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'].map(
              (l) => ({ src: ph(l), label: l }),
            )}
          />
        </div>
      </section>

      {/* Full-width feature: Background Color (scroll-scrub bg crossfade) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10">
        <div className="absolute z-10 px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span>Background Color</span> · scroll · per-zone crossfade
        </div>
        <BackgroundColor stops={['#0a0a0a', '#fafafa']}>
          <div className="grid min-h-[70vh] place-items-center text-2xl font-semibold text-white">
            Shop by Sport
          </div>
          <div className="grid min-h-[70vh] place-items-center text-2xl font-semibold text-black">
            Shop by Product
          </div>
        </BackgroundColor>
      </section>

      {/* Feature: Motion Accordion (click headers, single-open height morph) */}
      <section className="mt-5 rounded-xl border border-foreground/10 bg-secondary/30 p-8 md:p-12">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Motion Accordion</span> · click the
          headers
        </div>
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
      </section>

      {/* Full-width feature: Hoverable List (per-row liquid fill on hover) */}
      <section className="mt-5 rounded-xl border border-foreground/10 bg-secondary/30 p-8 md:p-12">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Hoverable List</span> · hover the rows
        </div>
        <HoverableList
          items={[
            { label: 'Running Collection' },
            { label: 'Cycling Gear' },
            { label: 'Performance Apparel' },
            { label: 'Eyewear' },
          ]}
        />
      </section>

      {/* Full-width feature: Custom Cursor (scoped to this area only) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30">
        <div className="px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Custom Cursor</span> · move the cursor
          inside this area
        </div>
        <CustomCursor className="grid min-h-[40vh] w-full place-items-center">
          <button
            data-cursor-hover
            data-cursor-text="View"
            className="rounded-full bg-foreground px-8 py-4 font-sans text-lg font-semibold text-background"
          >
            Hover me
          </button>
        </CustomCursor>
      </section>

      {/* Full-width feature: Infinite Draggable Grid (drag in any direction) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30">
        <div className="px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Infinite Draggable Grid</span> · drag
          to pan · wraps infinitely
        </div>
        <InfiniteDraggableGrid
          images={['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'].map(
            (l) => ph(l),
          )}
        />
      </section>

      {/* Full-width feature: Mega Menu (hover nav opens morphing panel) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30">
        <div className="px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Mega Menu</span> · hover the nav items
        </div>
        <div className="min-h-[50vh]">
          <MegaMenu />
        </div>
      </section>

      {/* Full-width feature: Mesh Gradient (auto-animating background) */}
      <section className="relative mt-5 h-[50vh] overflow-hidden rounded-xl border border-foreground/10">
        <MeshGradient className="absolute inset-0">
          <div className="relative z-10 grid h-full place-items-center">
            <div className="text-center">
              <p className="font-mono text-[11px] uppercase tracking-tight text-white/70">
                Mesh Gradient · auto-animates
              </p>
              <p className="mt-2 font-sans text-4xl font-semibold tracking-tight text-white">
                Every Mile Counts
              </p>
            </div>
          </div>
        </MeshGradient>
      </section>

      {/* Full-width feature: Image Dissolve Scroll (scroll-scrubbed dissolve) */}
      <section className="mt-5 overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30">
        <div className="px-8 pt-8 font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Image Dissolve Scroll</span> · scroll
          to disintegrate (DOM approximation of a WebGL shader)
        </div>
        <ImageDissolveScroll src={ph('DISSOLVE')} />
      </section>

      {/* Full-width feature: Image Follow List (needs room + cursor space) */}
      <section className="mt-5 rounded-xl border border-foreground/10 bg-secondary/30 p-8 md:p-12">
        <div className="mb-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Image Follow List</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-foreground/60" aria-hidden />
            list · hover the rows
          </span>
        </div>
        <ImageFollowList items={followItems} />
      </section>

      <p className="mt-16 border-t border-foreground/10 pt-8 text-sm text-muted-foreground">
        Tip: toggle your OS &quot;Reduce Motion&quot; setting and refresh — every
        component should render its final, static state with no animation.
      </p>
    </main>
  )
}
