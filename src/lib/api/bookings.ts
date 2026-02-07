// lib/api/bookings.ts
import { apiUrl } from "@/config";

export interface CreateBookingRequest {
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tableId: number;
  tableNumber: string;
  bookingDate: string; // YYYY-MM-DD
  day: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number;
  seats: number;
  specialRequests?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data?: {
    bookingId: number;
    reference: string;
    status: string;
    bookingDetails: {
      date: string;
      time: string;
      tableNumber: string;
      seats: number;
      duration: number;
    };
  };
}

// Create a new booking
export async function createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
  const url = `${apiUrl}/seller/restaurant/create-booking.php`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    const text = await res.text();
    console.log("📦 Booking API Response:", text);

    const data = JSON.parse(text);
    
    if (!data.success) {
      throw new Error(data.message || "Failed to create booking");
    }

    return data;
  } catch (error: any) {
    console.error("❌ Booking failed:", error.message);
    throw error;
  }
}

// Check table availability
export async function checkAvailability(
  restaurantId: number,
  date: string,
  startTime: string,
  endTime: string,
  seats: number
): Promise<{
  success: boolean;
  available: boolean;
  availableTables?: any[];
  message?: string;
}> {
  const url = `${apiUrl}/seller/restaurant/check-availability.php?restaurantId=${restaurantId}&date=${date}&startTime=${startTime}&endTime=${endTime}&seats=${seats}`;
  
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      mode: "cors",
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("❌ Availability check failed:", error);
    return { success: false, available: false, message: "Server error" };
  }
}