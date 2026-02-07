import { Navbar, Footer, Home } from "@/components";

export default function SellerHome({
  site,
  user,
  settings,
  categories,
}: {
  site: string;
  user: any;
  settings: any;
  categories: any[];
}) {

  return (
    <div className="space-y-20">
      <Navbar />
      <Home site={site} user={user} />
      <Footer
        user={user}
        settings={settings}
        categories={categories}
      />
    </div>
  );
}
