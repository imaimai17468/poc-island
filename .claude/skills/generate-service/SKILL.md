---
name: generate-service
description: Generate a mini-service from a prompt. Spawns a worktree agent that scaffolds a Hono app on Cloudflare Workers, starts it locally, and registers it in the Gallery. Use this whenever the user wants to create a new mini-service or app — including when they describe an app idea without explicitly invoking this skill.
user_invocable: true
autoTrigger: true
---

# Generate Service

Creates a mini Cloudflare Worker app from a user prompt, starts it locally, and registers it in the Gallery.

## Prerequisites

The Gallery dev server must be running (`bun run dev` in the poc-island root). If it is not running, start it first with `Bash(run_in_background: true)`.

## Steps

### 1. Assign a port

Find the next available port by querying the Gallery API:

```bash
curl -s http://localhost:5173/api/services | jq '[.[].url | capture("localhost:(?<p>[0-9]+)") | .p | tonumber] | max // 3000 | . + 1'
```

If the API returns an empty array, use port `3001`.

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
You are building a mini Cloudflare Worker app. Follow these steps exactly:

1. Delete all existing files in the worktree root (rm -rf src/ *.ts *.tsx *.json *.toml *.css etc.), then create a fresh project:

2. Create package.json:
   {
     "name": "<SERVICE_ID>",
     "type": "module",
     "scripts": { "dev": "wrangler dev --port <PORT>" },
     "dependencies": { "hono": "4.7.10" },
     "devDependencies": { "wrangler": "4.87.0", "@cloudflare/workers-types": "4.20260501.1" }
   }

3. Create wrangler.toml:
   name = "<SERVICE_ID>"
   main = "src/index.ts"
   compatibility_date = "2024-12-01"
   compatibility_flags = ["nodejs_compat"]

4. Create tsconfig.json:
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "esnext",
       "moduleResolution": "bundler",
       "strict": true,
       "jsx": "react-jsx",
       "jsxImportSource": "hono/jsx",
       "types": ["@cloudflare/workers-types"]
     }
   }

5. Create src/index.ts — a Hono app that:
   - Serves HTML with inline CSS at GET /
   - Implements the feature described in the user's prompt
   - Has a clean, modern UI (use Tailwind CSS via CDN <script src="https://cdn.tailwindcss.com"></script>)
   - Is fully functional as a single-file app

6. Run: bun install
7. Verify the app compiles: npx tsc --noEmit (fix any errors)
8. Do NOT start the dev server — the parent will handle that.

Return a JSON summary as your final message:
{"id": "<SERVICE_ID>", "name": "<NAME>", "description": "<one-line description>", "port": <PORT>}
```

### 4. Start the service

After the agent returns, start the service in background from the worktree:

```bash
cd <worktree_path> && bun run dev &
```

Wait a few seconds, then verify it responds:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:<PORT>/
```

### 5. Register in Gallery

POST to the Gallery API:

```bash
curl -s -X POST http://localhost:5173/api/services \
  -H "Content-Type: application/json" \
  -d '{"id":"<ID>","name":"<NAME>","prompt":"<ORIGINAL_PROMPT>","description":"<DESCRIPTION>","url":"http://localhost:<PORT>"}'
```

### 6. Report

Tell the user:
- Service name and description
- URL: `http://localhost:<PORT>`
- Gallery: `http://localhost:5173/services/<ID>`

## Error handling

- If the worktree agent fails, report the error and do not register a broken service.
- If the port is already in use, increment and retry.
- If the Gallery API is unreachable, remind the user to start `bun run dev`.
