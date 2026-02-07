"use client";

import { CalendarIcon, ChevronRight } from "lucide-react";
import {
  DAYS_OF_WEEK,
  MONTHS,
  formatTime12Hour,
  getDepartmentAvailabilityForDate,
  formatShortDate,
  areAllSlotsFull,
  getAvailableTokensForDate
} from "./utils";

interface CalendarViewProps {
  department: any;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  handleSlotClick: (department: any, date: Date, slot: any) => void;
}

const convertToMinutes = (time: string) => {
  if (!time) return null;

  // If time is already in 24-hour format with seconds (23:00:00 → 23:00)
  if (time.includes(':') && time.split(":").length === 3) {
    const [h, m] = time.split(":");
    time = `${h}:${m}`;
  }

  // Check if time is in 12-hour format with AM/PM
  const timeLower = time.toLowerCase();
  const hasAM = timeLower.includes('am');
  const hasPM = timeLower.includes('pm');

  let cleanTime = time;
  if (hasAM || hasPM) {
    // Remove AM/PM and trim
    cleanTime = time.replace(/[apm]/gi, '').trim();
  }

  let [hh, mm] = cleanTime.split(":").map(Number);

  // If minutes are NaN (e.g., "11 PM" without colon), set to 0
  if (isNaN(mm)) mm = 0;

  // Handle 12-hour format conversion
  if (hasPM) {
    if (hh < 12) hh += 12;
  }
  if (hasAM) {
    if (hh === 12) hh = 0;
  }

  return hh * 60 + mm;
};

