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

  async function diagnose() {
    const result = {
      checkedAt: new Date().toISOString(),
      workerConfigured: Boolean(config.workerUrl),
      notificationSupported: "Notification" in window,
      permission: "Notification" in window ? Notification.permission : "unsupported",
      serviceWorkerSupported: "serviceWorker" in navigator,
      pushSupported: "PushManager" in window,
      serviceWorkerActive: false,
      subscriptionPresent: false,
      subscriptionSynced: readJson("panka_push_status", null),
      worker: null,
      error: null,
    };
    try {
      if (result.serviceWorkerSupported) {
        const registration = await navigator.serviceWorker.ready;
        result.serviceWorkerActive = Boolean(registration.active);
        if (result.pushSupported) result.subscriptionPresent = Boolean(await registration.pushManager.getSubscription());
      }
      if (config.workerUrl) {
        const response = await fetch(`${config.workerUrl.replace(/\/$/, "")}/debug/status`, { mode: "cors" });
        result.worker = { httpStatus: response.status, ...(await response.json()) };
      }
    } catch (error) {
      result.error = String(error);
    }
    return result;
  }

  async function testNotification() {
    await syncPushSubscription(true);
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) throw new Error("端末のPush購読がありません。先に通知を許可してください");
    const response = await fetch(`${config.workerUrl.replace(/\/$/, "")}/debug/test-push`, {
      method: "POST",
      mode: "cors",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(`${response.status}: ${body.error || body.message || "test failed"}`);
    return body;
  }

  function installDebugPanel() {
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (new URLSearchParams(location.search).get("notificationDebug") !== "1" && !standalone) return;
    const button = document.createElement("button");
    button.textContent = "🔔 通知診断";
    button.style.cssText = "position:fixed;right:12px;bottom:90px;z-index:99998;padding:12px 16px;border:0;border-radius:999px;background:#1d2b3e;color:white;font-weight:700;box-shadow:0 4px 16px #0003";
    const panel = document.createElement("div");
    panel.style.cssText = "display:none;position:fixed;inset:8% 12px auto;max-height:78vh;overflow:auto;z-index:99999;padding:18px;border-radius:16px;background:white;color:#17263a;box-shadow:0 8px 32px #0005;font:14px/1.6 system-ui";
    panel.innerHTML = '<div style="font-size:18px;font-weight:700;margin-bottom:10px">通知診断</div><div data-result>確認中...</div><div style="display:flex;gap:8px;margin-top:14px"><button data-refresh>再診断</button><button data-test>今すぐテスト通知</button><button data-close>閉じる</button></div>';
    const result = panel.querySelector("[data-result]");
    const render = async () => {
      result.textContent = "確認中...";
      const data = await diagnose();
      const rows = [
        ["通知権限", data.permission === "granted", data.permission],
        ["Service Worker", data.serviceWorkerActive, data.serviceWorkerActive ? "稼働中" : "未稼働"],
        ["端末のPush購読", data.subscriptionPresent, data.subscriptionPresent ? "登録済み" : "未登録"],
        ["Worker接続", data.worker?.httpStatus === 200, data.worker?.httpStatus || data.error || "未接続"],
        ["VAPID公開鍵", data.worker?.publicKeyConfigured, data.worker?.publicKeyConfigured ? "設定済み" : "未設定"],
        ["VAPID秘密鍵", data.worker?.privateKeyConfigured, data.worker?.privateKeyConfigured ? "設定済み" : "未設定"],
        ["VAPID連絡先", data.worker?.vapidSubjectValid, data.worker?.vapidSubjectValid ? "正常" : "不正"],
        ["KV", data.worker?.kvConfigured, data.worker?.kvConfigured ? "接続済み" : "未接続"],
        ["Cron最終実行", Boolean(data.worker?.lastCronRun), data.worker?.lastCronRun?.ranAt || "実行記録なし"],
      ];
      result.innerHTML = rows.map(([name, ok, detail]) => `<div style="padding:6px 0;border-bottom:1px solid #e5e9ef"><b>${ok ? "✅" : "❌"} ${name}</b><br><span style="color:#61728a">${String(detail)}</span></div>`).join("");
    };
    button.onclick = () => { panel.style.display = "block"; render(); };
    panel.querySelector("[data-close]").onclick = () => { panel.style.display = "none"; };
    panel.querySelector("[data-refresh]").onclick = render;
    panel.querySelector("[data-test]").onclick = async (event) => {
      event.currentTarget.disabled = true;
      try { await testNotification(); alert("テスト通知を送信しました"); }
      catch (error) { alert(`テスト失敗: ${error}`); }
      finally { event.currentTarget.disabled = false; render(); }
    };
    document.body.append(button, panel);
  }

  window.PANKA_PUSH = {
    sync: () => syncPushSubscription(true),
    supported: () => "serviceWorker" in navigator && "PushManager" in window,
    configured: () => Boolean(config.workerUrl),
    diagnose,
    testNotification,
  };

  window.addEventListener("load", () => { syncPushSubscription(true); installDebugPanel(); });
  window.addEventListener("storage", () => syncPushSubscription(true));
  document.addEventListener("click", (event) => {
    if (event.target?.textContent?.includes("通知を許可する")) setTimeout(() => syncPushSubscription(true), 1200);
  }, true);
  setInterval(() => syncPushSubscription(false), 5000);
})();
