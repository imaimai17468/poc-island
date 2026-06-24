import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/db";
import { services } from "@/lib/drizzle/schema";

export const listServicesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = getDb();
    return db.select().from(services).orderBy(desc(services.createdAt));
  }
);

export const getServiceFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "string") throw new Error("Expected string id");
    return data;
  })
  .handler(async ({ data: id }) => {
    const db = getDb();
    const result = await db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);
    return result[0] ?? null;
  });
