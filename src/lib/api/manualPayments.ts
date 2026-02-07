import axios from "axios";
import { apiUrl } from "@/config";

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const getManualPayments = async (userId: number) => {
  try {
    const res = await api.get(`/seller/settings/get-manual-payments.php`, {
      params: { user_id: userId }
    });

    return res.data;
  } catch (err) {
    console.error("❌ Failed to load manual payments", err);
    return { success: false, data: [] };
  }
};
