import { z } from "zod";

export const createGameSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  cover_url: z.string().url().min(1, { message: "Cover is required" }),
  genres: z.array(z.string()),
  download_links: z.array(
    z.object({ link: z.string().url(), label: z.string() })
  ),
  description: z.string().min(1, { message: "Description is required" }),
  platform: z.string().min(1, { message: "Platform is required" }),
  requeriments: z
    .string()
    .min(1, { message: "Requeriments are required" })
    .optional(),
});