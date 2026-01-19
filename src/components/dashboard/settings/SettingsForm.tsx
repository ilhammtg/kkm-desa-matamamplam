"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateSiteSettings } from "@/server/actions/settings.actions";
import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FAQManager } from "@/components/dashboard/settings/FAQManager";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListManager, ListItem } from "@/components/dashboard/settings/ListManager";
import { AboutSettings } from "@/components/dashboard/settings/AboutSettings";

const settingsSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  logo_url: z.string().optional(),
  favicon_url: z.string().optional(),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  instagram_url: z.string().optional(),
  tiktok_url: z.string().optional(),
  about_landing_summary: z.string().optional(),
  about_image_url: z.string().optional(),
  about_intro: z.string().optional(),
  about_vision_title: z.string().optional(),
  about_vision: z.string().optional(), // Reusing this for vision text
  about_mission: z.string().optional(), // JSON string
  about_programs: z.string().optional(), // JSON string
  footer_text: z.string().optional(),
  navbar_config: z.string().optional(), // Storing JSON as string for simplicity
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: SettingsFormValues;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setLoading(true);
    try {
        // Filter out empty strings if needed, or send as is
        const payload: Record<string, string> = {};
        (Object.keys(data) as Array<keyof SettingsFormValues>).forEach((key) => {
            if (data[key] !== undefined) {
                payload[key] = data[key] as string;
            }
        });

      await updateSiteSettings(payload);
      toast.success("Settings updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const showMainSaveButton = ["general", "hero", "navigation", "social"].includes(activeTab);

  return (
    <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="about">About Us</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            
            <TabsContent value="general">
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>Basic site details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="site_name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Site Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="KKM Mata Mamplam" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="logo_url"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Logo URL</FormLabel>
                                <FormControl>
                                    <ImageUpload 
                                        value={field.value || ""} 
                                        onChange={field.onChange}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormDescription>Public URL for the site logo.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="favicon_url"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Favicon URL</FormLabel>
                                <FormControl>
                                    <ImageUpload 
                                        value={field.value || ""} 
                                        onChange={field.onChange}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="hero">
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Section</CardTitle>
                        <CardDescription>Customize the homepage hero banner.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="hero_title"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Hero Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Selamat Datang" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="hero_subtitle"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Hero Subtitle</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Short description..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="navigation">
                <Card>
                    <CardHeader>
                        <CardTitle>Navigation & Footer</CardTitle>
                        <CardDescription>Manage navbar links and footer content.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="footer_text"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Footer Copyright Text</FormLabel>
                                <FormControl>
                                    <Input placeholder="© 2024 KKM Mata Mamplam. All rights reserved." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="navbar_config"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Navbar Links (JSON)</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder='[{"label": "Home", "href": "/"}, {"label": "External", "href": "https://google.com"}]' 
                                        className="font-mono text-xs"
                                        rows={5}
                                        {...field} 
                                    />
                                </FormControl>
                                <FormDescription>Advanced: JSON array for custom extra links.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="social">
                <Card>
                    <CardHeader>
                        <CardTitle>Social Media</CardTitle>
                        <CardDescription>Links to your social profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="instagram_url"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Instagram URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://instagram.com/..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="tiktok_url"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>TikTok URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://tiktok.com/@..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            {showMainSaveButton && (
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            )}
          </form>
        </Form>

        <TabsContent value="about" className="mt-6">
            <AboutSettings />
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
            <FAQManager />
        </TabsContent>
    </Tabs>
  );
}
