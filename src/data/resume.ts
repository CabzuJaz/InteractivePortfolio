export interface Education {
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  gpa?: string;
  highlights?: string[];
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  tech?: string[];
}

export interface Certificate {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  image?: string;
}

export const resume = {
  pdfUrl: "/resume.pdf",
  education: [
    {
      school: "Cavite State University",
      degree: "Bachelor of Science",
      field: "Computer Engineering",
      startYear: 2018,
      endYear: 2023,
    },
  ] as Education[],
  experience: [
    {
      company: "Xytron",
      role: "Junior Software Engineer",
      startDate: "2023",
      endDate: "2025",
      description:
        "Built internal automation tools for database integration (SQL, Access, SQLite), print automation, and system workflows. Developed C# applications for secure banking document processing. Reduced manual processing time by 60% through workflow automation and custom tooling.",
      tech: ["C#", "Python", "SQL", "SQLite", "MS Access", "Automation"],
    },
    {
      company: "Seven-Eleven Corp.",
      role: "Kitchen Team Leader",
      startDate: "2021",
      endDate: "2023",
      description:
        "Led kitchen operations and team coordination in a fast-paced environment. Developed leadership, time management, and problem-solving skills while managing a team and ensuring quality standards.",
      tech: [],
    },
    {
      company: "Greenergy Inc.",
      role: "IT Admin Intern",
      startDate: "2020",
      endDate: "2021",
      description:
        "Provided IT support and system administration. Built foundational technical skills in networking, troubleshooting, and system maintenance.",
      tech: ["IT Support", "System Administration", "Networking"],
    },
  ] as Experience[],
  certificates: [
    {
      name: "Zapier",
      issuer: "Tara AI Community",
      date: "2026",
    },
    {
      name: "AI Engineering Certificate",
      issuer: "30-Day AI Engineering Sprint",
      date: "2024",
      url: "/certs/certificate.pdf",
      image: "/certs/certificate.pdf",
    },
  ] as Certificate[],
};
