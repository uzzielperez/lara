export const DASHBOARD_NAV = [
  { href: "/chat", label: "LARA Guide", icon: "✦", short: "Guide" },
  { href: "/profile", label: "My Profile", icon: "👤", short: "Profile" },
  { href: "/programs", label: "Programs", icon: "🎓", short: "Programs" },
  { href: "/applications", label: "Applications", icon: "📋", short: "Apps" },
  { href: "/profile#documents", label: "Documents", icon: "📄", short: "Docs" },
] as const;

export const PREMIUM_NAV = {
  href: "/pricing",
  label: "Coaching",
  icon: "🎯",
  description: "1:1 guidance, voice & call support",
} as const;
