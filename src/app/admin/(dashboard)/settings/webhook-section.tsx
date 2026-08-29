"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { getWebhooks, createWebhook, toggleWebhook, deleteWebhook, testWebhook } from "./webhook-actions";

interface Webhook {
  id: string;
  url: string;
  events: string;
  active: boolean;
  secret: string | null;
  lastTriggeredAt: string | null;
  lastStatus: string | null;
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

export function WebhookSection() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  const loadWebhooks = useCallback(async () => {
    const data = await getWebhooks();
    setWebhooks(data as Webhook[]);
  }, []);

  // Initial fetch: setState happens in an async continuation, never
  // synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;
    getWebhooks().then((data) => {
      if (!cancelled) setWebhooks(data as Webhook[]);
    });
    return () => { cancelled = true; };
  }, []);

  const toggleEvent = (ev: string) => {
    setEvents(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  const handleSave = () => {
    if (!url || events.length === 0) return;
    startTransition(async () => {
      await createWebhook({ url, events });
      setUrl("");
      setEvents([]);
      setShowForm(false);
      await loadWebhooks();
    });
  };

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      await toggleWebhook(id, !active);
      await loadWebhooks();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    startTransition(async () => {
      await deleteWebhook(id);
      await loadWebhooks();
    });
  };

  const handleTest = (id: string) => {
    startTransition(async () => {
      try {
        const result = await testWebhook(id);
        setTestResult(prev => ({ ...prev, [id]: `Status ${result.status} - ${result.ok ? 'OK' : 'Failed'}` }));
      } catch {
        setTestResult(prev => ({ ...prev, [id]: 'Delivery failed' }));
      }
    });
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
            disabled={!url || events.length === 0 || pending}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-500 disabled:opacity-50"
          >
            {pending ? 'Saving...' : 'Save Webhook'}
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
          {webhooks.map(wh => {
            const eventsList: string[] = JSON.parse(wh.events);
            return (
              <div key={wh.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <button
                  onClick={() => handleToggle(wh.id, wh.active)}
                  className={`h-3 w-3 rounded-full transition ${wh.active ? 'bg-emerald-400' : 'bg-zinc-700'}`}
                  aria-label={wh.active ? 'Disable' : 'Enable'}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-300 truncate font-mono">{wh.url}</p>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {eventsList.map(ev => (
                      <span key={ev} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                        {ev.split('.').pop()}
                      </span>
                    ))}
                  </div>
                  {wh.lastStatus && (
                    <p className="mt-1 text-[10px] text-zinc-600">
                      Last: {wh.lastStatus} {wh.lastTriggeredAt ? `at ${new Date(wh.lastTriggeredAt).toLocaleTimeString()}` : ''}
                    </p>
                  )}
                  {testResult[wh.id] && (
                    <p className={`mt-0.5 text-[10px] ${testResult[wh.id].includes('OK') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {testResult[wh.id]}
                    </p>
                  )}
                </div>
                <button onClick={() => handleTest(wh.id)} disabled={pending} className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">
                  Test
                </button>
                <button onClick={() => handleDelete(wh.id)} disabled={pending} className="text-xs text-zinc-600 hover:text-red-400 transition">
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}