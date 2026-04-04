import {
  type StudentDashboardCurriculumNode,
  type StudentDashboardPath,
  type StudentDashboardRoom,
  type StudentDashboardSeed,
  type StudentDashboardSkill,
  type StudentDashboardWeeklyActivity,
} from './student-dashboard-model';
import type { StudentProfile } from './student-profile-model';
import type { StudentPersonalizationProfile } from './student-personalization-model';

export type GeneratedDashboardSnapshot = StudentDashboardSeed & {
  learnerSummary: string;
  recommendedTrack: string;
  recommendedAction: {
    title: string;
    description: string;
    prompt: string;
  };
  confidenceSummary: string;
  assumptions: string[];
  provider: string;
  modelUsed: string | null;
};

const zeroWeeklyActivity: StudentDashboardWeeklyActivity[] = [
  { dayKey: 'mon', dayLabel: 'MON', containerHeight: 96, fillHeight: 0, highlighted: false, sortOrder: 1 },
  { dayKey: 'tue', dayLabel: 'TUE', containerHeight: 128, fillHeight: 0, highlighted: false, sortOrder: 2 },
  { dayKey: 'wed', dayLabel: 'WED', containerHeight: 80, fillHeight: 0, highlighted: false, sortOrder: 3 },
  { dayKey: 'thu', dayLabel: 'THU', containerHeight: 144, fillHeight: 0, highlighted: false, sortOrder: 4 },
  { dayKey: 'fri', dayLabel: 'FRI', containerHeight: 112, fillHeight: 0, highlighted: false, sortOrder: 5 },
  { dayKey: 'sat', dayLabel: 'SAT', containerHeight: 48, fillHeight: 0, highlighted: false, sortOrder: 6 },
  { dayKey: 'sun', dayLabel: 'SUN', containerHeight: 48, fillHeight: 0, highlighted: false, sortOrder: 7 },
];

type GoalBlueprint = {
  pathTitle: string;
  learningTrackTitle: string;
  focus: string;
  pathDescription: string;
  trackDescription: string;
  recommendedActionTitle: string;
  recommendedActionDescription: string;
  recommendedActionPrompt: string;
  nodeTitles: [string, string, string];
  nodeDescriptions: [string, string, string];
};

