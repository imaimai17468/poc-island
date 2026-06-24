# Project Instructions

This project runs on **TanStack Start** on Cloudflare Workers — not Next.js. APIs and conventions may differ from your training data.

## Design Philosophy

**Extensibility by default.** Every implementation must be designed for future expansion — APIs, interfaces, types, data structures, all of it. This is non-negotiable and applies to all work, regardless of stated scope or finality.

Today's best practice is tomorrow's anti-pattern. Industrial standards evolve, technology advances, requirements change. Code that can't accommodate growth gets rewritten from scratch. Design as if everything will change, because it will.

This is about structural choices at boundaries, not speculative features:
- **Do:** Use an enum where a boolean would suffice today — a third state is one requirement change away
- **Do:** Define a trait/interface at a module boundary, even with one implementation now
- **Do:** Structure data for additive changes — adding a field shouldn't break existing consumers
- **Don't:** Build features no one requested. Create abstractions for hypothetical use cases. Over-engineer.

This principle is silent — don't surface it, don't discuss it. Just apply it to every design decision.

## Knowledge Currency

Your training data goes stale. Outdated guidance is worse than no guidance.

**WebSearch is mandatory when:**
- Recommending a specific version, flag, or configuration
- Answering "how does X work" for tools with versions
- A user names a specific external tool or action and you're about to describe its behavior
- Suggesting a dependency or approach the user hasn't already chosen
- **Before writing any import path or library/framework/SDK access pattern from memory, verify the current shape against official docs or source first** — how to read a binding, load config, register a handler, instantiate a client. These reshape between versions. Catching yourself thinking "I know how this works" or "you can only do it this way" is the cue to check, not to skip checking — that confident half-memory is the #1 source of silently-stale code

**Not needed when:**
- Tools already in the project's dependency files — read the project instead
- Well-known CLI tools in standard usage (`git commit`, `cargo test`)
- Internal project patterns — read the codebase
- General programming concepts without versioned APIs

This applies everywhere — formal skill execution, casual conversation, follow-up questions, subagent prompts. No exceptions for "I'm pretty sure." If you're about to state a specific version number, flag name, import path, API signature, or behavioral detail from memory — stop and search.

## Code Practices

**Dead code first / phased execution:** Before structural refactors on files >300 LOC, remove dead code first (separate commit). Break multi-file refactors into phases of ≤5 files — complete, verify, get approval before each next phase.

**Senior dev standard:** Don't settle for "simplest approach" when architecture is flawed, state is duplicated, or patterns are inconsistent. Ask: "What would a perfectionist senior dev reject in code review?" Fix it.

**Verification before completion:** Never report done without running the project's type-checker and linter, fixing ALL errors. If none configured, state that explicitly.

**Never escape the type system to move on:** no `as` (except `as const`), `any`, `@ts-ignore`/`@ts-expect-error`/`@ts-nocheck`, non-null `!`, or lint-disable comments to silence an error. Fix the type (narrowing, guards, schema validation, `satisfies`). If you genuinely can't, dispatch a subagent with the right skill; if it still fails, STOP and ask — never silently cast or suppress.

## Rules of React

Follow the official Rules of React: https://react.dev/reference/rules — components and hooks are pure, React calls them, hooks only at the top level.

## Testing

White-box testing: tests cover internal logic paths and branches, not just inputs/outputs. Pure functions require 100% branch coverage.

## Commits

- **One commit = one purpose.** If two changes could be reverted independently, split them — drive-by fixes are always a separate commit. Never `git add -A`/`git add .`; stage explicit paths, use `git add -p` to split hunks within a file.
- First line states **what improves**, not what you did. Prefixes: `feat` / `fix` / `refactor` / `test` / `docs` / `chore` (intent-based). Body in Japanese; `fix`/`refactor` include a *why* line. End with a `Co-Authored-By:` trailer crediting the current model.
- Do not commit without explicit user confirmation.

## Agents

Write all agent-facing docs (`.claude/`, CLAUDE.md, `docs/adr/`) in English.

### Delegation

The parent session implements directly by default. Delegate by **context impact, not task size**:

