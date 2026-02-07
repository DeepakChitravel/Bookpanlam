import Template1Home from "@/templates/1/pages/homepage";
import Template2Home from "@/templates/2/pages/homepage";
import Template3Home from "@/templates/3/pages/homepage";

import axios from "axios";
import { apiUrl } from "@/config";

async function getUserBySite(site: string) {
  const res = await axios.get(`${apiUrl}/get-user-by-site.php`, {
    params: { site },
  });
  return res.data;
}

async function getTemplate(user_id: number) {
  const res = await axios.get(`${apiUrl}/seller/settings/template/get.php`, {
    params: { user_id },
  });

  return res.data.template ?? 1;
}

export default async function SitePage({ params }: any) {
  const site = params.site;

  const userRes = await getUserBySite(site);

  if (!userRes.success) return <div>Invalid site</div>;

const user = {
  ...userRes.user,
  userId: Number(userRes.user.user_id),
  service_type_id:
    userRes.user.service_type_id !== undefined &&
    userRes.user.service_type_id !== null
      ? Number(userRes.user.service_type_id)
      : null,
};


  const templateId = await getTemplate(user.userId);

  switch (templateId) {
    case 2:
      return <Template2Home site={site} user={user} />;

    case 3:
      return <Template3Home site={site} user={user} />;

    default:
      return <Template1Home site={site} user={user} />;
  }
}

