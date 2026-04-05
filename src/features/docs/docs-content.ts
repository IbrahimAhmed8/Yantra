export type DocsGroupId = 'getting-started' | 'product' | 'account-access' | 'support';

export type DocsBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'steps'; items: Array<{ title: string; body: string }> }
  | { type: 'cards'; items: Array<{ title: string; body: string }> }
  | {
      type: 'callout';
      tone: 'note' | 'tip' | 'warning';
      label: string;
      title: string;
      body: string;
    }
  | { type: 'code'; label: string; code: string };

export type DocsSection = {
  id: string;
  title: string;
  kicker?: string;
  blocks: DocsBlock[];
};

export type DocsArticle = {
  slug: string;
  title: string;
  navLabel?: string;
  summary: string;
  eyebrow: string;
  readTime: string;
  group: DocsGroupId;
  tags: string[];
  heroLabel: string;
  sections: DocsSection[];
  related: string[];
};

export type DocsGroup = {
  id: DocsGroupId;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  featureSlugs: string[];
};

export const docsGroups: DocsGroup[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    shortLabel: 'Start here',
    description: 'Create your account, complete onboarding, and open your first guided Yantra session.',
    accent: '01',
    featureSlugs: ['create-account', 'complete-onboarding', 'first-dashboard-session'],
  },
  {
    id: 'product',
    label: 'Product',
    shortLabel: 'Product',
    description: 'Understand what Yantra AI is, how learning paths work, and how focused study surfaces help.',
    accent: '02',
    featureSlugs: ['what-is-yantra-ai', 'how-yantra-helps-you', 'python-room', 'learning-paths-and-voids'],
  },
  {
    id: 'account-access',
    label: 'Account & Access',
    shortLabel: 'Access',
    description: 'Everything around signing in, profiles, Google and GitHub login, password recovery, and secure access.',
    accent: '03',
    featureSlugs: ['sign-in-and-google', 'password-reset', 'student-profile'],
  },
  {
    id: 'support',
    label: 'Troubleshooting',
    shortLabel: 'Support',
    description: 'Fast fixes for account issues, missing confirmations, dashboard confusion, and chat questions.',
    accent: '04',
    featureSlugs: ['common-issues', 'security-and-privacy', 'faq'],
  },
];

