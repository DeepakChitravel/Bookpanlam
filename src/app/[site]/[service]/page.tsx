import { Service } from "@/components";
import { getAllServices, getService } from "@/lib/api/services";
import { notFound } from "next/navigation";

const Page = async ({
  params,
}: {
  params: { site: string; service: string };
}) => {
  const service = await getService(params.site, params.service);
  if (!service) return notFound();
  const services = await getAllServices(params.site, { limit: 3 });

  return <Service services={services.records} data={service} />;
};

export default Page;
