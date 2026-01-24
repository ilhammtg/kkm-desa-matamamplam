
"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";

export type CommentState = {
    success?: boolean;
    error?: string;
    message?: string;
};

export async function submitComment(postId: string, prevState: CommentState, formData: FormData): Promise<CommentState> {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const content = formData.get("content") as string;

        if (!name || !content) {
            return { error: "Nama dan Komentar wajib diisi." };
        }

        if (!postId) {
            return { error: "Terjadi kesalahan sistem (Post ID missing)." };
        }

        await prisma.comment.create({
            data: {
                postId,
                name,
                email,
                content,
            },
        });

        revalidatePath(`/artikel/${postId}`); // Revalidate generic paths. Ideally need precise path or revalidate tag
        revalidatePath(`/kegiatan/${postId}`);
        // Can't easily revalidate strict slug path without querying it, but usually standard revalidatePath(pagePath) works if we know it.
        // For now, simple revalidation is fine. Since this is bound to a component, the component can assume revalidation.
        
        return { success: true, message: "Komentar berhasil dikirim." };
    } catch (error) {
        console.error("Failed to submit comment:", error);
        return { error: "Gagal mengirim komentar." };
    }
}

export async function getPostComments(postId: string) {
    try {
        return await prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        return [];
    }
}
