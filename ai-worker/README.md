# BlueDot AI Chat — backend

This is a tiny Cloudflare Worker whose only job is to hold your Anthropic
API key in secret and relay chat requests from the BlueDot app to Claude.
It doesn't store any of the app's historical data itself — the app sends
it fresh with every request, so this backend never needs to be redeployed
when you add civilizations, wars, routes, etc. in `app/index.jsx`.

## 1. Get an Anthropic API key

1. Go to https://console.anthropic.com and sign up / log in.
2. Create an API key (Settings → API Keys → Create Key).
3. Add a small amount of credit to the account (Billing) — a few dollars
   is plenty to test with. Each question costs roughly $0.01-0.02 with the
   default model.
4. Copy the key (starts with `sk-ant-...`). You'll paste it in step 3
   below. Keep it secret — never put it in the app itself.

## 2. Install Wrangler and log in to Cloudflare

Run these from inside this `ai-worker` folder:

```bash
npm install
npx wrangler login
```

This opens a browser tab to authorize Wrangler with your Cloudflare
account (free tier is enough — sign up at https://dash.cloudflare.com/sign-up
if you don't have one yet).

## 3. Set your API key as a secret

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

Paste the `sk-ant-...` key when prompted. This stores it encrypted on
Cloudflare's side — it's never written to any file in this project.

## 4. Deploy

```bash
npx wrangler deploy
```

Wrangler will print a URL like:

```
https://bluedot-ai-chat.<your-subdomain>.workers.dev
```

That's your chat endpoint. The app will call `<that-url>/chat`.

## 5. Point the app at it

Open `app/index.jsx` and find:

```js
const AI_CHAT_ENDPOINT = 'https://YOUR-WORKER-URL.workers.dev/chat';
```

Replace it with your real URL + `/chat`, e.g.:

```js
const AI_CHAT_ENDPOINT = 'https://bluedot-ai-chat.yourname.workers.dev/chat';
```

Save, reload the app, tap the chat icon, and ask something.

## Changing the model

By default the Worker uses `claude-haiku-4-5-20251001` (fast, cheap, good
for Q&A). To use a more capable model for deeper reasoning about
relationships between civilizations, edit `wrangler.toml` and uncomment:

```toml
[vars]
MODEL = "claude-sonnet-5"
```

then run `npx wrangler deploy` again. Check
https://platform.claude.com/docs/en/about-claude/models/overview for the
current list of available model IDs and pricing if you want to compare
options.

## Redeploying after code changes

Any time you (or I) edit `ai-worker/src/index.js`, run `npx wrangler
deploy` again from this folder. You do NOT need to redeploy when you only
change data in `app/index.jsx` (civilizations, wars, etc.) — that part
stays in sync automatically.

## Map navigation (navigate_map tool)

The Worker gives the model a `navigate_map` tool: it can propose a year
and, optionally, a civilization/war/route/etc. to open -- e.g. asking
"take me to the fall of Constantinople" gets a tappable suggestion under
the reply, not an automatic jump. The person decides whether to tap it
(and see it on the globe) or keep chatting. The Worker itself doesn't
execute anything; it just forwards the model's request (year + entity) in
the response as `actions`, and the app (`AIChatPanel`'s `onResolveNav` in
`app/index.jsx`) resolves the entity against its own live data just to
show its name on the chip -- the actual navigation (`navigateFromAI`)
only runs if the person taps it. If you ever rename a civilization/war id
in the app's data, nothing here needs to change -- the model always sees
current ids through STRUCTURED DATA on every request.

## Follow-up suggestions (suggest_followups tool)

The Worker also gives the model a `suggest_followups` tool: after most
replies it proposes 2-3 natural next questions (a related event, what
else was happening elsewhere at the same time, an unexplored cause or
consequence, etc.), returned in the response as `followups`. The app
renders these as tappable chips under the reply, reusing the same chip UI
already used for the initial per-card quick-question suggestions -- so
the conversation never has to dead-end with nothing to tap.

## Notes on the freemium / usage-limit layer

This version has no usage limits or payments wired up yet — anyone who
has your Worker URL and knows the request shape could send it requests
and spend your API credit. That's fine for testing with just yourself,
but before sharing this build publicly you'll want to add at minimum a
per-device daily quota (Cloudflare Workers KV or Durable Objects) and,
for a real paid tier, RevenueCat + native in-app purchases (required by
the App Store / Play Store for digital content unlocked inside the app).
Ask me when you're ready for that piece and we'll add it as a next step.
