import { apiUrl } from "@/config";
import axios from "axios";


const route = "/customers";

export const userWithSite = async (slug: string) => {
  const url = `${apiUrl}${route}/site.php?slug=${slug}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    return false;
  }
};

