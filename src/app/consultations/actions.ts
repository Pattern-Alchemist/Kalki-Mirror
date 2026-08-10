"use server";

import { db } from "@/lib/db";
import { z } from "zod";

const consultationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(200, "Name too long."),
  whatsapp: z.string().min(7, "A valid WhatsApp number is required.").max(30, "Number too long."),
  message: z.string().min(10, "Please describe your pattern (at least 10 characters).").max(5000, "Message too long."),
});

export async function submitConsultation(formData: {
  name: string;
  whatsapp: string;
  message: string;
}) {
  const parsed = consultationSchema.safeParse({
    name: (formData.name || "").trim(),
    whatsapp: (formData.whatsapp || "").trim(),
    message: (formData.message || "").trim(),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, whatsapp, message } = parsed.data;

  try {
    await db.consultation.create({
      data: {
        name,
        phone: whatsapp,
        email: "",
        request: message,
        status: "NEW",
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to submit. Please try again." };
  }
}
