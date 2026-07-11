/** Simplest path to studying abroad — shown on dashboard & chat. */

export const STUDY_ABROAD_PATH = [
  {
    step: 1,
    title: "Share your story",
    description: "Quick intake chat — goals, background, CV optional. No budget needed yet.",
    href: "/intake",
    icon: "💬",
  },
  {
    step: 2,
    title: "Ask LARA anything",
    description: "5 free personalized questions about programs, visas, and your path.",
    href: "/profile",
    icon: "✦",
  },
  {
    step: 3,
    title: "Browse programs",
    description: "Search partner schools and save matches to your list.",
    href: "/programs",
    icon: "🎓",
  },
  {
    step: 4,
    title: "Track applications",
    description: "Checklist, deadlines, and documents per program.",
    href: "/applications",
    icon: "📋",
  },
] as const;

export const CHAT_WELCOME =
  "I'm LARA — your study-abroad assistant.\n\nSimplest path: (1) share your story in intake, (2) ask me questions here, (3) browse programs, (4) track applications.\n\nWhat would you like to know?";
