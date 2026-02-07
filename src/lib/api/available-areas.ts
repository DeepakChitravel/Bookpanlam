import { apiUrl } from "@/config";
import { availableAreasPrams } from "@/types";
import axios from "axios";

const route = "/available-areas";

// Get all areas
export const getAllAvailableAreas = async (
  slug: string,
  params: availableAreasPrams
) => {
  const url = `${apiUrl + route}/site/${slug}`;

  const options = {
    params: {
      limit: params.limit ? params.limit : 10,
      page: params.page && params.page >= 1 ? params.page : 1,
      q: params.q,
    },
  };

  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error: any) {
    return false;
  }
};
