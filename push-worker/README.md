# PANKA PACE Web Push

このWorkerは5分ごとに予定を確認し、PWAが閉じていても通知を送ります。

1. `npm install`
2. `npx wrangler login`
3. `npx wrangler kv namespace create PUSH_SUBSCRIPTIONS`
4. KV IDを`wrangler.jsonc`へ設定
5. `ALLOWED_ORIGIN`、`APP_URL`、`VAPID_SUBJECT`を設定
6. URL-safe Base64形式のP-256 VAPID鍵を生成
7. `npx wrangler secret put VAPID_PRIVATE_KEY`
8. `npx wrangler secret put VAPID_PUBLIC_KEY`
9. `npm run check`
10. `npm run deploy`
11. Worker URLをアプリの`push-config.js`へ設定

VAPID秘密鍵をGitや`push-config.js`へ記載しないでください。
