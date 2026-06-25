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
- Writing any import path or library/framework/SDK access pattern from memory — verify the current shape against official docs first

**Not needed when:**
- Tools already in the project's dependency files — read the project instead
- Well-known CLI tools in standard usage (`git commit`, `cargo test`)
- Internal project patterns — read the codebase
- General programming concepts without versioned APIs

## Code Practices

**Dead code first / phased execution:** Before structural refactors on files >300 LOC, remove dead code first (separate commit). Break multi-file refactors into phases of ≤5 files — complete, verify, get approval before each next phase.

**Senior dev standard:** Don't settle for "simplest approach" when architecture is flawed, state is duplicated, or patterns are inconsistent. Ask: "What would a perfectionist senior dev reject in code review?" Fix it.

**Never escape the type system to move on:** no `as` (except `as const`), `any`, `@ts-ignore`/`@ts-expect-error`/`@ts-nocheck`, non-null `!`, or lint-disable comments to silence an error. Fix the type (narrowing, guards, schema validation, `satisfies`). If you genuinely can't, dispatch a subagent with the right skill; if it still fails, STOP and ask — never silently cast or suppress.

## Rules of React

See `.claude/rules/react.md` (auto-injected for `**/*.tsx` files). That file is the single source of truth for React purity, hooks, effects, component splitting, and module organization rules.

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

### Nesting

A dispatched worker may offload messy exploration to a child scout to keep its own context clean. Models get cheaper with depth (worker `sonnet` → scout `haiku`). Default ceiling is depth 2 (parent → worker → scout); every extra level multiplies token cost, so justify deeper nesting explicitly. Never nest for sequential work — do it inline instead.

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

### Generating a mini-service

Use the `/generate-service` skill. It automates the full flow: worktree agent spawn → Hono app scaffold → local start → Gallery registration. Never generate a service manually — always go through the skill so port assignment and registration are consistent.

### Quality gates

Enforcement is in `.claude/settings.json` hooks and `lefthook.yml`. Do not duplicate the gate list here — read those files for the current set.
