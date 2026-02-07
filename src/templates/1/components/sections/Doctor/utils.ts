// utils.ts
// IMPORTANT: Remove any duplicate or conflicting imports

// ADD THIS IMPORT at the top
import { apiUrl } from "@/config";

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Get enabled payment gateways
export const getEnabledPaymentGateways = (settings: any) => {
  if (!settings) return [];

  const s = settings;
  const enabled = [];

  if (s.cash_in_hand == 1) {
    enabled.push("Cash");
  }

  if (s.razorpay_key_id) {
    enabled.push("Razorpay");
  }

  if (s.phonepe_salt_key) {
    enabled.push("PhonePe");
  }

  if (s.payu_api_key) {
    enabled.push("PayU");
  }

  return enabled;
};

// Convert time to 12-hour format with AM/PM - HANDLES BOTH 12H AND 24H FORMATS
export const formatTime12Hour = (time: string) => {
  if (!time || typeof time !== 'string') return "";
  
  // Clean the time string
  let cleanTime = time.trim().toUpperCase();
  
  // If already in 12-hour format with AM/PM
  if (cleanTime.includes('AM') || cleanTime.includes('PM')) {
    // Ensure proper spacing
    cleanTime = cleanTime.replace(/(AM|PM)/, ' $1').trim();
    return cleanTime;
  }

  try {
    // Handle 24-hour format (e.g., "23:00", "23:00:00")
    const timeParts = cleanTime.split(':');
    let hours = parseInt(timeParts[0], 10);
    let minutes = timeParts[1] || '00';
    
    // Remove seconds if present
    if (minutes.includes(':')) {
      const [min, sec] = minutes.split(':');
      minutes = min;
    }
    
    // Pad minutes to 2 digits
    minutes = minutes.padStart(2, '0');
    
    if (isNaN(hours)) {
      return time; // Return original if parsing fails
    }

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    
    return `${hours12}:${minutes} ${ampm}`;
  } catch (e) {
    console.error("Error formatting time:", e);
    return time; // Return original on error
  }
};

// Generate calendar days
export const generateCalendar = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days = [];
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
    });
  }

  const totalCells = 42;
  const remainingCells = totalCells - days.length;

  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
};

// Format date - SAFE VERSION
export const formatDate = (date: any) => {
  if (!date) return "Date not selected";

  try {
    // If date is string ("2026-01-25")
    if (typeof date === "string") {
      date = new Date(date + "T00:00:00");
    }

    // Check if date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Date format error";
  }
};

export const formatShortDate = (date: any) => {
  if (!date) return "";

  try {
    if (typeof date === "string") {
      date = new Date(date + "T00:00:00");
    }

    // Check if date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    console.error("Error formatting short date:", e);
    return "";
  }
};

// Get doctor availability with token count
export const getDoctorAvailabilityForDate = (doctor: any, date: Date) => {
  const dateKey = date.toISOString().split('T')[0];
  
  if (!doctor?.futureSchedule) {
    return {
      enabled: false,
      slots: [],
      isLeaveDay: false,
      hasWeeklySchedule: false,
      dayHasSchedule: false,
      dayEnabled: false,
      availableSlots: []
    };
  }

  const schedule = doctor.futureSchedule[dateKey];

  if (schedule) {
    // Get the day of week to check original schedule
    const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
    const daySchedule = doctor.weeklySchedule?.[dayOfWeek];
    
    // Check if day is enabled
    const isDayEnabled = daySchedule?.enabled === true || daySchedule?.enabled === "true";
    
    // Map slots to include enabled property from original schedule
    const enhancedSlots = (schedule.slots || []).map((slot: any) => {
      // Find the original slot in the weekly schedule
      let slotEnabled = slot.enabled;
      
      if (slotEnabled === undefined && daySchedule?.slots) {
        const originalSlot = daySchedule.slots.find((s: any) => 
          s.from === slot.from && s.to === slot.to
        );
        slotEnabled = originalSlot?.enabled ?? true;
      }
      
      return {
        ...slot,
        enabled: isDayEnabled ? slotEnabled : false // If day is disabled, slot is disabled
      };
    });

    return {
      ...schedule,
      dayEnabled: isDayEnabled, // Add dayEnabled to the schedule
      slots: enhancedSlots, // Use enhanced slots with enabled property
      availableSlots: enhancedSlots.filter((slot: any) => slot.enabled === true)
    };
  }

  const leaveDates = doctor.leaveDates || [];
  const isLeaveDay = leaveDates.some((leaveDate: string) => {
    try {
      const leaveDateObj = new Date(leaveDate);
      leaveDateObj.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return leaveDateObj.getTime() === compareDate.getTime();
    } catch (e) {
      return false;
    }
  });

  return {
    enabled: false,
    slots: [],
    isLeaveDay: isLeaveDay,
    hasWeeklySchedule: doctor.hasWeeklySchedule || false,
    dayHasSchedule: false,
    dayEnabled: false,
    date: date,
    availableSlots: []
  };
};

