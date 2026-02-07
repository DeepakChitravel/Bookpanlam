import { Booking } from "@/components";
import { getService } from "@/lib/api/services";
import { notFound } from "next/navigation";

const Page = async ({
  params,
}: {
  params: { site: string; service: string };
}) => {
  const service = await getService(params.site, params.service);
  if (!service) return notFound();

  return <Booking serviceData={service} />;
};

export default Page;
