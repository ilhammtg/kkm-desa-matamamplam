"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ListManager } from "@/components/dashboard/settings/ListManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const aboutSchema = z.object({
  landingTitle: z.string().nullish(),
  landingContentHtml: z.string().nullish(),
  landingImageUrl: z.string().nullish(),
  
  visionLabel: z.string().nullish(),
  visionTitle: z.string().nullish(),
  visionDescription: z.string().nullish(),
  visionImageUrl: z.string().nullish(),

  missionLabel: z.string().nullish(),
  missionTitle: z.string().nullish(),
  missionSubtitle: z.string().nullish(),
  missionItems: z.array(z.object({
    id: z.string().nullish(),
    title: z.string(),
    description: z.string(),
    icon: z.string().nullish(),
    order: z.number().nullish()
  })).optional(),

  programBadge: z.string().nullish(),
  programTitle: z.string().nullish(),
  programSubtitle: z.string().nullish(),
  programItems: z.array(z.object({
    id: z.string().nullish(),
    title: z.string(),
    description: z.string(),
    href: z.string().nullish(),
    order: z.number().nullish()
  })).optional(),
});

type AboutFormValues = z.infer<typeof aboutSchema>;

export function AboutSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
        missionItems: [],
        programItems: []
    }
  });

  useEffect(() => {
    async function fetchData() {
        try {
            const res = await fetch("/api/settings/about");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            form.reset(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load About settings");
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [form]);

  const onSubmit = async (data: AboutFormValues) => {
    setSaving(true);
    try {
        const res = await fetch("/api/settings/about", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
        if (!res.ok) throw new Error("Failed to update");
        
        const updated = await res.json();
        // Keep the form data but update with server response if needed
        // form.reset(updated); 
        toast.success("About settings updated!");
    } catch (error) {
        console.error("Submit Error:", error);
        toast.error("Failed to save changes");
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
      return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>About Us Page</CardTitle>
                <CardDescription>Content for the "About Us" section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* LANDING SECTION */}
                <div className="border-b pb-4 mb-4 space-y-4">
                    <h3 className="font-semibold text-lg">Landing Page Section</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="landingTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="landingImageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Landing Image</FormLabel>
                                    <FormControl>
                                        <ImageUpload 
                                            value={field.value || ""} 
                                            onChange={(url) => field.onChange(url)} 
                                            disabled={saving} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="landingContentHtml"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content (HTML)</FormLabel>
                                <FormControl>
                                    <RichTextEditor content={field.value || ""} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* VISION SECTION */}
                <div className="border-b pb-4 mb-4 space-y-4">
                     <h3 className="font-semibold text-lg">Vision Section</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="visionLabel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label (e.g. VISI KAMI)</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="visionTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vision Title</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="visionDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="visionImageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vision Image</FormLabel>
                                <FormControl>
                                    <ImageUpload 
                                        value={field.value || ""} 
                                        onChange={(url) => field.onChange(url)} 
                                        disabled={saving} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* MISSION SECTION */}
                <div className="border-b pb-4 mb-4 space-y-4">
                    <h3 className="font-semibold text-lg">Mission Section</h3>
                     <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="missionLabel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="missionTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="missionSubtitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subtitle</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                </FormItem>
                            )}
                        />
                     </div>
                     <FormField
                        control={form.control}
                        name="missionItems"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mission Cards</FormLabel>
                                <FormControl>
                                    <ListManager 
                                        label="Mission"
                                        items={(field.value || []) as any} 
                                        onChange={field.onChange}
                                        withIcon={true}
                                    />
                                </FormControl>
                                <FormDescription>Add exactly 3 items for best layout.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                     />
                </div>

                {/* PROGRAM SECTION */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Program Section</h3>
                     <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="programBadge"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Badge</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="programTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="programSubtitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subtitle</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                </FormItem>
                            )}
                        />
                     </div>
                      <FormField
                        control={form.control}
                        name="programItems"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Program Cards</FormLabel>
                                <FormControl>
                                    <ListManager 
                                        label="Program"
                                        items={(field.value || []) as any} 
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                     />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
                    </Button>
                </div>
            </CardContent>
        </Card>
      </form>
    </Form>
  );
}

