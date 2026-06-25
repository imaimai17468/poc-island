import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { GalleryGrid } from "@/components/features/gallery/GalleryGrid";
import { listServicesFn } from "@/server/fn/services";

const POLL_INTERVAL_MS = 5000;

export const Route = createFileRoute("/")({
  loader: async () => {
    const services = await listServicesFn();
    return { services };
  },
  component: IndexComponent,
});

function IndexComponent() {
  const { services } = Route.useLoaderData();
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      void router.invalidate();
    }, POLL_INTERVAL_MS);
    return () => {
      clearInterval(id);
    };
  }, [router]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl">Gallery</h1>
        <p className="text-muted-foreground mt-2">Generated services</p>
      </div>
      <GalleryGrid services={services} />
    </div>
  );
}
