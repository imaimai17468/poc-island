import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteServiceFn, getServiceFn } from "@/server/fn/services";

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
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(() => {
    if (!window.confirm(`"${service.name}" を削除しますか？`)) return;
    setDeleting(true);
    void deleteServiceFn({ data: service.id })
      .then(() => navigate({ to: "/" }))
      .catch((err: unknown) => {
        setDeleting(false);
        window.alert(
          `削除に失敗しました: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      });
  }, [service.id, service.name, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={deleting}
          onClick={handleDelete}
        >
          <Trash2 className="size-4" />
          {deleting ? "Deleting..." : "Delete"}
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
