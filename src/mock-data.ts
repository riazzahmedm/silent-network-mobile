export const feedFilters = [
  { label: 'All Dev Logs' },
  { label: 'Building' },
  { label: 'Learning' },
  { label: 'Debugging' },
];

export const feedPosts = [
  {
    id: '1',
    type: 'BUILDING',
    author: 'Riaz Ahmed',
    handle: '@riazahmed',
    postedAt: '2h ago',
    content:
      'Shipping a private-first network for developers. Finished auth flow and feed pagination today.',
    accent: 'building' as const,
    actions: ['I can help debug this', 'I shipped something similar'],
  },
  {
    id: '2',
    type: 'LEARNING',
    author: 'Maya Chen',
    handle: '@mayachen',
    postedAt: '5h ago',
    content:
      'Learning why cursor pagination makes the feed calmer than offsets once new posts start arriving between requests.',
    accent: 'learning' as const,
    actions: ['I learned this too', 'I can help debug this'],
  },
  {
    id: '3',
    type: 'STRUGGLING',
    author: 'Omar Idris',
    handle: '@omaridris',
    postedAt: '8h ago',
    content:
      'Debugging a mixed-signal heatmap UI. One day can include shipping and learning, and I do not want to flatten that into a single color.',
    accent: 'struggling' as const,
    actions: ['I fixed something similar', 'I can help debug this'],
  },
];

export const profileSignals = [
  {
    title: 'Build Signal',
    value: '21',
    subtitle: 'days',
    tone: 'building' as const,
    milestone: 'Focused Builder',
  },
  {
    title: 'Learning Signal',
    value: '14',
    subtitle: 'dev learnings',
    tone: 'learning' as const,
    milestone: 'Committed Learner',
  },
  {
    title: 'Debug Signal',
    value: '7',
    subtitle: 'shared',
    tone: 'struggling' as const,
    milestone: 'Honest Builder',
  },
];

export const buildMapRows = [
  ['building', 'building', 'mixed', 'learning', 'empty', 'struggling', 'building'],
  ['empty', 'learning', 'building', 'building', 'mixed', 'empty', 'building'],
  ['struggling', 'building', 'empty', 'learning', 'building', 'learning', 'empty'],
  ['building', 'mixed', 'building', 'empty', 'empty', 'building', 'learning'],
];

export const inboxThreads = [
  {
    id: 'thread-1',
    title: 'I can help debug this',
    name: 'Maya Chen',
    snippet: 'I dealt with the same Prisma migration issue last month. Want the exact fix?',
    time: 'Now',
    accent: 'building' as const,
  },
  {
    id: 'thread-2',
    title: 'I shipped something similar',
    name: 'Omar Idris',
    snippet: 'I used a segmented heatmap tile for mixed days. Sharing the layout idea here.',
    time: '23m',
    accent: 'learning' as const,
  },
  {
    id: 'thread-3',
    title: 'I learned this too',
    name: 'Lena Park',
    snippet: 'Cursor pagination fixed feed jitter in my app too. The tie-breaker on id matters.',
    time: '2h',
    accent: 'struggling' as const,
  },
];

export const profileHighlights = [
  { title: 'Built this month', value: '6 updates' },
  { title: 'Top learning topic', value: 'System Design' },
  { title: 'Shared struggles', value: 'Query performance' },
];
