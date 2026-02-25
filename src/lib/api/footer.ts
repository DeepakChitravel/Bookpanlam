// lib/api/footer.ts

import { apiUrl } from "@/config";

export interface SiteSettings {
  id: number;
  user_id: number;
  logo: string | null;
  favicon: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  currency: string;
  country: string | null;
  state: string | null;
  address: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sharing_image_preview: string | null;
  gst_number: string | null;
  gst_type: string | null;
  tax_percent: number | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  pinterest: string | null;
  cash_in_hand: number | null;
  razorpay_key_id: string | null;
  phonepe_salt_key: string | null;
  phonepe_salt_index: string | null;
  phonepe_merchant_id: string | null;
  payu_api_key: string | null;
  payu_salt: string | null;
  razorpay_secret_key: string | null;
  selected_template: number;
}

export interface FooterResponse {
  success: boolean;
  data?: {
    siteSettings: SiteSettings | null;
    quickLinks: Array<{
      label: string;
      href: string;
    }>;
    socialLinks: Array<{
      platform: string;
      url: string | null;
      icon: string;
    }>;
    disclaimer: string;
    copyright: string;
  };
  message?: string;
}

/**
 * Get footer data for a specific site/slug
 */
export async function getFooterData(slug: string): Promise<FooterResponse> {
  if (!slug) {
    return { 
      success: false, 
      message: "Site slug is required" 
    };
  }

  // ✅ CORRECT: Using the path that matches your file structure
  const url = `${apiUrl}/customers/footer.php?slug=${encodeURIComponent(slug)}`;
  
  console.log("🔍 Fetching footer from:", url);

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
    console.log("✅ Footer data received:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch footer data:", error);
    return { 
      success: false, 
      message: "Failed to fetch footer data" 
    };
  }
}

/**
 * Get site settings by user_id
 */
export async function getSiteSettings(userId: number): Promise<{
  success: boolean;
  data?: SiteSettings;
  message?: string;
}> {
  if (!userId) {
    return { success: false, message: "User ID is required" };
  }

  // ✅ CORRECT: Using the exact path from your reference
  const url = `${apiUrl}/seller/settings/get-site-settings.php?user_id=${userId}`;
  
  console.log("🔍 Fetching site settings from:", url);

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
    console.log("✅ Site settings received:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch site settings:", error);
    return { success: false, message: "Failed to fetch site settings" };
  }
}