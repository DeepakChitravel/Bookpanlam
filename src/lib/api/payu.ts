import axios from "axios";
import { apiUrl } from "@/config";

/* ----------------------------------------------
 * Get PayU Credentials
 * ---------------------------------------------- */
export const getPayUCredentials = async (userId: number) => {
  try {
    const res = await axios.get(
      `${apiUrl}/customers/payment/payu-credentials.php`,
      {
        params: { user_id: userId }
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Failed to load PayU credentials:", error);
    return {
      success: false,
      payu_api_key: "",
      payu_secret_key: ""
    };
  }
};

/* ----------------------------------------------
 * Create PayU Order
 * ---------------------------------------------- */
// In your payu.ts file, update the createPayUOrder function:
export const createPayUOrder = async (data: any) => {
  try {
    const res = await axios.post(
      `${apiUrl}/customers/payment/create-payu-order.php`,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error("❌ PayU Order creation failed:", error);

    return {
      success: false,
      message: "PayU order creation failed",
    };
  }
};

/* ----------------------------------------------
 * Verify PayU Payment
 * ---------------------------------------------- */
export const verifyPayUPayment = async (data: any) => {
  try {
    const res = await axios.post(
      `${apiUrl}/customers/payment/verify-payu-payment.php`,
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
