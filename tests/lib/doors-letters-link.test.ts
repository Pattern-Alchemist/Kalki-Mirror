// =============================================================
// KALKI — Letters cross-links tests (Vol. 5 #13)
// -------------------------------------------------------------
// Door 3+ emails carry a quiet footer link to the letters hub
// (HTML + text parity, UTM-stamped, days 1–2/welcome/completion
// stay quiet); the letters hub mounts the house capture band;
// and the feed surfaces declare their discovery routes.
// =============================================================
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildDoorDay, buildWelcome, buildCompletion } from "@/lib/emails/course-content";

const email = "seeker@example.com";

describe("Door 3+ footer link to /letters (Vol. 5 #13)", () => {
  it("Doors 3–10 carry the letters-hub link in html and text", () => {
    for (let day = 3; day <= 10; day += 1) {
      const door = buildDoorDay(day, email);
      expect(door).not.toBeNull();
      const utm = `utm_campaign=doors-email-course&utm_content=day-${day}`;
      expect(door!.html, `door ${day} html missing letters link`).toContain("/letters?");
      expect(door!.html).toContain(utm);
      expect(door!.html).toContain("Every letter, archived");
      expect(door!.text, `door ${day} text missing letters link`).toContain(
        "Every letter, archived:"
      );
      expect(door!.text).toContain(utm);
    }
  });

  it("Doors 1–2, welcome and completion stay quiet (no letters link)", () => {
    for (const day of [1, 2]) {
      const door = buildDoorDay(day, email);
      expect(door).not.toBeNull();
      expect(door!.html, `door ${day} should stay quiet`).not.toContain("/letters?");
      expect(door!.text).not.toContain("Every letter, archived");
    }
    const welcome = buildWelcome(email);
    expect(welcome.html).not.toContain("/letters?");
    expect(welcome.text).not.toContain("Every letter, archived");
    const completion = buildCompletion(email);
    expect(completion.html).not.toContain("/letters?");
    expect(completion.text).not.toContain("Every letter, archived");
  });
});

describe("letters hub carries a capture surface (Vol. 5 #13)", () => {
  const page = readFileSync("src/app/letters/page.tsx", "utf8");

  it("mounts the house CaptureBand with letters-hub attribution", () => {
    expect(page).toContain("CaptureBand");
    expect(page).toContain('topic="letters-hub"');
  });
});

describe("feed discovery routes exist on disk (Vol. 5 #13)", () => {
  it("/feed.json route is served from the same builder as /feed.xml", () => {
    const route = readFileSync("src/app/feed.json/route.ts", "utf8");
    expect(route).toContain("buildFeedJson");
    expect(route).toContain("revalidate = 3600");
  });
});
