import { createFileRoute } from "@tanstack/react-router";
import { GalleryGrid } from "@/components/features/gallery/GalleryGrid";
import { listServicesFn } from "@/server/fn/services";

export const Route = createFileRoute("/")({
  loader: async () => {
    const services = await listServicesFn();
    return { services };
  },
  component: IndexComponent,
});

function IndexComponent() {
  const { services } = Route.useLoaderData();

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
