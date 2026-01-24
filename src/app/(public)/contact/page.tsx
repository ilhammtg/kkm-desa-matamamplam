
import { getSiteSettings } from "@/server/actions/settings.actions";
import { ContactForm } from "@/components/contact/ContactForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Hubungi Kami | KKM Mata Mamplam",
    description: "Hubungi tim KKM Mata Mamplam untuk pertanyaan atau informasi lebih lanjut.",
};

export default async function ContactPage() {
    const settings = await getSiteSettings();

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950/50">
            
            <main className="flex-1 container max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                     <h1 className="text-4xl font-bold tracking-tight mb-4">Hubungi Kami</h1>
                     <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Punya pertanyaan, saran, atau ingin berkolaborasi? Jangan ragu untuk menghubungi kami.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Kontak</CardTitle>
                                <CardDescription>Temukan kami di saluran berikut</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold">Alamat Posko</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {settings.address || "Desa Mata Mamplam, Kec. Peusangan, Kab. Bireuen, Aceh, Indonesia"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold">Email</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {settings.email || "kkm.matamamplam@gmail.com"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold">Telepon / WhatsApp</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {settings.phone || "+62 812-3456-7890"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                         {/* Map Embed (Placeholder) */}
                         <div className="rounded-xl overflow-hidden shadow-sm border h-[250px] bg-muted relative group">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15886.643477124376!2d96.8242442!3d5.1585806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304777a419515967%3A0xe534608779836746!2sMata%20Mamplam%2C%20Peusangan%2C%20Bireuen%20Regency%2C%20Aceh!5e0!3m2!1sen!2sid!4v1706103323531!5m2!1sen!2sid" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                className="grayscale group-hover:grayscale-0 transition-all duration-500"
                            ></iframe>
                         </div>
                    </div>

                    {/* Form Card */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Kirim Pesan</CardTitle>
                                <CardDescription>Kami akan membalas pesan Anda secepatnya.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ContactForm />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
