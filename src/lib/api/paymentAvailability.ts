// lib/api/paymentAvailability.ts
import axios from "axios";
import { apiUrl } from "@/config";

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const getPaymentAvailability = async (userId: number) => {
  try {
    const res = await api.get(`/seller/settings/get-payment-availability.php`, {
      params: { user_id: userId }
    });

    return res.data;
  } catch (err) {
    console.error("❌ Failed to load payment availability", err);
    return { 
      success: false, 
      data: {
        manual_payments: { allowed: true, available: true },
        upi_payments: { allowed: true, available: true }
      }
    };
  }
};