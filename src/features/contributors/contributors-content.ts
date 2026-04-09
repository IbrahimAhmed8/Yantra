export type ContributorProfile = {
  name: string;
  handle: string;
  role: string;
  commits: number;
  footprint: string;
  summary: string;
  contributions: string[];
  lanes: string[];
  signal: string;
  cardClassName: string;
  glowPosition: string;
};

export type ContributorWorkstream = {
  title: string;
  owners: string;
  detail: string;
  output: string;
};

export const contributors: ContributorProfile[] = [
  {
    name: 'Krish',
    handle: 'KR',
    role: 'Product Architecture / Core Experience',
    commits: 46,
    footprint: 'src/features / docs / app/api',
    summary: 'Largest repo footprint across product systems, route logic, and engineering documentation.',
    contributions: [
      'Pushes the main product shape across dashboard systems, shared flows, and launch-facing surfaces.',
      'Carries the heaviest footprint through feature code, docs, and API-adjacent implementation.',
      'Keeps Yantra feeling like one system instead of a stack of disconnected pages.',
    ],
    lanes: ['Architecture', 'Dashboard', 'Docs'],
    signal: 'Core Direction',
    cardClassName: 'xl:col-span-8 xl:min-h-[34rem]',
    glowPosition: '84% 18%',
  },
  {
    name: 'Rishi',
    handle: 'RS',
    role: 'Frontend Surfaces / Responsive Quality',
    commits: 17,
    footprint: 'team brief owner for UI, Lighthouse, certificate, portfolio',
    summary: 'Frontend lane owner for responsive cleanup, public-facing surfaces, and higher-fidelity interaction quality.',
    contributions: [
      'Takes point on mobile fit, screen-size stability, and Lighthouse-minded frontend polish.',
      'Assigned to the public certificate, portfolio, and Algorithm Void experience lane.',
      'Keeps new surfaces aligned with the current Yantra visual language instead of inventing a second system.',
    ],
    lanes: ['Responsive', 'UI Quality', 'Public Pages'],
    signal: 'Surface Control',
    cardClassName: 'xl:col-span-8 xl:min-h-[32rem]',
    glowPosition: '12% 22%',
  },
  {
    name: 'Tobe Chukwu',
    handle: 'TB',
    role: 'Backend / API Infrastructure',
    commits: 26,
    footprint: 'backend/src / app/api / supabase',
    summary: 'Backend-heavy footprint centered on services, routes, and data-connected system support.',
    contributions: [
      'Moves the server-side layer forward through backend services and route work.',
      'Owns the strongest backend footprint in the current repo history.',
      'Supports the data and API contracts that public and protected surfaces depend on.',
    ],
    lanes: ['Backend', 'APIs', 'Data'],
    signal: 'Service Layer',
    cardClassName: 'xl:col-span-4 xl:min-h-[26rem]',
    glowPosition: '82% 86%',
  },
  {
    name: 'Pavan Gopala',
    handle: 'PG',
    role: 'Setup / Classroom Scaffolding',
    commits: 9,
    footprint: 'app/classroom / docs/engineering / layout support',
    summary: 'Infrastructure and support footprint across classroom scaffolding, layout touches, and engineering docs.',
    contributions: [
      'Owns the setup-and-support lane that makes later feature work easier to ship.',
      'Pushes classroom placeholder structure, environment setup, and deployment-facing docs.',
      'Helps keep the shell around Yantra coherent while deeper systems are still landing.',
    ],
    lanes: ['Scaffolding', 'Setup', 'Classroom'],
    signal: 'Support Rail',
    cardClassName: 'xl:col-span-4 xl:min-h-[25rem]',
    glowPosition: '84% 20%',
  },
  {
    name: 'Swayam',
    handle: 'SW',
    role: 'Frontend Support / Style Passes',
    commits: 5,
    footprint: 'src/features / src/components / src/styles',
    summary: 'Frontend support footprint across shared features, components, and the style layer.',
    contributions: [
      'Supports the UI lane with feature updates and shared component iteration.',
      'Touches both styling and component structure to tighten the feel of the build.',
      'Adds useful momentum in the layers users actually see first.',
    ],
    lanes: ['Components', 'Styles', 'Support'],
    signal: 'UI Support',
    cardClassName: 'xl:col-span-4 xl:min-h-[25rem]',
    glowPosition: '50% 10%',
  },
  {
    name: 'Ibrahim',
    handle: 'IB',
    role: 'Feature Support / Shared Layout',
    commits: 3,
    footprint: 'src/features / app/layout.tsx',
    summary: 'Early supporting footprint across shared feature work and top-level app structure.',
    contributions: [
      'Contributes to shared frontend surfaces and layout-level support where needed.',
      'Helps steady the base application shell as new public and protected routes expand.',
      'Acts as a support lane across the product instead of a single isolated feature.',
    ],
    lanes: ['Layout', 'Support', 'Frontend'],
    signal: 'Shared Shell',
    cardClassName: 'xl:col-span-4 xl:min-h-[25rem]',
    glowPosition: '18% 18%',
  },
];

export const contributorWorkstreams: ContributorWorkstream[] = [
  {
    title: 'Core Experience',
    owners: 'Krish, Swayam',
    detail:
      'Landing atmosphere, dashboard feel, shared interaction language, and the visual discipline that keeps Yantra coherent.',
    output: 'Public shell, motion, dashboard flow',
  },
  {
    title: 'Backend Systems',
    owners: 'Tobe Chukwu, Krish',
    detail:
      'API routes, service foundations, data contracts, and the server-side work that keeps the product from collapsing behind the UI.',
    output: 'Services, routes, data plumbing',
  },
  {
    title: 'Responsive Surfaces',
    owners: 'Rishi, Ibrahim',
    detail:
      'Mobile fit, screen-size integrity, and the public-facing pages that need to feel sharp instead of patched together.',
    output: 'Responsive quality, certificate, portfolio',
  },
  {
    title: 'Launch Support',
    owners: 'Pavan Gopala',
    detail:
      'Scaffolding, classroom shells, environment support, and the docs that make the whole build operable for the team.',
    output: 'Setup, classroom, launch readiness',
  },
];

export const contributorTicker = [
  '106 TRACKED COMMITS',
  '6 ACTIVE BUILDERS',
  'CORE EXPERIENCE',
  'BACKEND SYSTEMS',
  'RESPONSIVE SURFACES',
  'CLASSROOM SCAFFOLDING',
  'LAUNCH DOCS',
  'YANTRA BUILD COLLECTIVE',
] as const;
