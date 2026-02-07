"use client";

import { useState, useEffect, useCallback } from "react";
import { getEnabledPaymentGateways, formatTime12Hour, formatDate, formatFileSize } from "./utils";
import { uploadsUrl } from "@/config";
import { useParams, useRouter } from "next/navigation";
import { getSiteSettings } from "@/lib/api/siteSettings";
import { toast } from "sonner";
import Image from "next/image"; // Added Image import

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
  ArrowRight,
  Building,
  Check,
  Plus,
  Minus
} from "lucide-react";

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

interface ServiceType {
  id: string;
  name: string;
  price: number;
  hsn?: string;
  quantity: number;
  selected: boolean;
}

interface BookingFormProps {
  department: any;
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

const extractSellerId = (department: any) => {
  if (!department) return null;

  if (department.image) {
    const match = department.image.match(/sellers\/(\d+)\//);
    if (match) return match[1];
  }

  return (
    department.user_id ||
    department.seller_id ||
    department.userId ||
    department.created_by ||
    department.category_user_id ||
    null
  );
};

const BookingForm = ({
  department,
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
    notes: "",
    paymentMethod: "cash"
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const enabledGateways = getEnabledPaymentGateways(siteSettings);
  const paymentEnabled = enabledGateways.length > 0;
  const router = useRouter();
  const params = useParams();
  const site = params.site;
  const [gstSettings, setGstSettings] = useState<any>(null);

  // Define extractServiceTypes with useCallback to memoize it
  const extractServiceTypes = useCallback(() => {
    if (!department) return [];

    const services: ServiceType[] = [];

    // Check if type fields exist
    console.log("🔍 Checking type_main_name:", department.type_main_name);

    // Add main service type
    if (department.type_main_name && department.type_main_amount) {
      console.log("✅ Found main service:", department.type_main_name);
      services.push({
        id: 'main',
        name: department.type_main_name,
        price: parseFloat(department.type_main_amount) || 0,
        hsn: department.type_main_hsn,
        quantity: 1,
        selected: true
      });
    }

    // Add additional service types
    for (let i = 1; i <= 25; i++) {
      const typeName = department[`type_${i}_name`];
      const typeAmount = department[`type_${i}_amount`];

      if (typeName && typeAmount && parseFloat(typeAmount) > 0) {
        console.log(`✅ Found service ${i}:`, typeName);
        services.push({
          id: `type_${i}`,
          name: typeName,
          price: parseFloat(typeAmount) || 0,
          hsn: department[`type_${i}_hsn`],
          quantity: 1,
          selected: false
        });
      }
    }

    console.log("🟢 Total services extracted:", services.length);
    setServiceTypes(services);
    return services;
  }, [department]);

  useEffect(() => {
    console.log("🟥 USER OBJECT INSIDE BOOKING FORM:", user);
  }, [user]);

  useEffect(() => {
    console.log("=========== DEPARTMENT BOOKING FORM DEBUG ===========");
    console.log("🟢 Department:", department?.name);
    console.log("🟢 Selected Date:", selectedDate);
    console.log("🟢 Selected Slot:", selectedSlot);
    console.log("===================================================");

    // Extract service types from department data
    extractServiceTypes();
  }, [department, selectedDate, selectedSlot, extractServiceTypes]); // Added extractServiceTypes dependency

  // Extract service types from department data
  useEffect(() => {
    if (department) {
      console.log("🟢 DEBUG: Full department data received:", department);
      console.log("🟢 type_main_name:", department.type_main_name);
      console.log("🟢 type_main_amount:", department.type_main_amount);

      // Extract and log service types
      const services = extractServiceTypes();
      console.log("🟢 Extracted services:", services);
    }
  }, [department, extractServiceTypes]); // Added extractServiceTypes dependency

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
    if (!department) return;

    const sellerId = extractSellerId(department);
    console.log("🟩 Seller ID:", sellerId);

    if (!sellerId) {
      console.error("❌ Seller ID not found in department object");
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
  }, [department]);

  // Moved user validation to a separate effect
  useEffect(() => {
    if (user && !user.customer_id) {
      toast.error("Please sign in to book an appointment.");
    }
  }, [user]); // Added user dependency

  const calculateGST = () => {
    // Calculate total from selected services
    const totalAmount = serviceTypes
      .filter(service => service.selected)
      .reduce((sum, service) => sum + (service.price * service.quantity), 0);

    // If GST disabled or null
    if (!gstSettings || !gstSettings.tax_percent) {
      return {
        gstAmount: 0,
        total: totalAmount.toFixed(2),
      };
    }

    const gstPercent = parseFloat(gstSettings.tax_percent);
    const type = gstSettings.gst_type;

    if (type === "inclusive") {
      return {
        gstAmount: 0,
        total: totalAmount.toFixed(2),
      };
    }

    // Exclusive GST
    const gstAmount = (totalAmount * gstPercent) / 100;
    const totalWithGST = totalAmount + gstAmount;

    return {
      gstAmount: gstAmount.toFixed(2),
      total: totalWithGST.toFixed(2),
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

  // Handle service selection
  const toggleServiceSelection = (serviceId: string) => {
    setServiceTypes(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, selected: !service.selected }
          : service
      )
    );
  };

  // Handle quantity change
  const updateServiceQuantity = (serviceId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setServiceTypes(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, quantity: newQuantity }
          : service
      )
    );
  };

