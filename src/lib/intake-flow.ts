/** Conversational intake flow — scripted chat steps and visual options. */

export type IntakeOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  image: string;
  value: string;
};

export const INTAKE_GOAL_OPTIONS: IntakeOption[] = [
  {
    id: "masters",
    label: "Master's degree",
    description: "Graduate studies in Europe or beyond",
    emoji: "🎓",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=480&h=280&fit=crop",
    value: "I want to pursue a Master's degree abroad",
  },
  {
    id: "bachelors",
    label: "Bachelor's degree",
    description: "Undergraduate study as an international student",
    emoji: "🌍",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf5f?w=480&h=280&fit=crop",
    value: "I'm looking for a Bachelor's degree abroad",
  },
  {
    id: "phd",
    label: "PhD or research",
    description: "Doctoral programs and research opportunities",
    emoji: "🔬",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=480&h=280&fit=crop",
    value: "I'm interested in PhD or research programs",
  },
  {
    id: "career",
    label: "Career change",
    description: "Upskill or pivot with a new qualification",
    emoji: "💼",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=480&h=280&fit=crop",
    value: "I want to upskill or change careers through study abroad",
  },
  {
    id: "explore",
    label: "Not sure yet",
    description: "Help me figure out what's possible",
    emoji: "✨",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=480&h=280&fit=crop",
    value: "I'm exploring my options and not sure where to start",
  },
];

export const INTAKE_LOOKING_FORWARD_OPTIONS: IntakeOption[] = [
  {
    id: "culture",
    label: "New culture & experiences",
    description: "Live somewhere completely different",
    emoji: "🎭",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=480&h=280&fit=crop",
    value: "Experiencing a new culture and way of life",
  },
  {
    id: "career",
    label: "Career opportunities",
    description: "Better jobs and global networks",
    emoji: "📈",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&h=280&fit=crop",
    value: "Building my career with international experience",
  },
  {
    id: "affordable",
    label: "Quality, affordable education",
    description: "Strong programs without breaking the bank",
    emoji: "💡",
    image: "https://images.unsplash.com/photo-1427504490025-80a015fbca1f?w=480&h=280&fit=crop",
    value: "Finding quality education that's affordable",
  },
  {
    id: "graduate-work",
    label: "Study & work in the EU",
    description: "Graduate and build a life abroad",
    emoji: "🇪🇺",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4fcc5f?w=480&h=280&fit=crop",
    value: "Studying abroad and potentially working in Europe after",
  },
  {
    id: "personal",
    label: "Personal growth",
    description: "Challenge myself and gain independence",
    emoji: "🌱",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&h=280&fit=crop",
    value: "Growing personally and becoming more independent",
  },
];

export type IntakePhase = "welcome" | "goals_detail" | "background" | "looking_forward" | "complete";

export function getAssistantMessage(
  phase: IntakePhase,
  displayName: string
): string {
  switch (phase) {
    case "welcome":
      return `Hi ${displayName}! 👋 I'm LARA, your study-abroad assistant.\n\nLet's start simple — **what are you looking for?** Pick an option below or tell me in your own words. No need to know your budget yet.`;
    case "goals_detail":
      return "Great start! Tell me a bit more — **what field or subject interests you?** Any countries on your mind? Share whatever you know, even if it's vague.";
    case "background":
      return "Now help me understand **your background**.\n\n📄 Upload your CV (PDF), **or** describe your education, work experience, and skills in plain language. There's no wrong way to answer.";
    case "looking_forward":
      return "Almost done! **What are you most excited about** when you think of studying abroad?";
    case "complete":
      return "You're all set for now! 🎉\n\nI've saved your profile. Add budget and countries anytime in your **dashboard** — or ask LARA anything (5 free questions).";
  }
}