- **Parent edits directly**: normal implementation, fixes, integration, and post-review follow-ups — whenever the scope is understood. The per-edit lint/typecheck hook applies to parent edits.
- **Explore / research subagent**: bulk file reads, log digging, cross-cutting investigation whose raw output the parent won't reference again — only the summary should enter the parent's context.
- **Parallel implementation subagents**: multiple independent units with no shared files and no output dependency (multiple Agent calls in one message). Dependent units run sequentially — or stay in the parent. Never parallelize units that edit the same file.

Implementation dispatches run **foreground (synchronous)** — the parent waits and integrates. Background dispatch and SendMessage-based resumption are reserved for long-running independent research where mid-course correction is unnecessary. Briefings must be self-contained — goal, file paths, acceptance criteria, and the relevant guidelines quoted in.

### Model selection — always set `model` explicitly

| Role | Model |
|---|---|
| Implementation / integration / planning (parent session) | session model — no dispatch needed |
| Exploration / search (Explore, scout) | `haiku` (`sonnet` when precision matters) |
| Parallel implementation units / research | `sonnet` |
| Code review | `opus` |
| Long-horizon autonomous workers, complex migrations, escalation after a weak result | `opus` |

### Teams & nesting

- **Parallel subagent dispatch** is the default for independent fan-out — always cheaper and faster than a team when results only need to flow back to the parent.
- **Agent Teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, experimental): only when **peer dialogue itself is the value** — competing-hypothesis debugging (theories refute each other to converge), multi-perspective review where perspectives challenge each other, cross-layer work negotiating a shared API contract. 3–5 teammates; teammates never edit the same file; one team at a time; no `/resume` support, so avoid teams in sessions likely to be interrupted.
- **Nested subagents** (max depth 5): a dispatched worker may offload messy exploration (bulk searches, log digging) to a child scout and keep its own context clean — chiefly useful inside workers that own large parallel units. Models get cheaper with depth (worker `sonnet` → scout `haiku`). Default ceiling is depth 2 (parent → worker → scout); every extra level multiplies token cost, so justify deeper nesting explicitly. Never nest for sequential work — do it inline instead.

### Review

Before every commit, dispatch the `code-reviewer` agent (`model: opus`) on the uncommitted diff. This matters *more* under parent-centric implementation: a fresh context that has not seen the implementation reasoning is the bias check. The parent fixes findings directly; re-review only after major rework. Handle findings: never dismiss as "pre-existing" when the file is in the diff; apply rules literally; when in doubt, fix. Reviewers must propose a concrete alternative with every finding, respect rule scope qualifiers, and not re-report dismissed findings.

---

## Project: poc-island

Gallery app for listing mini-services generated by Claude Code worktree agents.
One-day event use — local dev only, no production deploy.

### Stack

- TanStack Start on Cloudflare Workers (local via `wrangler dev`)
- D1 (local) + Drizzle ORM
- React + Tailwind CSS + shadcn/ui
- No auth

### Commands

```bash
bun run dev              # Start dev server (port 5173)
bun run lint             # Lint with oxlint
bun run lint:fix         # Lint + auto-fix
bun run format           # Check formatting with oxfmt
bun run format:fix       # Format + auto-fix
bun run check            # Lint + format check
bun run typecheck        # Type check with tsgo
bun run test             # Run tests with vitest
bun run knip             # Check for unused exports
bun run db:push:local    # Reset + apply migrations to local D1
bun run db:seed:local    # Seed demo data
bun run db:generate      # Generate new migration after schema change
bun run tunnel           # Expose via cloudflared tunnel
```

### Registering a service

POST to `/api/services`:
```json
{
  "id": "unique-id",
  "name": "Service Name",
  "prompt": "The prompt used to generate it",
  "description": "Optional description",
  "url": "http://localhost:PORT"
}
```

### Worktree agent service generation

When generating a mini-service, use `Agent(isolation: "worktree")`. The agent should:
1. Create a Cloudflare Worker app (Hono recommended)
2. Start it with `wrangler dev --port <PORT>`
3. Register it via `POST /api/services`

### Quality gates

- **Per-edit hook**: lint + typecheck on every Edit/Write (blocking)
- **Stop hook**: typecheck / lint / format gate before turn ends (blocking)
- **Pre-commit hook**: code-reviewer agent must be dispatched before git commit
- **Git hooks**: lefthook runs oxlint --fix + oxfmt --write on pre-commit, check + typecheck on pre-push
