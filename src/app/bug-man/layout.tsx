import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bug-Man Phase 1 Dashboard",
  description:
    "Project command center for Bug-Man answering-service and WordPress lead capture.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Bug-Man Phase 1 Dashboard",
    description:
      "Access, milestones, controls, and lead-flow readiness for the Bug-Man lead handling system.",
  },
  twitter: {
    title: "Bug-Man Phase 1 Dashboard",
    description:
      "Access, milestones, controls, and lead-flow readiness for the Bug-Man lead handling system.",
  },
};

export default function BugManLayout({ children }: { children: React.ReactNode }) {
  return children;
}