const goalBlueprints: Record<string, GoalBlueprint> = {
  'Artificial Intelligence & ML': {
    pathTitle: 'AI Foundations',
    learningTrackTitle: 'Machine Learning Starter Track',
    focus: 'Python, data intuition, and model vocabulary',
    pathDescription: 'Start with the technical basics that let future AI work feel grounded instead of abstract.',
    trackDescription:
      'This roadmap keeps the first stretch honest: core Python practice, data reasoning, and a slow move into model thinking.',
    recommendedActionTitle: 'Enter Python Room',
    recommendedActionDescription: 'Use the Python Room first so Yantra can calibrate your problem-solving pace on real work.',
    recommendedActionPrompt: 'Open the Python Room and tell me what to focus on in my first session.',
    nodeTitles: ['Python Logic Core', 'Data Thinking Basics', 'First Model Intuition'],
    nodeDescriptions: [
      'Write simple control flow and break problems into small solvable steps.',
      'Read tables and datasets clearly enough to explain what matters before modeling.',
      'Build a usable mental model for features, training, and evaluation before deeper math.',
    ],
  },
  'Web Development': {
    pathTitle: 'Web Development Track',
    learningTrackTitle: 'Web Development Starter Track',
    focus: 'HTML, CSS, JavaScript, and first React habits',
    pathDescription: 'Start with page structure, styling, interactivity, and component thinking before larger product builds.',
    trackDescription:
      'The first roadmap keeps the dashboard honest while pointing you toward HTML, CSS, JavaScript, and React foundations.',
    recommendedActionTitle: 'Map My First Web Build',
    recommendedActionDescription: 'Use the dashboard plan to decide what to learn first, then move into guided practice with a clear frontend goal.',
    recommendedActionPrompt: 'Given my web development onboarding answers, tell me the first thing I should build and what to learn first.',
    nodeTitles: ['HTML Structure', 'CSS Layouts', 'JavaScript Interactivity'],
    nodeDescriptions: [
      'Learn semantic page structure so your layouts have a clean foundation.',
      'Practice spacing, responsiveness, and visual hierarchy with real interface patterns.',
      'Add interactions, events, and simple UI logic before you step into bigger frameworks.',
    ],
  },
  'App Development': {
    pathTitle: 'App Builder Track',
    learningTrackTitle: 'Product and Logic Foundations',
    focus: 'logic, state, and guided product-building habits',
    pathDescription: 'Start with the reasoning patterns that help app ideas turn into stable features.',
    trackDescription:
      'The first roadmap keeps you on foundations: logic, feature planning, and using Yantra to tighten each build loop.',
    recommendedActionTitle: 'Open Python Room',
    recommendedActionDescription: 'Strengthen core programming moves before you scale into app flows and larger projects.',
    recommendedActionPrompt: 'Guide me through the Python Room as preparation for app development.',
    nodeTitles: ['Programming Logic', 'Feature Design', 'Build and Review Loop'],
    nodeDescriptions: [
      'Practice the technical moves that carry into product code and debugging.',
      'Turn rough app ideas into small buildable features with clear state and flow.',
      'Use AI guidance to review, tighten, and iterate on a build without skipping the reasoning.',
    ],
  },
  'Data Science & Analytics': {
    pathTitle: 'Data Reasoning Track',
    learningTrackTitle: 'Analytics Starter Track',
    focus: 'clean data thinking and explainable analysis',
    pathDescription: 'Start with the habits that make data work careful, structured, and explainable.',
    trackDescription:
      'This first roadmap emphasizes data literacy, analysis flow, and the reasoning needed before more advanced ML work.',
    recommendedActionTitle: 'Enter Data Explorer',
    recommendedActionDescription: 'Use the Data Explorer mindset early so you learn to inspect and narrate patterns honestly.',
    recommendedActionPrompt: 'Show me the first data analysis move I should make from this dashboard.',
    nodeTitles: ['Data Structure Basics', 'Pattern Reading', 'Intro to Modeling'],
    nodeDescriptions: [
      'Understand rows, columns, missing values, and why structure matters before conclusions.',
      'Read distributions, categories, and trends in a way you can explain clearly.',
      'Move from analysis toward simple model intuition only after the data story is stable.',
    ],
  },
  'Cloud & DevOps': {
    pathTitle: 'Systems Foundations',
    learningTrackTitle: 'Automation and Delivery Track',
    focus: 'technical discipline, automation, and systems thinking',
    pathDescription: 'Start with the logic and workflow habits that make delivery work dependable.',
    trackDescription:
      'The roadmap starts with reasoning, automation mindset, and repeatable workflow discipline before platform depth.',
    recommendedActionTitle: 'Open Python Room',
    recommendedActionDescription: 'Use the Python Room to reinforce automation logic before moving into larger systems workflows.',
    recommendedActionPrompt: 'Help me use the Python Room as a systems-thinking warm-up for cloud and DevOps.',
    nodeTitles: ['Automation Logic', 'Workflow Discipline', 'Systems Thinking'],
    nodeDescriptions: [
      'Practice writing simple automation logic that mirrors real ops work.',
      'Build habits around repeatable steps, debugging, and safe iteration.',
      'Develop the systems lens needed to reason about services, pipelines, and deployment flows.',
    ],
  },
  Cybersecurity: {
    pathTitle: 'Security Foundations',
    learningTrackTitle: 'Defensive Thinking Track',
    focus: 'structured reasoning and safe systems thinking',
    pathDescription: 'Start with the logic and systems awareness that let security concepts land cleanly.',
    trackDescription:
      'The early roadmap focuses on reasoning, structured analysis, and safe defensive thinking before advanced topics.',
    recommendedActionTitle: 'Open Python Room',
    recommendedActionDescription: 'Use the Python Room first so your debugging and systems reasoning is strong before deeper security work.',
    recommendedActionPrompt: 'Guide me through the first Python Room task that helps a cybersecurity learner.',
    nodeTitles: ['Logic and Debugging', 'Systems Awareness', 'Defensive Analysis'],
    nodeDescriptions: [
      'Strengthen the habit of reading behavior, tracing issues, and explaining what happened.',
      'Understand how components connect so security ideas have real technical anchors.',
      'Practice the observation and hypothesis-building skills that support defensive analysis.',
    ],
  },
  'UI/UX Design': {
    pathTitle: 'Design Systems Track',
    learningTrackTitle: 'Interface Thinking Starter',
    focus: 'product thinking, user flow, and AI-assisted design review',
    pathDescription: 'Start with interface structure and product reasoning that can later support stronger design execution.',
    trackDescription:
      'The roadmap begins with design decisions, user flow clarity, and better AI-assisted critique rather than fake mastery.',
    recommendedActionTitle: 'Open Prompt Lab',
    recommendedActionDescription: 'Use Prompt Lab to learn how to ask for sharper design feedback and stronger interface critique.',
    recommendedActionPrompt: 'Teach me how to use Prompt Lab to improve my UI and UX thinking.',
    nodeTitles: ['Interface Structure', 'User Flow', 'AI Critique Workflow'],
    nodeDescriptions: [
      'Learn how screens, layout, and hierarchy support usable interfaces.',
      'Think through the journey a learner or user takes across a product surface.',
      'Use AI tools to critique design decisions without outsourcing your judgment.',
    ],
  },
  'Digital Marketing': {
    pathTitle: 'Growth Systems Track',
    learningTrackTitle: 'Messaging and Analytics Starter',
    focus: 'clear messaging, analytics, and AI-assisted iteration',
    pathDescription: 'Start with audience reasoning, structured experimentation, and the analytics basics that keep work honest.',
    trackDescription:
      'The first roadmap emphasizes messaging, measurement, and disciplined AI-assisted iteration rather than vague growth hacks.',
    recommendedActionTitle: 'Open Prompt Lab',
    recommendedActionDescription: 'Use Prompt Lab first so you learn how to refine messaging and ask for stronger campaign critique.',
    recommendedActionPrompt: 'Help me use Prompt Lab to sharpen my marketing and messaging workflow.',
    nodeTitles: ['Message Clarity', 'Audience Signals', 'Iteration Workflow'],
    nodeDescriptions: [
      'Learn to make a value proposition concrete before you optimize anything.',
      'Read simple analytics signals and connect them to audience behavior.',
      'Use AI to iterate on copy and ideas while keeping the strategy grounded.',
    ],
  },
  'Entrepreneurship & Startups': {
    pathTitle: 'Builder Strategy Track',
    learningTrackTitle: 'Product and Execution Starter',
    focus: 'problem framing, product logic, and disciplined AI-assisted building',
    pathDescription: 'Start with the reasoning and execution habits that help startup ideas become testable product moves.',
    trackDescription:
      'The early roadmap keeps things concrete: problem framing, build discipline, and learning how to ask better questions.',
    recommendedActionTitle: 'Open Prompt Lab',
    recommendedActionDescription: 'Use Prompt Lab to shape sharper product questions, pitch ideas, and decision-making loops.',
    recommendedActionPrompt: 'Teach me how to use Prompt Lab for startup thinking and product validation.',
    nodeTitles: ['Problem Framing', 'Product Scope', 'Execution Loop'],
    nodeDescriptions: [
      'Clarify the user problem before turning it into features or pitches.',
      'Break a rough idea into a smaller testable product slice.',
      'Use AI assistance to tighten planning and review without skipping first-principles thinking.',
    ],
  },
};