export const docsArticles: DocsArticle[] = [
  {
    slug: 'welcome',
    title: 'Welcome to Yantra Docs',
    navLabel: 'Welcome',
    summary:
      'Start here to understand what Yantra is, what is live today, and how to move from account creation to your first focused learning session.',
    eyebrow: 'Introduction',
    readTime: '4 min read',
    group: 'getting-started',
    heroLabel: 'Docs / Overview',
    tags: ['welcome', 'overview', 'getting started', 'docs', 'start here'],
    related: ['create-account', 'what-is-yantra-ai', 'common-issues'],
    sections: [
      {
        id: 'what-yantra-is-today',
        title: 'What Yantra Is Today',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Yantra is an AI-native learning platform built to help learners understand what to learn next, stay focused, and turn progress into real-world outcomes. The account layer, onboarding, protected dashboard, editable profile, live AI chat, and access request flow are already real.',
          },
          {
            type: 'cards',
            items: [
              {
                title: 'Public entry',
                body: 'The landing page explains Yantra, opens onboarding, and collects access intent.',
              },
              {
                title: 'Protected learner space',
                body: 'The dashboard, student profile, and Python Room open after authentication. Onboarding is part of the new-account flow, but auth is the current route gate.',
              },
              {
                title: 'Live AI assistant',
                body: 'Yantra chat can explain the product, answer learning questions, and resume for signed-in users.',
              },
            ],
          },
          {
            type: 'callout',
            tone: 'note',
            label: 'Current Product Reality',
            title: 'Some learning visuals are still illustrative',
            body:
              'Your identity, profile, auth, and chat continuity are real. Some dashboard metrics, room states, and progression cards are still curated presentation content while the deeper learning model evolves.',
          },
        ],
      },
      {
        id: 'what-this-docs-area-covers',
        title: 'What This Docs Area Covers',
        blocks: [
          {
            type: 'list',
            items: [
              'Account creation, email sign-in, Google or GitHub sign-in, and password recovery',
              'What Yantra AI is and how it supports focused learning',
              'What the dashboard, student profile, skills, rooms, and chat surfaces are for',
              'How learning paths and void-style focus spaces are meant to help',
              'Common issues, recovery paths, and support-first troubleshooting',
            ],
          },
        ],
      },
      {
        id: 'best-first-route',
        title: 'Best First Route',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Create your account',
                body: 'Use email and password to open your Yantra identity, or continue with Google or GitHub if that fits your flow.',
              },
              {
                title: 'Complete onboarding',
                body: 'Choose the role that best fits you so Yantra can open the right learner context.',
              },
              {
                title: 'Open the dashboard',
                body: 'Your dashboard is the protected home surface where your profile, guided path, and chat entry live.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'create-account',
    title: 'Create Your Yantra Account',
    summary:
      'Open your Yantra identity with the minimum friction: what you need before signup, what the flow looks like, and what happens right after.',
    eyebrow: 'Quick Start',
    readTime: '3 min read',
    group: 'getting-started',
    heroLabel: 'Quick Start / Account',
    tags: ['create account', 'signup', 'register', 'new account', 'start'],
    related: ['sign-in-and-google', 'complete-onboarding', 'welcome'],
    sections: [
      {
        id: 'before-you-start',
        title: 'Before You Start',
        blocks: [
          {
            type: 'list',
            items: [
              'Use an email address you can access immediately',
              'Choose a password with at least 8 characters',
              'If you already prefer Google or GitHub sign-in, you can use that instead from the same auth surface',
            ],
          },
        ],
      },
      {
        id: 'signup-flow',
        title: 'Signup Flow',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Open signup', body: 'Go to the Yantra signup screen and choose Create Account.' },
              {
                title: 'Enter your details',
                body: 'Your full name helps seed your learner profile and personalize the protected dashboard.',
              },
              {
                title: 'Submit the form',
                body: 'Yantra creates the account and, when verification is enabled, sends you through confirmation.',
              },
              {
                title: 'Confirm and continue',
                body: 'After confirmation, move into onboarding and unlock the protected learner route.',
              },
            ],
          },
        ],
      },
      {
        id: 'what-happens-next',
        title: 'What Happens Next',
        blocks: [
          {
            type: 'cards',
            items: [
              {
                title: 'Email confirmation',
                body: 'Yantra can ask you to confirm the account before the protected dashboard opens.',
              },
              {
                title: 'Role selection',
                body: 'New users are guided through onboarding so the product knows what kind of learner path to shape.',
              },
              {
                title: 'Profile seed',
                body: 'Your learner profile is automatically created the first time the protected app loads.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'sign-in-and-google',
    title: 'Sign In With Email, Google, or GitHub',
    summary:
      'Choose the auth path that fits you best, understand how OAuth sign-in works, and know what to do if one path feels blocked.',
    eyebrow: 'Account & Access',
    readTime: '4 min read',
    group: 'account-access',
    heroLabel: 'Access / Sign In',
    tags: ['login', 'sign in', 'google', 'github', 'oauth', 'email sign in', 'authenticate'],
    related: ['create-account', 'password-reset', 'common-issues'],
    sections: [
      {
        id: 'choose-your-path',
        title: 'Choose Your Path',
        blocks: [
          {
            type: 'cards',
            items: [
              {
                title: 'Email + password',
                body: 'Best if you want a direct login flow that matches your signup details exactly.',
              },
              {
                title: 'Google sign-in',
                body: 'Best if you prefer account selection handled through Google rather than typing a password.',
              },
              {
                title: 'GitHub sign-in',
                body: 'Best if you want to use your GitHub identity instead of managing a separate password for Yantra.',
              },
              {
                title: 'Recovery first',
                body: 'If the account exists but the password is gone, jump to reset instead of creating another account.',
              },
            ],
          },
        ],
      },
      {
        id: 'email-sign-in',
        title: 'Email Sign-In',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Open login', body: 'Use the login page and enter the same email used during signup.' },
              {
                title: 'Enter the access key',
                body: 'Your current password unlocks the session and sends you toward the protected app.',
              },
              {
                title: 'Land in the dashboard',
                body: 'If onboarding is already complete, Yantra routes you directly into the dashboard.',
              },
            ],
          },
        ],
      },
      {
        id: 'google-sign-in',
        title: 'Google and GitHub Sign-In',
        blocks: [
          {
            type: 'list',
            items: [
              'Choose Continue with Google from login or signup',
              'Select the Google account you want tied to Yantra',
              'Approve the handoff and wait for the redirect back into the app',
              'If Google opens the wrong account, restart and choose the correct identity',
              'Or choose Continue with GitHub from login or signup and finish the GitHub authorization flow',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            label: 'Avoid Duplicate Accounts',
            title: 'Do not mix two different emails accidentally',
            body:
              'If you signed up with one email and then use a different Google or GitHub account, Yantra may treat that as a separate identity. Use the same address across methods whenever possible.',
          },
        ],
      },
    ],
  },
  {
    slug: 'complete-onboarding',
    title: 'Complete Onboarding',
    summary:
      'Yantra uses onboarding to shape your learner profile for a new account, keep your learner context relevant, and make the first dashboard session easier to read.',
    eyebrow: 'Quick Start',
    readTime: '3 min read',
    group: 'getting-started',
    heroLabel: 'Quick Start / Onboarding',
    tags: ['onboarding', 'role', 'setup', 'start path', 'first setup'],
    related: ['first-dashboard-session', 'student-profile', 'welcome'],
    sections: [
      {
        id: 'why-role-selection-matters',
        title: 'Why Role Selection Matters',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Role selection is not decorative. Yantra stores your selected role, goals, and pace in the learner profile so the dashboard can start from a more useful baseline. New accounts are routed through onboarding first, even though the current protected dashboard and room routes are gated by authentication rather than a second onboarding check.',
          },
          {
            type: 'cards',
            items: [
              {
                title: 'School Student',
                body: 'Best for learners building fundamentals with guided structure and clearer pacing.',
              },
              {
                title: 'College Student',
                body: 'Best for deeper AI, ML, and portfolio-oriented technical growth.',
              },
              {
                title: 'Self-Learner',
                body: 'Best when you want flexible progress and independent rhythm without classroom framing.',
              },
            ],
          },
        ],
      },
      {
        id: 'the-onboarding-flow',
        title: 'The Onboarding Flow',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Enter the role screen',
                body: 'After signup or first auth, Yantra routes new users to onboarding before the dashboard opens.',
              },
              {
                title: 'Choose the closest role',
                body: 'Select the option that best describes your learning context today, not the one that only sounds advanced.',
              },
              {
                title: 'Confirm the choice',
                body: 'Yantra stores the role and marks onboarding as complete so the learner profile starts with the right context.',
              },
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            label: 'What Unlocks',
            title: 'Onboarding is the new-account setup layer',
            body:
              'Once the role is saved, the learner profile feels more complete across the dashboard, student profile, and Python Room. Returning sessions still rely on authentication as the main route gate.',
          },
        ],
      },
    ],
  },
  {
    slug: 'first-dashboard-session',
    title: 'Open Your First Dashboard Session',
    summary:
      'Learn what you will see the first time the dashboard opens, what is already personalized, and what to do next inside the protected learner surface.',
    eyebrow: 'Getting Started',
    readTime: '4 min read',
    group: 'getting-started',
    heroLabel: 'Getting Started / Dashboard',
    tags: ['dashboard', 'first session', 'learner home', 'start dashboard'],
    related: ['student-profile', 'python-room', 'chat-with-yantra', 'learning-paths-and-voids'],
    sections: [
      {
        id: 'what-you-see-first',
        title: 'What You See First',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The dashboard is the learner home surface. On first open, it greets you with your identity, a current path card, summary progress visuals, and a floating chat entry. Even in early product stages, it gives your learning context a place to settle.',
          },
          {
            type: 'cards',
            items: [
              { title: 'Identity', body: 'Your name and account-linked details are pulled from the real profile layer.' },
              { title: 'Current path', body: 'You see a framed learning direction, focus label, and next-action area.' },
              { title: 'Yantra chat', body: 'The assistant stays close so you can ask what to learn next without leaving the page.' },
              {
                title: 'Python Room',
                body: 'The first real dedicated room route lets you run Python in the browser, inspect runtime errors, and ask for targeted help.',
              },
            ],
          },
        ],
      },
      {
        id: 'live-vs-illustrative',
        title: 'Live vs Illustrative',
        blocks: [
          {
            type: 'callout',
            tone: 'note',
            label: 'Honest Product Reading',
            title: 'Not every dashboard tile is dynamic yet',
            body:
              'Your auth, profile, and chat continuity are live. Some progress numbers, rooms, curriculum nodes, and momentum visuals are still curated presentation content while the full learning-state model is being built.',
          },
          {
            type: 'steps',
            items: [
              {
                title: 'Open your student profile',
                body: 'Make sure your class, skill level, progress, and academic year reflect your current reality.',
              },
              {
                title: 'Read the current path card',
                body: 'Use it as a directional frame for your first sessions, even if the deeper system is still growing.',
              },
              {
                title: 'Open Yantra chat',
                body: 'Ask what you should learn first, or ask the assistant to explain how to use the platform effectively.',
              },
              {
                title: 'Try the Python Room',
                body: 'If you want a hands-on first session, open the live Python Room and use it as your first focused practice surface.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'what-is-yantra-ai',
    title: 'What Is Yantra AI?',
    summary:
      'Understand Yantra as a learning operating system, not just another course page or passive AI chatbot.',
    eyebrow: 'Product',
    readTime: '4 min read',
    group: 'product',
    heroLabel: 'Product / Yantra AI',
    tags: ['yantra ai', 'what is yantra', 'product', 'learning platform', 'ai teacher'],
    related: ['how-yantra-helps-you', 'chat-with-yantra', 'learning-paths-and-voids'],
    sections: [
      {
        id: 'learning-os',
        title: 'Yantra as a Learning OS',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Yantra is being shaped as an AI-native learning operating system. The goal is not just to show lessons, but to create a clearer loop between identity, guided direction, focused work, AI explanation, and visible progress.',
          },
          {
            type: 'list',
            items: [
              'It helps learners understand where they are',
              'It helps clarify what to learn next instead of leaving users in content overload',
              'It keeps the AI assistant close to the actual learning surface instead of isolating it in a generic chat tool',
            ],
          },
        ],
      },
      {
        id: 'why-it-feels-different',
        title: 'Why It Feels Different',
        blocks: [
          {
            type: 'cards',
            items: [
              {
                title: 'Identity-aware',
                body: 'Your account, role, and profile are part of the learning context, not an afterthought.',
              },
              {
                title: 'Guidance-first',
                body: 'Yantra is designed to reduce “what do I do now?” moments that stop learning momentum.',
              },
              {
                title: 'Outcome-minded',
                body: 'The product language stays tied to skills, readiness, and useful forward motion rather than passive consumption.',
              },
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            label: 'Best Mental Model',
            title: 'Treat Yantra as a guided foundation with a live AI layer',
            body:
              'It already helps you create an identity, enter a protected learner space, and ask good questions. The broader adaptive system is being built on top of that foundation.',
          },
        ],
      },
    ],
  },
  {
    slug: 'how-yantra-helps-you',
    title: 'How Yantra Helps You Learn',
    summary:
      'A practical explanation of how Yantra reduces confusion, supports focused effort, and helps learners keep moving instead of stalling.',
    eyebrow: 'Product',
    readTime: '5 min read',
    group: 'product',
    heroLabel: 'Product / Benefits',
    tags: ['benefits', 'help', 'why use yantra', 'outcomes', 'learning help'],
    related: ['what-is-yantra-ai', 'learning-paths-and-voids', 'chat-with-yantra'],
    sections: [
      {
        id: 'where-most-learners-get-stuck',
        title: 'Where Most Learners Get Stuck',
        blocks: [
          {
            type: 'list',
            items: [
              'Too much information without a clear next step',
              'No grounded sense of current level or real direction',
              'No easy way to ask focused questions inside the learning flow',
              'No consistent place where identity, progress, and guidance meet',
            ],
          },
        ],
      },
      {
        id: 'how-yantra-responds',
        title: 'How Yantra Responds',
        blocks: [
          {
            type: 'cards',
            items: [
              { title: 'Clear entry', body: 'Account creation, login, onboarding, and first dashboard access form a clean first-run path.' },
              { title: 'Focused home surface', body: 'The dashboard and student profile create a stable place for your learner context.' },
              { title: 'Embedded help', body: 'Yantra chat can answer product questions and learning questions without sending you elsewhere.' },
              { title: 'Persistent context', body: 'Signed-in chat history restores so the conversation does not reset every time you return.' },
            ],
          },
        ],
      },
      {
        id: 'what-you-gain',
        title: 'What You Gain',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Less confusion', body: 'You spend less time wondering where to start and more time moving through a real flow.' },
              { title: 'More continuity', body: 'Your profile, role, and chat follow you, which makes the experience feel cumulative instead of disposable.' },
              { title: 'Better focus', body: 'The product is designed to feel quiet and intentional, so the learning surface supports concentration instead of noise.' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'learning-paths-and-voids',
    title: 'Learning Paths and Voids',
    summary:
      'Understand how Yantra frames direction through paths and how the idea of “voids” supports deep, low-noise focus around real work.',
    eyebrow: 'Product',
    readTime: '5 min read',
    group: 'product',
    heroLabel: 'Product / Focus',
    tags: ['paths', 'voids', 'focus', 'learning paths', 'study spaces'],
    related: ['skills-rooms-and-focus', 'how-yantra-helps-you', 'first-dashboard-session'],
    sections: [
      {
        id: 'what-a-learning-path-means',
        title: 'What a Learning Path Means',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A learning path in Yantra is not just a label at the top of the dashboard. It is the product’s way of reducing ambiguity. Instead of dropping the learner into a blank interface with too many possible directions, the path frame tells you what domain you are in, what the current mode is trying to develop, and what kind of next step makes sense.',
          },
          {
            type: 'cards',
            items: [
              { title: 'Current path', body: 'A framed area that gives you the immediate theme or learning lane.' },
              { title: 'Current focus', body: 'A tighter indicator of what deserves attention right now.' },
              { title: 'Next action', body: 'A practical step, not just an abstract idea, so you can move without hesitation.' },
            ],
          },
          {
            type: 'list',
            items: [
              'Treat the path title as the current lane, not your permanent identity',
              'Read the focus label as the fastest hint about what the next session should optimize for',
              'Use the primary CTA or chat prompt when you want the shortest route from the dashboard into action',
            ],
          },
        ],
      },
      {
        id: 'what-voids-are',
        title: 'What Voids Are',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Voids are the Yantra idea of deep-focus learning spaces: low-noise surfaces where the task, the context, and the AI help stay close together. They are less about decoration and more about creating a calm environment for understanding, deliberate practice, and uninterrupted forward motion.',
          },
          {
            type: 'list',
            items: [
              'A quieter visual field that helps reduce context switching',
              'A clearer relationship between what you are doing and why it matters',
              'A place where chat, profile context, and guided direction can stay aligned',
            ],
          },
        ],
      },
      {
        id: 'how-to-use-path-signals-today',
        title: 'How to Use Path Signals Today',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Read the path title first', body: 'This tells you which lane the dashboard is trying to keep you in before you scan every card.' },
              { title: 'Check the current focus', body: 'That smaller signal narrows the next session down even further so you do not try to do everything at once.' },
              { title: 'Use chat when the path still feels vague', body: 'Ask for the next move in plain language instead of guessing what the label means.' },
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            label: 'Practical Reading Rule',
            title: 'Look for direction first, completeness second',
            body:
              'Yantra does not need every adaptive engine to be finished before the path model becomes useful. Even today, the path frame is already doing the job of narrowing your attention and making the dashboard less noisy.',
          },
        ],
      },
      {
        id: 'today-and-next',
        title: 'What Is Live Today',
        blocks: [
          {
            type: 'callout',
            tone: 'note',
            label: 'Current State',
            title: 'The full void model is still expanding',
            body:
              'Today, the dashboard already moves in that direction through focused surfaces, path framing, and low-noise design. The richer room engine and deeper adaptive path logic are still being built from that same foundation.',
          },
          {
            type: 'paragraph',
            text:
              'That means you should read paths and void-like surfaces as intentionally structured guidance that is already useful, even if some of the deeper automation behind them is still evolving. The visual language is not random chrome; it is the first layer of a calmer learning system.',
          },
        ],
      },
    ],
  },
  {
    slug: 'student-profile',
    title: 'Student Profile',
    summary:
      'Your student profile is the most concrete persisted learner surface in Yantra today. Here is what it stores and why keeping it current matters.',
    eyebrow: 'Account & Access',
    readTime: '4 min read',
    group: 'account-access',
    heroLabel: 'Access / Profile',
    tags: ['profile', 'student profile', 'account details', 'save profile'],
    related: ['first-dashboard-session', 'complete-onboarding', 'security-and-privacy'],
    sections: [
      {
        id: 'what-the-profile-stores',
        title: 'What the Profile Stores',
        blocks: [
          {
            type: 'cards',
            items: [
              { title: 'Name', body: 'Used across the protected learner surfaces so the product feels tied to your real identity.' },
              { title: 'Class and year', body: 'Useful for grounding the learner context and keeping the experience aligned with your stage.' },
              { title: 'Skill level and progress', body: 'A lightweight baseline that helps Yantra frame the current learner state.' },
              { title: 'Role and onboarding state', body: 'Used to decide whether the protected app can open and how the experience begins.' },
            ],
          },
        ],
      },
      {
        id: 'why-it-matters',
        title: 'Why It Matters',
        blocks: [
          {
            type: 'list',
            items: [
              'The profile is seeded automatically the first time the protected route loads',
              'Changes are validated and sanitized before being saved',
              'What you save persists across sessions instead of living only in browser memory',
            ],
          },
          {
            type: 'steps',
            items: [
              { title: 'Open the student profile page', body: 'Reach it from the protected learner area once you are authenticated.' },
              { title: 'Edit the fields that changed', body: 'Update your name, class, skill level, progress, or academic year as needed.' },
              { title: 'Save and verify', body: 'Reload once after saving to confirm the latest values persisted correctly.' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'skills-rooms-and-focus',
    title: 'Skills, Rooms, and Focus Areas',
    summary:
      'A guide to reading the dashboard’s skill cards, room cards, and focus surfaces without mistaking early visuals for confusing noise.',
    eyebrow: 'Product',
    readTime: '4 min read',
    group: 'product',
    heroLabel: 'Product / Dashboard Areas',
    tags: ['skills', 'rooms', 'focus', 'dashboard areas', 'curriculum'],
    related: ['first-dashboard-session', 'python-room', 'learning-paths-and-voids', 'chat-with-yantra'],
    sections: [
      {
        id: 'how-to-read-these-surfaces',
        title: 'How to Read These Surfaces',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The dashboard can feel dense the first time because skills, rooms, progress labels, and focus cues appear together. The right way to read it is not as one giant control panel. It is closer to a guided study surface where each block plays a different role in helping the learner decide what matters next.',
          },
          {
            type: 'cards',
            items: [
              { title: 'Skills', body: 'These cards represent capabilities Yantra wants to make legible over time.' },
              { title: 'Rooms', body: 'These are thematic spaces that point toward a type of work, atmosphere, or practice lane.' },
              { title: 'Focus', body: 'These labels are meant to keep the next session grounded in one clear direction.' },
            ],
          },
        ],
      },
      {
        id: 'how-they-help',
        title: 'How They Help',
        blocks: [
          {
            type: 'list',
            items: [
              'They reduce the feeling of “everything at once” by giving the dashboard structure',
              'They provide visual anchors for where a learner is supposed to look next',
              'They make the protected app feel like a deliberate learning environment instead of a blank shell',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            label: 'Early Product Warning',
            title: 'The room grid is mixed: one live room, broader preview surfaces',
            body:
              'The visual system is already strong, but not every room card or skill state is backed by a real learning engine yet. The Python Room is live today. Treat most other room cards as structured guidance surfaces rather than finished adaptive logic.',
          },
        ],
      },
      {
        id: 'what-to-do-with-them-right-now',
        title: 'What To Do With Them Right Now',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Use skills as capability hints', body: 'Read them as signals for what Yantra wants to make visible in your growth, not as perfect mastery scores yet.' },
              { title: 'Use rooms as session context', body: 'A room is a way to understand what kind of work the current surface is leaning toward: practice, exploration, review, or a themed lane.' },
              { title: 'Use focus labels to simplify choice', body: 'If you are unsure where to click, let the focus indicator decide the first move instead of over-scanning the whole dashboard.' },
            ],
          },
          {
            type: 'cards',
            items: [
              { title: 'When a card feels too generic', body: 'Treat it as a directional prompt, then ask chat for the concrete action hidden behind it.' },
              { title: 'When a room feels unfinished', body: 'That usually means the design language is ahead of the deeper adaptive logic. The Python Room is the current live dedicated room route.' },
              { title: 'When there is too much on screen', body: 'Start with the path title, focus label, and one CTA. Ignore the rest until you have momentum.' },
            ],
          },
        ],
      },
      {
        id: 'what-not-to-overread',
        title: 'What Not To Overread',
        blocks: [
          {
            type: 'list',
            items: [
              'Do not treat every visual badge as a precise measurement of your true ability yet',
              'Do not assume every room card is already connected to a deep live curriculum engine; today the Python Room is the clear live room surface',
              'Do not confuse structured presentation with fake value; even the early surfaces are there to reduce confusion',
            ],
          },
          {
            type: 'callout',
            tone: 'note',
            label: 'Interpretation Rule',
            title: 'These surfaces are meant to guide attention before they perfectly automate everything',
            body:
              'Yantra is deliberately building the legibility layer first: a dashboard that helps the learner read direction, context, and next steps. That alone already improves the product, even before every card becomes fully adaptive.',
          },
        ],
      },
    ],
  },
  {
    slug: 'python-room',
    title: 'Use the Python Room',
    summary:
      'The Python Room is Yantra’s first live dedicated room route. Here is what works today, how room feedback behaves, and what to expect from voice and in-browser execution.',
    eyebrow: 'Product',
    readTime: '4 min read',
    group: 'product',
    heroLabel: 'Product / Python Room',
    tags: ['python room', 'python', 'practice room', 'pyodide', 'room feedback', 'voice assistant'],
    related: ['first-dashboard-session', 'skills-rooms-and-focus', 'chat-with-yantra', 'common-issues'],
    sections: [
      {
        id: 'what-the-room-is',
        title: 'What The Python Room Is',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The Python Room is the first real room route in Yantra. It opens from `/dashboard/rooms/python` after you sign in and gives you a focused place to write Python, run it in the browser, and get targeted help when runtime errors happen.',
          },
          {
            type: 'cards',
            items: [
              { title: 'Protected route', body: 'You must be signed in to open the room. It sits inside the learner app, not the public marketing surface.' },
              { title: 'In-browser runtime', body: 'Python runs through Pyodide in the browser, so the first warmup can take a few seconds.' },
              { title: 'Targeted help', body: 'When a runtime error happens, Yantra can explain the likely issue and suggest one next fix.' },
            ],
          },
        ],
      },
      {
        id: 'how-feedback-and-voice-work',
        title: 'How Feedback And Voice Work',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Run the code', body: 'Use the editor and run the current Python task directly in the room.' },
              { title: 'Trigger room feedback on runtime errors', body: 'If the code throws, Yantra sends the runtime-error payload through the dedicated room feedback route for a short hint-oriented reply.' },
              { title: 'Use voice if that fits your session', body: 'The room can transcribe speech with Sarvam, send the text through Yantra, and synthesize the reply back to audio.' },
            ],
          },
          {
            type: 'callout',
            tone: 'note',
            label: 'Current Backend Shape',
            title: 'Python Room help is routed through the live backend stack',
            body:
              'Room feedback targets the Python AI service first and can fall back to Gemini. Voice is handled by Next.js server routes plus Sarvam, not by a separate Python voice worker.',
          },
        ],
      },
      {
        id: 'current-limits',
        title: 'Current Limits',
        blocks: [
          {
            type: 'list',
            items: [
              'Only runtime errors trigger dedicated room feedback today',
              'Successful-but-wrong output is not evaluated yet',
              'The first Pyodide startup can feel slower than later runs',
              'The broader room grid is still evolving; Python is the current fully live dedicated room route',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'chat-with-yantra',
    title: 'Chat With Yantra',
    summary:
      'How the Yantra assistant works, where you can use it, and how to get the most useful answers out of the live AI layer.',
    eyebrow: 'Product',
    readTime: '4 min read',
    group: 'product',
    heroLabel: 'Product / AI Chat',
    tags: ['chat', 'yantra ai', 'assistant', 'teacher', 'ai help'],
    related: ['what-is-yantra-ai', 'python-room', 'how-yantra-helps-you', 'common-issues'],
    sections: [
      {
        id: 'what-chat-can-do',
        title: 'What Chat Can Do',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Yantra is the learning assistant inside the product. It is the right place for explanations, concept teaching, learning strategy, product walkthroughs, and “what should I do next?” questions when you want a guided answer instead of manual exploration.',
          },
          {
            type: 'cards',
            items: [
              { title: 'Explain the product', body: 'Yantra can answer how the platform works and where to begin.' },
              { title: 'Teach concepts', body: 'You can ask about AI, computer science, math, programming, or learning strategy.' },
              { title: 'Guide next steps', body: 'If you are unsure what to do inside the dashboard, ask for a clear first move.' },
            ],
          },
        ],
      },
      {
        id: 'where-chat-works',
        title: 'Where Chat Works',
        blocks: [
          {
            type: 'list',
            items: [
              'On the public marketing site as a product explainer and guided entry point',
              'Inside the protected dashboard as a learner-contextual helper',
              'Inside the Python Room voice flow after speech is transcribed into text',
              'As a shared widget that can open from guided prompts or the floating launcher',
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            label: 'Signed-In Benefit',
            title: 'Authenticated chat continuity is already live',
            body:
              'When you chat while signed in, Yantra restores the recent rolling conversation after reload so you can pick up where you left off.',
          },
        ],
      },
      {
        id: 'how-to-get-better-answers',
        title: 'How To Get Better Answers',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Give the current context', body: 'Mention whether you are on the landing page, dashboard, profile page, or inside a specific learning lane.' },
              { title: 'Ask for one clear outcome', body: 'Questions like “give me the next move” or “explain this screen” are usually stronger than broad open-ended requests.' },
              { title: 'Narrow the follow-up', body: 'If the first answer feels broad, ask for the first three steps, one example, or a shorter explanation instead of starting over.' },
            ],
          },
          {
            type: 'callout',
            tone: 'note',
            label: 'Scope Rule',
            title: 'Use Support Desk for docs and access issues',
            body:
              'On the docs surface, Support Desk is the dedicated customer care AI. It focuses on onboarding, recovery, troubleshooting, and product-use guidance from the documentation. Use Yantra when you want the learning or teaching side of the experience.',
          },
        ],
      },
    ],
  },
  {
    slug: 'password-reset',
    title: 'Reset Your Password',
    summary:
      'A direct recovery guide for accounts that exist but cannot be accessed with the current password anymore.',
    eyebrow: 'Account & Access',
    readTime: '3 min read',
    group: 'account-access',
    heroLabel: 'Access / Recovery',
    tags: ['password reset', 'forgot password', 'recovery', 'access issue'],
    related: ['sign-in-and-google', 'common-issues', 'security-and-privacy'],
    sections: [
      {
        id: 'when-to-use-reset',
        title: 'When to Use Reset',
        blocks: [
          {
            type: 'list',
            items: [
              'You know the account exists, but the current password is not working',
              'You want to rotate the password after a security concern',
              'You can still access the original email inbox used for the account',
            ],
          },
        ],
      },
      {
        id: 'reset-flow',
        title: 'Reset Flow',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Open login and enter your email', body: 'The reset flow uses the email field already on the auth page, so start there.' },
              { title: 'Choose Forgot Password', body: 'Yantra sends a recovery email with the reset link if the address is valid.' },
              { title: 'Open the recovery link', body: 'The link takes you to the reset screen where you can set a new password.' },
              { title: 'Create a new access key', body: 'Use a new password, submit it, then return to login and sign in normally.' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            label: 'Security Rule',
            title: 'The new password must not match the old one',
            body:
              'Yantra blocks reset attempts that reuse the same password. Choose a genuinely new password with at least 8 characters so the recovery step improves security instead of repeating the old access key.',
          },
        ],
      },
      {
        id: 'if-the-email-does-not-arrive',
        title: 'If The Recovery Email Does Not Arrive',
        blocks: [
          {
            type: 'cards',
            items: [
              { title: 'Check the exact inbox', body: 'Make sure you are checking the same email address you entered on the login screen.' },
              { title: 'Check spam and promotions', body: 'Recovery emails sometimes land outside the primary inbox, especially during fresh testing or first use.' },
              { title: 'Avoid repeated requests', body: 'Too many requests in a short window can hit provider throttling and make the flow slower or noisier.' },
            ],
          },
          {
            type: 'list',
            items: [
              'If you signed up with Google or GitHub, try that provider first before assuming the password route is the right one',
              'If the app keeps saying the reset was sent but nothing arrives, verify the email address and wait a little before retrying',
              'If you regain access, sign in and confirm the account is tied to the identity you actually want to keep using',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'common-issues',
    title: 'Common Issues and Fast Fixes',
    summary:
      'A support-first troubleshooting guide for the issues users usually hit first: email confirmation delays, auth confusion, redirects, and missing expected state.',
    eyebrow: 'Troubleshooting',
    readTime: '5 min read',
    group: 'support',
    heroLabel: 'Support / Fast Fixes',
    tags: ['issues', 'troubleshooting', 'errors', 'login issue', 'dashboard issue'],
    related: ['password-reset', 'sign-in-and-google', 'faq'],
    sections: [
      {
        id: 'auth-and-access',
        title: 'Auth and Access',
        blocks: [
          {
            type: 'cards',
            items: [
              { title: 'No confirmation email yet', body: 'Wait a moment, check spam, and make sure you used the right email. Avoid creating a second account immediately.' },
              { title: 'OAuth opened the wrong account', body: 'Restart Google or GitHub sign-in and choose the correct identity instead of continuing with the wrong account.' },
              { title: 'I keep landing on onboarding', body: 'The account likely has not completed role selection yet. Finish onboarding once and try again.' },
            ],
          },
        ],
      },
      {
        id: 'dashboard-and-profile',
        title: 'Dashboard and Profile',
        blocks: [
          {
            type: 'cards',
            items: [
              { title: 'Dashboard looks static', body: 'That is partly expected today. Identity, profile, and chat are real; many learning cards are still curated surfaces.' },
              { title: 'Profile changes do not look updated', body: 'Save first, then reload once. A clean refresh is the fastest way to verify the latest state.' },
              { title: 'The first path feels generic', body: 'Use the profile page and chat to add more context. The deeper adaptive model is still evolving from the real foundation already in place.' },
            ],
          },
        ],
      },
      {
        id: 'chat-and-continuity',
        title: 'Chat and Continuity',
        blocks: [
          {
            type: 'list',
            items: [
              'If chat resets on the public site, that is expected because public marketing chat remains temporary',
              'If you are signed in and chat still does not restore, refresh once and make sure the session is active',
              'If an answer feels too broad, ask a narrower follow-up instead of restarting the thread',
            ],
          },
        ],
      },
      {
        id: 'fast-order-of-operations',
        title: 'Fast Order Of Operations',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Confirm which identity you are using', body: 'Most confusion starts when the wrong email, Google account, or GitHub account is used on the auth screen.' },
              { title: 'Check whether onboarding is actually complete', body: 'If you keep getting redirected, the role-selection flow may still be unfinished even if the account exists.' },
              { title: 'Reload once after profile or auth changes', body: 'A clean refresh is often enough to confirm whether the latest state persisted server-side.' },
              { title: 'Use Support Desk or the exact guide next', body: 'Do not guess from memory when the docs already have a specific path for the symptom you are seeing.' },
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            label: 'Support Rule',
            title: 'Work from the symptom outward',
            body:
              'If the issue is unclear, start with the visible symptom: wrong redirect, missing email, generic dashboard, or lost password. The docs are structured so each symptom leads you into the nearest fix instead of forcing you to understand the whole system first.',
          },
        ],
      },
    ],
  },
  {
    slug: 'security-and-privacy',
    title: 'Security and Privacy Basics',
    summary:
      'A plain-language overview of what Yantra stores today, how access is protected, and the user habits that make the experience safer.',
    eyebrow: 'Account & Access',
    readTime: '4 min read',
    group: 'account-access',
    heroLabel: 'Access / Security',
    tags: ['security', 'privacy', 'data', 'safe access', 'account safety'],
    related: ['password-reset', 'student-profile', 'faq'],
    sections: [
      {
        id: 'what-yantra-stores',
        title: 'What Yantra Stores Today',
        blocks: [
          {
            type: 'list',
            items: [
              'Your account identity through Supabase authentication',
              'Your learner profile fields such as name, class designation, skill level, progress, and academic year',
              'Authenticated rolling chat history for signed-in users',
              'Public access requests when someone uses the landing-page access form',
            ],
          },
        ],
      },
      {
        id: 'how-access-is-protected',
        title: 'How Access Is Protected',
        blocks: [
          {
            type: 'cards',
            items: [
              { title: 'Protected routes', body: 'The dashboard and student profile are checked server-side so unauthenticated users cannot open them casually.' },
              { title: 'Session handling', body: 'Supabase SSR session cookies keep auth state moving through the app consistently.' },
              { title: 'Validated writes', body: 'Profile and access-request inputs are validated and sanitized before persistence.' },
            ],
          },
        ],
      },
      {
        id: 'best-user-habits',
        title: 'Best User Habits',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Use one consistent identity', body: 'If you use Google or GitHub sign-in, keep the same email aligned with your Yantra account to avoid fragmentation.' },
              { title: 'Rotate passwords when needed', body: 'Use reset if you suspect the old password is weak or compromised.' },
              { title: 'Sign out on shared devices', body: 'Yantra supports a clean sign-out route, so use it whenever you are not on a personal machine.' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    summary:
      'Quick answers to the most common Yantra questions around accounts, onboarding, dashboard behavior, chat, and what is already live.',
    eyebrow: 'Troubleshooting',
    readTime: '5 min read',
    group: 'support',
    heroLabel: 'Support / FAQ',
    tags: ['faq', 'questions', 'help', 'support answers'],
    related: ['common-issues', 'what-is-yantra-ai', 'password-reset'],
    sections: [
      {
        id: 'accounts-and-access',
        title: 'Accounts and Access',
        blocks: [
          {
            type: 'cards',
            items: [
              { title: 'Do I need to verify my email?', body: 'Often yes. If verification is enabled, confirm your email before expecting the protected app to open normally.' },
              { title: 'Can I use Google or GitHub instead of a password?', body: 'Yes. Both Google and GitHub sign-in are live through the same auth surface.' },
              { title: 'Why am I seeing onboarding again?', body: 'Because the role-selection step probably has not been completed or saved yet.' },
            ],
          },
        ],
      },
      {
        id: 'product-behavior',
        title: 'Product Behavior',
        blocks: [
          {
            type: 'cards',
            items: [
              { title: 'Is the dashboard fully adaptive already?', body: 'Not yet. The account, profile, and chat foundation are real; many learning visuals are still evolving.' },
              { title: 'Does chat remember previous messages?', body: 'Yes for signed-in learners, no for public marketing chat.' },
              { title: 'What are voids?', body: 'Voids are Yantra’s concept for focused learning spaces with less noise and better context continuity.' },
            ],
          },
        ],
      },
      {
        id: 'best-next-reads',
        title: 'Best Next Reads',
        blocks: [
          {
            type: 'list',
            items: [
              'Read What Is Yantra AI? if you want the product story',
              'Read Create Your Yantra Account if you are entering the platform now',
              'Read Common Issues and Fast Fixes if something already feels wrong',
              'Read Learning Paths and Voids if you want the clearest explanation of the product’s focus philosophy',
            ],
          },
        ],
      },
    ],
  },
];

export const docsHomeQuickStartSlugs = ['create-account', 'complete-onboarding', 'password-reset'];
export const docsHomeCommonTaskSlugs = [
  'what-is-yantra-ai',
  'first-dashboard-session',
  'python-room',
  'chat-with-yantra',
  'common-issues',
];
export const docsHomeSupportSlugs = ['password-reset', 'common-issues', 'faq'];

export function getDocsArticleHref(slug: string) {
  return `/docs/${slug}`;
}

export function getDocsArticleBySlug(slug: string) {
  return docsArticles.find((article) => article.slug === slug) ?? null;
}

export function getDocsArticlesByGroup(group: DocsGroupId) {
  return docsArticles.filter((article) => article.group === group);
}

export function getDocsPrevNext(slug: string) {
  const index = docsArticles.findIndex((article) => article.slug === slug);

  if (index === -1) {
    return {
      previous: null,
      next: null,
    };
  }

  return {
    previous: index > 0 ? docsArticles[index - 1] : null,
    next: index < docsArticles.length - 1 ? docsArticles[index + 1] : null,
  };
}

export function searchDocsArticles(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return docsArticles;
  }

  return docsArticles.filter((article) => {
    const searchSpace = [article.title, article.summary, article.eyebrow, ...article.tags]
      .join(' ')
      .toLowerCase();

    return searchSpace.includes(normalizedQuery);
  });
}
