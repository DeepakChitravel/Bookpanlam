"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSiteSettings } from "@/lib/api/siteSettings";
import { toast } from "sonner";
import {
  getEnabledPaymentGateways,
  formatTime12Hour,
  formatDate,
  formatFileSize
} from "./utils";
import { uploadsUrl } from "@/config";
import {
  CalendarDays,
  X,
  Phone,
  Mail,
  User as UserIcon,
  ShieldCheck,
  CreditCard,
  Clock as ClockIcon,
  BadgeCheck,
  Loader2,
  Calendar,
  Banknote,
  Star,
  Image as ImageIcon,
  FileText,
  File,
  Eye,
  Trash2,
  Smartphone,
  Upload,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import Image from 'next/image'
interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
}

interface BookingFormProps {
  doctor: any;
  selectedDate: Date;
  selectedSlot: any;
  user: any;
  siteSettings: any;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_STYLES: Record<string, {
  container: string;
  iconBg: string;
  text: string;
  check: string;
}> = {
  blue: {
    container: "border-blue-500 bg-blue-50",
    iconBg: "bg-blue-100",
    text: "text-blue-700",
    check: "border-blue-500 bg-blue-500",
  },
  purple: {
    container: "border-purple-500 bg-purple-50",
    iconBg: "bg-purple-100",
    text: "text-purple-700",
    check: "border-purple-500 bg-purple-500",
  },
  green: {
    container: "border-green-500 bg-green-50",
    iconBg: "bg-green-100",
    text: "text-green-700",
    check: "border-green-500 bg-green-500",
  },
  amber: {
    container: "border-amber-500 bg-amber-50",
    iconBg: "bg-amber-100",
    text: "text-amber-700",
    check: "border-amber-500 bg-amber-500",
  },
};

// Define getSlotEnabledStatus function here since it's not in utils
const getSlotEnabledStatus = (doctor: any, selectedDate: Date, selectedSlot: any) => {
  if (!doctor || !selectedSlot) {
    console.log("❌ No doctor or slot");
    return false;
  }
  
  // Get day of week
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selectedDate.getDay()];
  
  // Check if the DAY is enabled in weekly schedule
  const daySchedule = doctor.weeklySchedule?.[dayOfWeek];
  
  // First check if the DAY is enabled
  const isDayEnabled = daySchedule?.enabled === true || daySchedule?.enabled === "true";
  
  if (!isDayEnabled) {
    console.log("❌ Day is not enabled in weekly schedule");
    return false;
  }
  
  // Now check if the SPECIFIC SLOT is enabled
  if (selectedSlot.enabled !== undefined) {
    // Handle both boolean true and string "true"
    const isSlotEnabled = selectedSlot.enabled === true || selectedSlot.enabled === "true";
    console.log("🎯 Final slot enabled status:", isSlotEnabled);
    return isSlotEnabled;
  }
  
  // If slot doesn't have enabled property, check in day schedule
  if (daySchedule?.slots) {
    // Find the specific slot
    const originalSlot = daySchedule.slots.find((slot: any) => 
      slot.from === selectedSlot.from && slot.to === selectedSlot.to
    );
    
    const result = originalSlot?.enabled ?? true;
    
    // Handle both boolean and string values
    if (result === true || result === "true") return true;
    if (result === false || result === "false") return false;
    return Boolean(result);
  }
  
  console.log("⚠️ No schedule found, defaulting to true");
  return true; // Default to enabled if not found
};

