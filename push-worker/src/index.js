import { buildPushPayload } from "@block65/webcrypto-web-push";

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...headers },
});

function cors(env, request) {
  const origin = request.headers.get("origin") || "";
  return origin === env.ALLOWED_ORIGIN ? {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "Origin",
  } : null;
}

async function subscriptionKey(endpoint) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
  return `subscription:${Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

function validSubscription(subscription) {
  if (!subscription || typeof subscription.endpoint !== "string" || subscription.endpoint.length > 2048) return false;
  if (!subscription.keys?.p256dh || !subscription.keys?.auth) return false;
  try { return new URL(subscription.endpoint).protocol === "https:"; } catch { return false; }
}

function sanitizeSettings(settings = {}) {
  const hour = (value, fallback) => Number.isInteger(value) && value >= 0 && value <= 23 ? value : fallback;
  const minute = (value) => Number.isInteger(value) && value >= 0 && value <= 59 ? value : 0;
  return {
    dailyEnabled: settings.dailyEnabled === true,
    dailyHour: hour(settings.dailyHour, 21),
    dailyMinute: minute(settings.dailyMinute),
    weeklyEnabled: settings.weeklyEnabled === true,
    weeklyDay: Number.isInteger(settings.weeklyDay) && settings.weeklyDay >= 0 && settings.weeklyDay <= 6 ? settings.weeklyDay : 0,
    weeklyHour: hour(settings.weeklyHour, 21),
    weeklyMinute: minute(settings.weeklyMinute),
    recordFrequency: settings.recordFrequency === "3perweek" ? "3perweek" : "daily",
    recordDays: Array.isArray(settings.recordDays)
      ? settings.recordDays.filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
      : [1, 3, 5],
  };
}

function localParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(value("weekday")),
    hour: Number(value("hour")), minute: Number(value("minute")),
  };
}

async function sendPush(env, entry, notification) {
  const init = await buildPushPayload(
    { data: JSON.stringify(notification), options: { ttl: 300 } },
    entry.subscription,
    { subject: env.VAPID_SUBJECT, publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY },
  );
  return fetch(entry.subscription.endpoint, init);
}

async function processSubscriptions(env, now = new Date()) {
  let cursor;
  do {
    const page = await env.PUSH_SUBSCRIPTIONS.list({ prefix: "subscription:", cursor });
    for (const key of page.keys) {
      const entry = await env.PUSH_SUBSCRIPTIONS.get(key.name, "json");
      if (!entry?.subscription || !entry?.settings) continue;
      let local;
      try { local = localParts(now, entry.timeZone || "Asia/Tokyo"); } catch { local = localParts(now, "Asia/Tokyo"); }
      const settings = entry.settings;
      const dailyDayAllowed = settings.recordFrequency !== "3perweek" || settings.recordDays.includes(local.weekday);
      const dailyDue = settings.dailyEnabled && dailyDayAllowed && local.hour === settings.dailyHour && local.minute === settings.dailyMinute && entry.lastDaily !== local.date;
      const weeklyDue = settings.weeklyEnabled && local.weekday === settings.weeklyDay && local.hour === settings.weeklyHour && local.minute === settings.weeklyMinute && entry.lastWeekly !== local.date;
      if (!dailyDue && !weeklyDue) continue;
      const notification = dailyDue
        ? { title: "PANKA PACE", body: "今日の記録をつけましょう 📝", url: env.APP_URL, tag: "panka-daily" }
        : { title: "PANKA PACE", body: "今週の振り返りをしましょう 📈", url: env.APP_URL, tag: "panka-weekly" };
      try {
        const response = await sendPush(env, entry, notification);
        if (response.status === 404 || response.status === 410) await env.PUSH_SUBSCRIPTIONS.delete(key.name);
        else if (response.ok) {
          if (dailyDue) entry.lastDaily = local.date;
          if (weeklyDue) entry.lastWeekly = local.date;
          await env.PUSH_SUBSCRIPTIONS.put(key.name, JSON.stringify(entry));
        } else {
          console.error(JSON.stringify({ event: "push_failed", status: response.status, key: key.name }));
        }
      } catch (error) {
        console.error(JSON.stringify({ event: "push_error", message: String(error), key: key.name }));
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
}

export default {
  async fetch(request, env) {
    const headers = cors(env, request);
    if (!headers) return json({ error: "origin_not_allowed" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/vapid-public-key") return json({ publicKey: env.VAPID_PUBLIC_KEY }, 200, headers);
    if (request.method === "POST" && url.pathname === "/subscribe") {
      if (Number(request.headers.get("content-length") || 0) > 16_384) return json({ error: "payload_too_large" }, 413, headers);
      const body = await request.json();
      if (!validSubscription(body.subscription)) return json({ error: "invalid_subscription" }, 400, headers);
      const timeZone = typeof body.timeZone === "string" && body.timeZone.length <= 64 ? body.timeZone : "Asia/Tokyo";
      try { new Intl.DateTimeFormat("en-US", { timeZone }).format(); } catch { return json({ error: "invalid_timezone" }, 400, headers); }
      const key = await subscriptionKey(body.subscription.endpoint);
      const previous = await env.PUSH_SUBSCRIPTIONS.get(key, "json");
      await env.PUSH_SUBSCRIPTIONS.put(key, JSON.stringify({
        subscription: body.subscription, settings: sanitizeSettings(body.settings), timeZone,
        lastDaily: previous?.lastDaily || null, lastWeekly: previous?.lastWeekly || null,
        updatedAt: new Date().toISOString(),
      }));
      return json({ ok: true }, 201, headers);
    }
    if (request.method === "DELETE" && url.pathname === "/subscribe") {
      const body = await request.json();
      if (!validSubscription(body.subscription)) return json({ error: "invalid_subscription" }, 400, headers);
      await env.PUSH_SUBSCRIPTIONS.delete(await subscriptionKey(body.subscription.endpoint));
      return json({ ok: true }, 200, headers);
    }
    return json({ error: "not_found" }, 404, headers);
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(processSubscriptions(env, new Date(controller.scheduledTime)));
  },
};
