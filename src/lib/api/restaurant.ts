import { apiUrl  } from "@/config";

export interface RestaurantTable {
  table_number: string;
  seats: number;
  eating_time: number;
}

export interface RestaurantSettings {
  start_time: string;
  start_meridiem: "AM" | "PM";
  end_time: string;
  end_meridiem: "AM" | "PM";
  break_start: string | null;
  break_end: string | null;
  operating_days: string[];
}

export interface RestaurantData {
  settings: RestaurantSettings | null;
  tables: RestaurantTable[];
  summary: {
    total_tables: number;
    total_seats: number;
    avg_eating_time: number;
  };
}


export async function getRestaurantSettings() {
  const url = `${apiUrl}/seller/restaurant/get-restaurant-settings.php`;
  console.log("🟡 [restaurant.ts] Fetching settings from:", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",   
      mode: "cors",           
      headers: {
        "Accept": "application/json"
      }
    });

    console.log("🟡 [restaurant.ts] Response status:", res.status);

    const text = await res.text();
    console.log("🟡 [restaurant.ts] Raw response:", text.substring(0, 200));

    const data = JSON.parse(text);

    if (!data.success) {
      console.error("❌ [restaurant.ts] API error:", data.message);
      return {
        settings: null,
        tables: [],
        summary: {
          total_tables: 0,
          total_seats: 0,
          avg_eating_time: 0
        }
      };
    }

    const tables = data.data.tables || [];
    const total_tables = tables.length;
    const total_seats = tables.reduce((s: number, t: any) => s + Number(t.seats), 0); // Added types
    const avg_eating_time = total_tables
      ? Math.round(tables.reduce((s: number, t: any) => s + Number(t.eating_time), 0) / total_tables) // Added types
      : 0;

    return {
      settings: data.data.settings,
      tables,
      summary: { total_tables, total_seats, avg_eating_time }
    };

  } catch (err: any) {
    console.error("❌ [restaurant.ts] Fetch failed:", err.message);
    return {
      settings: null,
      tables: [],
      summary: { total_tables: 0, total_seats: 0, avg_eating_time: 0 }
    };
  }
}


export function getFormattedHours(settings: RestaurantSettings | null): string {
  if (!settings) return "Not set";
  return `${settings.start_time} ${settings.start_meridiem} - ${settings.end_time} ${settings.end_meridiem}`;
}


export function getFormattedDays(settings: RestaurantSettings | null): string {
  if (!settings || !settings.operating_days || !Array.isArray(settings.operating_days)) {
    return "Not available";
  }
  
  const days = settings.operating_days;
  
  // Check if no operating days
  if (days.length === 0) {
    return "Not available";
  }
  
  // If only one day is operational
  if (days.length === 1) {
    return `${capitalizeFirstLetter(days[0])} only`;
  }
  
  // For multiple days, format them properly
  const formattedDays = days.map((day: string) => capitalizeFirstLetter(day));
  return formattedDays.join(", ");
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


export function isRestaurantOpen(settings: RestaurantSettings | null): boolean {
  if (!settings) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  
  if (!settings.operating_days.includes(currentDay)) {
    return false;
  }
  
  const [startHour, startMinute] = settings.start_time.split(':').map(Number);
  let openingHour = startHour;
  if (settings.start_meridiem === "PM" && startHour !== 12) {
    openingHour += 12;
  } else if (settings.start_meridiem === "AM" && startHour === 12) {
    openingHour = 0;
  }
  
  const [endHour, endMinute] = settings.end_time.split(':').map(Number);
  let closingHour = endHour;
  if (settings.end_meridiem === "PM" && endHour !== 12) {
    closingHour += 12;
  } else if (settings.end_meridiem === "AM" && endHour === 12) {
    closingHour = 0;
  }
  
  if (closingHour < openingHour) {
    closingHour += 24;
  }
  
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const openingTotalMinutes = openingHour * 60 + startMinute;
  const closingTotalMinutes = closingHour * 60 + endMinute;
  
  return currentTotalMinutes >= openingTotalMinutes && currentTotalMinutes <= closingTotalMinutes;
}