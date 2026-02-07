// api/siteSettings.ts

import axios from "axios";
import { apiUrl } from "@/config";

/**
 * Axios instance (client-safe)
 */
const api = axios.create({
  baseURL: apiUrl, // e.g. https://manager.bookpanlam.com/public
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Fetch seller site settings
 */
export const getSiteSettings = async (userId: number) => {
  if (!userId) {
    console.error("❌ getSiteSettings: userId is missing");
    return { success: false, data: null };
  }

  try {
    /**
     * ✅ CORRECT ENDPOINT
     * This must match your backend file location:
     * /managerbp/public/seller/settings/get-site-settings.php
     */
    const res = await api.get(
      `/seller/settings/get-site-settings.php`,
      {
        params: { user_id: userId },
      }
    );

    return res.data;
  } catch (err) {
    console.error("❌ getSiteSettings failed", err);
    return { success: false, data: null };
  }
};
