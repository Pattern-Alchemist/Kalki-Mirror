import { describe, it, expect } from 'vitest';
import { aghoriCourse, COURSE_PHASE_COUNT, COURSE_LESSON_COUNT } from '@/lib/data/aghori-tantra-course';
import { courseHubJsonLd, coursePhaseJsonLd, courseLessonJsonLd, globalLessonPosition } from '@/lib/seo/course-jsonld';
import { SITE_URL } from '@/lib/utils/metadata';

/**
 * Vol. 3 #10 — course structured data.
 *
 * The Aghorī Tantra course is the site's deepest educational surface
 * (8 phases, 54 lessons). These tests pin the full graph: the hub's
 * Course/offers/instance + phase ItemList, every phase's lesson
 * ItemList, and every lesson's LearningResource node.
 */

const BASE = 'https://www.astrokalki.com';
const COURSE_URL = `${BASE}/aghori-tantra`;

describe('hub graph (courseHubJsonLd)', () => {
  const graph = courseHubJsonLd();
  const [course, itemList, crumbs] = graph['@graph'];

  it('emits a Course node with provider + free offer + online instance', () => {
    expect(course['@type']).toBe('Course');
    expect(course['@id']).toBe(`${COURSE_URL}#course`);
    expect(course['url']).toBe(COURSE_URL);
    expect(course['provider']['@id']).toMatch(/#organization$/);
    expect(course['offers']['category']).toBe('Free');
    expect(course['offers']['price']).toBe(0);
    expect(course['hasCourseInstance']['@type']).toBe('CourseInstance');
    expect(course['hasCourseInstance']['courseMode']).toBe('Online');
  });

  it('the ItemList covers all eight phases with crawlable URLs', () => {
    expect(itemList['@type']).toBe('ItemList');
    expect(itemList['numberOfItems']).toBe(COURSE_PHASE_COUNT);
    expect(itemList['itemListElement']).toHaveLength(COURSE_PHASE_COUNT);
    const urls = itemList['itemListElement'].map((it: { url: string }) => it.url);
    for (const m of aghoriCourse) {
      expect(urls).toContain(`${COURSE_URL}/${m.id}`);
    }
    for (const [i, it] of itemList['itemListElement'].entries()) {
      expect(it.position).toBe(i + 1);
    }
  });

  it('hasPart mirrors the phase set', () => {
    expect(course['hasPart']).toHaveLength(COURSE_PHASE_COUNT);
  });

  it('breadcrumb anchors home → course', () => {
    expect(crumbs['itemListElement']).toHaveLength(2);
    expect(crumbs['itemListElement'][1].item).toBe(COURSE_URL);
  });
});

describe('phase graphs (coursePhaseJsonLd)', () => {
  it('every phase emits a Course + ItemList of ALL its lessons', () => {
    for (const mod of aghoriCourse) {
      const graph = coursePhaseJsonLd(mod);
      const [course, itemList, crumbs] = graph['@graph'];

      expect(course['@type']).toBe('Course');
      expect(course['url']).toBe(`${COURSE_URL}/${mod.id}`);
      expect(course['isPartOf']['@id']).toBe(`${COURSE_URL}#course`);
      expect(course['educationalLevel']).toBe(mod.difficulty);

      expect(itemList['numberOfItems']).toBe(mod.lessons.length);
      const urls = itemList['itemListElement'].map((it: { url: string }) => it.url);
      for (const l of mod.lessons) {
        expect(urls).toContain(`${COURSE_URL}/${mod.id}/${l.id}`);
      }
      expect(crumbs['itemListElement']).toHaveLength(3);
    }
  });

  it('lesson ItemList positions are 1-based and consecutive', () => {
    for (const mod of aghoriCourse) {
      const itemList = coursePhaseJsonLd(mod)['@graph'][1];
      itemList['itemListElement'].forEach((it: { position: number }, i: number) => {
        expect(it.position).toBe(i + 1);
      });
    }
  });
});

describe('lesson graphs (courseLessonJsonLd)', () => {
  it('emits LearningResource with learningResourceType Lesson (schema.org has no Lesson type)', () => {
    const mod = aghoriCourse[0];
    const lesson = mod.lessons[0];
    const [node, crumbs] = courseLessonJsonLd(mod, lesson)['@graph'];

    expect(node['@type']).toBe('LearningResource');
    expect(node['learningResourceType']).toBe('Lesson');
    expect(node['name']).toBe(lesson.title);
    expect(node['url']).toBe(`${COURSE_URL}/${mod.id}/${lesson.id}`);
    expect(node['isPartOf'][0]['@id']).toBe(`${COURSE_URL}#course`);
    expect(node['inLanguage']).toBe('en-US');
    expect(crumbs['itemListElement']).toHaveLength(4);
    expect(crumbs['itemListElement'][3].item).toBe(node['url']);
  });

  it('global positions are 1-based, unique across all 54 lessons, and dense', () => {
    const positions: number[] = [];
    for (const mod of aghoriCourse) {
      for (const lesson of mod.lessons) {
        positions.push(globalLessonPosition(mod, lesson));
        const node = courseLessonJsonLd(mod, lesson)['@graph'][0];
        expect(node['position']).toBe(positions[positions.length - 1]);
      }
    }
    expect(positions).toHaveLength(COURSE_LESSON_COUNT);
    expect(new Set(positions).size).toBe(COURSE_LESSON_COUNT);
    expect(Math.min(...positions)).toBe(1);
    expect(Math.max(...positions)).toBe(COURSE_LESSON_COUNT);
  });

  it('every lesson URL matches the sitemap scheme exactly', () => {
    for (const mod of aghoriCourse) {
      for (const l of mod.lessons) {
        const node = courseLessonJsonLd(mod, l)['@graph'][0];
        expect(node['url']).toBe(`${SITE_URL}/aghori-tantra/${mod.id}/${l.id}`);
      }
    }
  });
});
