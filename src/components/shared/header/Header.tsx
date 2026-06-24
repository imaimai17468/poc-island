import { Link } from "@tanstack/react-router";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b bg-background backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        <Link to="/" className="font-bold text-lg">
          poc-island
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Gallery
          </Link>
        </nav>
      </div>
    </header>
  );
};
