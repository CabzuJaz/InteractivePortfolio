"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
  Mail,
  ChevronDown,
  Brain,
  Code2,
  Database,
  Zap,
  Layers,
  Shield,
  Calendar,
  MapPin,
  Briefcase,
  Phone,
  Cpu,
  Lightbulb,
  Target,
  AlertTriangle,
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

  const handleChatClick = () => {
    router.push("/chat");
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* ─── HERO ─── */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden">
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
          className="flex flex-col items-center text-center max-w-3xl w-full"
        >
          {/* Status pill */}
          <motion.div variants={fadeUp} className="mb-6">
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1.5 text-sm bg-green-500/10 text-green-500 border-0"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              {persona.status}
            </Badge>
          </motion.div>

          {/* Animated Avatar */}
          <motion.div variants={fadeUp} className="mb-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-110" />
              <Image
                src="/avatars/avatar.png"
                alt={persona.name}
                width={128}
                height={128}
                priority
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-primary/30 glow-cyan"
              />
            </motion.div>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4"
          >
            <span className="text-gradient">{persona.name}</span>
          </motion.h1>

          {/* Role */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-muted-foreground mb-6 max-w-xl"
          >
            {persona.role}
          </motion.p>

          {/* Positioning */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-muted-foreground/80 mb-10 max-w-lg leading-relaxed"
          >
            {persona.positioning}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              View Projects
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleChatClick}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full glass font-medium hover:bg-primary/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Talk to My AI
            </button>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full glass font-medium hover:bg-primary/10 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Me
            </button>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            variants={fadeUp}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground/40 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── ABOUT ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">About</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              I build systems that <span className="text-gradient">work</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed max-w-2xl">
              <p>{persona.bio}</p>
              <p>
                From banking document processing with C# to multi-agent AI pipelines with Claude API —
                I&apos;ve worked across the full spectrum of enterprise software and cutting-edge AI.
                I completed a self-directed 30-day AI Engineering sprint where I built production-grade
                systems with MCP, FastMCP, and multi-agent architectures.
              </p>
              <p>
                I&apos;m not just a developer who uses AI — I build the systems that make AI work:
                orchestrators, tool-use pipelines, automated workflows, and intelligent integrations.
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
              {[
                { label: "Years Experience", value: "2+", icon: Calendar },
                { label: "AI Projects Built", value: String(projects.length), icon: Cpu },
                { label: "Based In", value: "Cavite, Philippines", icon: MapPin },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SKILLS ─── */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Skills</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-10">
              My <span className="text-gradient">tech stack</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((category, ci) => {
              const Icon = categoryIcons[category.category] ?? Layers;
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: ci * 0.1, type: "spring" as const, stiffness: 260, damping: 24 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{category.category}</h3>
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

      {/* ─── EXPERIENCE ─── */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Experience</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-10">
              Where I&apos;ve <span className="text-gradient">worked</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {resume.experience.map((exp, i) => (
              <motion.div
                key={exp.company + exp.role}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: "spring" as const, stiffness: 260, damping: 24 }}
                className="relative pl-8 border-l-2 border-primary/20"
              >
                <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-primary glow-cyan" />
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-lg">{exp.role}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {exp.company} · {exp.startDate}–{exp.endDate}
                  </p>
                  <p className="text-sm leading-relaxed">{exp.description}</p>
                  {exp.tech && exp.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exp.tech.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROJECTS ─── */}
      <section id="projects" className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Projects</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-10">
              What I&apos;ve <span className="text-gradient">built</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: "spring" as const, stiffness: 260, damping: 24 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {project.highlight && (
                          <Badge variant="secondary" className="bg-primary/15 text-primary text-xs border-0">
                            Featured
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{project.year}</span>
                      </div>
                      <h3 className="font-semibold text-xl">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{project.oneLiner}</p>
                    </div>
                  </div>

                  <p className="text-sm mt-4 leading-relaxed">{project.description}</p>

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
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-4"
                  >
                    {expandedProject === project.slug ? "Hide" : "View"} Architecture
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
                    className="border-t border-border/50 px-6 pb-6 pt-4 space-y-4"
                  >
                    <div>
                      <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        <Layers className="w-3.5 h-3.5" />
                        Architecture
                      </p>
                      <p className="text-sm font-mono bg-muted/30 rounded-lg px-3 py-2">
                        {project.architecture}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          <Target className="w-3.5 h-3.5" />
                          Problem
                        </p>
                        <p className="text-sm text-muted-foreground">{project.problem}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Solution
                        </p>
                        <p className="text-sm text-muted-foreground">{project.solution}</p>
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
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Beyond the Code</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-10">
              Fun <span className="text-gradient">facts</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {fun.hobbies.map((hobby, i) => {
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
                  <p className="text-sm text-muted-foreground">{hobby.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="glass rounded-2xl p-6">
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
      <section id="contact" className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Contact</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Let&apos;s <span className="text-gradient">build something</span>
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              {contact.availability}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-8 max-w-md mx-auto space-y-6"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{contact.email}</p>
              </div>
            </div>

            {contact.whatsapp && (
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">Message me</p>
                </div>
              </a>
            )}

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
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity glow-cyan"
              >
                <Calendar className="w-4 h-4" />
                Book a Discovery Call
              </a>
            )}

            <button
              onClick={handleChatClick}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" />
              Talk to My AI Assistant
            </button>
          </motion.div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              © 2026 BuildWithJazz.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
