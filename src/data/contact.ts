export interface Social {
  label: string;
  url: string;
  icon: string; // lucide-react icon name
}

export const contact = {
  email: "jazzmincabizares@gmail.com",
  availability: "Open to full-time remote roles with US and international teams",
  schedule: "Flexible hours, mornings preferred (Philippine time, UTC+8)",
  calendly: "https://calendly.com/jazzmincabizares/15-minutes-discovery-call",
  socials: [
    {
      label: "GitHub",
      url: "https://github.com/CabzuJaz",
      icon: "github",
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/jazzmin-sicat-cabizares-9346041b8",
      icon: "linkedin",
    },
  ] as Social[],
};