  // Calculate subtotal for a service
  const calculateServiceSubtotal = (service: ServiceType) => {
    return service.price * service.quantity;
  };

  // Calculate total for all selected services
  const calculateTotal = () => {
    return serviceTypes
      .filter(service => service.selected)
      .reduce((sum, service) => sum + calculateServiceSubtotal(service), 0)
      .toFixed(2);
  };

  // Check if at least one service is selected
  const hasSelectedServices = () => {
    return serviceTypes.some(service => service.selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate services
    if (!hasSelectedServices()) {
      toast.error("Please select at least one service to proceed");
      return;
    }

    console.log("🟢 handleSubmit STARTED - Direct redirect to payments");

    // 🔍 Extract sellerId from image URL
    let extractedSellerId = null;
    if (department.image) {
      const match = department.image.match(/sellers\/(\d+)\//);
      if (match) extractedSellerId = match[1];
    }

    const sellerId =
      department.user_id ||
      department.seller_id ||
      department.userId ||
      department.created_by ||
      department.category_user_id ||
      extractedSellerId ||
      null;

    if (!sellerId) {
      console.error("❌ No sellerId found in department:", department);
      toast.error("Department information is incomplete. Please try again.");
      return;
    }

    console.log("✅ Seller ID found:", sellerId);

    // ⭐ FIX: Extract batch_id from selectedSlot
    console.log("🟢 Selected Slot data:", selectedSlot);
    console.log("🟢 Selected Slot batch_id:", selectedSlot?.batch_id);

    const batchId = selectedSlot?.batch_id || selectedSlot?.batchId || null;
    console.log("🟢 Extracted batchId:", batchId);

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
    };

    // Format date properly
    const formatDateForAPI = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const gst = calculateGST();
    const selectedServices = serviceTypes.filter(service => service.selected);

    // ⭐ FIX: Create services array in JSON format
    const servicesJson = {
      type: 'department',
      department_name: department.name,
      department_id: department.department_id || department.id, // Use department_id if available
      services: selectedServices.map(service => ({
        id: service.id,
        name: service.name,
        price: service.price,
        quantity: service.quantity,
        hsn: service.hsn || '',
        subtotal: calculateServiceSubtotal(service)
      })),
      summary: {
        total_items: selectedServices.length,
        total_quantity: selectedServices.reduce((sum, service) => sum + service.quantity, 0),
        subtotal: selectedServices.reduce((sum, service) => sum + calculateServiceSubtotal(service), 0),
        gst_amount: Number(gst.gstAmount),
        total_amount: parseFloat(gst.total)
      }
    };

    // Create items array for payment page
    const items = selectedServices.map(service => ({
      name: service.name,
      price: service.price,
      quantity: service.quantity,
      hsn: service.hsn,
      subtotal: calculateServiceSubtotal(service)
    }));

    // Calculate subtotal
    const subTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    // ⭐ FIX: Create payment data WITH batch_id
    const paymentData = {
      // Main structure expected by payments page
      userId: Number(sellerId),
      customerId: Number(user?.customer_id),
      customerUserId: user?.user_id,
      appointment_id: "DEPT-" + Date.now(),
      totalAmount: gst.total,

      // Customer information
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,

      // Appointment details
      selectedDate: formatDateForAPI(selectedDate),
      selectedSlot: normalizedSlot,

      // ⭐ ADD: Batch ID for token management
      batchId: batchId,
      batch_id: batchId, // Both formats for compatibility

      // Department specific data
      type: 'department',
      departmentId: department.department_id || department.id, // Use department_id
      departmentName: department.name,
      categoryId: department.department_id || department.id, // For backward compatibility

      // Services selected
      services: selectedServices,
      services_json: servicesJson,
      items: items,

      // Price breakdown
      subTotal: subTotal.toFixed(2),
      gstType: gstSettings?.gst_type || "inclusive",
      gstPercent: gstSettings?.tax_percent || 0,
      gstAmount: gst.gstAmount,

      // Payment method
      payment_method: formData.paymentMethod,

      // Additional fields
      notes: formData.notes
    };

    console.log("🟢 Payment data prepared with batch_id:", paymentData);
    console.log("🟢 Batch ID in payment data:", paymentData.batchId);
    console.log("🟢 Department ID in payment data:", paymentData.departmentId);

    // Save to localStorage for payment page
    localStorage.setItem("pendingBooking", JSON.stringify(paymentData));
    localStorage.setItem("pendingDepartmentBooking", JSON.stringify(paymentData));

    console.log("✅ Saved to localStorage, redirecting to payments...");

    // Show redirecting message
    setIsRedirecting(true);

    // Wait a moment then redirect
    setTimeout(() => {
      // Use the correct path with site parameter
      if (site) {
        // If site parameter exists (from URL), use it
        window.location.href = `/${site}/payments/departments`;
      } else {
        // Fallback to default path
        window.location.href = `/payments`;
      }
    }, 500);
  };

  const enabledPaymentMethods = getEnabledPaymentMethods();

  if (!department || !selectedSlot || !selectedDate) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center h-[400px]">
          <Building className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Select a Time Slot
          </h3>
          <p className="text-gray-500">
            Choose a department, date, and time slot from the calendar to see booking details here.
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
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Book Department Appointment</h2>
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
              Your department appointment has been successfully booked. You will receive a confirmation email shortly.
            </p>
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
              <ShieldCheck className="h-5 w-5" />
              Booking ID: DEPT-{Date.now().toString().slice(-8)}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Department Info Summary */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              {department?.image && (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                  <Image
                    src={`${uploadsUrl}/${department.image}`}
                    alt={department.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  {department.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {department.description || "Department services"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-blue-700">₹{department.consultation_fee || "Consultation"}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-600">
                    {formatDate(selectedDate)} at {formatTime12Hour(selectedSlot?.from)}
                  </span>
                </div>
              </div>
            </div>

            <div>
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
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Services Selection Section */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
                    Select Services *
                  </label>

                  <div className="space-y-3">
                    {serviceTypes.map((service) => (
                      <div
                        key={service.id}
                        className={`p-3 border rounded-lg transition-all duration-200 ${service.selected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleServiceSelection(service.id)}
                              className={`w-5 h-5 rounded border flex items-center justify-center ${service.selected
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                                }`}
                            >
                              {service.selected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </button>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {service.name}
                              </h4>
                              <p className="text-xs text-gray-600">
                                ₹{service.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>

                          {service.selected && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateServiceQuantity(service.id, service.quantity - 1)}
                                className="p-1 rounded-full hover:bg-gray-100"
                              >
                                <Minus className="h-3 w-3 text-gray-600" />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">
                                {service.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateServiceQuantity(service.id, service.quantity + 1)}
                                className="p-1 rounded-full hover:bg-gray-100"
                              >
                                <Plus className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        {service.selected && (
                          <div className="mt-2 pl-8">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">
                                Subtotal: ₹{calculateServiceSubtotal(service).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {serviceTypes.length === 0 && (
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-500">No services available for this department</p>
                    </div>
                  )}
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

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors h-20 resize-none"
                    placeholder="Any specific concerns, symptoms, or questions for the department..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isRedirecting || !hasSelectedServices()}
                className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden ${isRedirecting
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  } ${!hasSelectedServices() ? 'opacity-50 cursor-not-allowed' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
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