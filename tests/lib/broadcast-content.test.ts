import { describe, it, expect } from 'vitest';
import {
  buildBroadcast,
  renderBroadcastBody,
  renderBroadcastText,
} from '@/lib/emails/broadcast-content';

/**
 * Vol. 3 #6 — Broadcast content builder.
 *
 * The founder writes plain text; the builder escapes it and renders the
 * same dark serif shell the Doors use. These tests pin the two invariants
 * that matter most for a send-to-everyone path:
 *   1. NOTHING from the compose surface reaches the HTML unescaped,
 *   2. every send carries the signed one-click unsubscribe machinery.
 */
describe('renderBroadcastBody', () => {
  it('splits paragraphs on blank lines', () => {
    const html = renderBroadcastBody('First paragraph.\n\nSecond paragraph.');
    expect(html).toContain('<p');
    expect(html).toContain('First paragraph.');
    expect(html).toContain('Second paragraph.');
    expect((html.match(/<p /g) ?? []).length).toBe(2);
  });

  it('renders "- " lines as a bullet list', () => {
    const html = renderBroadcastBody('Intro.\n\n- one\n- two\n\nOutro.');
    expect(html).toContain('<ul');
    expect(html).toContain('<li');
    expect(html).toContain('one');
    expect(html).toContain('two');
  });

  it('renders "## " lines as small-caps section labels', () => {
    const html = renderBroadcastBody('## A Section');
    expect(html).toContain('text-transform:uppercase');
    expect(html).toContain('A Section');
  });

  it('escapes HTML-significant characters — no injection path', () => {
    const malicious = 'Hello <script>alert("x")</script> & <b>bold</b>';
    const html = renderBroadcastBody(malicious);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>bold</b>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
  });
});

describe('renderBroadcastText', () => {
  it('mirrors the structure without markup', () => {
    const text = renderBroadcastText('Para one.\n\n- bullet\n## Label');
    expect(text).toContain('Para one.');
    expect(text).toContain('• bullet');
    expect(text).toContain('Label');
    expect(text).not.toContain('## ');
    expect(text).not.toContain('- bullet');
  });
});

describe('buildBroadcast', () => {
  const email = 'reader@example.com';

  it('wraps the body in the dark serif shell with signature and footer', () => {
    const built = buildBroadcast('A letter', 'Hello there, this is the body.', email);
    expect(built.html).toContain('Georgia');
    expect(built.html).toContain('— Kaustubh');
    expect(built.html).toContain('astrokalki.com');
  });

  it('carries the per-recipient signed unsubscribe link and RFC 8058 headers', () => {
    const built = buildBroadcast('A letter', 'Hello there, this is the body.', email);
    expect(built.html).toContain('Unsubscribe');
    expect(built.html).toContain(encodeURIComponent(email));
    expect(built.headers['List-Unsubscribe']).toContain(email.toLowerCase().replace('@', '%40'));
    expect(built.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });

  it('escapes the subject in the HTML title', () => {
    const built = buildBroadcast('<script>x</script>', 'Hello there, this is the body.', email);
    expect(built.html).not.toContain('<title><script>');
    expect(built.subject).toBe('<script>x</script>');
  });

  it('keeps subject verbatim for the Resend API (subject is a header field, not HTML)', () => {
    const built = buildBroadcast('Doors open — updates inside', 'Hello there, this is the body.', email);
    expect(built.subject).toBe('Doors open — updates inside');
  });
});
