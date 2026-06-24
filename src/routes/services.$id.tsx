import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceFn } from "@/server/fn/services";

export const Route = createFileRoute("/services/$id")({
  loader: async ({ params }) => {
    const service = await getServiceFn({ data: params.id });
    if (!service) throw new Error("Service not found");
    return { service };
  },
  component: ServiceDetailComponent,
});

function ServiceDetailComponent() {
  const { service } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-bold text-2xl">{service.name}</h1>
        {service.description && (
          <p className="text-muted-foreground">{service.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {(service.createdAt instanceof Date
              ? service.createdAt
              : new Date(service.createdAt)
            ).toLocaleDateString("ja-JP")}
          </span>
          <Button variant="link" size="sm" className="h-auto p-0" asChild>
            <a href={service.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              Open in new tab
            </a>
          </Button>
        </div>
      </div>

      <div
        className="rounded-lg border overflow-hidden"
        style={{ height: "70vh" }}
      >
        <iframe
          src={service.url}
          title={service.name}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