function cleanList(values: string[]) {
  return values.filter(Boolean).slice(0, 6);
}

function getPrimaryGoal(profile: StudentProfile, personalization?: StudentPersonalizationProfile | null) {
  return personalization?.approvedFacts?.normalized.targetGoals[0] ?? profile.primaryLearningGoals[0] ?? 'Artificial Intelligence & ML';
}

function getGoalBlueprint(primaryGoal: string) {
  return goalBlueprints[primaryGoal] ?? goalBlueprints['Artificial Intelligence & ML'];
}

function getStartingProgress(skillLevel: StudentProfile['skillLevel']) {
  switch (skillLevel) {
    case 'Advanced':
      return 24;
    case 'Intermediate':
      return 16;
    default:
      return 8;
  }
}

function getCompletionEstimate(learningPace: StudentProfile['learningPace'] | null) {
  switch (learningPace) {
    case 'Intensive':
      return '4-week arc';
    case 'Light':
      return '10-week arc';
    default:
      return '7-week arc';
  }
}

function buildLearnerSummary(
  profile: StudentProfile,
  personalization: StudentPersonalizationProfile | null | undefined,
  blueprint: GoalBlueprint,
) {
  if (personalization?.learnerSummary.trim()) {
    return personalization.learnerSummary.trim();
  }

  const goal = getPrimaryGoal(profile, personalization);
  const pace = personalization?.approvedFacts?.normalized.timeAvailability ?? profile.learningPace ?? 'Focused';
  const article = /^[aeiou]/i.test(goal) ? 'an' : 'a';
  return `${profile.name} is starting ${article} ${goal.toLowerCase()} path at a ${pace.toLowerCase()} pace, with the first focus on ${blueprint.focus}.`;
}

function buildConfidenceSummary(personalization: StudentPersonalizationProfile | null | undefined) {
  if (personalization?.confidenceSummary.trim()) {
    return personalization.confidenceSummary.trim();
  }

  return 'Built from Yantra onboarding answers first. This roadmap should tighten after real practice data appears.';
}

function buildAssumptions(personalization: StudentPersonalizationProfile | null | undefined, primaryGoal: string) {
  const approvedAssumptions = cleanList(personalization?.assumptions ?? []);

  if (approvedAssumptions.length > 0) {
    return approvedAssumptions;
  }

  return [
    `Primary goal assumed from onboarding: ${primaryGoal}.`,
    'No real activity history has been recorded yet, so momentum and weekly progress start at zero.',
  ];
}

