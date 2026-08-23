(function () {
  const config = window.PANKA_PUSH_CONFIG || {};
  let syncing = false;
  let lastPayload = "";

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function base64UrlToBytes(value) {
    const padding = "=".repeat((4 - value.length % 4) % 4);
    const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, (character) => character.charCodeAt(0));
  }

  function currentSettings() {
    const notifications = readJson("panka_notif", {});
    const custom = readJson("panka_usersettings", {});
    return {
      ...notifications,
      recordFrequency: custom.recordFrequency || "daily",
      recordDays: custom.recordDays || [1, 3, 5],
    };
  }

  async function syncPushSubscription(force) {
    if (syncing || !config.workerUrl || !("Notification" in window) || Notification.permission !== "granted") return false;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    syncing = true;
    try {
      const workerUrl = config.workerUrl.replace(/\/$/, "");
      const registration = await navigator.serviceWorker.ready;
      const keyResponse = await fetch(`${workerUrl}/vapid-public-key`, { mode: "cors" });
      if (!keyResponse.ok) throw new Error(`VAPID key: ${keyResponse.status}`);
      const { publicKey } = await keyResponse.json();
      if (!publicKey) throw new Error("VAPID公開鍵が設定されていません");
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToBytes(publicKey),
        });
      }
      const payload = JSON.stringify({
        subscription: subscription.toJSON(),
        settings: currentSettings(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo",
      });
      if (!force && payload === lastPayload) return true;
      const response = await fetch(`${workerUrl}/subscribe`, {
        method: "POST",
        mode: "cors",
        headers: { "content-type": "application/json" },
        body: payload,
      });
      if (!response.ok) throw new Error(`購読登録: ${response.status}`);
      lastPayload = payload;
      localStorage.setItem("panka_push_status", JSON.stringify({ ok: true, syncedAt: new Date().toISOString() }));
      return true;
    } catch (error) {
      localStorage.setItem("panka_push_status", JSON.stringify({ ok: false, error: String(error), syncedAt: new Date().toISOString() }));
      console.error("[PANKA Push]", error);
      return false;
    } finally {
      syncing = false;
    }
  }

  window.PANKA_PUSH = {
    sync: () => syncPushSubscription(true),
    supported: () => "serviceWorker" in navigator && "PushManager" in window,
    configured: () => Boolean(config.workerUrl),
  };

  window.addEventListener("load", () => syncPushSubscription(true));
  window.addEventListener("storage", () => syncPushSubscription(true));
  document.addEventListener("click", (event) => {
    if (event.target?.textContent?.includes("通知を許可する")) setTimeout(() => syncPushSubscription(true), 1200);
  }, true);
  setInterval(() => syncPushSubscription(false), 5000);
})();
