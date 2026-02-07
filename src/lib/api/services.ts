import { apiUrl } from "@/config";
import { servicesParams } from "@/types";
import axios from "axios";

const route = "/services";

// Get all services
export const getAllServices = async (slug: string, params: servicesParams) => {
  const url = `${apiUrl + route}/site/${slug}`;

  const options = {
    params: {
      limit: params.limit ? params.limit : 10,
      page: params.page && params.page >= 1 ? params.page : 1,
      q: params.q,
      category: params.category,
    },
  };

  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error: any) {
    return false;
  }
};

// Get single service
export const getService = async (site: string, slug: string) => {
  const url = `${apiUrl + route}/site/${site}/${slug}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    return false;
  }
};
