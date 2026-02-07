import axios from "axios";
import { apiUrl } from "@/config";

/* ----------------------------------------------
 * Load Razorpay script dynamically
 * ---------------------------------------------- */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => reject(false);

    document.body.appendChild(script);
  });
};

/* ----------------------------------------------
 * Get Razorpay Credentials
 * customer/payment/razorpay-credentials.php
 * ---------------------------------------------- */
export const getRazorpayCredentials = async (userId: number) => {
  try {
    const res = await axios.get(
      `${apiUrl}/customers/payment/razorpay-credentials.php`,
      {
        params: { user_id: userId }
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Failed to load Razorpay credentials:", error);
    return {
      success: false,
      razorpay_key_id: "",
      razorpay_key_secret: ""
    };
  }
};


/* ----------------------------------------------
 * Create Razorpay Order
 * customer/payment/create-razorpay-order.php
 * ---------------------------------------------- */
export const createRazorpayOrder = async (data: any) => {
  try {
    const res = await axios.post(
      `${apiUrl}/customers/payment/create-razorpay-order.php`,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error("❌ Order creation failed:", error);

    return {
      success: false,
      order: null,
      message: "Order creation failed",
    };
  }
};

/* ----------------------------------------------
 * Verify Razorpay Payment
 * customer/payment/verify-razorpay-payment.php
 * ---------------------------------------------- */
export const verifyRazorpayPayment = async (data: any) => {
  try {
    const res = await axios.post(
      `${apiUrl}/customers/payment/verify-razorpay-payment.php`,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.data;
  } catch (error) {
    console.error("❌ Payment verification failed:", error);

    return {
      success: false,
      message: "Payment verification failed",
    };
  }
};