function buildSkills(progress: number, primaryGoal: string): StudentDashboardSkill[] {
  if (primaryGoal === 'Web Development') {
    return [
      {
        skillKey: 'logic-core',
        title: 'HTML Structure',
        description: 'Start with semantic structure so every page and component has a clean base.',
        levelLabel: progress <= 10 ? 'Starting' : 'In Progress',
        progress: Math.min(34, progress + 10),
        iconKey: 'logic',
        toneKey: 'primary',
        locked: false,
        sortOrder: 1,
      },
      {
        skillKey: 'tooling-foundation',
        title: 'CSS Layouts',
        description: 'Learn spacing, alignment, responsiveness, and layout systems that make interfaces feel intentional.',
        levelLabel: 'In Progress',
        progress: Math.min(28, progress + 6),
        iconKey: 'python',
        toneKey: 'soft',
        locked: false,
        sortOrder: 2,
      },
      {
        skillKey: 'data-thinking',
        title: 'JavaScript Logic',
        description: 'Use conditions, events, and state changes to make pages interactive instead of static.',
        levelLabel: progress >= 18 ? 'Started' : 'Queued',
        progress: Math.max(0, progress - 2),
        iconKey: 'data',
        toneKey: 'soft',
        locked: progress < 8,
        sortOrder: 3,
      },
      {
        skillKey: 'ml-intuition',
        title: 'React Foundations',
        description: 'Move into components, props, and reusable UI patterns once HTML, CSS, and JavaScript feel grounded.',
        levelLabel: 'Locked',
        progress: Math.max(0, progress - 10),
        iconKey: 'ml',
        toneKey: 'muted',
        locked: true,
        sortOrder: 4,
      },
      {
        skillKey: 'system-design',
        title: 'Component State',
        description: 'Connect UI pieces, state changes, and screen flow into a product that feels coherent.',
        levelLabel: 'Locked',
        progress: Math.max(0, progress - 16),
        iconKey: 'networks',
        toneKey: 'muted',
        locked: true,
        sortOrder: 5,
      },
      {
        skillKey: 'prompt-review',
        title: 'AI Build Review',
        description: 'Use AI to critique frontend output, catch weak structure, and tighten the build without blindly trusting it.',
        levelLabel: 'Locked',
        progress: Math.max(0, progress - 12),
        iconKey: 'prompt',
        toneKey: 'muted',
        locked: true,
        sortOrder: 6,
      },
    ];
  }

  const goalSupportLabel =
    primaryGoal === 'Artificial Intelligence & ML' ? 'AI work' : `${primaryGoal.toLowerCase()} work`;

  return [
    {
      skillKey: 'logic-core',
      title: 'Programming Logic',
      description: `Build the control-flow confidence that supports clearer ${goalSupportLabel}.`,
      levelLabel: progress <= 10 ? 'Starting' : 'In Progress',
      progress: Math.min(32, progress + 8),
      iconKey: 'logic',
      toneKey: 'primary',
      locked: false,
      sortOrder: 1,
    },
    {
      skillKey: 'tooling-foundation',
      title: 'Tooling Foundations',
      description: 'Use guided rooms and prompts without losing the reasoning behind each step.',
      levelLabel: 'In Progress',
      progress: Math.min(26, progress + 4),
      iconKey: 'python',
      toneKey: 'soft',
      locked: false,
      sortOrder: 2,
    },
    {
      skillKey: 'data-thinking',
      title: 'Data Thinking',
      description: 'Read structure, signals, and evidence before you make decisions or build on top of them.',
      levelLabel: progress >= 18 ? 'Started' : 'Queued',
      progress: Math.max(0, progress - 4),
      iconKey: 'data',
      toneKey: 'soft',
      locked: progress < 8,
      sortOrder: 3,
    },
    {
      skillKey: 'ml-intuition',
      title: primaryGoal === 'Artificial Intelligence & ML' ? 'ML Intuition' : 'AI Collaboration',
      description:
        primaryGoal === 'Artificial Intelligence & ML'
          ? 'Develop a usable mental model for features, training, evaluation, and why outputs change.'
          : 'Learn how to use AI tools as leverage while still checking quality, constraints, and logic.',
      levelLabel: 'Locked',
      progress: Math.max(0, progress - 10),
      iconKey: 'ml',
      toneKey: 'muted',
      locked: true,
      sortOrder: 4,
    },
    {
      skillKey: 'system-design',
      title: 'Systems Thinking',
      description: 'Connect isolated exercises into larger product, workflow, or model systems.',
      levelLabel: 'Locked',
      progress: Math.max(0, progress - 16),
      iconKey: 'networks',
      toneKey: 'muted',
      locked: true,
      sortOrder: 5,
    },
    {
      skillKey: 'prompt-review',
      title: 'Prompt Review',
      description: 'Ask sharper questions, critique outputs, and improve the quality of each AI-assisted loop.',
      levelLabel: 'Locked',
      progress: Math.max(0, progress - 12),
      iconKey: 'prompt',
      toneKey: 'muted',
      locked: true,
      sortOrder: 6,
    },
  ];
}

