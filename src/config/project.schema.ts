import { z } from "zod"

export const projectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  cover_image: z.string().url(),

  background_image: z.string().url().optional(),

  primary_color: z.string(),
  secondary_color: z.string(),

  blocks: z.array(
    z.object({
      type: z.enum(["image", "text", "subtitle", "spacer"]),
      url: z.string().optional(),
      content: z.string().optional(),
      size: z.number().optional(),
    }),
  ),
})
