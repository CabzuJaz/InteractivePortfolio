export interface Social {
  label: string;
  url: string;
  icon: string; // lucide-react icon name
}

export const contact = {
  email: "jazzmincabizares@gmail.com",
  whatsapp: "https://wa.me/639389036717",
  availability: "Open to remote work and project inquiries",
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
