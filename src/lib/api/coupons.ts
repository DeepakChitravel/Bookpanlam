// lib/api/coupons.ts
import { apiUrl } from "@/config";

export interface Coupon {
  id: number;
  coupon_id: string;
  user_id: number;
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount: number;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  min_booking_amount: number | null;
  created_at: string;
  formatted_start?: string;
  formatted_end?: string;
}

export interface CouponDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
  total_after_discount: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  message: string;
  data?: Coupon;
  discount?: CouponDiscount;
}

/**
 * Get all active coupons for a specific user
 */
export async function getUserCoupons(userId: number): Promise<{
  success: boolean;
  data: Coupon[];
  count: number;
  message?: string;
}> {
  if (!userId) {
    return { success: false, data: [], count: 0, message: "User ID is required" };
  }

  const url = `${apiUrl}/customers/coupons/user-coupons.php?user_id=${userId}`;
  
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
  } catch (error) {
    console.error("❌ Failed to fetch user coupons:", error);
    return { success: false, data: [], count: 0, message: "Failed to fetch coupons" };
  }
}

/**
 * Validate and apply a coupon code
 */
export async function validateCoupon(
  couponCode: string,
  userId: number,
  totalAmount: number
): Promise<ValidateCouponResponse> {
  if (!couponCode.trim() || !userId) {
    return { 
      success: false, 
      message: "Coupon code and User ID are required" 
    };
  }

  const url = `${apiUrl}/customers/coupons/validate-coupon.php`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        coupon_code: couponCode.trim(),
        user_id: userId,
        total_amount: totalAmount
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const text = await res.text();
    console.log("📦 Coupon validation response:", text);

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("❌ Coupon validation failed:", error);
    return { 
      success: false, 
      message: "Failed to validate coupon. Please try again." 
    };
  }
}

/**
 * Get a single coupon by coupon_id
 */
export async function getCouponById(couponId: string): Promise<{
  success: boolean;
  data?: Coupon;
  message?: string;
}> {
  if (!couponId) {
    return { success: false, message: "Coupon ID is required" };
  }

  const url = `${apiUrl}/seller/coupons/single.php?coupon_id=${couponId}`;
  
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
  } catch (error) {
    console.error("❌ Failed to fetch coupon:", error);
    return { success: false, message: "Failed to fetch coupon" };
  }
}