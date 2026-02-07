"use client";
import { HomepageBookingProps } from "@/types";
import { useEffect, useState } from "react";
import { uploadsUrl } from "@/config";
import { getDoctorSchedulesForSite } from "@/lib/api/doctor-schedule";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteSettings } from "@/lib/api/siteSettings";
import BookingForm from "./Doctor/BookingForm";
import CalendarView from "./Doctor/CalendarView";
import { toast } from "sonner";

import { getEnabledPaymentGateways, getAvailableDaysCount, getNextAvailableSlot, formatShortDate } from "./Doctor/utils";
import { Loader2, AlertCircle, Calendar, Clock, User, CreditCard, Star, XCircle, CheckCircle } from "lucide-react";
import Image from 'next/image'
// Move these components inline for now
const StatsCards = ({ doctors, siteSettings }: any) => {
  const enabledGateways = getEnabledPaymentGateways(siteSettings);
  const paymentEnabled = enabledGateways.length > 0;

  const stats = [
    {
      icon: User,
      value: doctors.length,
      label: "Available Doctors",
      color: "blue"
    },
    // {
    //   icon: Calendar,
    //   value: doctors.reduce((acc: number, doc: any) => acc + getAvailableDaysCount(doc, 30), 0),
    //   label: "Available Days (Next 30 days)",
    //   color: "green"
    // },
    // {
    //   icon: Clock,
    //   value: "Instant",
    //   label: "Booking Confirmation",
    //   color: "purple"
    // },
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

};

const HomepageBooking = ({ userId, site }: HomepageBookingProps) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const enabledGateways = getEnabledPaymentGateways(siteSettings);

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
          fetchDoctors()
        ]);

      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDoctors = async () => {
      const data = await getDoctorSchedulesForSite(userId);

      if (data.length === 0) {
        setError("No doctors available for booking at this time");
      }

      const enhancedDoctors = data.map((doctor: any) => {
        const leaveDates = doctor.leaveDates || [];
        const weeklySchedule = doctor.weeklySchedule || {};
        const hasWeeklySchedule = Object.keys(weeklySchedule).length > 0;

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

          const daySchedule = weeklySchedule?.[dayOfWeek];

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
          ...doctor,
          weeklySchedule: weeklySchedule,
          futureSchedule,
          leaveDates,
          hasWeeklySchedule: hasWeeklySchedule,
          token_limit: doctor.token_limit ? parseInt(doctor.token_limit) : 1
        };
      });

      setDoctors(enhancedDoctors);
      if (enhancedDoctors.length > 0) {
        setSelectedDoctor(enhancedDoctors[0]);
      }
    };

    fetchData();
  }, [userId]);

  const handleSlotClick = (doctor: any, date: Date, slot: any) => {
    if (!user || !user.customer_id) {
      toast.error("Please sign in to book an appointment.");
      return;
    }

    console.log("🏠 Slot clicked:", slot);

    const doctorTokens = doctor.token_limit
      ? parseInt(doctor.token_limit)
      : 1;

    const availableTokens = doctorTokens;

    setSelectedDoctor(doctor);
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

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setSelectedSlot(null);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedSlot(null);
    // You might want to refresh data or show success message
  };

  if (loading || loadingSettings) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-700">Loading available doctors...</h3>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Available Doctors</h3>
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
            <Calendar className="h-4 w-4" />
            Book Appointments Online
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Available Doctors for Consultation
          </h2>

        </div>

        <PaymentStatus siteSettings={siteSettings} />
        <StatsCards doctors={doctors} siteSettings={siteSettings} />

        {/* Two-column layout: Left for calendar, Right for booking form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Calendar and Doctor List */}
          <div className="lg:col-span-2 space-y-8">
            {doctors.map((doctor) => {
              const nextSlot = getNextAvailableSlot(doctor);
              const availableDays = getAvailableDaysCount(doctor, 30);

              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="relative self-start">
                        <Image
                          src={`${uploadsUrl}/${doctor.doctorImage}`}
                          alt={doctor.name}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover border-2 border-white shadow-sm"
                        />

                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl">{doctor.name}</h3>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-blue-700">₹{doctor.amount}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-xs font-medium text-gray-700 ml-1">4.8</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">{doctor.experience || '5'}+ years</span> experience
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Calendar View for this doctor */}
                  <CalendarView
                    doctor={doctor}
                    selectedDate={selectedDoctor?.id === doctor.id ? selectedDate : null}
                    setSelectedDate={(date) => {
                      setSelectedDate(date);
                      setSelectedDoctor(doctor);
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
            {showBookingForm && selectedDoctor && selectedSlot && selectedDate ? (
              <div className="sticky top-24">
                <BookingForm
                  doctor={selectedDoctor}
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
                  <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Select a Time Slot
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Choose a doctor, date, and time slot from the calendar to see booking details here.
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
              <span>On leave</span>
            </div>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <span>Not available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageBooking;