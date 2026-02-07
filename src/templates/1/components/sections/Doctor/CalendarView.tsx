"use client";

import { CalendarIcon, ChevronRight } from "lucide-react";
import {
  DAYS_OF_WEEK,
  MONTHS,
  formatTime12Hour,
  getDoctorAvailabilityForDate,
  formatShortDate,
  areAllSlotsFull,
  getAvailableTokensForDate
} from "./utils";

interface CalendarViewProps {
  doctor: any;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  handleSlotClick: (doctor: any, date: Date, slot: any) => void;
}

const convertToMinutes = (time: string) => {
  if (!time) return null;

  if (time.includes(':') && time.split(":").length === 3) {
    const [h, m] = time.split(":");
    time = `${h}:${m}`;
  }

  const timeLower = time.toLowerCase();
  const hasAM = timeLower.includes('am');
  const hasPM = timeLower.includes('pm');

  let cleanTime = time;
  if (hasAM || hasPM) {
    cleanTime = time.replace(/[apm]/gi, '').trim();
  }

  let [hh, mm] = cleanTime.split(":").map(Number);

  if (isNaN(mm)) mm = 0;

  if (hasPM) {
    if (hh < 12) hh += 12;
  }
  if (hasAM) {
    if (hh === 12) hh = 0;
  }

  return hh * 60 + mm;
};

const CalendarView = ({
  doctor,
  selectedDate,
  setSelectedDate,
  handleSlotClick
}: CalendarViewProps) => {

  const getCurrentTimeMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const isPastSlotForToday = (slotStartTime: string, slotDate: Date) => {
    const today = new Date();
    const slotDateOnly = new Date(slotDate);
    slotDateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);

    if (slotDateOnly.getTime() !== todayOnly.getTime()) {
      return false;
    }

    const currentTimeMinutes = getCurrentTimeMinutes();
    const slotStartMinutes = convertToMinutes(slotStartTime);

    return slotStartMinutes !== null && slotStartMinutes < currentTimeMinutes;
  };

  const isSlotTooFarInAdvance = (slotDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxAdvanceDate = new Date(today);
    maxAdvanceDate.setDate(today.getDate() + 7);
    const slotDateOnly = new Date(slotDate);
    slotDateOnly.setHours(0, 0, 0, 0);

    return slotDateOnly > maxAdvanceDate;
  };

  const isSlotForFutureDate = (slotDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slotDateOnly = new Date(slotDate);
    slotDateOnly.setHours(0, 0, 0, 0);

    return slotDateOnly.getTime() > today.getTime();
  };

  console.log("🟦 Doctor Appointment Window:", {
    from: doctor?.appointment_time_from,
    to: doctor?.appointment_time_to
  });

  const isSlotForToday = (slotDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slotDateOnly = new Date(slotDate);
    slotDateOnly.setHours(0, 0, 0, 0);

    return slotDateOnly.getTime() === today.getTime();
  };

  const handleSlotClickDirect = (doctor: any, date: Date, slot: any) => {
    console.log("🎯🎯🎯 handleSlotClickDirect CALLED!");
    console.log("Slot:", slot);
    console.log("Slot enabled from UI:", slot.enabled);
    console.log("Date:", date);

    const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
    console.log("Day of week:", dayOfWeek);

    const daySchedule = doctor.weeklySchedule?.[dayOfWeek];
    let slotEnabled = true;

    if (daySchedule?.slots) {
      const originalSlot = daySchedule.slots.find((s: any) =>
        s.from === slot.from && s.to === slot.to
      );
      console.log("Original slot from schedule:", originalSlot);
      slotEnabled = originalSlot?.enabled ?? true;
    }

    console.log("Final slotEnabled:", slotEnabled);

    const fixedSlot = {
      ...slot,
      enabled: slotEnabled
    };

    console.log("Sending to handleSlotClick:", fixedSlot);

    handleSlotClick(doctor, date, fixedSlot);
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const getNext30Days = () => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 30; i++) {
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
        isActive: i < 7,
        isInNextMonth: i >= (30 - new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate() - startDate.getDate() + 1)
      });
    }
    return days;
  };

  const next30Days = getNext30Days();
  const currentMonth = next30Days[0].month;

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">

      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {MONTHS[currentMonth]} {next30Days[0].year}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select a date to view available time slots
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs text-gray-600">Leave</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-700"></div>
              <span className="text-xs text-gray-600">Full</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span className="text-xs text-gray-600">Past</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs sm:text-sm font-bold text-gray-500 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center mx-auto">
                {day}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: next30Days[0].dayOfWeek }).map((_, index) => (
            <div key={`empty-before-${index}`} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto"></div>
          ))}

          {next30Days.map((day, index) => {
            const availability = getDoctorAvailabilityForDate(doctor, day.date);
            const isSelected = selectedDate &&
              selectedDate.toDateString() === day.date.toDateString();
            const isPast = isPastDate(day.date);
            const allSlotsFull = areAllSlotsFull(availability, doctor);
            const availableTokens = getAvailableTokensForDate(availability, doctor);

            let dayBgColor = "bg-gray-50";
            let dayTextColor = "text-gray-900";
            let dayBorderColor = "border-transparent";
            let statusColor = "";
            let monthIndicator = "";

            if (isPast) {
              dayBgColor = "bg-gradient-to-br from-gray-100 to-gray-200";
              dayTextColor = "text-gray-400";
              statusColor = "bg-gradient-to-br from-gray-400 to-gray-500";
            } else if (availability.isLeaveDay) {
              dayBgColor = "bg-gradient-to-br from-orange-50 to-amber-50";
              dayBorderColor = "border-orange-200";
              statusColor = "bg-gradient-to-br from-orange-500 to-amber-600";
            } else if (availability.enabled) {
              if (allSlotsFull) {
                dayBgColor = "bg-gradient-to-br from-red-50 to-rose-50";
                dayBorderColor = "border-red-200";
                statusColor = "bg-gradient-to-br from-red-500 to-rose-600";
              } else if (availableTokens > 0) {
                dayBgColor = "bg-gradient-to-br from-green-50 to-emerald-50";
                dayBorderColor = "border-green-200";
                statusColor = "bg-gradient-to-br from-green-500 to-emerald-600";
              } else {
                dayBgColor = "bg-gradient-to-br from-gray-50 to-gray-100";
                dayBorderColor = "border-gray-200";
                statusColor = "bg-gradient-to-br from-gray-300 to-gray-400";
              }
            } else {
              dayBgColor = "bg-gradient-to-br from-gray-50 to-gray-100";
              dayBorderColor = "border-gray-200";
              statusColor = "bg-gradient-to-br from-gray-300 to-gray-400";
            }

            if (index > 0 && day.month !== next30Days[index - 1].month) {
              monthIndicator = "text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full";
            }

            return (
              <div key={index} className="flex flex-col items-center">
                {monthIndicator && (
                  <div className={monthIndicator}>
                    {MONTHS[day.month].substring(0, 3)}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!isPast) {
                      setSelectedDate(day.date);
                      handleSlotClick(doctor, day.date, null); // ⬅ CLEAR SLOT WHEN CLICKING GREY DAY
                    }
                  }}
                  disabled={isPast}

                  className={`
                    relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex flex-col items-center justify-center
                    rounded-full transition-all duration-200 border
                    ${dayBgColor} ${dayBorderColor}
                    ${isPast
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
                  <div className={`
                    text-sm sm:text-base font-bold
                    ${dayTextColor}
                    ${day.isToday && !isPast ? "text-blue-600" : ""}
                    ${isSelected ? "text-blue-700" : ""}
                  `}>
                    {day.dateNumber}
                  </div>

                  {statusColor && (
                    <div className={`
                      absolute bottom-0.5 sm:bottom-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm
                      ${statusColor}
                    `}></div>
                  )}
                </button>

                <div className="mt-1 text-[10px] xs:text-xs text-gray-500">
                  {day.dayName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {doctor.appointment_time_from && doctor.appointment_time_to && (
        <div className="mt-4 mb-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {"Doctor's Appointment Hours"}
              </p>

              <p className="text-gray-600 mt-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {formatTime12Hour(doctor.appointment_time_from)} - {formatTime12Hour(doctor.appointment_time_to)}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Current Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                Only slots within the above time range can be booked.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-white to-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                    Time Slots for {formatShortDate(selectedDate)}
                  </h4>
                  {doctor.appointment_time_from && doctor.appointment_time_to && (
                    <p className="text-sm text-gray-600 mt-1">
                      Available: {formatTime12Hour(doctor.appointment_time_from)} - {formatTime12Hour(doctor.appointment_time_to)}
                    </p>
                  )}
                </div>
              </div>
              {isSlotTooFarInAdvance(selectedDate) && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Cannot book more than 7 days in advance
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedDate(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-300"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">

            {(() => {
              const availability = getDoctorAvailabilityForDate(doctor, selectedDate);
              const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selectedDate.getDay()];

              const fallbackSlots =
                doctor?.weeklySchedule?.[dayName]?.slots || [];

              const slots =
                Array.isArray(availability?.slots) && availability.slots.length > 0
                  ? availability.slots
                  : Array.isArray(fallbackSlots) && fallbackSlots.length > 0
                    ? fallbackSlots
                    : [];



              if (!slots || slots.length === 0) {
                return (
                  <div className="col-span-full text-center py-6 text-gray-500">
                    No slots available for this date
                  </div>
                );
              }

              return slots.map((slot: any, i: number) => {
                const booked = slot.booked || 0;
                const total = slot.token
                  ? parseInt(slot.token)
                  : doctor.token_limit
                    ? parseInt(doctor.token_limit)
                    : 1;
                const remaining = Math.max(0, total - booked);
                const isFull = remaining === 0;

                const isPastSlot = isPastSlotForToday(slot.from, selectedDate);

                const isTooFarInAdvance = isSlotTooFarInAdvance(selectedDate);

                let isEnabled = false;
                let disableReason = "";
                let warningMessage = "";

                const isStartWithinAllowedTime = (slotStartTime: string) => {
                  const slotStart = convertToMinutes(slotStartTime);
                  const fromLimit = doctor?.appointment_time_from
                    ? convertToMinutes(doctor.appointment_time_from)
                    : null;
                  const toLimit = doctor?.appointment_time_to
                    ? convertToMinutes(doctor.appointment_time_to)
                    : null;

                  if (slotStart === null || fromLimit === null || toLimit === null) return true;
                  return slotStart >= fromLimit && slotStart <= toLimit;

                };

                const isEndWithinAllowedTime = (slotEndTime: string) => {
                  const slotEnd = convertToMinutes(slotEndTime);
                  const toLimit = doctor?.appointment_time_to
                    ? convertToMinutes(doctor.appointment_time_to)
                    : null;

                  if (slotEnd === null || toLimit === null) return true;
                  return slotEnd <= toLimit;

                };

                const bookingStart = doctor?.appointment_time_from
                  ? convertToMinutes(doctor.appointment_time_from)
                  : null;
                const bookingEnd = doctor?.appointment_time_to
                  ? convertToMinutes(doctor.appointment_time_to)
                  : null;

                const now = new Date().getHours() * 60 + new Date().getMinutes();

                const isBookingWindowOpen =
                  bookingStart !== null &&
                  bookingEnd !== null &&
                  now >= bookingStart &&
                  now <= bookingEnd;

                if (!isBookingWindowOpen) {
                  disableReason = `Available ${formatTime12Hour(
                    doctor.appointment_time_from
                  )} - ${formatTime12Hour(doctor.appointment_time_to)}`;
                  isEnabled = false;
                } else if (isTooFarInAdvance) {
                  disableReason = "Cannot book more than 7 days in advance";
                  isEnabled = false;
                } else if (isPastSlot) {
                  disableReason = "Time has passed";
                  isEnabled = false;
                } else if (isFull) {
                  disableReason = "Fully booked";
                  isEnabled = false;
                } else {
                  isEnabled = true;
                }

                if (
                  !isEndWithinAllowedTime(slot.to) && isStartWithinAllowedTime(slot.from)) {
                  warningMessage = `⚠️ Ends at ${formatTime12Hour(slot.to)} (closes at ${formatTime12Hour(
                    doctor.appointment_time_to
                  )})`;
                }

                let slotBgColor = "bg-white";
                let borderColor = "border-gray-200";
                let statusBgColor = "bg-gray-100";
                let statusTextColor = "text-gray-600";

                if (!isEnabled) {
                  slotBgColor = "bg-gray-50";
                  borderColor = "border-gray-300";
                } else if (isFull) {
                  slotBgColor = "bg-red-50";
                  borderColor = "border-red-200";
                  statusBgColor = "bg-red-100";
                  statusTextColor = "text-red-900";
                } else {
                  if (remaining > 2) {
                    slotBgColor = "bg-green-50";
                    borderColor = "border-green-200";
                    statusBgColor = "bg-green-100";
                    statusTextColor = "text-green-900";
                  } else if (remaining === 2) {
                    slotBgColor = "bg-amber-50";
                    borderColor = "border-amber-200";
                    statusBgColor = "bg-amber-100";
                    statusTextColor = "text-amber-900";
                  } else {
                    slotBgColor = "bg-orange-50";
                    borderColor = "border-orange-200";
                    statusBgColor = "bg-orange-100";
                    statusTextColor = "text-orange-900";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => isEnabled && handleSlotClickDirect(doctor, selectedDate, slot)}
                    disabled={!isEnabled}
                    className={`relative p-3 sm:p-4 rounded-xl border text-center transition-all
            ${slotBgColor} ${borderColor}
            ${isEnabled
                        ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer hover:border-green-400"
                        : "cursor-not-allowed opacity-70"
                      }
            ${warningMessage ? "border-dashed border-yellow-300" : ""}
          `}
                  >
                    <div className="text-base sm:text-lg font-bold text-gray-900">
                      {formatTime12Hour(slot.from)}
                    </div>

                    <div className="text-xs sm:text-sm text-gray-600">
                      to {formatTime12Hour(slot.to)}
                    </div>

                    <div
                      className={`mt-2 sm:mt-3 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg ${statusBgColor} ${statusTextColor}`}
                    >
                      {!isEnabled
                        ? disableReason
                        : isFull
                          ? "FULLY BOOKED"
                          : `${remaining}/${total} tokens`}
                    </div>

                    {warningMessage && (
                      <div className="mt-2 text-xs text-yellow-600 italic">{warningMessage}</div>
                    )}

                    {isEnabled && !isFull && (
                      <>
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm"></div>
                        </div>

                        <div className="mt-2 text-xs sm:text-sm text-green-700 font-medium flex items-center justify-center gap-1">
                          Book Now <ChevronRight className="h-4 w-4" />
                        </div>
                      </>
                    )}
                  </button>
                );
              });
            })()}

          </div>

        </div>
      )}
    </div>
  );
};

export default CalendarView;