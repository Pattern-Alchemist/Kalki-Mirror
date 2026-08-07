"use server";

import { db } from "@/lib/db";

export async function submitConsultation(formData: {
  name: string;
  whatsapp: string;
  message: string;
}) {
  // Basic server-side validation
  const name = (formData.name || "").trim().slice(0, 200);
  const whatsapp = (formData.whatsapp || "").trim().slice(0, 30);
  const message = (formData.message || "").trim().slice(0, 5000);

  if (!name || name.length < 2) {
    return { success: false, error: "Name is required." };
  }

  if (!whatsapp || whatsapp.length < 7) {
    return { success: false, error: "A valid WhatsApp number is required." };
  }

  if (!message || message.length < 10) {
    return { success: false, error: "Please describe your pattern (at least 10 characters)." };
  }

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
