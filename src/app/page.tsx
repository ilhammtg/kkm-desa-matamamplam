import { getSiteSettings } from "@/server/actions/settings.actions";
import { getPosts } from "@/server/actions/posts.actions";
import { getFAQs } from "@/server/actions/faq.actions";
import { HeroSection } from "@/components/landing/HeroSection";
import { LatestPosts } from "@/components/landing/LatestPosts";
import { FAQSection } from "@/components/landing/FAQSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const settings = await getSiteSettings();
  const { posts } = await getPosts(1, 3, "", "PUBLISHED");
  const faqs = await getFAQs();

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar settings={settings} />
      
      <HeroSection settings={settings} />
      
      <div id="latest-posts">
        <LatestPosts posts={posts} />
      </div>

      <div id="about">
         <AboutSection content={settings.about_content || ""} />
      </div>

      <div id="faq">
        <FAQSection faqs={faqs} />
      </div>

      <Footer settings={settings} />
    </main>
  );
}
