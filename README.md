# poc-island

1日限りのイベント用システム。プロンプトからミニサービスを「その場で作って、公開して、一覧できる」。

## Architecture

```
[外部入力] --> [ローカル Claude Code]
                      |
            Agent(isolation: "worktree")
            ・worktree内でミニアプリ生成
            ・wrangler dev --port <PORT>
                      |
            cloudflared tunnel で公開
                      |
            [Gallery D1 に URL 登録]
```

- **Gallery App** — TanStack Start on Cloudflare Workers。生成されたサービスの一覧・プレビュー
- **Service Generation** — Claude Code の worktree agent がミニアプリを生成・起動
- **Publishing** — `cloudflared tunnel` でローカルサーバーを公開。デプロイ不要

## Tech Stack

- [TanStack Start](https://tanstack.com/start) + React
- [Cloudflare Workers](https://workers.cloudflare.com/) + D1 (local)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [oxlint](https://oxc.rs/) + [oxfmt](https://oxc.rs/) + [tsgo](https://github.com/nicolo-ribaudo/tc39-proposal-type-annotations)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

## Setup

```bash
bun install
bun run db:push:local    # ローカル D1 をセットアップ
bun run db:seed:local    # デモデータ投入（任意）
bun run dev              # http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | 開発サーバー起動 |
| `bun run lint` | oxlint でリント |
| `bun run format` | oxfmt でフォーマットチェック |
| `bun run check` | lint + format |
| `bun run typecheck` | tsgo で型チェック |
| `bun run test` | vitest でテスト実行 |
| `bun run tunnel` | cloudflared tunnel で公開 |
| `bun run db:push:local` | ローカル D1 リセット + マイグレーション適用 |
| `bun run db:seed:local` | デモデータ投入 |
| `bun run db:generate` | スキーマ変更後にマイグレーション生成 |

## API

### `GET /api/services`

サービス一覧を取得。

### `POST /api/services`

サービスを登録。

```json
{
  "id": "unique-id",
  "name": "Service Name",
  "prompt": "The prompt used to generate it",
  "description": "Optional description",
  "url": "http://localhost:PORT"
}
```

### `GET /api/services/:id`

サービス詳細を取得。

## Pages

| Route | Description |
|-------|-------------|
| `/` | サービス一覧（カードグリッド） |
| `/services/:id` | サービス詳細 + iframe プレビュー |

## License

MIT
