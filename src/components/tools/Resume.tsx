"use client";

import { motion } from "framer-motion";
import { Download, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { resume as ResumeType } from "@/data/resume";

interface ResumeProps {
  resume: typeof ResumeType;
}

export function Resume({ resume }: ResumeProps) {
  return (
    <div className="w-full space-y-6">
      <a href={resume.pdfUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </a>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          <GraduationCap className="w-4 h-4" />
          Education
        </h3>
        <div className="space-y-4">
          {resume.education.map((edu, i) => (
            <motion.div
              key={edu.school}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: "spring" as const, stiffness: 260, damping: 24 }}
              className="relative pl-6 border-l-2 border-primary/20"
            >
              <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-semibold">{edu.school}</h4>
              <p className="text-sm text-muted-foreground">
                {edu.degree} in {edu.field} · {edu.startYear}–{edu.endYear}
              </p>
              {edu.gpa && (
                <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
              )}
              {edu.highlights && (
                <ul className="mt-2 space-y-1">
                  {edu.highlights.map((h) => (
                    <li key={h} className="text-sm text-muted-foreground">
                      • {h}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          <Briefcase className="w-4 h-4" />
          Experience
        </h3>
        <div className="space-y-4">
          {resume.experience.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: "spring" as const, stiffness: 260, damping: 24 }}
              className="relative pl-6 border-l-2 border-primary/20"
            >
              <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-semibold">{exp.role}</h4>
              <p className="text-sm text-muted-foreground">
                {exp.company} · {exp.startDate}–{exp.endDate}
              </p>
              <p className="text-sm mt-2">{exp.description}</p>
              {exp.tech && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {exp.tech.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