// Get next available slot
export const getNextAvailableSlot = (doctor: any) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    const schedule = doctor?.futureSchedule?.[dateKey];

    if (schedule?.enabled && schedule.slots?.length > 0) {
      return {
        date: schedule.date,
        time: schedule.slots[0].from,
        isToday: i === 0,
      };
    }
  }
  return null;
};

// Get available days count
export const getAvailableDaysCount = (doctor: any, daysRange = 30) => {
  let count = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysRange; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    const schedule = doctor?.futureSchedule?.[dateKey];

    if (schedule?.enabled && schedule.slots?.length > 0) {
      count++;
    }
  }
  return count;
};

// Calculate if all slots are full for a date
export const areAllSlotsFull = (availability: any, doctor: any) => {
  if (!availability?.enabled || !availability?.slots || availability.slots.length === 0) {
    return false;
  }
  
  return availability.slots.every((slot: any) => {
    const booked = slot.booked || 0;
    const total = slot.total || slot.token || doctor?.token_limit || 1;
    return booked >= total;
  });
};

// Get available token count for a date
export const getAvailableTokensForDate = (availability: any, doctor: any) => {
  if (!availability?.enabled || !availability?.slots) {
    return 0;
  }
  
  return availability.slots.reduce((total: number, slot: any) => {
    const booked = slot.booked || 0;
    const totalTokens = slot.total || slot.token || doctor?.token_limit || 1;
    return total + Math.max(0, totalTokens - booked);
  }, 0);
};

// Check if date is in the past - REMOVE DUPLICATE
export const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

// Function to get current date in YYYY-MM-DD format
export const getCurrentDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Function to format date to YYYY-MM-DD
export const formatDateString = (date: Date) => {
  try {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  } catch (e) {
    return "";
  }
};

// ========== NEW TOKEN AVAILABILITY FUNCTIONS ==========

// Check slot availability before booking
export const checkSlotAvailability = async (
  userId: number, 
  batchId: string, 
  date: string
) => {
  try {
    const response = await fetch(
      `${apiUrl}/site/doctor_schedule/check_availability.php?user_id=${userId}&batch_id=${batchId}&date=${date}`
    );
    const result = await response.json();
    
    if (result.success) {
      return {
        available: result.data.available,
        message: result.data.message,
        booked: result.data.booked,
        total: result.data.total,
        remaining: result.data.remaining
      };
    } else {
      return {
        available: false,
        message: result.message || 'Error checking availability'
      };
    }
  } catch (error) {
    console.error('Error checking availability:', error);
    return {
      available: false,
      message: 'Network error checking availability'
    };
  }
};

// Get available slots for a date
export const getAvailableSlotsForDate = async (
  userId: number, 
  date: string
) => {
  try {
    const response = await fetch(
      `${apiUrl}/site/doctor_schedule/get_slots.php?user_id=${userId}&date=${date}`
    );
    const result = await response.json();
    
    if (result.success && result.data.available) {
      return {
        available: true,
        slots: result.data.slots,
        message: result.data.message
      };
    } else {
      return {
        available: false,
        slots: [],
        message: result.data?.message || 'No slots available'
      };
    }
  } catch (error) {
    console.error('Error getting slots:', error);
    return {
      available: false,
      slots: [],
      message: 'Network error'
    };
  }
};

// Calculate available tokens for a slot
export const calculateAvailableTokens = (
  slot: any, 
  doctorBookings: Record<string, number>, 
  dateStr: string,
  doctorTokenLimit: number = 1
) => {
  if (!slot) {
    return {
      booked: 0,
      total: 0,
      remaining: 0,
      available: false
    };
  }
  
  const batchId = slot.batch_id;
  const key = `${dateStr}_${batchId}`;
  const bookedCount = doctorBookings[key] || 0;
  const totalTokens = slot.token || doctorTokenLimit || 1;
  const remainingTokens = Math.max(0, totalTokens - bookedCount);
  
  return {
    booked: bookedCount,
    total: totalTokens,
    remaining: remainingTokens,
    available: remainingTokens > 0
  };
};

// ADDITIONAL HELPER FUNCTION: Convert time to minutes for comparison
export const convertTimeToMinutes = (time: string) => {
  if (!time) return 0;
  
  try {
    const formatted = formatTime12Hour(time);
    const parts = formatted.split(' ');
    const timePart = parts[0];
    const ampm = parts[1];
    
    const [hours, minutes] = timePart.split(':').map(Number);
    
    let totalMinutes = hours * 60 + minutes;
    
    // Adjust for AM/PM
    if (ampm === 'PM' && hours !== 12) {
      totalMinutes += 12 * 60;
    }
    if (ampm === 'AM' && hours === 12) {
      totalMinutes -= 12 * 60;
    }
    
    return totalMinutes;
  } catch (e) {
    console.error("Error converting time to minutes:", e);
    return 0;
  }
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
