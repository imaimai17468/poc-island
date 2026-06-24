import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/db";
import { services } from "@/lib/drizzle/schema";

export const Route = createFileRoute("/api/services/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const db = getDb();
        const result = await db
          .select()
          .from(services)
          .where(eq(services.id, params.id))
          .limit(1);

        if (!result[0]) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        return Response.json(result[0]);
      },
    },
  },
});