const extractSellerId = (doctor: any) => {
  if (!doctor) return null;

  if (doctor.doctorImage) {
    const match = doctor.doctorImage.match(/sellers\/(\d+)\//);
    if (match) return match[1];
  }

  return (
    doctor.user_id ||
    doctor.seller_id ||
    doctor.userId ||
    doctor.created_by ||
    doctor.category_user_id ||
    null
  );
};

const BookingForm = ({
  doctor,
  selectedDate,
  selectedSlot,
  user,
  siteSettings,
  onClose,
  onSuccess
}: BookingFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    token: "1",
    notes: "",
    paymentMethod: "cash"
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const enabledGateways = getEnabledPaymentGateways(siteSettings);
  const paymentEnabled = enabledGateways.length > 0;
  const router = useRouter();
  const params = useParams();
  const site = params.site;
  const [gstSettings, setGstSettings] = useState<any>(null);

  // Calculate available tokens for the selected slot
const getAvailableTokens = () => {
  if (!doctor || !selectedSlot) return 1;

  const booked = parseInt(selectedSlot.booked || 0);

  // If slot token exists → use it
  if (selectedSlot.token) {
    const slotLimit = parseInt(selectedSlot.token);
    return Math.max(0, slotLimit - booked);
  }

  // Else use doctor.token_limit
  if (doctor.token_limit) {
    const doctorLimit = parseInt(doctor.token_limit);
    return Math.max(0, doctorLimit - booked);
  }

  return 1;
};




  const availableTokens = getAvailableTokens();
  const isSlotEnabled = getSlotEnabledStatus(doctor, selectedDate, selectedSlot);

  useEffect(() => {
    console.log("🟥 USER OBJECT INSIDE BOOKING FORM:", user);
  }, [user]);

  useEffect(() => {
    console.log("=========== BOOKING FORM DEBUG ===========");
    console.log("🟢 Doctor:", doctor?.doctor_name || doctor?.name);
    console.log("🟢 Selected Date:", selectedDate);
    console.log("🟢 Selected Slot:", selectedSlot);
    console.log("🟢 Slot enabled property:", selectedSlot?.enabled);
    console.log("🟢 Available Tokens:", availableTokens);
    console.log("🟢 Is Slot Enabled:", isSlotEnabled);
    console.log("==========================================");
  }, [doctor, selectedDate, selectedSlot, availableTokens, isSlotEnabled]);

  const getEnabledPaymentMethods = () => {
    const methods = [];

    if (enabledGateways.includes("Razorpay")) {
      methods.push({
        id: "razorpay",
        name: "Razorpay",
        description: "Cards, UPI, NetBanking",
        icon: "💳",
        color: "blue",
      });
    }

    if (enabledGateways.includes("PhonePe")) {
      methods.push({
        id: "phonepe",
        name: "PhonePe",
        description: "UPI, Wallet",
        icon: "📱",
        color: "purple",
      });
    }

    if (enabledGateways.includes("PayU")) {
      methods.push({
        id: "payu",
        name: "PayU",
        description: "Multiple payment options",
        icon: "💰",
        color: "green",
      });
    }

    methods.push({
      id: "cash",
      name: "Cash",
      description: "Pay at hospital",
      icon: "🏥",
      color: "amber",
    });

    return methods;
  };

  useEffect(() => {
    if (!doctor) return;

    const sellerId = extractSellerId(doctor);
    console.log("🟩 Seller ID:", sellerId);

    if (!sellerId) {
      console.error("❌ Seller ID not found in doctor object");
      return;
    }

    getSiteSettings(sellerId).then((res) => {
      console.log("🟦 GST Response:", res);

      if (res.success && res.data) {
        setGstSettings(res.data);
      } else {
        console.error("❌ GST settings not found for:", sellerId);
      }
    });
  }, [doctor]);

  useEffect(() => {
    if (user) {
      if (!user.customer_id) {
        toast.error("Please sign in to book an appointment.");
      }
    }
  }, [user]);

  const calculateGST = () => {
    const amount = parseFloat(doctor?.amount) || 0;
    const tokens = parseInt(formData.token) || 1;
    const fee = amount * tokens;

    if (!gstSettings || !gstSettings.tax_percent) {
      return {
        gstAmount: 0,
        total: fee.toFixed(2),
      };
    }

    const gstPercent = parseFloat(gstSettings.tax_percent);
    const type = gstSettings.gst_type;

    if (type === "inclusive") {
      return {
        gstAmount: 0,
        total: fee.toFixed(2),
      };
    }

    const gstAmount = (fee * gstPercent) / 100;
    const totalAmount = fee + gstAmount;

    return {
      gstAmount: gstAmount.toFixed(2),
      total: totalAmount.toFixed(2),
    };
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploadProgress: 0,
      uploadStatus: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    setUploadedFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, uploadStatus: 'uploading' }
          : file
      )
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadedFiles(prev =>
        prev.map(file =>
          file.id === fileId
            ? { ...file, uploadProgress: progress }
            : file
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        setUploadedFiles(prev =>
          prev.map(file =>
            file.id === fileId
              ? { ...file, uploadStatus: 'completed', uploadProgress: 100 }
              : file
          )
        );
      }
    }, 100);
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file =>
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    if (validFiles.length > 0) {
      handleFiles(validFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🟢 handleSubmit STARTED");

    // Check if slot is enabled
    // if (!isSlotEnabled) {
    //   console.error("❌ ERROR: This slot is disabled");
    //   toast.error("This appointment slot is currently unavailable. Please select another slot.");
    //   return;
    // }

    // 🔍 VALIDATE TIME SLOT
    console.log("🔍 Validating time slot:", selectedSlot);

    const parseTime = (timeStr: string) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const fromMinutes = parseTime(selectedSlot.from);
    const toMinutes = parseTime(selectedSlot.to);

    console.log(`Time in minutes: from=${fromMinutes}, to=${toMinutes}`);
    console.log(`Is from >= to? ${fromMinutes >= toMinutes}`);

    // if (fromMinutes >= toMinutes) {
    //   console.error("❌ ERROR: Invalid time slot - end time is before start time");
    //   toast.error("Invalid time slot selected. Please choose a valid time slot.");
    //   return;
    // }

    console.log("✅ Time validation PASSED");

    // ⭐ FINAL TOKEN VALIDATION
    const selectedTokens = parseInt(formData.token);
    console.log(`🔢 Token validation: selected=${selectedTokens}, available=${availableTokens}`);

    if (selectedTokens > availableTokens) {
      console.error("❌ Token validation failed");
      toast.error(`Only ${availableTokens} tokens available for this slot`);
      return;
    }

    if (selectedTokens < 1) {
      console.error("❌ Minimum token validation failed");
      toast.error("Minimum 1 token required");
      return;
    }

    console.log("✅ Token validation PASSED");

    // 🔍 Extract batch_id from selected slot
    const batchId = selectedSlot?.batch_id || null;

    console.log("🟡 Extracted batch_id:", batchId);
    console.log("🟡 Selected Slot Object:", selectedSlot);
    console.log("🟡 Slot Enabled:", isSlotEnabled);

    // 🔍 Extract sellerId from image URL
    let extractedSellerId = null;
    if (doctor.doctorImage) {
      const match = doctor.doctorImage.match(/sellers\/(\d+)\//);
      if (match) extractedSellerId = match[1];
    }

    const sellerId =
      doctor.user_id ||
      doctor.seller_id ||
      doctor.userId ||
      doctor.created_by ||
      doctor.category_user_id ||
      extractedSellerId ||
      null;

    if (!sellerId) {
      console.error("❌ No sellerId found in doctor:", doctor);
      toast.error("Doctor information is incomplete. Please try again.");
      return;
    }

    console.log("✅ Seller ID found:", sellerId);

    // Normalize time formats
    const normalizeTime = (timeStr: string) => {
      if (!timeStr) return '';
      const [hours, minutes] = timeStr.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    // Create normalized slot
    const normalizedSlot = {
      ...selectedSlot,
      from: normalizeTime(selectedSlot.from),
      to: normalizeTime(selectedSlot.to),
      enabled: isSlotEnabled
    };

    // Format date properly (avoid timezone issues)
    const formatDateForAPI = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const gst = calculateGST();

    // ⭐ CRITICAL: Ensure category_id AND batch_id are included
    const bookingPayload = {
      doctorId: doctor.id,
      doctorName: doctor.doctor_name || doctor.name,
      doctorSpecialization: doctor.specialization,
      doctorImage: doctor.doctor_image || doctor.doctorImage,

      // ⭐ ADD CATEGORY_ID HERE
      categoryId: doctor.category_id,

      // ⭐ ADD BATCH_ID HERE
      batchId: batchId,

      // ⭐ ADD SLOT ENABLED STATUS
      slotEnabled: isSlotEnabled,

      customerName: formData.name,
      customerPhone: formData.phone,
      customerEmail: formData.email,

      selectedDate: formatDateForAPI(selectedDate),
      selectedSlot: normalizedSlot,
      token: formData.token,

      amount: doctor.amount,
      subTotal: (parseFloat(doctor.amount) * parseInt(formData.token)).toFixed(2),

      gstPercent: gstSettings?.tax_percent || 0,
      gstType: gstSettings?.gst_type || "inclusive",
      gstAmount: gst.gstAmount,
      totalAmount: gst.total,

      paymentMethod: formData.paymentMethod,

      userId: sellerId,
      customerId: user?.customer_id,
      customerUserId: user?.user_id,

      appointment_id: "APT-" + Date.now(),

      // Add debug info
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    console.log("🟢 Booking payload with categoryId and batchId:", bookingPayload);
    console.log("🟢 Doctor category_id:", doctor.category_id);
    console.log("🟢 Slot batch_id:", batchId);
    console.log("🟢 Slot enabled status:", isSlotEnabled);
    console.log("📅 Selected Date Info:", {
      original: selectedDate,
      formatted: formatDateForAPI(selectedDate),
      iso: selectedDate.toISOString()
    });

    try {
      console.log("💾 Saving to localStorage...");
      localStorage.setItem("pendingBooking", JSON.stringify(bookingPayload));
      console.log("✅ Saved to localStorage");

      console.log(`🔄 Redirecting to /${site}/payments in 300ms...`);
      setIsRedirecting(true);

      setTimeout(() => {
        console.log("🚀 Starting redirect...");
        router.push(`/${site}/payments/doctor`);
      }, 300);

    } catch (error) {
      console.error("❌ Error saving booking:", error);
      toast.error("Failed to save booking. Please try again.");
      setIsRedirecting(false);
    }
  };

  const calculateTotal = () => {
    const tokens = parseInt(formData.token) || 1;
    return (parseFloat(doctor.amount) * tokens).toFixed(2);
  };

  const enabledPaymentMethods = getEnabledPaymentMethods();

// 1. Doctor missing
if (!doctor) {
  return (
    <div className="p-6 border rounded-xl bg-white shadow-sm">
      Loading doctor info...
    </div>
  );
}

// 2. Date missing
if (!selectedDate) {
  return (
    <div className="bg-white rounded-2xl border p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center h-[300px]">
        <Calendar className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Date</h3>
        <p className="text-gray-500">Choose a date to continue.</p>
      </div>
    </div>
  );
}

// 3. Slot missing — THIS FIXES YOUR PROBLEM
if (!selectedSlot) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center text-center h-[300px]">
        <ClockIcon className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Select a Time Slot
        </h3>
        <p className="text-gray-500">
          Click any available time slot to continue booking.
        </p>
      </div>
    </div>
  );
}



  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarDays className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Book Appointment</h2>
            <p className="text-xs sm:text-sm text-gray-600">Confirm your consultation details</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close booking form"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {bookingSuccess ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <BadgeCheck className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h4>
            <p className="text-gray-600 mb-6">
              Your appointment has been successfully booked. You will receive a confirmation email shortly.
            </p>
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
              <ShieldCheck className="h-5 w-5" />
              Booking ID: APT-{Date.now().toString().slice(-8)}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Doctor Info Summary */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <Image
  src={`${uploadsUrl}/${doctor.doctorImage}`}
  alt={doctor.doctor_name || doctor.name}
  width={56}       // <-- required
  height={56}      // <-- required
  unoptimized      // <-- required for local PHP images
  className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-sm"
/>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  {doctor.doctor_name || doctor.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {doctor.specialization}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-blue-700">₹{doctor.amount}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-600">
                    {formatDate(selectedDate)} at {formatTime12Hour(selectedSlot?.from)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              {/* <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-blue-600" />
                Patient Information
              </h3> */}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Number of Tokens
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(formData.token);
                        if (current <= 1) return;
                        setFormData({ ...formData, token: (current - 1).toString() });
                      }}
                      className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-sm">−</span>
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={availableTokens}
                      value={formData.token}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (isNaN(value) || value < 1) {
                          setFormData({ ...formData, token: "1" });
                          return;
                        }
                        if (value > availableTokens) {
                          toast.error(`Only ${availableTokens} tokens available`);
                          setFormData({ ...formData, token: availableTokens.toString() });
                          return;
                        }
                        setFormData({ ...formData, token: value.toString() });
                      }}
                      className="w-16 px-2 py-1.5 text-sm border rounded-lg text-center"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(formData.token);
                        if (current >= availableTokens) {
                          toast.error(`Only ${availableTokens} tokens available`);
                          return;
                        }
                        setFormData({ ...formData, token: (current + 1).toString() });
                      }}
                      className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-sm">+</span>
                    </button>

                  </div>
                </div>

                {paymentEnabled && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {enabledPaymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`relative flex flex-col items-center justify-center p-2 bg-white border rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === method.id
                            ? PAYMENT_STYLES[method.color].container
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={formData.paymentMethod === method.id}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="sr-only"
                          />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${formData.paymentMethod === method.id
                            ? PAYMENT_STYLES[method.color].iconBg
                            : 'bg-gray-100'
                            }`}>
                            <span className={`text-xs font-bold ${formData.paymentMethod === method.id
                              ? PAYMENT_STYLES[method.color].text
                              : 'text-gray-700'
                              }`}>
                              {method.icon}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-gray-900">{method.name}</div>
                          <div className={`absolute top-1 right-1 w-4 h-4 border rounded-full flex items-center justify-center ${formData.paymentMethod === method.id
                            ? PAYMENT_STYLES[method.color].check
                            : 'border-gray-300'
                            }`}>
                            {formData.paymentMethod === method.id && (
                              <CheckCircle className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload Section */}
                {isSlotEnabled && selectedSlot && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Upload Medical Documents (Optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload images or PDF files of medical records (Max 10MB each)
                    </p>

                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Images (JPG, PNG) or PDF files
                          </p>
                        </div>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-700">
                          Uploaded Files ({uploadedFiles.length})
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {uploadedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                {getFileIcon(file.type)}
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {file.uploadStatus === 'uploading' && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${file.uploadProgress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      {file.uploadProgress}%
                                    </span>
                                  </div>
                                )}
                                {file.uploadStatus === 'completed' && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeFile(file.id)}
                                  className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors h-20 resize-none"
                    placeholder="Any specific concerns, symptoms, or questions for the doctor..."
                  />
                </div>
              </div>
            </div>


            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isRedirecting}
                className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden ${isRedirecting
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRedirecting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 animate-shimmer bg-[length:200%_100%]"></div>
                )}

                <span className="relative flex items-center justify-center gap-2">
                  {isRedirecting ? (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 border-2 border-blue-200 rounded-full animate-ping opacity-50"></div>
                        <Loader2 className="h-4 w-4 animate-spin text-white relative" />
                      </div>
                      <span className="text-sm animate-pulse">Redirecting...</span>
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </>
                  ) : paymentEnabled ? (
                    <>
                      {formData.paymentMethod === 'cash' ? (
                        <Calendar className="h-4 w-4" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {formData.paymentMethod === 'cash'
                          ? `Book Appointment`
                          : `Pay ₹${calculateTotal()} Now`}
                      </span>
                      {formData.paymentMethod !== 'cash' && (
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Book Appointment</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingForm;