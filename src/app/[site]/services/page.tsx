import { Services } from "@/components";
import { getAllCategories } from "@/lib/api/categories";
import { getAllServices } from "@/lib/api/services";

const Page = async ({
  params,
  searchParams,
}: {
  params: { site: string };
  searchParams: { page: string; category: string };
}) => {
  let category = searchParams.category ? searchParams.category : "";

  let page = 1;
  if (parseInt(searchParams.page) > 0) page = parseInt(searchParams.page);

  const services = await getAllServices(params.site, {
    limit: 6,
    page: page,
    category: category,
  });
  const categories = await getAllCategories(params.site, { limit: 999 });

  return <Services data={services} categories={categories.records} />;
};

export default Page;
