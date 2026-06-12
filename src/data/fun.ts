export interface Hobby {
  name: string;
  description: string;
  icon: string; // lucide-react icon name
}

export const fun = {
  hobbies: [
    {
      name: "AI Engineering Sprint",
      description:
        "Completed a self-directed 30-day AI Engineering sprint, building production-grade systems with Claude API, MCP, and multi-agent architectures from scratch.",
      icon: "brain",
    },
    {
      name: "Legacy Meets Modern",
      description:
        "Started in enterprise software with C#, VB.NET, and MS Access — now building cutting-edge AI automation systems. Comfortable in both worlds.",
      icon: "layers",
    },
    {
      name: "Secure Systems",
      description:
        "Worked on secure banking document processing systems, handling sensitive data with care and precision.",
      icon: "shield",
    },
    {
      name: "Automation Obsessed",
      description:
        "If I do something more than twice, I automate it. From print workflows to email triage to lead research — everything gets a pipeline.",
      icon: "zap",
    },
  ] as Hobby[],
  facts: [
    "Built production-grade multi-agent systems with Claude API",
    "Processed banking documents securely with C# automation",
    "Completed a self-directed 30-day AI Engineering sprint",
    "Comfortable in both legacy systems (VB.NET, Access) and modern AI workflows",
    "Automated a lead research pipeline that runs completely hands-free",
  ],
  photos: [],
};
