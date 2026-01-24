
"use client";

import { useActionState } from "react";
import { submitContactMessage, ContactState } from "@/server/actions/contact.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const initialState: ContactState = {};

function SubmitButton() {
    // import { useFormStatus } from "react-dom"; // Need this for loading state
    // but React 19 / Next 14/15 uses useActionState's pending often or we use useFormStatus hook inside a child
    return <PendingButton />;
}

import { useFormStatus } from "react-dom";

function PendingButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                </>
            ) : (
                <>
                    <Send className="mr-2 h-4 w-4" />
                    Kirim Pesan
                </>
            )}
        </Button>
    );
}

export function ContactForm() {
    const [state, formAction] = useActionState(submitContactMessage, initialState);
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
        <form action={formAction} ref={formRef} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="subject">Subjek</Label>
                <Input id="subject" name="subject" placeholder="Tujuan pesan anda" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Pesan</Label>
                <Textarea id="message" name="message" placeholder="Tulis pesan anda di sini..." className="min-h-[150px]" required />
            </div>
            
            <PendingButton />
        </form>
    );
}
