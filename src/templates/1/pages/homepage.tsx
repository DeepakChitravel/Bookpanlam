import HeroSection from "../components/sections/hero-section";
import Navbar from "../components/shared/navbar";
import Footer from "../components/shared/footer";
import BusinessContent from "../components/sections/business-content";

import { getAllCategories } from "@/lib/api/categories";
import { websiteSettingsWithSlug } from "@/lib/api/website-settings";

const Home1 = async ({
  site,
  user,
}: {
  site: string;
  user: any;
}) => {

  // 2️⃣ Website settings for THIS slug
  const settingsRes = await websiteSettingsWithSlug(site);
  const settings = settingsRes?.data || {};

  // 3️⃣ Categories for footer
  const categories = await getAllCategories(site, { limit: 8 });

  return (
    <>
      <Navbar
        topbarInformations={settings.topbarInformations || []}
        phone={settings.phone || ""}
        logo={settings.logo || ""}
        siteName={settings.siteName || ""}
        navLinks={settings.navLinks || []}
      />


      <HeroSection
        user={user}
        // settings={settings}
      />

      <BusinessContent
        user={user}
        site={site}
      />

      <Footer
        user={user}
        settings={settings}
        categories={categories.records || []}
      />
    </>
  );
};

export default Home1;
