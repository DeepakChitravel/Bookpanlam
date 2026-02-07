"use client";
import{DepartmentBookingProps} from "@/types";
import { useEffect, useState } from "react";
import { uploadsUrl } from "@/config";
import { getDepartments } from "@/lib/api/departments";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteSettings } from "@/lib/api/siteSettings";
// CHANGE: Import BookingForm instead of BookingModal
import BookingForm from "./Department/BookingModal";
import CalendarView from "./Department/CalendarView";
import { toast } from "sonner";
import Image from 'next/image'
import { getEnabledPaymentGateways, getAvailableDaysCount, getNextAvailableSlot, formatShortDate } from "./Department/utils";
import { Loader2, AlertCircle, Calendar, Clock, Building, CreditCard, Users, XCircle, CheckCircle, Star } from "lucide-react";

// StatsCards with doctor-style UI
const StatsCards = ({ departments, siteSettings }: any) => {
  const enabledGateways = getEnabledPaymentGateways(siteSettings);
  const paymentEnabled = enabledGateways.length > 0;

  const stats = [
    {
      icon: Building,
      value: departments.length,
      label: "Available Departments",
      color: "blue"
    },
    {
      icon: Calendar,
      value: departments.reduce((acc: number, dept: any) => acc + getAvailableDaysCount(dept, 30), 0),
      label: "Available Days (Next 30 days)",
      color: "green"
    },
    {
      icon: Clock,
      value: "Instant",
      label: "Booking Confirmation",
      color: "purple"
    },
    {
      icon: CreditCard,
      value: paymentEnabled ? "Online" : "Cash",
      label: "Payment Method",
      color: "amber"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'green' ? 'bg-green-50 text-green-600' :
                  stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
              } rounded-xl`}>
              <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PaymentStatus = ({ siteSettings }: any) => {
  const enabledGateways = getEnabledPaymentGateways(siteSettings);
  const paymentEnabled = enabledGateways.length > 0;

  if (!siteSettings) return null;

  return (
    <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${paymentEnabled ? "bg-blue-50" : "bg-gray-50"}`}>
            <CreditCard className={`h-6 w-6 ${paymentEnabled ? "text-blue-600" : "text-gray-600"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {paymentEnabled ? "Online Payment Available" : "Pay at Hospital"}
            </h3>
            <p className="text-sm text-gray-600">
              {paymentEnabled
                ? `${enabledGateways.length} payment method${enabledGateways.length > 1 ? "s" : ""} enabled`
                : "Online payment not configured. Pay when you visit the hospital."}
            </p>
          </div>
        </div>

        {paymentEnabled && (
          <div className="flex flex-wrap gap-2">
            {enabledGateways.map((gateway) => (
              <span
                key={gateway}
                className={`px-3 py-1.5 text-xs font-medium rounded-full ${gateway === "Razorpay"
                    ? "bg-blue-100 text-blue-800"
                    : gateway === "PhonePe"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
              >
                {gateway}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DepartmentBooking = ({ userId, site }: DepartmentBookingProps) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // CHANGE: Add state for selected department, slot, and show booking form
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const enabledGateways = getEnabledPaymentGateways(siteSettings);

  // CHANGE: Remove modal state
  // REMOVE: const [bookingModal, setBookingModal] = useState({ ... });

  useEffect(() => {
    const fetchSiteSettings = async () => {
      if (!userId) return;

      try {
        setLoadingSettings(true);
        const settings = await getSiteSettings(userId);
        setSiteSettings(settings);
      } catch (error) {
        console.error("Error fetching site settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };

    if (!userId) {
      setError("Hospital information not available");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        await Promise.all([
          fetchSiteSettings(),
          fetchDepartments()
        ]);

      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      console.log("🟡 Calling getDepartments with userId:", userId);
      const data = await getDepartments(userId);
      console.log("🟡 Departments data received:", data);

      if (data.length === 0) {
        setError("No departments available for booking at this time");
      }

      const enhancedDepartments = data.map((department: any) => {
        // Parse appointmentSettings and leaveDates if they are strings
        const appointmentSettings = typeof department.appointmentSettings === 'string'
          ? JSON.parse(department.appointmentSettings)
          : department.appointmentSettings || {};

        const leaveDates = typeof department.leaveDates === 'string'
          ? JSON.parse(department.leaveDates)
          : department.leaveDates || [];

        const hasWeeklySchedule = Object.keys(appointmentSettings).length > 0;

        const futureSchedule: { [key: string]: any } = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureDays = 60;

        for (let i = 0; i < futureDays; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          date.setHours(0, 0, 0, 0);

          const dateKey = date.toISOString().split('T')[0];
          const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

          let isLeaveDay = false;
          for (const leaveDateStr of leaveDates) {
            try {
              const leaveDate = new Date(leaveDateStr);
              leaveDate.setHours(0, 0, 0, 0);

              if (leaveDate.getTime() === date.getTime()) {
                isLeaveDay = true;
                break;
              }
            } catch (e) {
              console.error("Error parsing leave date:", leaveDateStr, e);
            }
          }

          const daySchedule = appointmentSettings?.[dayOfWeek];

          if (isLeaveDay) {
            futureSchedule[dateKey] = {
              enabled: false,
              slots: [],
              dayOfWeek,
              date: new Date(date),
              isLeaveDay: true,
              hasWeeklySchedule: hasWeeklySchedule,
              dayHasSchedule: !!daySchedule,
              dayEnabled: daySchedule?.enabled || false
            };
          } else if (daySchedule?.enabled && daySchedule.slots?.length > 0) {
            const isDayEnabled = daySchedule.enabled === true || daySchedule.enabled === "true";
            const enhancedSlots = daySchedule.slots.map((slot: any) => ({
              ...slot,
              enabled: isDayEnabled ? (slot.enabled ?? true) : false
            }));

            futureSchedule[dateKey] = {
              enabled: isDayEnabled,
              slots: enhancedSlots,
              dayOfWeek,
              date: new Date(date),
              isLeaveDay: false,
              hasWeeklySchedule: true,
              dayHasSchedule: true,
              dayEnabled: isDayEnabled
            };
          } else {
            futureSchedule[dateKey] = {
              enabled: false,
              slots: [],
              dayOfWeek,
              date: new Date(date),
              isLeaveDay: false,
              hasWeeklySchedule: hasWeeklySchedule,
              dayHasSchedule: !!daySchedule,
              dayEnabled: daySchedule?.enabled || false
            };
          }
        }

        return {
          ...department,
          appointmentSettings,
          futureSchedule,
          leaveDates,
          hasWeeklySchedule: hasWeeklySchedule,
          token_limit: department.token_limit ? parseInt(department.token_limit) : 1
        };
      });

      setDepartments(enhancedDepartments);
      // CHANGE: Set first department as selected
      if (enhancedDepartments.length > 0) {
        setSelectedDepartment(enhancedDepartments[0]);
      }
    };

    fetchData();
  }, [userId]);

  // CHANGE: Update handleSlotClick to use inline form
  const handleSlotClick = (department: any, date: Date, slot: any) => {
    if (!user || !user.customer_id) {
      toast.error("Please sign in to book an appointment.");
      return;
    }

    console.log("🏥 Department Slot clicked:", slot);

    setSelectedDepartment(department);
    setSelectedDate(date);
    setSelectedSlot(slot);
    setShowBookingForm(true);
    
    // Scroll to booking form
    setTimeout(() => {
      document.getElementById('booking-form-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // CHANGE: Add close booking form function
  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setSelectedSlot(null);
  };

  // CHANGE: Add booking success function
  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedSlot(null);
  };

  if (loading || loadingSettings) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-700">Loading available departments...</h3>
            <p className="text-gray-500 mt-2">Please wait while we fetch the schedules</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Available Departments</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Building className="h-4 w-4" />
            Book Department Appointments Online
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Available Departments for Consultation
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Select a department and choose your preferred date & time slot. All consultations are confirmed instantly.
          </p>
        </div>

        <PaymentStatus siteSettings={siteSettings} />
        <StatsCards departments={departments} siteSettings={siteSettings} />

        {/* Two-column layout: Left for calendar, Right for booking form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Calendar and Department List */}
          <div className="lg:col-span-2 space-y-8">
            {departments.map((department) => {
              const nextSlot = getNextAvailableSlot(department);
              const availableDays = getAvailableDaysCount(department, 30);

              return (
                <div
                  key={department.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="relative self-start">
                        {department.image && (
                          <Image
                            src={`${uploadsUrl}/${department.image}`}
                            alt={department.name}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
                          />
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          Open
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl">{department.name}</h3>
                            <p className="text-sm text-gray-600">{department.description || "Comprehensive department services"}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-blue-700">
                              ₹{department.consultation_fee || "Consultation"}
                            </p>
                            <p className="text-xs text-gray-500">per session</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-600" />
                            <span className="text-xs font-medium text-gray-700 ml-1">
                              {department.staffCount || 'Multiple'} specialists
                            </span>
                          </div>
                          <div className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            {availableDays} days available
                          </div>
                          {department.leaveDates?.length > 0 && (
                            <div className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              {department.leaveDates.length} holiday{department.leaveDates.length > 1 ? 's' : ''}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-xs font-medium text-gray-700 ml-1">4.5</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {nextSlot && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Next available: {nextSlot.isToday ? 'Today' : formatShortDate(nextSlot.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-blue-700">
                              {nextSlot.time}
                            </span>
                            <button
                              onClick={() => {
                                const date = new Date(nextSlot.date);
                                handleSlotClick(department, date, { from: nextSlot.time, to: "04:00PM" });
                              }}
                              className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-sm"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Calendar View for this department */}
                  <CalendarView
                    department={department}
                    selectedDate={selectedDepartment?.id === department.id ? selectedDate : null}
                    setSelectedDate={(date) => {
                      setSelectedDate(date);
                      setSelectedDepartment(department);
                    }}
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    handleSlotClick={handleSlotClick}
                  />
                </div>
              );
            })}
          </div>

          {/* Right column - Booking Form */}
          <div className="lg:col-span-1" id="booking-form-section">
            {showBookingForm && selectedDepartment && selectedSlot && selectedDate ? (
              <div className="sticky top-24">
                <BookingForm
                  department={selectedDepartment}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  user={user}
                  siteSettings={siteSettings}
                  onClose={handleCloseBookingForm}
                  onSuccess={handleBookingSuccess}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
                <div className="flex flex-col items-center justify-center text-center h-[400px]">
                  <Building className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Select a Time Slot
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Choose a department, date, and time slot from the calendar to see booking details here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-sm text-gray-600 bg-white border border-gray-200 rounded-2xl px-4 sm:px-6 py-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>Available (has schedule & slots)</span>
            </div>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500"></div>
              <span>On holiday</span>
            </div>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-400"></div>
              <span>Not available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DepartmentBooking;