import { apiUrl } from "@/config";

export const getSiteHomepage = async (sellerId: number) => {
  const res = await fetch(
    `${apiUrl}/site/homepage/get.php?seller_id=${sellerId}`,
    { cache: "no-store" }
  );

  const json = await res.json();
  return json.success ? json.data : null;
};
