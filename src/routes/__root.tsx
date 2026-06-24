import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { Header } from "@/components/shared/header/Header";
import "@/styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "poc-island" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <p>Page not found</p>,
});

function RootComponent() {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily:
            '"Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", "メイリオ", Meiryo, sans-serif',
        }}
      >
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex w-full flex-1 justify-center px-6 md:px-4">
            <div className="container w-full py-8">
              <Outlet />
            </div>
          </main>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
