"use client";

import { useState } from "react";

/**
 * A14: Webhook integration panel.
 * Configure outgoing webhooks for Slack/Discord/custom endpoints.
 * Production: wire to a webhooks table in the database.
 */
interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

const EVENT_OPTIONS = [
  { value: 'user.signup', label: 'New User Signup' },
  { value: 'user.tier.change', label: 'Tier Change' },
  { value: 'consultation.new', label: 'New Consultation' },
  { value: 'consultation.status', label: 'Consultation Status Update' },
  { value: 'content.published', label: 'Content Published' },
  { value: 'security.login_failed', label: 'Failed Login Attempt' },
];

// Demo webhooks (replace with DB fetch)
const demoWebhooks: Webhook[] = [];

export function WebhookSection() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(demoWebhooks);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  const toggleEvent = (ev: string) => {
    setEvents(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  const handleSave = () => {
    if (!url || events.length === 0) return;
    const newWebhook: Webhook = {
      id: `wh-${Date.now()}`,
      url,
      events,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setWebhooks(prev => [...prev, newWebhook]);
    setUrl("");
    setEvents([]);
    setShowForm(false);
    // TODO: Call server action to persist
  };

  const toggleActive = (id: string) => {
    setWebhooks(prev =>
      prev.map(w => w.id === id ? { ...w, active: !w.active } : w)
    );
  };

  const remove = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Webhook Integrations</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-700"
        >
          {showForm ? 'Cancel' : '+ Add Webhook'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Endpoint URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Events</label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_OPTIONS.map(ev => (
                <label key={ev.value} className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={events.includes(ev.value)}
                    onChange={() => toggleEvent(ev.value)}
                    className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
                  />
                  {ev.label}
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!url || events.length === 0}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-500 disabled:opacity-50"
          >
            Save Webhook
          </button>
        </div>
      )}

      {webhooks.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center">
          <p className="text-sm text-zinc-600">No webhooks configured.</p>
          <p className="mt-1 text-xs text-zinc-700">Add a webhook to receive real-time notifications to Slack, Discord, or any endpoint.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {webhooks.map(wh => (
            <div key={wh.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              <button
                onClick={() => toggleActive(wh.id)}
                className={`h-3 w-3 rounded-full transition ${wh.active ? 'bg-emerald-400' : 'bg-zinc-700'}`}
                aria-label={wh.active ? 'Disable' : 'Enable'}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-300 truncate font-mono">{wh.url}</p>
                <div className="mt-1 flex gap-1 flex-wrap">
                  {wh.events.map(ev => (
                    <span key={ev} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                      {ev.split('.').pop()}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => remove(wh.id)}
                className="text-xs text-zinc-600 hover:text-red-400 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
