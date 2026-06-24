import { createFileRoute } from "@tanstack/react-router";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/db";
import { services } from "@/lib/drizzle/schema";

const CreateServiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  prompt: z.string().min(1),
  description: z.string().optional(),
  url: z.string().min(1),
});

export const Route = createFileRoute("/api/services")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDb();
        const rows = await db
          .select()
          .from(services)
          .orderBy(desc(services.createdAt));
        return Response.json(rows);
      },
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = CreateServiceSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Missing required fields: id, name, prompt, url" },
            { status: 400 }
          );
        }
        const { id, name, prompt, description, url } = parsed.data;

        try {
          const db = getDb();
          await db.insert(services).values({
            id,
            name,
            prompt,
            description: description ?? null,
            url,
            status: "deployed",
            createdAt: new Date(),
          });
          return Response.json({ success: true, id }, { status: 201 });
        } catch (e) {
          const fullMessage =
            e instanceof Error
              ? `${e.message} ${e.cause instanceof Error ? e.cause.message : ""}`
              : "Failed to create service";
          const isDuplicate = fullMessage.includes("UNIQUE constraint");
          return Response.json(
            {
              error: isDuplicate
                ? "Service with this ID already exists"
                : "Failed to create service",
            },
            { status: isDuplicate ? 409 : 500 }
          );
        }
      },
    },
  },
});
