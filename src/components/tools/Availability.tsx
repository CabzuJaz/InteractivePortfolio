"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar, Target, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AvailabilityProps {
  status: string;
  lookingFor: string[];
  whyHireMe: string[];
  availability: string;
  location: string;
}

export function Availability({ status, lookingFor, whyHireMe, availability, location }: AvailabilityProps) {
  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
        className="rounded-2xl border border-border/50 bg-card p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-0">
              {status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">{location}</p>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            Looking For
          </p>
          <div className="flex flex-wrap gap-2">
            {lookingFor.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4" />
            Why Hire Me
          </p>
          <ul className="space-y-1.5">
            {whyHireMe.map((reason) => (
              <li key={reason} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            Availability
          </p>
          <p className="text-sm">{availability}</p>
        </div>
      </motion.div>
    </div>
  );
}
