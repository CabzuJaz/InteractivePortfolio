"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
  Mail,
  ChevronDown,
  Menu,
  X,
  Brain,
  Code2,
  Database,
  Zap,
  Layers,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Cpu,
  Lightbulb,
  Target,
  AlertTriangle,
  Award,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { persona } from "@/data/persona";
import { skills } from "@/data/skills";
import { resume } from "@/data/resume";
import { projects } from "@/data/projects";
import { fun } from "@/data/fun";
import { contact } from "@/data/contact";
import { Badge } from "@/components/ui/badge";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { ArchitectureFlow } from "@/components/tools/ArchitectureFlow";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "AI & Automation": Brain,
  Programming: Code2,
  "APIs & Integrations": Zap,
  "Backend & Data": Database,
  Tools: Layers,
};

const hobbyIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  layers: Layers,
  shield: Shield,
  zap: Zap,
};

export default function HomePage() {
  const router = useRouter();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Framer Motion animates via JS, so the prefers-reduced-motion CSS block in
  // globals.css cannot stop the looping avatar float — it has to be gated here.
  const prefersReducedMotion = useReducedMotion();

  const handleChatClick = () => {
    router.push("/chat");
  };

  // Dismiss the mobile menu with Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => scrollToSection("top")}
            className="text-left text-sm font-bold leading-tight"
            aria-label="Go to top"
          >
            <span className="block text-foreground">Build with Jazz</span>
            <span className="block text-xs font-medium text-muted-foreground">AI Systems & Automation</span>
          </button>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex"
          >
            {[
              ["About", "about"],
              ["Work", "projects"],
              ["Skills", "skills"],
              ["Credentials", "credentials"],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="min-h-10 transition-colors hover:text-primary active:text-primary"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <button
              onClick={() => scrollToSection("contact")}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-cyan"
            >
              Let&apos;s Talk
            </button>
          </div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="border-t border-border bg-background px-4 py-4 md:hidden">
            <nav aria-label="Mobile navigation" className="mx-auto grid max-w-5xl gap-2 text-base font-semibold">
              {[
                ["About", "about"],
                ["Work", "projects"],
                ["Skills", "skills"],
                ["Credentials", "credentials"],
                ["Contact", "contact"],
              ].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="min-h-12 rounded-lg px-3 py-3 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:text-primary"
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="mx-auto mt-3 flex max-w-5xl items-center justify-between border-t border-border pt-4">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section
        id="top"
        className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-[clamp(2.5rem,6vh,5.5rem)] pt-[clamp(5rem,10vh,6.5rem)] sm:px-6"
      >
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex w-full max-w-[1700px] flex-col items-center text-center"
        >
          {/* Status pill */}
          <motion.div variants={fadeUp} className="mb-[clamp(0.75rem,1.8vh,1rem)] max-w-full">
            <Badge
              variant="secondary"
              className="h-auto max-w-full whitespace-normal rounded-full bg-green-500/10 px-3 py-1.5 text-center text-[0.72rem] leading-snug text-green-500 sm:px-4 sm:text-[0.82rem]"
              title={persona.status}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              {persona.status}
            </Badge>
          </motion.div>

          {/* Animated Avatar */}
          <motion.div variants={fadeUp} className="mb-[clamp(0.875rem,2vh,1.25rem)]">
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-110" />
              <Image
                src="/avatars/avatar.webp"
                alt="MinMin avatar for Jazzmin Sicat-Cabizares"
                width={128}
                height={128}
                priority
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-primary glow-cyan"
              />
            </motion.div>
          </motion.div>

          {/* Outcome headline */}
          <motion.h1
            variants={fadeUp}
            className="w-full max-w-[1700px] text-balance text-center text-[clamp(2.25rem,5.4vw,5.6rem)] font-bold leading-[1.04] tracking-normal [overflow-wrap:normal] [word-break:normal] sm:tracking-[-0.035em] lg:tracking-[-0.045em]"
          >
            <span className="block">I build AI systems that turn</span>
            <span className="block">repetitive work into</span>
            <span className="block text-gradient">reliable automation.</span>
          </motion.h1>

          {/* Positioning */}
          <motion.p
            variants={fadeUp}
            className="mb-[clamp(0.875rem,2vh,1.25rem)] mt-[clamp(0.875rem,2vh,1.25rem)] max-w-[850px] text-base leading-relaxed text-muted-foreground sm:text-lg lg:whitespace-nowrap"
          >
            AI agents, workflow automation, and backend systems for growing businesses.
          </motion.p>

          <motion.div variants={fadeUp} className="mb-[clamp(1rem,3vh,1.75rem)] text-center">
            <p className="text-lg font-semibold text-gradient">{persona.name}</p>
            <p className="text-sm font-medium text-muted-foreground">AI Automation Engineer</p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            <button
              onClick={() => scrollToSection("projects")}
              className="flex min-h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-cyan active:translate-y-0"
            >
              Explore My Work
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleChatClick}
              className="glass flex min-h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-base font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0"
            >
              <MessageCircle className="w-4 h-4" />
              Ask MinMin AI
            </button>
          </motion.div>

        </motion.div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="px-5 py-12 sm:px-6 md:py-18">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">About</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              I build systems that <span className="text-gradient">work</span>
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              I design and deploy AI workflows, multi-agent pipelines, and backend integrations that make business operations faster and more dependable.
            </p>

            {/* Highlights list */}
            <ul className="mt-6 space-y-2 max-w-2xl">
              {persona.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-8 min-[420px]:grid-cols-2 sm:grid-cols-4">
              {[
                { label: "Yrs in Engineering", value: "3+", icon: Calendar },
                { label: "Yrs in AI Systems", value: "1+", icon: Brain },
                { label: "AI Projects Built", value: String(projects.length), icon: Cpu },
                { label: "Based In", value: "Cavite, PH", icon: MapPin },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold leading-tight">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium leading-snug text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SKILLS ─── */}
      <section id="skills" className="px-5 py-12 sm:px-6 md:py-18 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Skills</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              Systems I <span className="text-gradient">build with</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((category, ci) => {
              const Icon = categoryIcons[category.category] ?? Layers;
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: ci * 0.1, type: "spring" as const, stiffness: 260, damping: 24 }}
                  className="glass rounded-2xl p-5 sm:p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold">{category.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.items.map((skill) => (
                      <Badge
                        key={skill.name}
                        variant="secondary"
                        className={`text-xs ${
                          skill.level === 3
                            ? "bg-primary/15 text-primary"
                            : skill.level === 2
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── EXPERIENCE — hidden ─── */}

      {/* ─── CERTIFICATES ─── */}
      {resume.certificates && resume.certificates.length > 0 && (
        <section id="credentials" className="px-5 py-12 sm:px-6 md:py-18 border-t border-border/50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Certificates</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-8">
                Credentials & <span className="text-gradient">Certifications</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {resume.certificates.map((cert, i) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, type: "spring" as const, stiffness: 260, damping: 24 }}
                  className="glass rounded-2xl overflow-hidden group hover:border-primary/30 transition-all"
                >
                  <div className="flex min-h-36 gap-4 p-5 sm:p-6">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Award className="h-9 w-9 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold leading-snug">{cert.name}</h3>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">{cert.issuer}</p>
                      <p className="text-sm text-muted-foreground">{cert.date}</p>
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        >
                          View Credential
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── PROJECTS ─── */}
      <section id="projects" className="px-5 py-12 sm:px-6 md:py-18 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Projects</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              What I&apos;ve <span className="text-gradient">built</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: "spring" as const, stiffness: 260, damping: 24 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {project.highlight && (
                          <Badge variant="secondary" className="bg-primary/15 text-primary text-xs border-0">
                            Featured
                          </Badge>
                        )}
                        {project.industry && (
                          <Badge variant="secondary" className="text-xs">
                            {project.industry}
                          </Badge>
                        )}
                        {project.year && <span className="text-xs text-muted-foreground">{project.year}</span>}
                      </div>
                      <h3 className="text-xl font-semibold leading-snug sm:text-2xl">{project.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{project.oneLiner}</p>
                    </div>
                  </div>

                  {project.images[0] ? (
                    <div className="mt-5 overflow-hidden rounded-xl border border-border bg-muted/30">
                      <Image
                        src={project.images[0]}
                        alt={`${project.title} workflow preview`}
                        width={1200}
                        height={849}
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  ) : (
                    <ArchitectureFlow architecture={project.architecture} className="mt-5" />
                  )}

                  <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Impact</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {project.results[0]}
                    </p>
                  </div>

                  <p className="text-sm mt-4 leading-relaxed text-muted-foreground sm:text-base">{project.description}</p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {project.tech.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setExpandedProject(expandedProject === project.slug ? null : project.slug)
                    }
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-4"
                  >
                    {expandedProject === project.slug ? "Hide" : "View"} Case Study
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        expandedProject === project.slug ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Architecture panel */}
                {expandedProject === project.slug && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
                    className="border-t border-border/50 px-5 pb-5 pt-4 space-y-4 sm:px-6 sm:pb-6"
                  >
                    <div>
                      <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        <Layers className="w-3.5 h-3.5" />
                        Architecture
                      </p>
                      <p className="text-sm font-mono bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
                        {project.architecture}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          <Target className="w-3.5 h-3.5" />
                          Problem
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">{project.problem}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Solution
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">{project.solution}</p>
                      </div>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        <Zap className="w-3.5 h-3.5" />
                        Key Features
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {project.keyFeatures.map((f) => (
                          <li key={f} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Challenges
                        </p>
                        <ul className="space-y-1">
                          {project.challenges.map((c) => (
                            <li key={c} className="text-sm text-muted-foreground">• {c}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          <Cpu className="w-3.5 h-3.5" />
                          Results
                        </p>
                        <ul className="space-y-1">
                          {project.results.map((r) => (
                            <li key={r} className="text-sm text-muted-foreground">• {r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FUN FACTS ─── */}
      <section className="px-5 py-12 sm:px-6 md:py-18 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Beyond the Build</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              A little <span className="text-gradient">about me</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {fun.hobbies.slice(0, 3).map((hobby, i) => {
              const Icon = hobbyIcons[hobby.icon] ?? Zap;
              return (
                <motion.div
                  key={hobby.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, type: "spring" as const, stiffness: 260, damping: 24 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{hobby.name}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{hobby.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="glass rounded-2xl p-5 sm:p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Quick Facts
            </h3>
            <ul className="space-y-2">
              {fun.facts.map((fact, i) => (
                <motion.li
                  key={fact}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="text-sm text-muted-foreground"
                >
                  • {fact}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="px-5 py-12 sm:px-6 md:py-18 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Contact</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Let&apos;s <span className="text-gradient">build something</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have a repetitive process slowing down your business? Let&apos;s explore how it can become a reliable system.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5 sm:p-8 max-w-2xl mx-auto space-y-6"
          >
            <p className="text-sm font-medium text-muted-foreground">{contact.availability}. I typically reply within 1-2 business days.</p>

            <div className="grid gap-4 text-left sm:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="break-all text-[0.82rem] font-medium leading-snug min-[420px]:text-sm sm:whitespace-nowrap sm:text-[0.92rem] md:text-[0.95rem]">
                    {contact.email}
                  </p>
                </div>
              </div>

              {contact.whatsapp && (
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">Message me</p>
                  </div>
                </a>
              )}
            </div>

            <div className="flex justify-center gap-3">
              {contact.socials.map((social) => {
                const Icon = social.icon === "github" ? GithubIcon : LinkedinIcon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            {contact.calendly && (
              <a
                href={contact.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-cyan"
              >
                <Calendar className="w-4 h-4" />
                Book a Discovery Call
              </a>
            )}

            <button
              onClick={handleChatClick}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border bg-muted font-semibold text-foreground hover:bg-accent transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Ask MinMin About Your Workflow
            </button>
          </motion.div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BuildWithJazz.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
