import { execSync } from "node:child_process";

const DB_NAME = "poc-island-db";

const seeds = [
  {
    id: "demo-counter",
    name: "Click Counter",
    prompt: "A simple click counter app with increment/decrement buttons",
    description: "Minimal counter app with a clean UI",
    url: "http://localhost:3001",
    status: "deployed",
    created_at: Math.floor(Date.now() / 1000),
  },
  {
    id: "demo-todo",
    name: "Mini TODO",
    prompt: "A todo list app that stores items in memory",
    description: "Simple TODO app with add/remove functionality",
    url: "http://localhost:3002",
    status: "deployed",
    created_at: Math.floor(Date.now() / 1000),
  },
  {
    id: "demo-timer",
    name: "Pomodoro Timer",
    prompt: "A pomodoro timer with start/pause/reset",
    description: "25-minute focus timer with break intervals",
    url: "http://localhost:3003",
    status: "deployed",
    created_at: Math.floor(Date.now() / 1000),
  },
];

for (const seed of seeds) {
  const sql = `INSERT OR IGNORE INTO services (id, name, prompt, description, url, status, created_at) VALUES ('${seed.id}', '${seed.name}', '${seed.prompt}', '${seed.description}', '${seed.url}', '${seed.status}', ${seed.created_at});`;

  console.log(`  Seeding: ${seed.name}`);
  execSync(`wrangler d1 execute "${DB_NAME}" --local --command="${sql}"`, {
    stdio: "inherit",
  });
}

console.log("Seed complete.");
