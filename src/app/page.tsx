"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Bot,
  Calendar,
  Check,
  ChevronRight,
  Code2,
  Database,
  Download,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArchitectureFlow } from "@/components/tools/ArchitectureFlow";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { persona } from "@/data/persona";
import { projects } from "@/data/projects";
import { resume } from "@/data/resume";
import { skills } from "@/data/skills";
import { contact } from "@/data/contact";

const heroQuestions = [
  { label: "Selected work", query: "Show me your strongest projects and what changed because of them." },
  { label: "Skills & tools", query: "What are your strongest skills and tools?" },
  { label: "How you work", query: "How do you approach a new automation project?" },
  { label: "Availability", query: "Are you available for a new project?" },
  { label: "My workflow", query: "Can you help me find automation opportunities in my workflow?" },
] as const;

const serviceIcons = [Workflow, Sparkles, Database] as const;

const serviceVisuals = [
  {
    src: "/tools/automation-systems.png",
    alt: "Connected workflow modules passing through a validation checkpoint",
  },
  {
    src: "/tools/ai-workflows.png",
    alt: "AI orchestration core coordinating task modules and structured output",
  },
  {
    src: "/tools/backend-integrations.png",
    alt: "Database connected to multiple business systems through API pathways",
  },
] as const;

const featuredProjects = projects.filter((project) => project.highlight).slice(0, 3);

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const rise = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

function SectionIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="mb-10 grid gap-4 md:grid-cols-[minmax(0,0.7fr)_minmax(20rem,0.45fr)] md:items-end md:justify-between"
    >
      <div>
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h2 className="display-title max-w-3xl text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
      </div>
      <p className="max-w-xl text-base leading-7 text-muted-foreground md:justify-self-end md:text-lg">
        {copy}
      </p>
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [question, setQuestion] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [menuOpen]);

  const openChat = (query?: string) => {
    const cleanQuery = query?.trim();
    router.push(cleanQuery ? `/chat?query=${encodeURIComponent(cleanQuery)}` : "/chat");
  };

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (question.trim()) openChat(question);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="group flex min-w-0 items-center gap-3" aria-label="Back to top">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-sm font-bold text-primary ring-1 ring-primary/20 transition-transform group-hover:-rotate-3">
              BWJ
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight">{persona.brandName}</span>
              <span className="hidden truncate text-xs text-muted-foreground sm:block">{persona.brandDescriptor}</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Primary navigation">
            <a href="#work" className="transition-colors hover:text-foreground">Work</a>
            <a href="#capabilities" className="transition-colors hover:text-foreground">Capabilities</a>
            <a href="#about" className="transition-colors hover:text-foreground">About</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={contact.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Book a call
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-menu" className="border-t border-border bg-background px-5 py-4 md:hidden" aria-label="Mobile navigation">
            <div className="mx-auto grid max-w-7xl gap-1">
              {[
                ["Work", "work"],
                ["Capabilities", "capabilities"],
                ["About", "about"],
                ["Contact", "contact"],
              ].map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-between rounded-xl px-3 text-base font-semibold hover:bg-muted"
                >
                  {label}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
              <a
                href={contact.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-4 font-semibold text-background"
              >
                Book a call
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </nav>
        )}
      </header>

      <main>
        <section id="top" className="hero-grid relative overflow-hidden border-b border-border pt-[4.5rem]">
          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.72fr)] lg:items-center lg:gap-14 lg:py-20">
            <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10">
              <motion.button
                variants={rise}
                type="button"
                onClick={() => openChat("Are you available for a new project?")}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-left text-xs font-semibold text-primary sm:text-sm"
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                {persona.status}
              </motion.button>

              <motion.p variants={rise} className="eyebrow mb-4">
                {persona.primaryRole} · {persona.location}
              </motion.p>

              <motion.h1
                variants={rise}
                className="display-title max-w-3xl text-[clamp(2.6rem,5.2vw,4.75rem)] leading-[1]"
              >
                {persona.heroHeadline}
              </motion.h1>

              <motion.p variants={rise} className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {persona.heroDescription}
              </motion.p>

              <motion.div variants={rise} className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#work"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  See selected work
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => openChat()}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold transition-colors hover:border-foreground/30"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask MinMin AI
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.18, type: "spring", stiffness: 220, damping: 25 }}
              className="relative mx-auto w-full max-w-md lg:max-w-none"
            >
              <div className="absolute -left-5 top-10 h-24 w-24 rounded-full bg-highlight/70 blur-2xl" />
              <div className="absolute -right-6 bottom-20 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-card p-3 shadow-2xl">
                <div className="relative aspect-[4/4.35] overflow-hidden rounded-[1.45rem] bg-highlight">
                  <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
                    <span className="rounded-full bg-background/88 px-3 py-1 text-xs font-semibold backdrop-blur">{persona.tagline}</span>
                    <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">{persona.brandName}</span>
                  </div>
                  <Image
                    src="/avatars/avatar.webp"
                    alt={`${persona.name}, ${persona.primaryRole}`}
                    width={640}
                    height={700}
                    priority
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-panel/90 p-4 text-panel-foreground backdrop-blur-md">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">{persona.brandDescriptor}</p>
                        <p className="mt-1 text-xs text-panel-foreground/70">Agents · workflows · integrations</p>
                      </div>
                      <Bot className="h-6 w-6 text-highlight" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.28, type: "spring", stiffness: 240, damping: 24 }}
              className="relative z-10 lg:col-span-2"
            >
              <form onSubmit={submitQuestion} className="rounded-2xl border border-border bg-card p-2 shadow-sm">
                <label htmlFor="portfolio-question" className="sr-only">Ask MinMin AI about {persona.name}&apos;s work</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex min-h-12 flex-1 items-center gap-3 px-3">
                    <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                    <input
                      id="portfolio-question"
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder="Ask about my work, skills, or your workflow..."
                      className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!question.trim()}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Ask MinMin
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {heroQuestions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => openChat(item.query)}
                    className="shrink-0 rounded-full border border-border bg-background/75 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="work" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Selected work"
              title="Systems built around the real bottleneck."
              copy="A few recent builds across lead operations, research, and AI-assisted decision workflows."
            />

            <div className="grid gap-5 lg:grid-cols-2">
              {featuredProjects.map((project, index) => (
                <motion.article
                  key={project.slug}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-70px" }}
                  transition={{ delay: reduceMotion ? 0 : index * 0.06, type: "spring", stiffness: 240, damping: 25 }}
                  className={`group overflow-hidden rounded-[1.75rem] border border-border bg-card ${index === 0 ? "lg:col-span-2" : ""}`}
                >
                  <div className={index === 0 ? "grid lg:grid-cols-[1.05fr_0.95fr]" : ""}>
                    <div className={`bg-muted/60 p-3 ${index === 0 ? "lg:order-2" : ""}`}>
                      {project.images[0] ? (
                        <div className="overflow-hidden rounded-2xl border border-border bg-background">
                          <Image
                            src={project.images[0]}
                            alt={`${project.title} workflow preview`}
                            width={1200}
                            height={849}
                            className="aspect-[16/10] h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.015]"
                          />
                        </div>
                      ) : (
                        <ArchitectureFlow architecture={project.architecture} className="min-h-64 rounded-2xl bg-background" />
                      )}
                    </div>

                    <div className={`flex flex-col p-6 sm:p-8 ${index === 0 ? "lg:order-1 lg:p-10" : ""}`}>
                      <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <span>{project.industry ?? project.year ?? "AI systems"}</span>
                      </div>
                      <h3 className={`mt-7 font-bold tracking-[-0.035em] ${index === 0 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
                        {project.title}
                      </h3>
                      <p className="mt-4 text-base leading-7 text-muted-foreground">{project.oneLiner}</p>

                      <div className="mt-6 border-l-2 border-primary pl-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Delivered</p>
                        <p className="mt-2 text-sm leading-6 text-foreground/85">{project.results[0]}</p>
                      </div>

                      <div className="mt-7 flex flex-wrap gap-2">
                        {project.tech.slice(0, 6).map((technology) => (
                          <span key={technology} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                            {technology}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => openChat(`Tell me about the ${project.title} case study.`)}
                        className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        Ask about this build
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => openChat("Show me all of your projects.")}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold hover:border-foreground/30"
              >
                Explore all projects with MinMin
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section id="capabilities" className="scroll-mt-24 border-y border-border bg-muted/35 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Capabilities"
              title="From messy process to dependable flow."
              copy="I work across the full system: understanding the operation, connecting the tools, and making exceptions visible."
            />

            <div className="grid gap-4 lg:grid-cols-3">
              {persona.services.map((service, index) => {
                const Icon = serviceIcons[index] ?? Code2;
                const visual = serviceVisuals[index] ?? serviceVisuals[0];
                return (
                  <motion.article
                    key={service.title}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.06, type: "spring", stiffness: 250, damping: 24 }}
                    className="overflow-hidden rounded-[1.5rem] border border-border bg-card p-3"
                  >
                    <motion.div
                      whileHover={reduceMotion ? undefined : { scale: 1.015 }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border/70 bg-panel"
                    >
                      <motion.div
                        className="absolute inset-0 scale-[1.035]"
                        animate={
                          reduceMotion
                            ? undefined
                            : {
                                y: [0, -5, 0],
                                x: [0, index % 2 === 0 ? 3 : -3, 0],
                              }
                        }
                        transition={{
                          duration: 5.5 + index * 0.5,
                          delay: index * 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Image
                          src={visual.src}
                          alt={visual.alt}
                          fill
                          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </motion.div>
                      <div className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-background/85 text-primary shadow-lg backdrop-blur-md">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                    </motion.div>
                    <div className="px-3 pb-3 pt-6">
                      <h3 className="text-xl font-bold tracking-[-0.025em]">{service.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.description}</p>
                      <ul className="mt-6 grid gap-2 border-t border-border pt-5">
                        {service.examples.map((example) => (
                          <li key={example} className="flex items-center gap-2 text-sm font-medium">
                            <Check className="h-4 w-4 text-primary" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <div className="mt-12 rounded-[1.5rem] border border-border bg-background p-6 sm:p-8">
              <div className="grid gap-7 lg:grid-cols-[0.35fr_1fr]">
                <div>
                  <p className="eyebrow">Working toolkit</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">Tools change. Strong system thinking stays.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {skills.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-sm font-semibold">{category.category}</h3>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {category.items.slice(0, 6).map((skill) => (
                          <span key={skill.name} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ type: "spring", stiffness: 250, damping: 24 }}
            >
              <p className="eyebrow mb-4">About</p>
              <h2 className="display-title max-w-3xl text-4xl sm:text-5xl lg:text-6xl">Engineering roots. Automation focus.</h2>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">{persona.bio}</p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {persona.highlights.slice(0, 4).map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-sm leading-6">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>

              <a
                href={resume.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold hover:border-foreground/30"
              >
                <Download className="h-4 w-4" />
                Download résumé
              </a>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ delay: reduceMotion ? 0 : 0.08, type: "spring", stiffness: 250, damping: 24 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-3 overflow-hidden rounded-[1.5rem] border border-border bg-card">
                {[
                  ["3+", "Years in engineering"],
                  ["1+", "Year focused on AI"],
                  [String(projects.length), "Systems featured"],
                ].map(([value, label], index) => (
                  <div key={label} className={`p-5 ${index > 0 ? "border-l border-border" : ""}`}>
                    <p className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">{value}</p>
                    <p className="mt-2 text-[0.68rem] leading-4 text-muted-foreground sm:text-xs">{label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Credentials</h3>
                </div>
                <div className="mt-5 divide-y divide-border">
                  {resume.certificates.map((certificate) => (
                    <a
                      key={certificate.name}
                      href={certificate.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <span>
                        <span className="block text-sm font-semibold">{certificate.name}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{certificate.issuer} · {certificate.date}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-highlight p-6 text-highlight-foreground">
                <MapPin className="h-5 w-5" />
                <p className="mt-5 text-lg font-bold">Based in {persona.location}</p>
                <p className="mt-2 text-sm leading-6 text-highlight-foreground/70">Available for remote collaboration and project-based work.</p>
              </div>
            </motion.aside>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 px-5 pb-8 sm:px-8 sm:pb-10">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="contact-panel mx-auto max-w-7xl overflow-hidden rounded-[2rem] p-7 sm:p-10 lg:p-14"
          >
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-current/60">Start a conversation</p>
                <h2 className="display-title mt-5 max-w-4xl text-4xl sm:text-6xl lg:text-7xl">Have a workflow that should run better?</h2>
                <p className="mt-6 max-w-2xl text-base leading-7 text-current/70 sm:text-lg">
                  Share the process, the bottleneck, and the tools you use today. I&apos;ll help you find the clearest next step.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href={contact.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <Calendar className="h-4 w-4" />
                  Book a 15-minute call
                </a>
                <button
                  type="button"
                  onClick={() => openChat("I have a workflow I want to improve. Where should we start?")}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-current/20 px-6 text-sm font-semibold transition-colors hover:bg-current/5"
                >
                  <Bot className="h-4 w-4" />
                  Start with MinMin AI
                </button>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-5 border-t border-current/15 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 font-medium hover:underline">
                <Mail className="h-4 w-4" />
                {contact.email}
              </a>
              <div className="flex items-center gap-2">
                {contact.socials.map((social) => {
                  const Icon = social.icon === "github" ? GithubIcon : LinkedinIcon;
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-10 w-10 place-items-center rounded-xl border border-current/20 transition-colors hover:bg-current/5"
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {persona.brandName}</p>
          <p>Designed for clarity. Built for conversation.</p>
        </div>
      </footer>
    </div>
  );
}
