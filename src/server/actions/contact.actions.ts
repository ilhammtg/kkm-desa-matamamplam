
"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";

export type ContactState = {
    success?: boolean;
    error?: string;
    message?: string;
};

export async function submitContactMessage(prevState: ContactState, formData: FormData): Promise<ContactState> {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        if (!name || !email || !subject || !message) {
            return { error: "Semua kolom wajib diisi." };
        }

        await prisma.contactMessage.create({
            data: {
                name,
                email,
                subject,
                message,
            },
        });

        // revalidatePath("/contact"); // Not strictly necessary if we just show success message
        return { success: true, message: "Pesan Anda telah terkirim. Terima kasih telah menghubungi kami." };
    } catch (error) {
        console.error("Failed to submit contact message:", error);
        return { error: "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi." };
    }
}
