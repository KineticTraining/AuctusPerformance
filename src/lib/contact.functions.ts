import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(255),
  goal: z.string().trim().min(2, "Select or describe your primary training goal").max(120),
  message: z
    .string()
    .trim()
    .min(10, "Share a few details about your goals (min 10 characters)")
    .max(2000),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;

export interface StoredInquiry extends ContactInquiryInput {
  id: string;
  submittedAt: string;
}

const INQUIRY_STORE_KEY = "__kinetic_contact_inquiries__";

function getInquiryStore(): StoredInquiry[] {
  const g = globalThis as Record<string, unknown>;
  if (!Array.isArray(g[INQUIRY_STORE_KEY])) {
    g[INQUIRY_STORE_KEY] = [];
  }
  return g[INQUIRY_STORE_KEY] as StoredInquiry[];
}

export const submitContactInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactInquirySchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; referenceId: string; submittedAt: string }> => {
    const referenceId = `KIN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const submittedAt = new Date().toISOString();
    const record: StoredInquiry = {
      ...data,
      id: referenceId,
      submittedAt,
    };
    const store = getInquiryStore();
    store.unshift(record);
    if (store.length > 200) store.length = 200;
    return { ok: true, referenceId, submittedAt };
  });
