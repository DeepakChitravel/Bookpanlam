import { apiUrl } from "@/config";
import axios from "axios";

const route = "/manual-payment-methods";

// Get all payment methods
export const getAllManualPaymentMethods = async (slug: string) => {
  const url = `${apiUrl + route}/site/${slug}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    return false;
  }
};