const CalendarView = ({
  department,
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  handleSlotClick
}: CalendarViewProps) => {

  // Get current time in minutes for comparison
  const getCurrentTimeMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Check if a time slot is in the past for today
  const isPastSlotForToday = (slotStartTime: string, slotDate: Date) => {
    const today = new Date();
    const slotDateOnly = new Date(slotDate);
    slotDateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);

    // If it's not today, it's not a past slot
    if (slotDateOnly.getTime() !== todayOnly.getTime()) {
      return false;
    }

    // If it's today, check if slot time has passed
    const currentTimeMinutes = getCurrentTimeMinutes();
    const slotStartMinutes = convertToMinutes(slotStartTime);

    return slotStartMinutes !== null && slotStartMinutes < currentTimeMinutes;
  };

  // Check if slot is too far in advance (beyond 7 days)
  const isSlotTooFarInAdvance = (slotDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxAdvanceDate = new Date(today);
    maxAdvanceDate.setDate(today.getDate() + 7); // Maximum 7 days in advance

    const slotDateOnly = new Date(slotDate);
    slotDateOnly.setHours(0, 0, 0, 0);

    return slotDateOnly > maxAdvanceDate;
  };

  const handleSlotClickDirect = (department: any, date: Date, slot: any) => {
    console.log("🎯🎯🎯 Department Slot clicked:", slot);

    // Get day of week
    const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

    // Get the slot enabled status from department's schedule
    const daySchedule = department.appointmentSettings?.[dayOfWeek];
    let slotEnabled = true;

    if (daySchedule?.slots) {
      const originalSlot = daySchedule.slots.find((s: any) =>
        s.from === slot.from && s.to === slot.to
      );
      slotEnabled = originalSlot?.enabled ?? true;
    }

    // Create the slot object to send
    const fixedSlot = {
      ...slot,
      enabled: slotEnabled
    };

    // Call parent function
    handleSlotClick(department, date, fixedSlot);
  };

  // Check past dates
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Check if date is within next 7 days (active dates)
  const isActiveDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7); // Next 7 days

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate >= today && checkDate <= maxDate;
  };

  // Generate 30 days starting today
  const getNext30Days = () => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 30; i++) { // 30 days total
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      days.push({
        date,
        isToday: i === 0,
        dayName: DAYS_OF_WEEK[date.getDay()].substring(0, 3),
        fullDayName: DAYS_OF_WEEK[date.getDay()],
        monthName: MONTHS[date.getMonth()].substring(0, 3),
        dateNumber: date.getDate(),
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isActive: i < 7, // First 7 days are active
        isInNextMonth: i >= (30 - new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate() - startDate.getDate() + 1)
      });
    }
    return days;
  };

  const next30Days = getNext30Days();
  const currentMonthIndex = next30Days[0].month;

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">

      {/* Large Round Calendar Container - Responsive */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm">
        {/* Month Navigation Header - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {MONTHS[currentMonthIndex]} {next30Days[0].year}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Select a date to view available slots</p>
          </div>
        </div>

        {/* Days of Week Header - Responsive */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs sm:text-sm font-bold text-gray-500 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center mx-auto">
                {day}
              </div>
            </div>
          ))}
        </div>

        {/* Large Round Calendar Grid - 30 days - Responsive */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Fill empty cells for first day position */}
          {Array.from({ length: next30Days[0].dayOfWeek }).map((_, index) => (
            <div key={`empty-before-${index}`} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto"></div>
          ))}

          {/* 30 Days */}
          {next30Days.map((day, index) => {
            const availability = getDepartmentAvailabilityForDate(department, day.date);
            const isSelected = selectedDate &&
              selectedDate.toDateString() === day.date.toDateString();
            const isPast = isPastDate(day.date);
            const isActive = isActiveDate(day.date);
            const allSlotsFull = areAllSlotsFull(availability, department);
            const availableTokens = getAvailableTokensForDate(availability, department);
            const isLeaveDay = availability.isLeaveDay;

            // Check if date is clickable: must be active, not past, not on leave, and has available slots
            const isDateClickable = isActive && !isPast && !isLeaveDay && availability.enabled && !allSlotsFull && availableTokens > 0;

            // Enhanced Color logic with better shading
            let dayBgColor = "bg-gray-50";
            let dayTextColor = "text-gray-900";
            let dayBorderColor = "border-transparent";
            let statusColor = "";
            let monthIndicator = "";

            if (isPast) {
              dayBgColor = "bg-gradient-to-br from-gray-100 to-gray-200";
              dayTextColor = "text-gray-400";
              statusColor = "bg-gradient-to-br from-gray-400 to-gray-500";
            } else if (!isActive) {
              dayBgColor = "bg-gradient-to-br from-gray-50 to-gray-100";
              dayTextColor = "text-gray-400";
              dayBorderColor = "border-gray-200";
              statusColor = "bg-gradient-to-br from-gray-300 to-gray-400";
            } else if (isLeaveDay) {
              dayBgColor = "bg-gradient-to-br from-orange-50 to-amber-50";
              dayBorderColor = "border-orange-200";
              statusColor = "bg-gradient-to-br from-orange-500 to-amber-600";
            } else if (availability.enabled) {
              if (allSlotsFull || availableTokens === 0) {
                dayBgColor = "bg-gradient-to-br from-red-50 to-rose-50";
                dayBorderColor = "border-red-200";
                statusColor = "bg-gradient-to-br from-red-500 to-rose-600";
              } else {
                dayBgColor = "bg-gradient-to-br from-green-50 to-emerald-50";
                dayBorderColor = "border-green-200";
                statusColor = "bg-gradient-to-br from-green-500 to-emerald-600";
              }
            } else {
              // Date is active but not enabled (no schedule)
              dayBgColor = "bg-gradient-to-br from-gray-50 to-gray-100";
              dayBorderColor = "border-gray-200";
              statusColor = "bg-gradient-to-br from-gray-300 to-gray-400";
            }

            // Month change indicator
            if (index > 0 && day.month !== next30Days[index - 1].month) {
              monthIndicator = "text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full";
            }

            return (
              <div key={index} className="flex flex-col items-center">
                {/* Month indicator for new month */}
                {monthIndicator && (
                  <div className={monthIndicator}>
                    {MONTHS[day.month].substring(0, 3)}
                  </div>
                )}

                <button
                  onClick={() => isDateClickable && setSelectedDate(day.date)}
                  disabled={!isDateClickable}
                  className={`
                    relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex flex-col items-center justify-center
                    rounded-full transition-all duration-200 border
                    ${dayBgColor} ${dayBorderColor}
                    ${!isDateClickable
                      ? "cursor-not-allowed"
                      : "hover:shadow-lg hover:scale-105 cursor-pointer"
                    }
                    ${isSelected
                      ? "ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2 scale-105 shadow-md"
                      : ""
                    }
                    ${day.isToday && !isPast
                      ? "border-2 border-blue-500 shadow-sm"
                      : ""
                    }
                  `}
                >
                  {/* Date number - Responsive */}
                  <div className={`
                    text-sm sm:text-base font-bold
                    ${dayTextColor}
                    ${day.isToday && !isPast ? "text-blue-600" : ""}
                    ${isSelected ? "text-blue-700" : ""}
                  `}>
                    {day.dateNumber}
                  </div>

                  {/* Status dot - Responsive */}
                  {statusColor && (
                    <div className={`
                      absolute bottom-0.5 sm:bottom-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm
                      ${statusColor}
                      ${isActive && !isPast ? "" : "opacity-50"}
                    `}></div>
                  )}
                </button>

                {/* Day name below - Responsive */}
                <div className="mt-1 text-[10px] xs:text-xs text-gray-500">
                  {day.dayName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Slot List - Responsive */}
      {selectedDate && isActiveDate(selectedDate) && !isPastDate(selectedDate) && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-gradient-to-r from-white to-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                  Time Slots for {formatShortDate(selectedDate)}
                </h4>
              </div>
            </div>

            <div className="flex gap-2 self-start sm:self-auto">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-300"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Warning for too far advance */}
          {isSlotTooFarInAdvance(selectedDate) ? (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-800 font-medium text-sm sm:text-base">
                ⚠️ Cannot book more than 7 days in advance
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {getDepartmentAvailabilityForDate(department, selectedDate).slots.map((slot: any, i: number) => {
                const booked = slot.booked || 0;
                const total = slot.total || slot.token || department?.token_limit || 1;
                const remaining = Math.max(0, total - booked);
                const isFull = remaining === 0;
                const isPastSlot = isPastSlotForToday(slot.from, selectedDate);
                const isLeave = slot.isLeave || false;

                // Enhanced color logic with better shading
                const isAvailable = remaining > 0 && !isPastSlot && !isLeave;
                let slotColor = "bg-white";
                let borderColor = "border-gray-200";
                let statusText = "";
                let statusColor = "";

                if (isLeave) {
                  slotColor = "bg-gradient-to-br from-orange-50 to-amber-50";
                  borderColor = "border-orange-300";
                  statusText = "Holiday";
                  statusColor = "bg-gradient-to-br from-orange-100 to-amber-200 text-orange-900";
                } else if (isPastSlot) {
                  slotColor = "bg-gradient-to-br from-gray-100 to-gray-200";
                  borderColor = "border-gray-300";
                  statusText = "Past";
                  statusColor = "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800";
                } else if (isFull) {
                  slotColor = "bg-gradient-to-br from-red-50 to-rose-50";
                  borderColor = "border-red-300";
                  statusText = "Full";
                  statusColor = "bg-gradient-to-br from-red-100 to-rose-200 text-red-900";
                } else {
                  if (remaining > 2) {
                    slotColor = "bg-gradient-to-br from-green-50 to-emerald-50";
                    borderColor = "border-green-300";
                    statusColor = "bg-gradient-to-br from-green-100 to-emerald-200 text-green-900";
                  } else if (remaining === 2) {
                    slotColor = "bg-gradient-to-br from-amber-50 to-yellow-50";
                    borderColor = "border-amber-300";
                    statusColor = "bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-900";
                  } else {
                    slotColor = "bg-gradient-to-br from-orange-50 to-red-50";
                    borderColor = "border-orange-300";
                    statusColor = "bg-gradient-to-br from-orange-100 to-red-200 text-orange-900";
                  }
                  statusText = `${remaining} tokens`;
                }

                const isEnabled = isAvailable;

                return (
                  <button
                    key={i}
                    onClick={() => isEnabled && handleSlotClickDirect(department, selectedDate, slot)}
                    disabled={!isEnabled}
                    className={`
                      relative p-3 sm:p-4 rounded-lg sm:rounded-xl border text-center transition-all
                      ${slotColor} ${borderColor}
                      ${isEnabled
                        ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer hover:border-green-400"
                        : "cursor-not-allowed opacity-80"
                      }
                    `}
                  >
                    {/* Time - Responsive */}
                    <div className="text-base sm:text-lg font-bold text-gray-900">
                      {formatTime12Hour(slot.from)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      to {formatTime12Hour(slot.to)}
                    </div>

                    {/* Status Badge - Responsive */}
                    <div className={`mt-2 sm:mt-3 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${statusColor}`}>
                      {statusText}
                    </div>

                    {/* Availability Indicator */}
                    {isEnabled && (
                      <>
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse shadow-sm"></div>
                        </div>
                        <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-green-700 font-medium flex items-center justify-center gap-0.5 sm:gap-1">
                          Book Now <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Inactive Date Message - Responsive */}
      {selectedDate && !isActiveDate(selectedDate) && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-300 text-center">
          <div className="text-gray-500 mb-2 sm:mb-3">
            <CalendarIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-gray-700 mb-1 sm:mb-2">
            Date Not Available for Booking
          </h4>
          <p className="text-gray-600 text-sm mb-3 sm:mb-4">
            You can only book appointments for the next 7 days.
          </p>
          <button
            onClick={() => setSelectedDate(null)}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Select Available Date
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarView;