import type { Metadata } from "next";
import EmailCourseClient from "./EmailCourseClient";

export const metadata: Metadata = {
  title: "The 10 Doors — Free Email Course | AstroKalki",
  description:
    "Ten doors. Ten karmic loops. Ten keys. A free 10-day email course from AstroKalki — one Mahāvidyā per day, each mapped to a pattern that keeps running your life. Walk it before you book it.",
  openGraph: {
    title: "The 10 Doors — Free Email Course | AstroKalki",
    description:
      "Ten doors. Ten karmic loops. Ten keys. A free 10-day email course — one Mahāvidyā per day, each mapped to a pattern that keeps running your life.",
    url: "https://www.astrokalki.com/email-course",
    siteName: "AstroKalki — KALKI",
    type: "website",
  },
  alternates: { canonical: "/email-course" },
};

export default function EmailCoursePage() {
  return <EmailCourseClient />;
}
