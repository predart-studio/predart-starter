'use strict';

const KEYWORD_MAP = {
  'real estate':    'Real Estate',
  'property':       'Real Estate',
  'realtor':        'Real Estate',
  'housing':        'Real Estate',
  'architecture':   'Architecture / Construction',
  'construction':   'Architecture / Construction',
  'building':       'Architecture / Construction',
  'contractor':     'Architecture / Construction',
  'auto':           'Auto Dealership',
  'dealership':     'Auto Dealership',
  'car':            'Auto Dealership',
  'vehicle':        'Auto Dealership',
  'automotive':     'Auto Dealership',
  'production':     'Production / Creative',
  'creative':       'Production / Creative',
  'agency':         'Production / Creative',
  'studio':         'Production / Creative',
  'film':           'Production / Creative',
  'photography':    'Production / Creative',
  'saas':           'SaaS / Tech',
  'tech':           'SaaS / Tech',
  'software':       'SaaS / Tech',
  'startup':        'SaaS / Tech',
  'app':            'SaaS / Tech',
};

// Playbook stacks -- sourced from docs/component-libraries.md Section 5
const PLAYBOOKS = {
  'Real Estate': {
    stack: ['Embla', 'yet-another-react-lightbox', 'React Leaflet', 'Magic UI', 'Motion Primitives'],
    reasoning: 'Property galleries (lightbox), location maps, property counters (stats), subtle animations, carousel for property details',
    install_commands: [
      'pnpm add yet-another-react-lightbox',
      'pnpm add react-leaflet leaflet',
      'npx motion-primitives@latest add [name]',
    ],
  },
  'Architecture / Construction': {
    stack: ['Embla', 'yet-another-react-lightbox', 'react-photo-album', 'Smooth UI'],
    reasoning: 'Scroll-pinned project showcases, image galleries, portfolio timelines, subtle polish on hover',
    install_commands: [
      'pnpm add yet-another-react-lightbox',
      'pnpm add react-photo-album',
      'pnpm dlx shadcn@latest add @smoothui/[name]',
    ],
  },
  'Auto Dealership': {
    stack: ['Swiper', 'yet-another-react-lightbox', 'React Leaflet', 'Magic UI'],
    reasoning: '3D car carousels (Swiper), dealer location maps, inventory galleries, background animations for promo sections',
    install_commands: [
      'pnpm add swiper',
      'pnpm add yet-another-react-lightbox',
      'pnpm add react-leaflet leaflet',
    ],
  },
  'Production / Creative': {
    stack: ['Aceternity UI', 'react-photo-album', 'React Player', 'Motion Primitives'],
    reasoning: 'Dramatic hero, showreel/case study videos, portfolio photo grids with scroll choreography, animated text reveals',
    install_commands: [
      'pnpm add react-photo-album',
      'pnpm add react-player',
      'npx motion-primitives@latest add [name]',
    ],
  },
  'SaaS / Tech': {
    stack: ['Aceternity UI', 'Magic UI', 'Motion Primitives', 'Animate UI', 'Smooth UI'],
    reasoning: 'Spotlight heroes, stat counters, animated feature lists, micro-interactions on dashboard preview, fluent transitions',
    install_commands: [
      'npx motion-primitives@latest add [name]',
      'pnpm dlx shadcn@latest add @animate-ui/[name]',
      'pnpm dlx shadcn@latest add @smoothui/[name]',
    ],
  },
};

// Component -> Library quick reference (fallback for unmatched types)
const COMPONENT_REFERENCE = {
  'Hero (dramatic)': 'Aceternity UI',
  'Hero (corporate)': 'Tailwind + Framer Motion',
  'Backgrounds (animated)': 'Magic UI',
  'Text reveal': 'Motion Primitives',
  'Counters/stats': 'Magic UI',
  'Scroll animations': 'GSAP + ScrollTrigger',
  'Micro-interactions': 'Animate UI or Framer Motion',
  'Card hover (dramatic)': 'Aceternity UI',
  'Carousels': 'Embla (via shadcn)',
  'Touch carousels': 'Swiper',
  'Galleries': 'yet-another-react-lightbox',
  'Photo grids': 'react-photo-album',
  'Maps': 'React Leaflet or react-map-gl',
  'Forms': 'shadcn + React Hook Form + Zod',
  'Video': 'React Player or Mux Player',
};

function matchPlaybook(input) {
  const normalized = input.toLowerCase().trim();
  const matched = KEYWORD_MAP[normalized] || null;

  if (matched && PLAYBOOKS[matched]) {
    return {
      matched_playbook: matched,
      confidence: 'exact',
      ...PLAYBOOKS[matched],
    };
  }

  return {
    matched_playbook: null,
    confidence: 'none',
    stack: [],
    reasoning: 'No matching playbook found. Use the component reference to pick libraries manually.',
    install_commands: [],
    component_reference: COMPONENT_REFERENCE,
  };
}

// CLI mode
if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node match-playbook.js "<business type>"');
    process.exit(1);
  }
  console.log(JSON.stringify(matchPlaybook(input), null, 2));
}

module.exports = { matchPlaybook, KEYWORD_MAP, PLAYBOOKS, COMPONENT_REFERENCE };
