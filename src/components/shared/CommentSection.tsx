
"use client";

import { useFormStatus } from "react-dom";
import { submitComment, CommentState } from "@/server/actions/comments.actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { MessageSquare, User } from "lucide-react";

interface Comment {
    id: string;
    name: string;
    content: string;
    createdAt: Date;
}

interface CommentSectionProps {
    postId: string;
    existingComments: Comment[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Mengirim..." : "Kirim Komentar"}
        </Button>
    );
}

export function CommentSection({ postId, existingComments }: CommentSectionProps) {
    // Bind the postId to the action
    const submitCommentWithId = submitComment.bind(null, postId);
    const [state, formAction] = useActionState(submitCommentWithId, {} as CommentState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
            formRef.current?.reset();
        } else if (state.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="space-y-8 py-8">
            <div className="flex items-center gap-2 text-2xl font-bold">
                <MessageSquare className="h-6 w-6" />
                <h2>Komentar ({existingComments.length})</h2>
            </div>

            {/* Comment List */}
            <div className="space-y-6">
                {existingComments.length === 0 ? (
                    <p className="text-muted-foreground italic">Belum ada komentar. Jadilah yang pertama!</p>
                ) : (
                    existingComments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <Avatar className="h-10 w-10 border">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {comment.name.substring(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm">{comment.name}</h4>
                                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: idLocale })}
                                    </span>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-lg text-sm text-foreground/90 whitespace-pre-wrap">
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Form */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Tulis Komentar</h3>
                    <form action={formAction} ref={formRef} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="name" placeholder="Nama Anda (Wajib)" required />
                            <Input name="email" type="email" placeholder="Email (Opsional)" />
                        </div>
                        <Textarea name="content" placeholder="Tulis komentar anda disini..." className="min-h-[100px]" required />
                        <div className="flex justify-end">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
