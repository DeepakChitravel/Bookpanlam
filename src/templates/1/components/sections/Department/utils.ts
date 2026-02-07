export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const formatTime12Hour = (time: string) => {
  if (!time) return "";
  
  try {
    // If time is already in 12-hour format with AM/PM, return as is
    if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
      return time;
    }
    
    // Remove seconds if present
    const cleanTime = time.split(':').slice(0, 2).join(':');
    const [hours, minutes] = cleanTime.split(':').map(Number);
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch (err) {
    return time;
  }
};

export const formatShortDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// FIXED: Handle both appointmentSettings and appointment_settings
export const getDepartmentAvailabilityForDate = (department: any, date: Date) => {
  const appointmentSettings = department?.appointmentSettings || department?.appointment_settings || {};
  
  if (!appointmentSettings || Object.keys(appointmentSettings).length === 0) {
    return { enabled: false, slots: [], isLeaveDay: false };
  }
  
  const dateKey = date.toISOString().split('T')[0];
  const dayName = DAYS_OF_WEEK[date.getDay()].substring(0, 3);
  
  // Check if date is in leaveDates
  const leaveDates = department.leaveDates || department.leave_dates || [];
  const isLeaveDay = leaveDates.some((leaveDateStr: string) => {
    try {
      const leaveDate = new Date(leaveDateStr);
      leaveDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return leaveDate.getTime() === checkDate.getTime();
    } catch (e) {
      return false;
    }
  });
  
  if (isLeaveDay) {
    return { enabled: false, slots: [], isLeaveDay: true };
  }
  
  const daySchedule = appointmentSettings[dayName];
  
  if (!daySchedule?.enabled) {
    return { enabled: false, slots: [], isLeaveDay: false };
  }
  
  return {
    enabled: true,
    slots: daySchedule.slots || [],
    isLeaveDay: false
  };
};

export const areAllSlotsFull = (availability: any, department: any) => {
  if (!availability.enabled || availability.slots.length === 0) {
    return false;
  }
  
  return availability.slots.every((slot: any) => {
    const booked = slot.booked || 0;
    const total = slot.total || slot.token || department?.token_limit || 10;
    return booked >= total;
  });
};

export const getAvailableTokensForDate = (availability: any, department: any) => {
  if (!availability.enabled) {
    return 0;
  }
  
  let totalAvailable = 0;
  availability.slots.forEach((slot: any) => {
    const booked = slot.booked || 0;
    const total = slot.total || slot.token || department?.token_limit || 10;
    totalAvailable += Math.max(0, total - booked);
  });
  
  return totalAvailable;
};

export const getEnabledPaymentGateways = (siteSettings: any) => {
  if (!siteSettings) return [];
  const gateways = [];
  if (siteSettings.razorpay_enabled === "1") gateways.push("Razorpay");
  if (siteSettings.phonepe_enabled === "1") gateways.push("PhonePe");
  if (siteSettings.paytm_enabled === "1") gateways.push("Paytm");
  return gateways;
};

// FIXED: Handle both appointmentSettings and appointment_settings
export const getNextAvailableSlot = (department: any) => {
  const appointmentSettings = department?.appointmentSettings || department?.appointment_settings || {};
  
  if (!appointmentSettings || Object.keys(appointmentSettings).length === 0) return null;

  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);
    
    // Check leave dates
    const leaveDates = department.leaveDates || department.leave_dates || [];
    const isLeaveDay = leaveDates.some((leaveDateStr: string) => {
      try {
        const leaveDate = new Date(leaveDateStr);
        leaveDate.setHours(0, 0, 0, 0);
        return leaveDate.getTime() === date.getTime();
      } catch (e) {
        return false;
      }
    });
    
    if (isLeaveDay) continue;
    
    const dayName = dayNames[date.getDay()];
    const daySchedule = appointmentSettings[dayName];
    
    if (daySchedule?.enabled && daySchedule.slots?.length > 0) {
      const firstSlot = daySchedule.slots[0];
      const isToday = i === 0;
      
      return {
        date,
        time: formatTime12Hour(firstSlot.from),
        isToday,
        slot: firstSlot
      };
    }
  }
  
  return null;
};

// FIXED: Handle both appointmentSettings and appointment_settings
export const getAvailableDaysCount = (department: any, days: number = 30) => {
  const appointmentSettings = department?.appointmentSettings || department?.appointment_settings || {};
  
  if (!appointmentSettings || Object.keys(appointmentSettings).length === 0) return 0;
  
  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let count = 0;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);
    
    // Check leave dates
    const leaveDates = department.leaveDates || department.leave_dates || [];
    const isLeaveDay = leaveDates.some((leaveDateStr: string) => {
      try {
        const leaveDate = new Date(leaveDateStr);
        leaveDate.setHours(0, 0, 0, 0);
        return leaveDate.getTime() === date.getTime();
      } catch (e) {
        return false;
      }
    });
    
    if (isLeaveDay) continue;
    
    const dayName = dayNames[date.getDay()];
    const daySchedule = appointmentSettings[dayName];
    
    if (daySchedule?.enabled && daySchedule.slots?.length > 0) {
      count++;
    }
  }
  
  return count;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};