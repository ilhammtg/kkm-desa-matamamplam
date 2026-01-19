import { getSiteSettings, getSocialMedias } from "@/server/actions/settings.actions";
import { getPosts } from "@/server/actions/posts.actions";
import { getFAQs } from "@/server/actions/faq.actions";
import { getOrgStructure } from "@/server/actions/member.actions";
import { HeroSection } from "@/components/landing/HeroSection";
import { LatestPosts } from "@/components/landing/LatestPosts";
import { FAQSection } from "@/components/landing/FAQSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { OrgStructureSection } from "@/components/landing/OrgStructureSection";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PostStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const settings = await getSiteSettings();
  const socials = await getSocialMedias();
  const { posts } = await getPosts(1, 3, "", PostStatus.PUBLISHED);
  const faqs = await getFAQs();
  const orgData = await getOrgStructure();

  const aboutPage = await prisma.aboutPage.findFirst();

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar settings={settings} socials={socials} />
      
      <HeroSection settings={settings} />
      
      <div id="latest-posts">
        <LatestPosts posts={posts} />
      </div>

      <div id="about">
         <AboutSection 
            title={aboutPage?.landingTitle || "Tentang Kami"}
            content={aboutPage?.landingContentHtml || settings.about_landing_summary || ""} 
            imageUrl={aboutPage?.landingImageUrl || settings.about_image_url || undefined} 
         />
      </div>

      <OrgStructureSection data={orgData} />

      <div id="faq">
        <FAQSection faqs={faqs} />
      </div>

      <Footer settings={settings} />
    </main>
  );
}

