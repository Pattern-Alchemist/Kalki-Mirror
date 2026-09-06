// =============================================================
// KALKI — COURSE GRAPH (Vol. 3 #10)
// -------------------------------------------------------------
// The 54 Aghorī lesson pages carried a generic Article graph; the
// hub carried a bare Course node. This module mints the full
// educational graph:
//   hub    → Course + offers (Free) + hasCourseInstance + ItemList of phases
//   phase  → phase-scoped Course + ItemList of its lessons
//   lesson → LearningResource (learningResourceType: Lesson)
//
// NOTE ON TYPES: schema.org has NO `Lesson` type (verified against
// schema.org — the URL 404s). The LRMI-correct way to mark a lesson
// is LearningResource with learningResourceType: 'Lesson'.
//
// Pure functions — the pages import these, the tests pin them.
// =============================================================

import { aghoriCourse, COURSE_META, type CourseModule, type CourseLesson } from '@/lib/data/aghori-tantra-course';
import { SITE_URL } from '@/lib/utils/metadata';
import { ORG_ID } from '@/lib/seo/service-schema';

const COURSE_URL = `${SITE_URL}/aghori-tantra`;
const COURSE_NAME = 'Aghorī Tantra Course';
const SITE_NAME = 'KALKI';

function breadcrumb(items: { name: string; item: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

/** Global lesson position (1-based) across the whole course. */
export function globalLessonPosition(mod: CourseModule, lesson: CourseLesson): number {
  const modIdx = aghoriCourse.findIndex((m) => m.id === mod.id);
  if (modIdx === -1) throw new Error(`Unknown course module: ${mod.id}`);
  const lessonIdx = mod.lessons.findIndex((l) => l.id === lesson.id);
  if (lessonIdx === -1) throw new Error(`Unknown lesson ${lesson.id} in ${mod.id}`);
  return (
    aghoriCourse.slice(0, modIdx).reduce((n, m) => n + m.lessons.length, 0) + lessonIdx + 1
  );
}

/**
 * Hub graph (/aghori-tantra). Course info rich-result shape:
 * provider, offers with category "Free" (the course is free to read —
 * the only honest price), and an Online CourseInstance. The ItemList
 * gives crawlers the eight phase URLs without forcing a crawl.
 */
export function courseHubJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `${COURSE_URL}#course`,
        name: COURSE_NAME,
        description: COURSE_META.description,
        url: COURSE_URL,
        provider: { '@id': ORG_ID },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@type': 'Thing', name: 'Aghorī Tantra' },
        inLanguage: 'en-US',
        educationalLevel: 'Foundational to advanced (staged phases)',
        offers: {
          '@type': 'Offer',
          category: 'Free',
          price: 0,
          priceCurrency: 'USD',
          url: COURSE_URL,
          availability: 'https://schema.org/InStock',
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'Online',
          // Self-paced: deliberately NO courseSchedule — fabricating a
          // daily cadence would be a false claim to the graph.
        },
        hasPart: aghoriCourse.map((m) => ({
          '@type': 'Course',
          name: `${m.phase}: ${m.title}`,
          url: `${COURSE_URL}/${m.id}`,
        })),
      },
      {
        '@type': 'ItemList',
        name: `${COURSE_NAME} — Phases`,
        numberOfItems: aghoriCourse.length,
        itemListElement: aghoriCourse.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${m.phase}: ${m.title}`,
          url: `${COURSE_URL}/${m.id}`,
        })),
      },
      breadcrumb([
        { name: 'Home', item: SITE_URL },
        { name: COURSE_NAME, item: COURSE_URL },
      ]),
    ],
  };
}

/**
 * Phase index graph (/aghori-tantra/[phase]). Phase-scoped Course node
 * (kept from the previous inline graph) + ItemList of the lessons.
 */
export function coursePhaseJsonLd(mod: CourseModule) {
  const phaseUrl = `${COURSE_URL}/${mod.id}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        name: `${COURSE_NAME} — ${mod.phase}: ${mod.title}`,
        description: mod.description.slice(0, 300),
        url: phaseUrl,
        provider: { '@id': ORG_ID },
        isPartOf: { '@id': `${COURSE_URL}#course` },
        educationalLevel: mod.difficulty,
        inLanguage: 'en-US',
      },
      {
        '@type': 'ItemList',
        name: `${mod.phase} — Lessons`,
        numberOfItems: mod.lessons.length,
        itemListElement: mod.lessons.map((l, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: l.title,
          url: `${phaseUrl}/${l.id}`,
        })),
      },
      breadcrumb([
        { name: 'Home', item: SITE_URL },
        { name: COURSE_NAME, item: COURSE_URL },
        { name: mod.phase, item: phaseUrl },
      ]),
    ],
  };
}

/**
 * Lesson graph (/aghori-tantra/[phase]/[lesson]). LearningResource with
 * learningResourceType 'Lesson' (schema.org has no Lesson type), member
 * of the course, with its global position and evidence grade preserved.
 */
export function courseLessonJsonLd(mod: CourseModule, lesson: CourseLesson) {
  const lessonUrl = `${COURSE_URL}/${mod.id}/${lesson.id}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LearningResource',
        name: lesson.title,
        alternateName: lesson.titleSanskrit,
        description: lesson.content.split('\n\n')[0].slice(0, 300),
        url: lessonUrl,
        learningResourceType: 'Lesson',
        educationalLevel: mod.difficulty,
        educationalUse: 'Guided study',
        position: globalLessonPosition(mod, lesson),
        isPartOf: [
          { '@id': `${COURSE_URL}#course` },
          { '@type': 'Course', name: `${COURSE_NAME} — ${mod.phase}: ${mod.title}`, url: `${COURSE_URL}/${mod.id}` },
        ],
        about: { '@type': 'Thing', name: 'Aghorī Tantra' },
        provider: { '@id': ORG_ID },
        inLanguage: 'en-US',
        ...(lesson.evidence ? { keywords: `${COURSE_META.tradition}, evidence: ${lesson.evidence.toLowerCase()}` } : {}),
      },
      breadcrumb([
        { name: 'Home', item: SITE_URL },
        { name: COURSE_NAME, item: COURSE_URL },
        { name: mod.phase, item: `${COURSE_URL}/${mod.id}` },
        { name: lesson.title, item: lessonUrl },
      ]),
    ],
  };
}
