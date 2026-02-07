import { cookies } from "next/headers";

type PreviewPageProps = {
  params: {
    site: string;
  };
};

export default function PreviewPage({ params }: PreviewPageProps) {
  const site = params.site;

  const cookieStore = cookies();
  const customerName = cookieStore.get("customer_name")?.value;

  return (
    <>
      <h1>Landing Page for: {site}</h1>

      {customerName && (
        <p className="mt-4 text-lg font-semibold">
          Welcome, {customerName} 👋
        </p>
      )}
    </>
  );
}