function buildCurriculumNodes(blueprint: GoalBlueprint, progress: number): StudentDashboardCurriculumNode[] {
  return blueprint.nodeTitles.map((title, index) => ({
    nodeKey: `module-0${index + 1}`,
    moduleLabel: `Module 0${index + 1}`,
    title,
    description: blueprint.nodeDescriptions[index],
    statusLabel: index === 0 ? (progress > 12 ? 'Ready now' : 'Start here') : 'Locked',
    unlocked: index === 0,
    sortOrder: index + 1,
  }));
}

function buildRooms(): StudentDashboardRoom[] {
  return [
    {
      roomKey: 'python-room',
      title: 'Python Room',
      description: 'Guided practice for logic, debugging, and tighter technical explanations.',
      statusLabel: 'Start Here',
      ctaLabel: 'Enter Room',
      prompt: 'Guide me through the Python Room and suggest the right first challenge for me.',
      featured: true,
      textureKey: 'python-room',
      sortOrder: 1,
    },
    {
      roomKey: 'neural-net-builder',
      title: 'Neural Net Builder',
      description: 'A visual model-building room that becomes more useful once your foundations are stable.',
      statusLabel: 'Recommended Next',
      ctaLabel: 'Preview Next Step',
      prompt: 'Explain why this should be my second room and what it unlocks.',
      featured: true,
      textureKey: 'neural-builder',
      sortOrder: 2,
    },
    {
      roomKey: 'data-explorer',
      title: 'Data Explorer',
      description: 'Inspect structure, notice patterns, and turn rough signals into clearer narratives.',
      statusLabel: 'Open',
      ctaLabel: 'Explore Data',
      prompt: 'Show me what I would learn inside Data Explorer right now.',
      featured: false,
      textureKey: 'data-explorer',
      sortOrder: 3,
    },
    {
      roomKey: 'prompt-lab',
      title: 'Prompt Lab',
      description: 'Compare instructions, critique outputs, and sharpen the way you ask for help.',
      statusLabel: 'Open',
      ctaLabel: 'Enter Lab',
      prompt: 'Teach me how to use Prompt Lab to improve my current learning path.',
      featured: false,
      textureKey: 'prompt-lab',
      sortOrder: 4,
    },
  ];
}

function buildPath(
  profile: StudentProfile,
  personalization: StudentPersonalizationProfile | null | undefined,
  blueprint: GoalBlueprint,
  progress: number,
): StudentDashboardPath {
  const primaryGoal = getPrimaryGoal(profile, personalization);
  const projects = personalization?.approvedFacts?.normalized.priorProjects ?? [];
  const topics = personalization?.approvedFacts?.normalized.topicsOfInterest ?? [];
  const nextFocus = topics[0] ?? blueprint.focus;

  return {
    pathTitle: blueprint.pathTitle,
    pathDescription: projects[0]
      ? `${blueprint.pathDescription} A previous project noted was ${projects[0]}.`
      : blueprint.pathDescription,
    pathStatusLabel: 'Starter Path',
    pathProgress: progress,
    currentFocus: nextFocus,
    recommendedActionTitle: blueprint.recommendedActionTitle,
    recommendedActionDescription: blueprint.recommendedActionDescription,
    recommendedActionPrompt: blueprint.recommendedActionPrompt,
    learningTrackTitle: blueprint.learningTrackTitle,
    learningTrackDescription: `${blueprint.trackDescription} Primary goal: ${primaryGoal}.`,
    completionEstimateLabel: getCompletionEstimate(personalization?.approvedFacts?.normalized.timeAvailability ?? profile.learningPace),
    masteryProgress: Math.max(4, Math.min(18, progress)),
    masteryUnlockedCount: 1,
    masteryTotalCount: 6,
    nextSessionDateDay: '--',
    nextSessionDateMonth: 'Suggested',
    nextSessionTitle: blueprint.recommendedActionTitle,
    nextSessionDayLabel: 'No live schedule yet',
    nextSessionTimeLabel: 'Pick a room to begin',
    nextSessionInstructorName: 'Yantra Guide',
    nextSessionInstructorRole: 'AI Coach',
    nextSessionInstructorImageUrl: '',
    weeklyCompletedSessions: 0,
    weeklyChangeLabel: 'No prior week yet',
    momentumSummary: 'No streak yet',
    focusSummary: nextFocus,
    consistencySummary: '0 sessions',
  };
}

function normalizeText(value: unknown, limit: number) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, limit) : null;
}

function getRecordValue(candidate: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (key in candidate) {
      return candidate[key];
    }
  }

  return undefined;
}

function normalizeStringList(value: unknown, limit = 8) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }

    const trimmed = entry.trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    normalized.push(trimmed);
    seen.add(key);

    if (normalized.length >= limit) {
      break;
    }
  }

  return normalized;
}

function normalizeProgress(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : null;
}

function normalizeBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

function mergeGeneratedSkill(
  value: unknown,
  fallbackSkills: StudentDashboardSkill[],
): StudentDashboardSkill | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const skillKey = normalizeText(getRecordValue(candidate, 'skillKey', 'skill_key'), 80);

  if (!skillKey) {
    return null;
  }

  const fallbackSkill = fallbackSkills.find((skill) => skill.skillKey === skillKey);

  if (!fallbackSkill) {
    return null;
  }

  const title = normalizeText(getRecordValue(candidate, 'title'), 120) ?? fallbackSkill.title;
  const description = normalizeText(getRecordValue(candidate, 'description'), 320) ?? fallbackSkill.description;
  const levelLabel = normalizeText(getRecordValue(candidate, 'levelLabel', 'level_label'), 40) ?? fallbackSkill.levelLabel;
  const progress = normalizeProgress(getRecordValue(candidate, 'progress')) ?? fallbackSkill.progress;
  const iconKey = getRecordValue(candidate, 'iconKey', 'icon_key');
  const toneKey = getRecordValue(candidate, 'toneKey', 'tone_key');
  const locked = normalizeBoolean(getRecordValue(candidate, 'locked')) ?? fallbackSkill.locked;
  const sortOrderValue = getRecordValue(candidate, 'sortOrder', 'sort_order');
  const sortOrder =
    typeof sortOrderValue === 'number' && Number.isFinite(sortOrderValue)
      ? Math.max(0, Math.round(sortOrderValue))
      : fallbackSkill.sortOrder;

  return {
    skillKey,
    title,
    description,
    levelLabel,
    progress,
    iconKey:
      iconKey === 'python' ||
      iconKey === 'logic' ||
      iconKey === 'ml' ||
      iconKey === 'data' ||
      iconKey === 'networks' ||
      iconKey === 'prompt'
        ? iconKey
        : fallbackSkill.iconKey,
    toneKey:
      toneKey === 'primary' || toneKey === 'soft' || toneKey === 'muted' ? toneKey : fallbackSkill.toneKey,
    locked,
    sortOrder,
  };
}

function mergeGeneratedCurriculumNode(
  value: unknown,
  fallbackNodes: StudentDashboardCurriculumNode[],
): StudentDashboardCurriculumNode | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const nodeKey = normalizeText(getRecordValue(candidate, 'nodeKey', 'node_key'), 80);

  if (!nodeKey) {
    return null;
  }

  const fallbackNode = fallbackNodes.find((node) => node.nodeKey === nodeKey);

  if (!fallbackNode) {
    return null;
  }

  const moduleLabel = normalizeText(getRecordValue(candidate, 'moduleLabel', 'module_label'), 40) ?? fallbackNode.moduleLabel;
  const title = normalizeText(getRecordValue(candidate, 'title'), 120) ?? fallbackNode.title;
  const description = normalizeText(getRecordValue(candidate, 'description'), 320) ?? fallbackNode.description;
  const statusLabel = normalizeText(getRecordValue(candidate, 'statusLabel', 'status_label'), 64) ?? fallbackNode.statusLabel;
  const unlocked = normalizeBoolean(getRecordValue(candidate, 'unlocked')) ?? fallbackNode.unlocked;
  const sortOrderValue = getRecordValue(candidate, 'sortOrder', 'sort_order');
  const sortOrder =
    typeof sortOrderValue === 'number' && Number.isFinite(sortOrderValue)
      ? Math.max(0, Math.round(sortOrderValue))
      : fallbackNode.sortOrder;

  return {
    nodeKey,
    moduleLabel,
    title,
    description,
    statusLabel,
    unlocked,
    sortOrder,
  };
}

