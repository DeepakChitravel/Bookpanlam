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
import Image from 'next/image'

import { getEnabledPaymentGateways, getAvailableDaysCount, getNextAvailableSlot, formatShortDate } from "./Doctor/utils";
import { 
  Loader2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  Star, 
  Award,
  MapPin,
  GraduationCap,
  Briefcase,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Globe,
  Heart,
  Stethoscope,
  Users,
  Clock3,
  BadgeCheck,
  Hospital
} from "lucide-react";

// Stats Cards - Responsive
const StatsCards = ({ doctors, siteSettings }: any) => {
  const enabledGateways = getEnabledPaymentGateways(siteSettings);
  const paymentEnabled = enabledGateways.length > 0;

  const stats = [
    {
      icon: User,
      value: doctors.length,
      label: "Available Doctors",
      color: "blue",
      bg: "bg-blue-50",
      text: "text-blue-600"
    },
    {
      icon: Calendar,
      value: doctors.reduce((acc: number, doc: any) => acc + getAvailableDaysCount(doc, 30), 0),
      label: "Available Days",
      color: "green",
      bg: "bg-green-50",
      text: "text-green-600"
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Booking Available",
      color: "purple",
      bg: "bg-purple-50",
      text: "text-purple-600"
    },
    {
      icon: CreditCard,
      value: paymentEnabled ? "Online" : "Cash",
      label: "Payment Method",
      color: "amber",
      bg: "bg-amber-50",
      text: "text-amber-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-2.5 ${stat.bg} rounded-lg shrink-0`}>
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.text}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{stat.value}</p>
              <p className="text-xs text-gray-500 truncate">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Payment Status - Responsive
const PaymentStatus = ({ siteSettings }: any) => {
  const enabledGateways = getEnabledPaymentGateways(siteSettings);
  const paymentEnabled = enabledGateways.length > 0;

  if (!siteSettings) return null;

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-900">Payment Status</p>
            <p className="text-xs text-gray-600 truncate">
              {paymentEnabled ? "Online payments available" : "Pay at hospital"}
            </p>
          </div>
        </div>
        {paymentEnabled && (
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {enabledGateways.map((gateway: string) => (
              <span key={gateway} className="px-2 py-1 bg-white text-xs font-medium text-blue-600 rounded-lg border border-blue-200">
                {gateway}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HomepageBooking = ({ userId, site }: HomepageBookingProps) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [expandedDoctorId, setExpandedDoctorId] = useState<number | null>(null);
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
    };

    fetchData();
  }, [userId]);

const handleSlotClick = (doctor: any, date: Date, slot: any) => {
  if (!user || !user.customer_id) {
    toast.error("Please login to book appointment", {
      id: "login-required-doctor",
      duration: 3000,
    });
    return;
  }

  console.log("🏠 Slot clicked:", slot);

  setSelectedDoctor(doctor);
  setSelectedDate(date);
  setSelectedSlot(slot);
  setShowBookingForm(true);

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
  };

  const toggleDoctorCalendar = (doctorId: number) => {
    setExpandedDoctorId(expandedDoctorId === doctorId ? null : doctorId);
    setSelectedDate(null);
  };

  const handleBookNowClick = (doctor: any, nextSlot: any) => {
    setExpandedDoctorId(doctor.id);
    const date = new Date(nextSlot.date);
    setSelectedDate(date);
    
    setTimeout(() => {
      document.getElementById(`doctor-${doctor.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  if (loading || loadingSettings) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 animate-spin mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-700 text-center">Loading available doctors...</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 text-center">Please wait while we fetch the schedules</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-xl sm:max-w-2xl mx-auto text-center bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <AlertCircle className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-amber-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Available Doctors</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header - Responsive */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 shadow-lg">
            <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4" />
            Book Doctor Appointments Online
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 px-2">
            Our Expert Doctors
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Consult with our experienced specialists and book your appointment instantly
          </p>
        </div>

        <PaymentStatus siteSettings={siteSettings} />
        <StatsCards doctors={doctors} siteSettings={siteSettings} />

        {/* Two-column layout - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column - Doctor Cards */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {doctors.map((doctor) => {
              const nextSlot = getNextAvailableSlot(doctor);
              const availableDays = getAvailableDaysCount(doctor, 30);
              const isExpanded = expandedDoctorId === doctor.id;

              return (
                <div
                  key={doctor.id}
                  id={`doctor-${doctor.id}`}
                  className={`bg-white rounded-xl sm:rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isExpanded ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-200'
                  }`}
                >
                  {/* Main Card Content - Responsive */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Left - Image Section */}
                      <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                          <Image
                            src={`${uploadsUrl}/${doctor.doctorImage}`}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {/* Status Badge */}
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg whitespace-nowrap">
                          Available
                        </div>
                      </div>

                      {/* Right - Details Section */}
                      <div className="flex-1 min-w-0">
                        {/* Title and Price Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                          <div className="text-center sm:text-left">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                              {doctor.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-blue-600 font-medium truncate">
                              {doctor.specialization}
                            </p>
                          </div>
                          <div className="text-center sm:text-right shrink-0">
                            <div className="flex items-center justify-center sm:justify-end gap-1 text-xl sm:text-2xl font-bold text-blue-600">
                              <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span>{doctor.amount}</span>
                            </div>
                            <p className="text-xs text-gray-500">Consultation fee</p>
                          </div>
                        </div>

                        {/* Tags Row - Responsive */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 rounded-full">
                            <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700 whitespace-nowrap">
                              {doctor.experience || '5'}+ years
                            </span>
                          </div>
                          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 rounded-full">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                            <span className="text-xs font-medium text-green-700 whitespace-nowrap">
                              {availableDays} days
                            </span>
                          </div>
                          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-50 rounded-full">
                            <Clock3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700 whitespace-nowrap">
                              Mon - Sat
                            </span>
                          </div>
                        </div>

                        {/* Rating and Qualifications - Responsive */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 ml-1">4.8</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">(128 reviews)</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                            <span>MBBS, MD</span>
                          </div>
                        </div>

                        {/* Languages/Hospital Info - Responsive */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <span>English, Hindi</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Hospital className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <span>City Hospital</span>
                          </div>
                        </div>

                        {/* Next Available Slot - Responsive */}
                        {nextSlot && (
                          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-blue-600 font-medium">Next Available</p>
                                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                                    {nextSlot.isToday ? 'Today' : formatShortDate(nextSlot.date)} • {nextSlot.time}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleBookNowClick(doctor, nextSlot)}
                                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Toggle Calendar Button */}
                        <button
                          onClick={() => toggleDoctorCalendar(doctor.id)}
                          className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl border border-gray-200 transition-all duration-300 group"
                        >
                          <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                            {isExpanded ? 'Hide Available Slots' : 'View All Available Time Slots'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-blue-600 transition-transform" />
                          ) : (
                            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-blue-600 transition-transform" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Calendar */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 overflow-x-auto">
                      <div className="min-w-[300px] sm:min-w-0">
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right column - Booking Form - Responsive */}
          <div className="lg:col-span-1" id="booking-form-section">
            {showBookingForm && selectedDoctor && selectedSlot && selectedDate ? (
              <div className="sticky top-4 sm:top-6 lg:top-24 animate-slideIn">
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
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-lg">
                <div className="flex flex-col items-center justify-center text-center h-[300px] sm:h-[400px] lg:h-[500px]">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                    <Calendar className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
                    Ready to Book?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-xs px-4">
                    Select a doctor and choose your preferred time slot to see booking details here
                  </p>
                  <div className="w-12 sm:w-14 lg:w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend - Responsive */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 ring-2 ring-green-100"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 ring-2 ring-amber-100"></div>
              <span className="text-gray-600">Limited</span>
            </div>
            <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 ring-2 ring-red-100"></div>
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-400 ring-2 ring-gray-100"></div>
              <span className="text-gray-600">Unavailable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
};

export default HomepageBooking;