//"use server"
import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { count } from "drizzle-orm";

export async function countGames() {
  const result = await db.select({ count: count() }).from(games);
  return result[0]?.count || 0;
}