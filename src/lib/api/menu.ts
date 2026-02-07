import axios from "axios";
import { apiUrl } from "@/config";

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const getMenuItems = async (sellerId: number) => {
  console.log("🔥 getMenuItems CALLED with sellerId =", sellerId);

  try {
    const res = await api.get("/site/hotel/get-menu-items.php", {
      params: { seller_id: sellerId },
    });

    console.log("📡 RAW API RESPONSE:", res);

    console.log("📦 DATA RETURNED TO COMPONENT:", res.data?.data);

    return res.data?.data || [];
  } catch (err) {
    console.error("❌ API FAILED:", err);
    return [];
  }
};