function normalizePath(value: unknown, fallback: StudentDashboardPath): StudentDashboardPath | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const requiredText = {
    pathTitle: normalizeText(getRecordValue(candidate, 'pathTitle', 'path_title'), 120),
    pathDescription: normalizeText(getRecordValue(candidate, 'pathDescription', 'path_description'), 320),
    pathStatusLabel: normalizeText(getRecordValue(candidate, 'pathStatusLabel', 'path_status_label'), 64),
    currentFocus: normalizeText(getRecordValue(candidate, 'currentFocus', 'current_focus'), 120),
    recommendedActionTitle: normalizeText(
      getRecordValue(candidate, 'recommendedActionTitle', 'recommended_action_title'),
      120,
    ),
    recommendedActionDescription: normalizeText(
      getRecordValue(candidate, 'recommendedActionDescription', 'recommended_action_description'),
      320,
    ),
    recommendedActionPrompt: normalizeText(
      getRecordValue(candidate, 'recommendedActionPrompt', 'recommended_action_prompt'),
      240,
    ),
    learningTrackTitle: normalizeText(getRecordValue(candidate, 'learningTrackTitle', 'learning_track_title'), 120),
    learningTrackDescription: normalizeText(
      getRecordValue(candidate, 'learningTrackDescription', 'learning_track_description'),
      360,
    ),
    completionEstimateLabel: normalizeText(
      getRecordValue(candidate, 'completionEstimateLabel', 'completion_estimate_label'),
      64,
    ),
    nextSessionDateDay: normalizeText(getRecordValue(candidate, 'nextSessionDateDay', 'next_session_date_day'), 24),
    nextSessionDateMonth: normalizeText(
      getRecordValue(candidate, 'nextSessionDateMonth', 'next_session_date_month'),
      24,
    ),
    nextSessionTitle: normalizeText(getRecordValue(candidate, 'nextSessionTitle', 'next_session_title'), 120),
    nextSessionDayLabel: normalizeText(getRecordValue(candidate, 'nextSessionDayLabel', 'next_session_day_label'), 120),
    nextSessionTimeLabel: normalizeText(
      getRecordValue(candidate, 'nextSessionTimeLabel', 'next_session_time_label'),
      120,
    ),
    nextSessionInstructorName: normalizeText(
      getRecordValue(candidate, 'nextSessionInstructorName', 'next_session_instructor_name'),
      120,
    ),
    nextSessionInstructorRole: normalizeText(
      getRecordValue(candidate, 'nextSessionInstructorRole', 'next_session_instructor_role'),
      120,
    ),
    nextSessionInstructorImageUrl:
      typeof getRecordValue(candidate, 'nextSessionInstructorImageUrl', 'next_session_instructor_image_url') === 'string'
        ? String(getRecordValue(candidate, 'nextSessionInstructorImageUrl', 'next_session_instructor_image_url')).trim()
        : null,
    weeklyChangeLabel: normalizeText(getRecordValue(candidate, 'weeklyChangeLabel', 'weekly_change_label'), 64),
    momentumSummary: normalizeText(getRecordValue(candidate, 'momentumSummary', 'momentum_summary'), 64),
    focusSummary: normalizeText(getRecordValue(candidate, 'focusSummary', 'focus_summary'), 120),
    consistencySummary: normalizeText(getRecordValue(candidate, 'consistencySummary', 'consistency_summary'), 64),
  };

  const numericFields = {
    pathProgress: normalizeProgress(getRecordValue(candidate, 'pathProgress', 'path_progress')),
    masteryProgress: normalizeProgress(getRecordValue(candidate, 'masteryProgress', 'mastery_progress')),
    masteryUnlockedCount: (() => {
      const value = getRecordValue(candidate, 'masteryUnlockedCount', 'mastery_unlocked_count');
      return typeof value === 'number' ? Math.max(0, Math.round(value)) : null;
    })(),
    masteryTotalCount: (() => {
      const value = getRecordValue(candidate, 'masteryTotalCount', 'mastery_total_count');
      return typeof value === 'number' ? Math.max(0, Math.round(value)) : null;
    })(),
    weeklyCompletedSessions: (() => {
      const value = getRecordValue(candidate, 'weeklyCompletedSessions', 'weekly_completed_sessions');
      return typeof value === 'number' ? Math.max(0, Math.round(value)) : null;
    })(),
  };

  const required =
    Object.values(requiredText).every((entry) => entry !== null) &&
    Object.values(numericFields).every((entry) => entry !== null);

  if (!required) {
    return null;
  }

  return {
    ...fallback,
    pathTitle: requiredText.pathTitle!,
    pathDescription: requiredText.pathDescription!,
    pathStatusLabel: requiredText.pathStatusLabel!,
    pathProgress: numericFields.pathProgress!,
    currentFocus: requiredText.currentFocus!,
    recommendedActionTitle: requiredText.recommendedActionTitle!,
    recommendedActionDescription: requiredText.recommendedActionDescription!,
    recommendedActionPrompt: requiredText.recommendedActionPrompt!,
    learningTrackTitle: requiredText.learningTrackTitle!,
    learningTrackDescription: requiredText.learningTrackDescription!,
    completionEstimateLabel: requiredText.completionEstimateLabel!,
    masteryProgress: numericFields.masteryProgress!,
    masteryUnlockedCount: numericFields.masteryUnlockedCount!,
    masteryTotalCount: numericFields.masteryTotalCount!,
    nextSessionDateDay: requiredText.nextSessionDateDay!,
    nextSessionDateMonth: requiredText.nextSessionDateMonth!,
    nextSessionTitle: requiredText.nextSessionTitle!,
    nextSessionDayLabel: requiredText.nextSessionDayLabel!,
    nextSessionTimeLabel: requiredText.nextSessionTimeLabel!,
    nextSessionInstructorName: requiredText.nextSessionInstructorName!,
    nextSessionInstructorRole: requiredText.nextSessionInstructorRole!,
    nextSessionInstructorImageUrl: requiredText.nextSessionInstructorImageUrl ?? '',
    weeklyCompletedSessions: numericFields.weeklyCompletedSessions!,
    weeklyChangeLabel: requiredText.weeklyChangeLabel!,
    momentumSummary: requiredText.momentumSummary!,
    focusSummary: requiredText.focusSummary!,
    consistencySummary: requiredText.consistencySummary!,
  };
}

