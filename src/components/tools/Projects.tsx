"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronDown, ChevronUp, Cpu, Lightbulb, Layers, Zap, Target, AlertTriangle } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/data/projects";

interface ProjectsProps {
  projects: Project[];
}

export function Projects({ projects }: ProjectsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring" as const, stiffness: 260, damping: 24 }}
      className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {project.highlight && (
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs border-0">
                  Featured
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{project.year}</span>
            </div>
            <h3 className="font-semibold text-lg">{project.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{project.oneLiner}</p>
          </div>
        </div>

        <p className="text-sm mt-3 leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tech.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live
            </a>
          )}
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              Code
            </a>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={`architecture-${project.slug}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground ml-auto"
          >
            {expanded ? "Less" : "Architecture"}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Architecture */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
            className="overflow-hidden"
          >
            <div id={`architecture-${project.slug}`} className="px-5 pb-5 pt-2 border-t border-border/50 space-y-4">
              {/* Architecture */}
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  Architecture
                </p>
                <p className="text-sm font-mono bg-muted/50 rounded-lg px-3 py-2">{project.architecture}</p>
              </div>

              {/* Problem & Solution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* Key Features */}
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

              {/* Challenges & Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
