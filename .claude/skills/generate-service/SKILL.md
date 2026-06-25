---
name: generate-service
description: Generate a mini-service from a prompt. Spawns a worktree agent that replaces the index page of a poc-island worktree copy, starts it locally, exposes it via cloudflared tunnel, and registers the public URL in the Gallery. Use this whenever the user wants to create a new mini-service or app — including when they describe an app idea without explicitly invoking this skill.
user_invocable: true
autoTrigger: true
---

# Generate Service

Creates a mini-service by replacing the index page in a poc-island worktree copy, starts it on a local port, exposes it via Cloudflare Tunnel, and registers the public URL in the Gallery.

## Prerequisites

The Gallery dev server must be running (`bun run dev` in the poc-island root). If it is not running, start it first with `Bash(run_in_background: true)`.

`cloudflared` must be installed on the machine.

## Steps

### 1. Assign a port

Find the next available port by querying the Gallery API:

```bash
curl -s http://localhost:5173/api/services | jq '[.[].url | capture(":(?<p>[0-9]+)") | .p | tonumber] | max // 3000 | . + 1'
```

If the API returns an empty array or no ports are found, use port `3001`.

### 2. Generate an ID and name

- **id**: derive from the prompt — kebab-case, max 30 chars (e.g., `click-counter`, `pomodoro-timer`)
- **name**: short human-readable title in English

### 3. Spawn the worktree agent

Dispatch a single `Agent` with `isolation: "worktree"` and `model: "sonnet"`. The agent prompt must be **fully self-contained** — include:

- The user's original prompt describing what to build
- The assigned port number
- The service id and name
- The exact scaffold instructions below

#### Scaffold instructions (include verbatim in the agent prompt)

```
You are building a mini-service inside a TanStack Start project (poc-island worktree). The project is already set up with React, Tailwind CSS, shadcn/ui components, and Cloudflare Workers. You only need to modify the index page.

Follow these steps exactly:

1. Replace src/routes/index.tsx with your mini-app implementation:
   - Import and use existing UI components from @/components/ui/ (Button, Card, etc.)
   - Use Tailwind CSS classes for styling
   - Implement the feature described in the user's prompt
   - The app must be fully functional and interactive
   - Keep it as a single page — do NOT create additional routes

2. Remove files that are not needed for the mini-app to avoid confusion:
   - src/routes/services.$id.tsx
   - src/routes/api/ (entire directory)
   - src/server/fn/services.ts
   - src/components/features/gallery/ (entire directory)
   Keep __root.tsx, the shared components, UI components, and all lib/ files.

3. Update the page title in src/routes/__root.tsx:
   Change { title: "poc-island" } to { title: "<NAME>" }

4. Update the header title in src/components/shared/header/Header.tsx:
   Change "poc-island" to "<NAME>"

5. Change the port in wrangler.toml by adding under [dev]:
   [dev]
   port = <PORT>

6. Run: npx tsr generate
7. Verify: bun run typecheck (fix any errors)
8. Do NOT start the dev server — the parent will handle that.

Return a JSON summary as your final message:
{"id": "<SERVICE_ID>", "name": "<NAME>", "description": "<one-line description>", "port": <PORT>}
```

### 4. Start the service

After the agent returns, start the dev server in background from the worktree:

```bash
cd <worktree_path> && bun run dev &
```

Wait a few seconds, then verify it responds:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:<PORT>/
```

### 5. Start the tunnel

Launch `cloudflared tunnel` in background to get a public URL:

```bash
cloudflared tunnel --url http://localhost:<PORT> 2>&1 &
TUNNEL_PID=$!
```

Wait for the tunnel URL to appear (it prints to stderr). Extract it:

```bash
sleep 5
TUNNEL_URL=$(cloudflared tunnel --url http://localhost:<PORT> 2>&1 & sleep 5 && kill $! 2>/dev/null; wait $! 2>/dev/null)
```

A more reliable approach — start in background and poll the log:

```bash
cloudflared tunnel --url http://localhost:<PORT> > /tmp/tunnel-<ID>.log 2>&1 &
TUNNEL_PID=$!
# Poll for the URL (appears in stderr, redirected to the log)
for i in $(seq 1 15); do
  TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel-<ID>.log 2>/dev/null | head -1)
  if [ -n "$TUNNEL_URL" ]; then break; fi
  sleep 2
done
```

If `TUNNEL_URL` is still empty after 30 seconds, fall back to `http://localhost:<PORT>` and warn the user.

### 6. Register in Gallery

POST to the Gallery API with the **tunnel URL** (not localhost):

```bash
curl -s -X POST http://localhost:5173/api/services \
  -H "Content-Type: application/json" \
  -d '{"id":"<ID>","name":"<NAME>","prompt":"<ORIGINAL_PROMPT>","description":"<DESCRIPTION>","url":"<TUNNEL_URL>"}'
```

### 7. Report

Tell the user:
- Service name and description
- Public URL: `<TUNNEL_URL>` (accessible from other devices)
- Local URL: `http://localhost:<PORT>`
- Gallery: `http://localhost:5173/services/<ID>`

## Error handling

- If the worktree agent fails, report the error and do not register a broken service.
- If the port is already in use, increment and retry.
- If the Gallery API is unreachable, remind the user to start `bun run dev`.
- If `cloudflared` is not installed, fall back to localhost URL and tell the user to install it.
- If the tunnel fails to start, register with localhost URL and warn the user.
