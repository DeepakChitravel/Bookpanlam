"use client";

import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { Plus, Minus, Star, Clock, Flame, Heart, Vegan, Beef, ChefHat, Coffee, MapPin, Phone, CalendarDays, Utensils, Salad, Dessert, Wine, Search, Filter, Users, Calendar, DoorOpen, Plane, Waves, Anchor, Navigation, Map, Compass } from "lucide-react";
import { getMenuItems } from "@/lib/api/menu";
import { getRestaurantSettings, isRestaurantOpen, getFormattedHours, getFormattedDays } from "@/lib/api/restaurant";
import { uploadsUrl } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import { createBooking, checkAvailability } from "@/lib/api/bookings";
import Image from "next/image"; // Added Image import

const getImageUrl = (path: string) => {
  if (!path) return "";
  return `${uploadsUrl}${path.replace("/uploads", "")}`;
};

export default function HotelMenu({ userId, site }: { userId: number; site: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);

  const [reservationForm, setReservationForm] = useState({
    name: "",
    email: "",
    phone: "",
    seats: "",
    date: "",
    time: "",
    specialRequests: ""
  });

  // Use the AuthContext
  const { user, loading: userLoading } = useAuth();

  // Auto-fill form when user data is available
  useEffect(() => {
    if (user) {
      console.log("User data available for form:", user);
      setReservationForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  // Format time to 12-hour format - wrapped in useCallback
  const formatTimeTo12Hour = useCallback((time24: string | undefined | null) => {
    if (!time24) return "";

    try {
      const timeStr = time24.toString().trim();
      if (!timeStr.includes(':')) return timeStr;

      const [hourStr, minuteStr] = timeStr.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        console.warn("Invalid time format:", time24);
        return timeStr;
      }

      const meridiem = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;

      return `${displayHour}:${minute.toString().padStart(2, '0')} ${meridiem}`;
    } catch (error) {
      console.error("Error formatting time:", time24, error);
      return time24 || "";
    }
  }, []);

  // Parse time string to 24-hour format - wrapped in useCallback
  const parseTimeTo24Hour = useCallback((timeStr: string) => {
    if (!timeStr) {
      console.warn("Empty time string provided");
      return { hour: 9, minute: 0 };
    }

    try {
      let normalizedTime = timeStr.trim().toUpperCase();
      normalizedTime = normalizedTime.replace(/\s+/g, ' ');

      if (!normalizedTime.includes(' ')) {
        normalizedTime = normalizedTime.replace(/(AM|PM)/, ' $1');
      }

      const timeMatch = normalizedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

      if (!timeMatch) {
        const simpleMatch = normalizedTime.match(/(\d{1,2})\s*(AM|PM)/i);
        if (simpleMatch) {
          let hour = parseInt(simpleMatch[1]);
          const meridiem = simpleMatch[2].toUpperCase();

          if (meridiem === "PM" && hour !== 12) hour += 12;
          if (meridiem === "AM" && hour === 12) hour = 0;

          console.log("Parsed simple time:", { hour, minute: 0 });
          return { hour, minute: 0 };
        }

        console.warn("Time parsing failed for:", timeStr);
        return { hour: 9, minute: 0 };
      }

      let hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const meridiem = timeMatch[3].toUpperCase();

      if (meridiem === "PM" && hour !== 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;

      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        console.warn("Invalid time values:", { hour, minute });
        return { hour: Math.max(0, Math.min(23, hour)), minute: Math.max(0, Math.min(59, minute)) };
      }

      console.log("Parsed time successfully:", { hour, minute });
      return { hour, minute };
    } catch (error) {
      console.error("Error parsing time:", timeStr, error);
      return { hour: 9, minute: 0 };
    }
  }, []);

  // Helper function to check if a specific table is booked
  const checkIfTableBooked = useCallback((tableId: number, startTime: string, endTime: string) => {
    if (!bookedSlots || !startTime || !endTime) return false;

    return bookedSlots.some(slot => {
      if (!slot || slot.date !== reservationForm.date || slot.tableId !== tableId) {
        return false;
      }

      const timesOverlap = !(endTime <= slot.startTime || startTime >= slot.endTime);
      return timesOverlap;
    });
  }, [bookedSlots, reservationForm.date]);

  // Check if a time slot is already booked
  const checkIfSlotBooked = useCallback((startTime: string, endTime: string) => {
    if (!startTime || !endTime || !bookedSlots) return false;

    const toMinutes = (timeStr: string) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return (hours || 0) * 60 + (minutes || 0);
    };

    const slotStart = toMinutes(startTime);
    const slotEnd = toMinutes(endTime);

    return bookedSlots.some(slot => {
      if (!slot || slot.date !== reservationForm.date) return false;

      const bookingStart = toMinutes(slot.startTime);
      const bookingEnd = toMinutes(slot.endTime);

      return !(slotEnd <= bookingStart || slotStart >= bookingEnd);
    });
  }, [bookedSlots, reservationForm.date]);

  // Generate available time slots
  const generateAvailableTimeSlots = useCallback(() => {
    if (!reservationForm.seats || !reservationForm.date || !restaurantData?.tables) {
      console.log("❌ Missing data for slot generation:", {
        seats: reservationForm.seats,
        date: reservationForm.date,
        tables: restaurantData?.tables
      });
      return [];
    }

    const seats = parseInt(reservationForm.seats);
    const settings = restaurantData.settings;

    if (!settings) {
      console.log("❌ No restaurant settings found");
      return [];
    }

    const openingTimeStr = settings?.start_time ?
      `${settings.start_time} ${settings.start_meridiem || 'AM'}` : "9:00 AM";
    const closingTimeStr = settings?.end_time ?
      `${settings.end_time} ${settings.end_meridiem || 'PM'}` : "10:00 PM";

    console.log("⏰ Restaurant Hours:", { openingTimeStr, closingTimeStr });

    const openingTime = parseTimeTo24Hour(openingTimeStr);
    const closingTime = parseTimeTo24Hour(closingTimeStr);

    console.log("📊 Parsed times:", {
      opening: openingTime,
      closing: closingTime,
      openingDisplay: `${openingTime.hour}:${openingTime.minute.toString().padStart(2, '0')}`,
      closingDisplay: `${closingTime.hour}:${closingTime.minute.toString().padStart(2, '0')}`
    });

    if (isNaN(openingTime.hour) || isNaN(openingTime.minute) ||
      isNaN(closingTime.hour) || isNaN(closingTime.minute)) {
      console.error("❌ Invalid time values after parsing");
      return [];
    }

    const suitableTables = restaurantData.tables.filter((table: any) =>
      table.seats >= seats
    );

    console.log("🪑 Suitable tables for", seats, "seats:", suitableTables.length);

    if (suitableTables.length === 0) {
      console.log("❌ No suitable tables found");
      return [];
    }

    const slotDuration = suitableTables[0].eating_time || 60;
    console.log("⏱️ Slot duration:", slotDuration, "minutes");

    const slots = [];
    let currentHour = openingTime.hour;
    let currentMinute = openingTime.minute;
    const closingHour = closingTime.hour;
    const closingMinute = closingTime.minute;

    console.log("🔄 Starting from:", currentHour, ":", currentMinute);
    console.log("🛑 Ending at:", closingHour, ":", closingMinute);

    let slotCount = 0;
    let iterationCount = 0;
    const maxIterations = 100;

    while (iterationCount < maxIterations) {
      iterationCount++;

      let endHour = currentHour;
      let endMinute = currentMinute + slotDuration;

      while (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }

      const isAfterClosing = endHour > closingHour ||
        (endHour === closingHour && endMinute > closingMinute);

      const isStartAfterClosing = currentHour > closingHour ||
        (currentHour === closingHour && currentMinute >= closingMinute);

      if (isAfterClosing || isStartAfterClosing) {
        console.log("⏰ Stopping - would exceed closing time");
        break;
      }

      const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      if (!startTime || !endTime) {
        console.error("❌ Invalid time string generated");
        break;
      }

      console.log(`🕐 Generated slot ${slotCount + 1}: ${startTime} - ${endTime}`);

      const isSlotBooked = checkIfSlotBooked(startTime, endTime);

      if (!isSlotBooked) {
        const availableTablesForSlot = suitableTables.filter((table: any) => {
          return !checkIfTableBooked(table.id, startTime, endTime);
        });

        if (availableTablesForSlot.length > 0) {
          slots.push({
            start: startTime,
            end: endTime,
            display: `${formatTimeTo12Hour(startTime)} - ${formatTimeTo12Hour(endTime)}`,
            duration: slotDuration,
            availableTables: availableTablesForSlot
          });
          slotCount++;
          console.log(`✅ Slot ${slotCount} added`);
        } else {
          console.log(`❌ No available tables for slot ${startTime}-${endTime}`);
        }
      } else {
        console.log(`⛔ Slot ${startTime}-${endTime} is already booked`);
      }

      currentHour = endHour;
      currentMinute = endMinute;
    }

    console.log(`🎯 Generated ${slotCount} available slots`);
    console.log("📅 Slots:", slots.map(s => `${s.start}-${s.end}`));

    return slots;
  }, [reservationForm.seats, reservationForm.date, restaurantData?.tables, restaurantData?.settings, checkIfSlotBooked, checkIfTableBooked, formatTimeTo12Hour, parseTimeTo24Hour]);

  // Get day name from date
  const getDayFromDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Check if today is open
  const isTodayOpen = () => {
    if (!restaurantData?.settings?.operating_days) return false;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const shortDay = today.slice(0, 3); // "mon", "tue", etc.
    return restaurantData.settings.operating_days.includes(shortDay);
  };

  // Check if day is open for reservation - wrapped in useCallback
  const isDayOpenForReservation = useCallback((dateString: string) => {
    if (!dateString || !restaurantData?.settings?.operating_days) return false;

    const date = new Date(dateString);
    const shortDay = date.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase(); // mon, tue, wed...

    return restaurantData.settings.operating_days.includes(shortDay);
  }, [restaurantData?.settings?.operating_days]);

  useEffect(() => {
    if (!reservationForm.seats || !reservationForm.date) {
      setAvailableTimeSlots([]);
      return;
    }

    // Check if selected day is open
    const isOpen = isDayOpenForReservation(reservationForm.date);

    if (!isOpen) {
      setAvailableTimeSlots([]); // Hide all times
      return;
    }

    // Day is open → generate slots
    if (restaurantData?.tables) {
      const slots = generateAvailableTimeSlots();
      setAvailableTimeSlots(slots);
    }
  }, [reservationForm.seats, reservationForm.date, restaurantData?.tables, bookedSlots, isDayOpenForReservation, generateAvailableTimeSlots]); // Added dependencies

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch menu items
      console.log("Fetching menu items...");
      const menuData = await getMenuItems(userId);
      console.log("Menu items fetched:", menuData);
      setItems(menuData || []);

      // Fetch restaurant settings
      try {
        console.log("Fetching restaurant settings...");
        const result = await getRestaurantSettings();
        console.log("✅ RESTAURANT DATA RECEIVED:", result);

        if (menuData && menuData.length > 0) {
          console.log("🔍 First item details:", menuData[0]);
          console.log("🔍 First item has prebooking_enabled?", menuData[0].prebooking_enabled);
          console.log("🔍 First item prebooking_min_amount:", menuData[0].prebooking_min_amount);
          console.log("🔍 First item prebooking_max_amount:", menuData[0].prebooking_max_amount);
          console.log("🔍 First item prebooking_advance_days:", menuData[0].prebooking_advance_days);

          // Also check all properties of the first item
          console.log("📋 All properties of first item:", Object.keys(menuData[0]));
        }

        setItems(menuData || []);
        setRestaurantData(result);

        // Initialize available tables
        if (result?.tables) {
          setAvailableTables(result.tables);
        }

      } catch (error) {
        console.error("❌ Failed to fetch restaurant settings:", error);
        setRestaurantData({
          settings: null,
          tables: [],
          summary: {
            total_tables: 0,
            total_seats: 0,
            avg_eating_time: 0
          }
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const uniqueSeatOptions = Array.from(
    new Set(availableTables.map((t) => Number(t.seats)))
  ).sort((a, b) => a - b);

  // Handle form changes
  const handleFormChange = (field: string, value: string) => {
    if (user && ['name', 'email', 'phone'].includes(field)) {
      return;
    }

    setReservationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle time slot selection
  const handleTimeSelect = (slot: any) => {
    setReservationForm(prev => ({
      ...prev,
      time: slot.start
    }));
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to make a reservation");
      return;
    }

    if (!reservationForm.seats || !reservationForm.date || !reservationForm.time) {
      alert("Please fill all required fields and select a time slot");
      return;
    }

    // Find the selected time slot
    const selectedSlot = availableTimeSlots.find(slot => slot.start === reservationForm.time);

    if (!selectedSlot) {
      alert("Please select a valid time slot");
      return;
    }

    // Find an available table for this slot
    const availableTable = selectedSlot.availableTables[0];

    if (!availableTable) {
      alert("No tables available for the selected time. Please choose another slot.");
      return;
    }

    try {
      const bookingData = {
        customerId: user.customer_id,
        customerName: reservationForm.name,
        customerEmail: reservationForm.email,
        customerPhone: reservationForm.phone,

        tableId: availableTable.id,
        tableNumber: availableTable.table_number,

        bookingDate: reservationForm.date,
        day: getDayFromDate(reservationForm.date),
        startTime: reservationForm.time,
        endTime: selectedSlot.end,
        duration: selectedSlot.duration,
        seats: parseInt(reservationForm.seats),
        specialRequests: reservationForm.specialRequests || ""
      };

      console.log("📤 Sending booking data:", bookingData);

      const result = await createBooking(bookingData);

      if (result.success) {
        alert(`🎉 Booking confirmed!\n\nBooking Reference: ${result.data?.reference}\nDate: ${bookingData.bookingDate} (${bookingData.day})\nTime: ${bookingData.startTime} - ${bookingData.endTime}\nTable: ${bookingData.tableNumber}\nSeats: ${bookingData.seats}\n\nStatus: ${result.data?.status}\n\nWe&apos;ve sent a confirmation to ${bookingData.customerEmail}`); // Fixed apostrophe

        // Add to booked slots
        setBookedSlots(prev => [...prev, {
          date: bookingData.bookingDate,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          tableId: bookingData.tableId
        }]);

        // Reset form (but keep user data)
        setReservationForm(prev => ({
          ...prev,
          seats: "",
          date: "",
          time: "",
          specialRequests: ""
        }));
        setAvailableTimeSlots([]);

      } else {
        alert(`Failed to create booking: ${result.message}`);
      }

    } catch (error: any) {
      console.error("❌ Booking error:", error);
      alert(`Booking failed: ${error.message || "Please try again"}`);
    }
  };

  // Check real-time availability
  const checkRealTimeAvailability = async (date: string, seats: number) => {
    if (!restaurantData?.settings?.id) return false;

    try {
      // Check for each time slot
      const slotsWithAvailability = [];

      for (const slot of generateAvailableTimeSlots()) {
        const availability = await checkAvailability(
          restaurantData.settings.id,
          date,
          slot.start,
          slot.end,
          seats
        );

        if (availability.available) {
          slot.availableTables = availability.availableTables || [];
          slotsWithAvailability.push(slot);
        }
      }

      setAvailableTimeSlots(slotsWithAvailability);
      return slotsWithAvailability.length > 0;
    } catch (error) {
      console.error("❌ Availability check failed:", error);
      return false;
    }
  };

  // Get restaurant status
  const isOpen = restaurantData?.settings ? isRestaurantOpen(restaurantData.settings) : false;
  const totalTables = restaurantData?.summary?.total_tables || 0;
  const totalSeats = restaurantData?.summary?.total_seats || 0;
  const avgEatingTime = restaurantData?.summary?.avg_eating_time || 0;
  const hasRestaurantData = restaurantData && (restaurantData.settings || restaurantData.tables?.length > 0);

  // Format price
  const formatPrice = (price: any) => `₹${Number(price || 0).toFixed(0)}`;

  // Toggle favorite
  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Category icons mapping with travel theme
  const categoryIcons = {
    all: Plane,
    starter: Compass,
    main: Anchor,
    dessert: Waves,
    beverage: Navigation,
    soup: Map,
    salad: ChefHat,
    snack: Utensils
  };

  const categories = [
    { id: "all", name: "All Cuisines", icon: Plane },
    { id: "starter", name: "Appetizers", icon: Compass },
    { id: "main", name: "Main Course", icon: Anchor },
    { id: "dessert", name: "Desserts", icon: Waves },
    { id: "beverage", name: "Beverages", icon: Navigation },
    { id: "salad", name: "Salads", icon: ChefHat }
  ];

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
      {/* Hero Header with Maldives Theme */}
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 overflow-hidden">
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 sm:h-20 text-blue-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>

        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">Ocean Breeze Restaurant</h1>

            {/* Restaurant Status with travel theme */}
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-6 sm:mb-8 border border-white/30">
              <div className={`h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 rounded-full ${isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              
              <span className="text-white font-semibold text-sm sm:text-base lg:text-lg">
                {isOpen ? "⚓ Open for Dining" : "🌙 Currently Closed"}
              </span>
              <span className="text-white/80 ml-2 sm:ml-4 text-xs sm:text-sm">
                <Plane className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 inline mr-1 sm:mr-2" />
                Book Your Culinary Journey
              </span>
            </div>

            <p className="text-lg sm:text-xl lg:text-2xl text-cyan-100 mb-6 sm:mb-8 lg:mb-10 font-light">Where Every Meal is a Destination</p>

            {/* Maldives-style search and booking bar */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 lg:mb-10 border border-white/30">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center justify-center">
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
                  <div className="text-left">
                    <div className="flex items-center gap-2 text-white mb-1 sm:mb-2">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-medium">Destination</span>
                    </div>
                    <div className="text-white text-base sm:text-lg font-semibold">Ocean View Dining</div>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2 text-white mb-1 sm:mb-2">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-medium">Check In</span>
                    </div>
                    <div className="text-white text-base sm:text-lg font-semibold">Today</div>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2 text-white mb-1 sm:mb-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-medium">Check Out</span>
                    </div>
                    <div className="text-white text-base sm:text-lg font-semibold">After 2 Hours</div>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2 text-white mb-1 sm:mb-2">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-medium">Guests</span>
                    </div>
                    <div className="text-white text-base sm:text-lg font-semibold">Select Below</div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-2xl mt-4 sm:mt-0">
                  <input
                    type="text"
                    placeholder="Search for exotic dishes, local specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 pl-12 sm:pl-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-sm sm:text-base"
                  />
                  <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-white/70" />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all text-xs sm:text-sm">
                    Explore
                  </button>
                </div>
              </div>
            </div>

            {/* Restaurant Info Bar */}
            {hasRestaurantData && restaurantData.settings && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center bg-white/10 backdrop-blur-sm p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/20">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-white mb-2 sm:mb-3">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="font-semibold text-sm sm:text-base lg:text-lg">Sailing Hours</span>
                  </div>
                  <p className="text-cyan-100 text-sm sm:text-base">
                    {getFormattedHours(restaurantData.settings)}
                  </p>
                </div>

                {/* Then modify the Open Days section: */}
                <div className="text-center bg-white/10 backdrop-blur-sm p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/20">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-white mb-2 sm:mb-3">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="font-semibold text-sm sm:text-base lg:text-lg">Open Days</span>
                  </div>
                  <p className="text-cyan-100 text-sm sm:text-base">
                    {getFormattedDays(restaurantData.settings)}
                  </p>
                  {restaurantData?.settings?.operating_days && (
                    <p className="text-xs sm:text-sm mt-1 sm:mt-2 text-cyan-200">
                      {isTodayOpen() ? "✓ Open today" : "✗ Closed today"}
                    </p>
                  )}
                </div>

                <div className="text-center bg-white/10 backdrop-blur-sm p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/20">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-white mb-2 sm:mb-3">
                    <Anchor className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="font-semibold text-sm sm:text-base lg:text-lg">Docking Capacity</span>
                  </div>
                  <p className="text-cyan-100 text-sm sm:text-base">
                    {totalTables} tables • {totalSeats} passengers
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        {/* Let's Discover Section */}
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full mb-3 sm:mb-4 text-xs sm:text-sm">
            <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-semibold">Let&apos;s Discover</span> {/* Fixed apostrophe */}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">A Culinary Journey Across The Seven Seas</h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Whether you&apos;re seeking romantic dinners, adventurous flavors, or friendly family feasts, {/* Fixed apostrophe */}
            our restaurant offers tailored culinary experiences that sail beyond your expectations.
          </p>
        </div>

        {/* Control Bar with travel tabs */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
          {/* Categories as travel tabs */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 sm:gap-3 pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-lg sm:rounded-xl transition-all duration-300 whitespace-nowrap border-2 text-xs sm:text-sm
                      ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl scale-105 border-blue-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-cyan-300 hover:shadow-lg hover:bg-blue-50'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedCategory === category.id ? 'text-white' : 'text-blue-600'}`} />
                    <span className="font-medium">{category.name}</span>
                    {selectedCategory === category.id && (
                      <span className="ml-1 sm:ml-2 text-xs bg-white/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Dropdown with travel theme */}
          <div className="relative w-full lg:w-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border-2 border-blue-200 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm sm:text-base w-full"
              >
                <option value="popular">Most Popular Routes</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Travel Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border-2 border-blue-200 shadow-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">{items.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Total Culinary Destinations</div>
            <div className="text-xs text-blue-500 mt-1 flex items-center gap-1">
              <Plane className="h-3 w-3" />
              Ready to explore
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border-2 border-green-200 shadow-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">4.8</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Average Rating</div>
            <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Excellent reviews
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border-2 border-purple-200 shadow-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600">{avgEatingTime}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Avg. Journey Time</div>
            <div className="text-xs text-purple-500 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Minutes per experience
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border-2 border-orange-200 shadow-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600">{totalSeats}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Total Capacity</div>
            <div className="text-xs text-orange-500 mt-1 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Seats available
            </div>
          </div>
        </div>

        {/* Most Popular Culinary Destinations */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Most Popular Culinary Destinations</h3>
              <p className="text-gray-600 text-sm sm:text-base">Something amazing waiting for you</p>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">All Services</span>
              <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">Activities</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">Amenities</span>
            </div>
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 sm:h-56 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                  <div className="p-4 sm:p-6">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded mb-3 sm:mb-4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200">
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 opacity-20">🌴</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">No culinary destinations found</h3>
              <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 sm:px-6 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm sm:text-base"
              >
                Explore All Destinations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredItems.map((item) => {
                const isFavorite = favorites.includes(item.id);
                const foodTypeIcon = item.food_type === "veg" ? "🌱" : "🍗";

                return (
                  <div key={item.id} className="group bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 overflow-hidden">
                    {/* Image Section */}
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      {item.image ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={getImageUrl(item.image)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-200 flex items-center justify-center">
                          <div className="text-5xl sm:text-6xl opacity-20">🍽️</div>
                        </div>
                      )}

                      {/* Prebooking Overlay Badge */}
                      {item.prebooking_enabled && (
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            <span className="hidden xs:inline">Early Booking</span>
                          </span>
                        </div>
                      )}

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-1 sm:gap-2">
                        {item.popular && (
                          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            <span className="hidden xs:inline">Hot Destination</span>
                          </span>
                        )}
                        {item.chef_special && (
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs">
                            Captain&apos;s Choice {/* Fixed apostrophe */}
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-3 sm:top-4 right-12 sm:right-16 bg-white/20 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        />
                      </button>

                      {/* Food Type */}
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-black/60 backdrop-blur-sm text-white text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                        {foodTypeIcon} {item.food_type === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                      </div>

                      {/* Prep Time */}
                      {item.preparation_time && (
                        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.preparation_time} min journey
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 sm:p-6">
                      {/* Title and Rating */}
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-current" />
                          <span className="text-sm font-bold text-gray-900">4.5</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 min-h-[2.5rem]">
                        {item.description || "A culinary masterpiece crafted with premium ingredients"}
                      </p>

                      {/* Nutritional Tags */}
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-5">
                        {item.healthy && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-1">
                            <Vegan className="h-3 w-3" />
                            Healthy
                          </span>
                        )}
                        {item.spicy_level > 0 && (
                          <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            Spicy Lv.{item.spicy_level}
                          </span>
                        )}
                        {item.calories && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                            {item.calories} cal
                          </span>
                        )}
                      </div>

                      {/* Price and Action */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-900">
                            {formatPrice(item.price)}
                            <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">/journey</span>
                          </div>

                          {/* Prebooking Badge */}
                          {item.prebooking_enabled && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                              <div className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full font-medium">
                                ⚡ Early Booking Available
                              </div>
                              <span className="text-xs text-gray-600">
                                ₹{item.prebooking_min_amount || 100} - ₹{item.prebooking_max_amount || 500}
                              </span>
                            </div>
                          )}

                          {item.stock_type === "limited" && item.stock_qty > 0 && (
                            <div className="text-xs text-blue-600 mt-1 sm:mt-2 font-medium flex items-center gap-1">
                              <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
                              Only {item.stock_qty} seats left
                            </div>
                          )}

                          {item.stock_type === "out_of_stock" && (
                            <div className="text-xs text-red-600 mt-1 sm:mt-2 font-medium flex items-center gap-1">
                              <span className="h-2 w-2 bg-red-600 rounded-full"></span>
                              Fully Booked
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex flex-col gap-1 sm:gap-2 mt-2 sm:mt-0">
                          {item.prebooking_enabled ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Prebook item:", item.id);
                                alert(`Early Booking for ${item.name}\nAmount Range: ₹${item.prebooking_min_amount || 100} - ₹${item.prebooking_max_amount || 500}\nAdvance Days: ${item.prebooking_advance_days || 7}`);
                              }}
                              className="group/btn bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                            >
                              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:rotate-12 transition-transform" />
                              <span>Book Early</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Add to cart:", item.id);
                              }}
                              className="group/btn bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                            >
                              <Plus className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:rotate-90 transition-transform" />
                              <span>Add to Journey</span>
                            </button>
                          )}
                          <span className="text-xs text-gray-500 text-center">
                            {item.prebooking_enabled ? "Reserve your spot early" : "Add to your culinary journey"}
                          </span>
                        </div>
                      </div>

                      {/* Prebooking Details */}
                      {item.prebooking_enabled && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                            <span className="font-medium">Early Booking Details:</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">Amount:</span>
                              <span className="font-medium text-blue-600">
                                ₹{item.prebooking_min_amount || 100} - ₹{item.prebooking_max_amount || 500}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">Advance:</span>
                              <span className="font-medium text-blue-600">
                                {item.prebooking_advance_days || 7} days
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                            Secure your experience with partial payment
                          </p>
                        </div>
                      )}

                      {/* Variations Indicator */}
                      {item.variations && item.variations.length > 0 && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                          <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2">
                            <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                              {item.variations.length} customization routes
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>Customize your journey</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dream Your Next Culinary Journey */}
          <div className="mt-12 sm:mt-14 lg:mt-16 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl border-2 border-blue-200 p-6 sm:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Dream Your Next Culinary Journey</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    Are you tired of the typical dining experiences and looking to step out of your comfort zone?
                    Our restaurant offers adventurous culinary journeys that may be the perfect solution for you.
                  </p>
                  <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:from-blue-700 hover:to-cyan-600 transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Explore More Journeys</span>
                  </button>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-100">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-4">
                      <Anchor className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-semibold text-sm sm:text-base">Best Culinary Agency</span>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base mb-3 sm:mb-4">We&apos;ve got the perfect dining experiences for you.</p> {/* Fixed apostrophe */}
                    <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">98%</div>
                    <div className="text-sm text-gray-600">Customer Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simplified Reservation Section with Travel Theme */}
          <div className="mt-12 sm:mt-14 lg:mt-16 bg-gradient-to-r from-white to-blue-50 rounded-xl sm:rounded-2xl border-2 border-blue-200 p-6 sm:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg sm:rounded-xl">
                  <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Book Your Table Journey</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {userLoading ? "Checking journey status..." :
                      user ? "Welcome back explorer! Your details are pre-filled." :
                        "Reserve your dining destination in advance"}
                  </p>
                </div>
              </div>

              {/* User Status Indicator */}
              {userLoading ? (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-100 rounded-lg sm:rounded-xl animate-pulse">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3 mb-1 sm:mb-2"></div>
                  <div className="h-4 sm:h-6 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : user ? (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-lg sm:rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                      <p className="font-medium text-green-800 text-sm sm:text-base">Journey Planner:</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <p className="text-xs sm:text-sm text-gray-500">Contact: {user.phone}</p>
                      <a
                        href={`/${site}/profile`}
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 mt-1 sm:mt-2 inline-block"
                      >
                        View journey profile →
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-100 border border-amber-200 rounded-lg sm:rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                      <p className="font-medium text-amber-800 text-sm sm:text-base">Please login to plan your journey</p>
                      <p className="text-xs sm:text-sm text-gray-600">Your details will be auto-filled</p>
                    </div>
                    <a
                      href={`/${site}/login`}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all text-sm sm:text-base mt-2 sm:mt-0"
                    >
                      Login / Register
                    </a>
                  </div>
                </div>
              )}

              <form onSubmit={handleReservationSubmit} className="space-y-4 sm:space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Smith"
                      value={reservationForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      readOnly={!!user}
                      className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${user ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                    />
                    {user && (
                      <p className="text-xs text-gray-500 mt-1">Journey planner - auto-filled</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={reservationForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      readOnly={!!user}
                      className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${user ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (234) 567-8900"
                    value={reservationForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    readOnly={!!user}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base ${user ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                  />
                </div>

                {/* Number of Seats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Number of Passengers *
                  </label>
                  <select
                    value={reservationForm.seats}
                    onChange={(e) => handleFormChange("seats", e.target.value)}
                    required
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                  >
                    <option value="">Select number of passengers</option>

                    {uniqueSeatOptions.map((seat) => (
                      <option key={seat} value={seat}>
                        {seat} passenger{seat > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>

                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Journey Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={reservationForm.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                  />
                  {reservationForm.date && !isDayOpenForReservation(reservationForm.date) && (
                    <div className="p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                      <p className="text-red-700 font-medium text-sm sm:text-base">
                        The restaurant is closed on {getDayFromDate(reservationForm.date)}.
                      </p>
                      <p className="text-xs sm:text-sm text-red-600">
                        Please choose another day.
                      </p>
                    </div>
                  )}

                </div>

                {/* Available Time Slots */}
                {reservationForm.seats && reservationForm.date && availableTimeSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Available Sailing Times *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {availableTimeSlots.map((slot: any, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleTimeSelect(slot)}
                          className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all text-sm ${reservationForm.time === slot.start
                            ? 'border-green-500 bg-green-50 shadow-sm'
                            : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:shadow-sm'
                            }`}
                        >
                          <div className="text-center">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{slot.display}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {slot.duration} min • {slot.availableTables.length} docks
                            </div>
                            {reservationForm.time === slot.start && (
                              <div className="mt-1 text-xs text-green-600 font-medium">✓ Selected</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No slots available message */}
                {reservationForm.seats && reservationForm.date && availableTimeSlots.length === 0 && (
                  <div className="p-3 sm:p-4 bg-amber-50 border-2 border-amber-200 rounded-lg sm:rounded-xl">
                    <div className="flex items-start sm:items-center gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5 sm:mt-0" />
                      <div>
                        <p className="font-medium text-amber-800 text-sm sm:text-base">No sailing times available</p>
                        <p className="text-xs sm:text-sm text-amber-600">
                          All docks are booked for {reservationForm.seats} passengers on this date.
                          Please try a different date or number of passengers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Time Info */}
                {reservationForm.time && (
                  <div className="p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-lg sm:rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                      <div>
                        <p className="font-medium text-blue-800 text-sm sm:text-base">Selected Sailing Time</p>
                        <p className="text-xs sm:text-sm text-gray-700">
                          {availableTimeSlots.find(s => s.start === reservationForm.time)?.display}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          System will automatically assign an available dock
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFormChange('time', '')}
                        className="text-xs sm:text-sm text-red-600 hover:text-red-800 mt-1 sm:mt-0"
                      >
                        Change Time
                      </button>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Journey Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any dietary preferences, allergies, or special journey requirements..."
                    value={reservationForm.specialRequests}
                    onChange={(e) => handleFormChange('specialRequests', e.target.value)}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Restaurant Hours Info */}
                {restaurantData?.settings && (
                  <div className="p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">Journey Information</p>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p>• Sailing hours: {getFormattedHours(restaurantData.settings)}</p>
                      <p>• Open days: {getFormattedDays(restaurantData.settings)}</p>
                      <p>• Docking capacity: {totalTables} docks • {totalSeats} passengers</p>
                      <p>• Avg. journey time: {avgEatingTime} minutes</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!user || !reservationForm.seats || !reservationForm.date || !reservationForm.time}
                  className={`w-full font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm sm:text-base ${user && reservationForm.seats && reservationForm.date && reservationForm.time
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {!user ? "Please login to book your journey" :
                    !reservationForm.seats ? "Please select number of passengers" :
                      !reservationForm.date ? "Please select a journey date" :
                        !reservationForm.time ? "Please select a sailing time" :
                          "Confirm Journey Booking"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We&apos;ll confirm your journey within 24 hours. {/* Fixed apostrophe */}
                  Cancellation policy: Free cancellation up to 2 hours before sailing.
                </p>
              </form>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 sm:mt-14 lg:mt-16 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl border-2 border-blue-200 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Journey Location</h4>
                <p className="text-gray-600 text-sm sm:text-base">123 Ocean View Street, Maldives Island</p>
                <p className="text-xs sm:text-sm text-gray-500">Contact: +1 234 567 8900</p>
              </div>

              <div className="text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                  <DoorOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Visit Us</h4>
                <p className="text-gray-600 text-sm sm:text-base">Perfect for romantic dinners & celebrations</p>
                <p className="text-xs sm:text-sm text-gray-500">Private docking available</p>
              </div>

              <div className="text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-400 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Awards & Recognition</h4>
                <p className="text-gray-600 text-sm sm:text-base">Best Fine Dining 2023</p>
                <p className="text-xs sm:text-sm text-gray-500">Certified by Culinary Excellence</p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-blue-200 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                ⚓ Ocean Breeze Restaurant • Where every meal is a destination worth exploring
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}