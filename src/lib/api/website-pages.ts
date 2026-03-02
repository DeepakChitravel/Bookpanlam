import { apiUrl } from "@/config";


// Get website pages for public view (by slug)
export const getWebsitePages = async (slug: string) => {
  if (!slug) {
    return { success: false, data: [], message: "Site slug is required" };
  }

  const url = `${apiUrl}/customers/pages.php?slug=${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      mode: "cors",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.log("GET WEBSITE PAGES ERROR →", error);
    return { success: false, data: [], message: error?.message };
  }
};