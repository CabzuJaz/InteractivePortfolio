import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.buildwithjazz.com";
const siteTitle = "Jazzmin Sicat-Cabizares — AI Automation Engineer";
const siteDescription =
  "AI Automation Engineer building intelligent agents, automation systems, and backend solutions. Chat with my AI assistant to learn about my projects, skills, and experience.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s — Build with Jazz",
  },
  description: siteDescription,
  applicationName: "Build with Jazz",
  authors: [{ name: "Jazzmin Sicat-Cabizares", url: siteUrl }],
  creator: "Jazzmin Sicat-Cabizares",
  keywords: [
    "AI automation engineer",
    "n8n",
    "workflow automation",
    "AI agents",
    "backend developer",
    "CRM integration",
    "business process automation",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Build with Jazz",
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
