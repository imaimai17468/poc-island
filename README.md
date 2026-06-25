# poc-island

1日限りのイベント用システム。プロンプトからミニサービスを「その場で作って、公開して、一覧できる」。

## Architecture

```
[プロンプト] --> [Claude Code]
                     |
           Agent(isolation: "worktree")
           ・poc-island コピーの index.tsx を差し替え
           ・bun run dev --port <PORT>
                     |
           bunx cloudflared tunnel --url localhost:<PORT>
           → https://xxx.trycloudflare.com
                     |
           [Gallery D1 に公開 URL 登録]
```

- **Gallery App (port 5173)** — TanStack Start on Workers。生成サービスの一覧・iframe プレビュー
- **Mini Apps (port 3001~)** — 各 worktree が独立した TanStack Start アプリとして起動
- **Publishing** — 各ミニアプリに `bunx cloudflared tunnel` で公開 URL を付与。デプロイ不要

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
| `bun run tunnel` | bunx cloudflared tunnel で公開 |
| `bun run db:push:local` | ローカル D1 リセット + マイグレーション適用 |
| `bun run db:seed:local` | デモデータ投入 |
| `bun run db:generate` | スキーマ変更後にマイグレーション生成 |

## Generating a mini-service

Claude Code セッション内でアプリの説明を入力するだけ（`/generate-service` は自動発火）。

```
カウンターアプリを作って
```

自動で以下が実行される:
1. worktree agent が poc-island のコピーで `index.tsx` を差し替え
2. `bun run dev --port <自動採番>` でローカル起動
3. `bunx cloudflared tunnel` で公開 URL を取得
4. Gallery に公開 URL を登録・報告

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

### `DELETE /api/services/:id`

サービスを削除。

## Pages

| Route | Description |
|-------|-------------|
| `/` | サービス一覧（カードグリッド、5秒ごと自動更新） |
| `/services/:id` | サービス詳細 + iframe プレビュー + 削除 |

## License

MIT