export function buildDeterministicDashboardSnapshot(
  profile: StudentProfile,
  personalization?: StudentPersonalizationProfile | null,
): GeneratedDashboardSnapshot {
  const primaryGoal = getPrimaryGoal(profile, personalization);
  const blueprint = getGoalBlueprint(primaryGoal);
  const progress = getStartingProgress(personalization?.approvedFacts?.normalized.inferredSkillLevel ?? profile.skillLevel);
  const path = buildPath(profile, personalization, blueprint, progress);
  const skills = buildSkills(progress, primaryGoal);
  const curriculumNodes = buildCurriculumNodes(blueprint, progress);
  const rooms = buildRooms();

  return {
    learnerSummary: buildLearnerSummary(profile, personalization, blueprint),
    recommendedTrack: blueprint.learningTrackTitle,
    recommendedAction: {
      title: blueprint.recommendedActionTitle,
      description: blueprint.recommendedActionDescription,
      prompt: blueprint.recommendedActionPrompt,
    },
    confidenceSummary: buildConfidenceSummary(personalization),
    assumptions: buildAssumptions(personalization, primaryGoal),
    path,
    skills,
    curriculumNodes,
    rooms,
    weeklyActivity: zeroWeeklyActivity,
    provider: 'deterministic-dashboard-fallback',
    modelUsed: null,
  };
}

export function normalizeGeneratedDashboardSnapshot(
  value: unknown,
  profile: StudentProfile,
  personalization?: StudentPersonalizationProfile | null,
): GeneratedDashboardSnapshot | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const fallback = buildDeterministicDashboardSnapshot(profile, personalization);
  const candidate = value as Record<string, unknown>;
  const path = normalizePath(candidate.path, fallback.path);
  const skills = Array.isArray(candidate.skills)
    ? (candidate.skills
        .map((entry) => mergeGeneratedSkill(entry, fallback.skills))
        .filter(Boolean) as StudentDashboardSkill[])
    : [];
  const curriculumNodesValue = candidate.curriculumNodes ?? candidate.curriculum_nodes;
  const curriculumNodes = Array.isArray(curriculumNodesValue)
    ? (curriculumNodesValue
        .map((entry) => mergeGeneratedCurriculumNode(entry, fallback.curriculumNodes))
        .filter(Boolean) as StudentDashboardCurriculumNode[])
    : [];
  const learnerSummary = normalizeText(candidate.learnerSummary ?? candidate.learner_summary, 400);
  const recommendedTrack = normalizeText(candidate.recommendedTrack ?? candidate.recommended_track, 120);
  const confidenceSummary = normalizeText(candidate.confidenceSummary ?? candidate.confidence_summary, 240);
  const assumptions = normalizeStringList(candidate.assumptions);
  const recommendedActionValue = candidate.recommendedAction ?? candidate.recommended_action;
  const recommendedAction =
    recommendedActionValue && typeof recommendedActionValue === 'object'
      ? {
          title: normalizeText((recommendedActionValue as Record<string, unknown>).title, 120),
          description: normalizeText((recommendedActionValue as Record<string, unknown>).description, 320),
          prompt: normalizeText((recommendedActionValue as Record<string, unknown>).prompt, 240),
        }
      : null;
  const provider = normalizeText(candidate.provider, 80) ?? 'yantra-ai-service';
  const modelUsed = normalizeText(candidate.modelUsed ?? candidate.model_used, 120);

  if (
    !path ||
    !learnerSummary ||
    !recommendedTrack ||
    !confidenceSummary ||
    !recommendedAction?.title ||
    !recommendedAction.description ||
    !recommendedAction.prompt
  ) {
    return null;
  }

  return {
    learnerSummary,
    recommendedTrack,
    recommendedAction: {
      title: recommendedAction.title,
      description: recommendedAction.description,
      prompt: recommendedAction.prompt,
    },
    confidenceSummary,
    assumptions,
    path: {
      ...path,
      recommendedActionTitle: recommendedAction.title,
      recommendedActionDescription: recommendedAction.description,
      recommendedActionPrompt: recommendedAction.prompt,
      learningTrackTitle: recommendedTrack,
    },
    skills: skills.length > 0 ? skills : fallback.skills,
    curriculumNodes: curriculumNodes.length > 0 ? curriculumNodes : fallback.curriculumNodes,
    rooms: fallback.rooms,
    weeklyActivity: fallback.weeklyActivity,
    provider,
    modelUsed,
  };
}
