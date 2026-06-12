"use client";

import { motion } from "framer-motion";
import { MapPin, Heart, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MeProps {
  persona: {
    name: string;
    role: string;
    location: string;
    bio: string;
    summary?: string;
    readonly values: readonly string[];
    readonly highlights?: readonly string[];
  };
}

export function Me({ persona }: MeProps) {
  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
        className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl">
            👋
          </div>
          <div>
            <h3 className="text-xl font-bold">{persona.name}</h3>
            <p className="text-muted-foreground text-sm">{persona.role}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {persona.location}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed">{persona.bio}</p>

        {persona.highlights && persona.highlights.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-2">
              <Zap className="w-3.5 h-3.5" />
              Highlights
            </p>
            <div className="flex flex-wrap gap-2">
              {persona.highlights.map((h) => (
                <Badge key={h} variant="secondary" className="rounded-full text-xs">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-2">
            <Heart className="w-3.5 h-3.5" />
            Values
          </p>
          <div className="flex flex-wrap gap-2">
            {persona.values.map((v) => (
              <Badge key={v} variant="secondary" className="rounded-full">
                {v}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
