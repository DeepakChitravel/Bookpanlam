"use client";

import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/api/siteSettings";
import { getManualPayments } from "@/lib/api/manualPayments";
import { getPaymentAvailability } from "@/lib/api/paymentAvailability";
import { uploadsUrl } from "@/config";
import {
  loadRazorpayScript,
  getRazorpayCredentials,
  createRazorpayOrder,
  verifyRazorpayPayment
} from "@/lib/api/razorpay";
import {
  getPayUCredentials,
  createPayUOrder,
  verifyPayUPayment
} from "@/lib/api/payu";
import NotificationModal from "@/components/NotificationModal";
import Image from 'next/image'
import {
  Copy,
  Download,
  Smartphone,
  CreditCard,
  Wallet,
  Banknote,
  QrCode,
  Check,
  Loader2,
  Scan,
  RefreshCw,
  X,
  ExternalLink,
  SmartphoneNfc,
  CheckCircle
} from "lucide-react";

// Import QRCode package
import QRCode from 'qrcode';

/* ✅ CLEAN PATH — Remove duplicate leading "uploads/" */
const cleanPath = (path: string) => {
  if (!path) return "";
  return path.replace(/^uploads\//, "").replace(/^\/+/, "");
};

const paymentLogos = {
  razorpay: "https://razorpay.com/assets/razorpay-logo.svg",
  phonepe: "https://www.phonepe.com/webstatic/static/phonepe-official-logo-1d64e8c7115a3c5e3d5e6e0f6c6a5e5c.svg",
  payu: "https://www.payu.in/sites/all/themes/payu_bootstrap/logo.png",
  cod: "https://cdn-icons-png.flaticon.com/512/3135/3135679.png",
  upi: "https://cdn-icons-png.flaticon.com/512/5968/5968512.png",
  gpay: "https://cdn-icons-png.flaticon.com/512/300/300221.png",
  phonepe_logo: "https://cdn-icons-png.flaticon.com/512/5968/5968534.png",
  paytm: "https://cdn-icons-png.flaticon.com/512/5968/5968266.png",
  bhim: "https://cdn-icons-png.flaticon.com/512/5968/5968242.png"
};

// UPI QR Code Component with Download QR button
const UPIQRCodeCard = ({ method, booking, appointmentId, copyUPIId, showNotification }: any) => {
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const customerId = booking?.customerId || "N/A";
        const appointmentIdValue = appointmentId || "N/A";

        // ⭐ UPDATED: Include both Customer ID and Appointment ID in UPI note
        const upiNote = `CID:${customerId} AID:${appointmentIdValue}`;

        // Create UPI payment link with note
        const upiLink = `upi://pay?pa=${encodeURIComponent(method.upi_id)}&pn=${encodeURIComponent(method.name || "Hospital")}&am=${booking.totalAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;

        // Generate QR code
        const qrDataUrl = await QRCode.toDataURL(upiLink, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrData({
          upi_id: method.upi_id,
          method_name: method.name,
          amount: booking.totalAmount,
          upi_link: upiLink,
          qr_url: qrDataUrl,
          scan_pay_url: upiLink,
          upi_note: upiNote,
          customer_id: customerId,
          appointment_id: appointmentIdValue
        });
      } catch (err) {
        console.error('QR generation failed:', err);
      } finally {
        setLoading(false);
      }
    };

    if (method.upi_id && booking && appointmentId) {
      generateQR();
    }
  }, [method, booking, appointmentId]);

  // Get icon source correctly
  const getIconSrc = () => {
    if (!method.icon) return null;

    // If icon already has full URL, use it directly
    if (method.icon.startsWith('http')) {
      return method.icon;
    }

    // Otherwise, construct the full URL
    return `${uploadsUrl}/${cleanPath(method.icon)}`;
  };

  // Function to download QR code
  const downloadQRCode = () => {
    if (!qrData?.qr_url) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrData.qr_url;
    link.download = `QR_${method.name.replace(/\s+/g, '_')}_₹${booking.totalAmount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success notification if showNotification function is provided
    if (showNotification) {
      showNotification(
        "success",
        "QR Code Downloaded!",
        `${method.name} QR code has been downloaded to your device`,
        ["Open gallery/files to view", "Scan with any UPI app"]
      );
    }
  };

  const iconSrc = getIconSrc();

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center p-1">
          {iconSrc && !iconError ? (
            <Image
              src={iconSrc}
              alt={method.name}
              className="w-10 h-10 object-contain"
              onError={() => setIconError(true)}
            />
          ) : (
            <SmartphoneNfc className="h-8 w-8 text-purple-600" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-lg">{method.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              {method.upi_id}
            </code>
            <button
              onClick={() => copyUPIId(method.upi_id, method.name)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Copy UPI ID"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center">
        {loading ? (
          <div className="w-48 h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : qrData ? (
          <>
            <div className="relative mb-3">
              <Image
                src={qrData.qr_url}
                alt={`${method.name} QR Code`}
                className="w-48 h-48 rounded-lg border-4 border-white shadow-lg"
              />

              {/* Logo in center of QR code */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-14 h-14 bg-white rounded-lg shadow-md flex items-center justify-center p-2">
                  {iconSrc && !iconError ? (
                    <Image
                      src={iconSrc}
                      alt={method.name}
                      className="w-full h-full object-contain"
                      onError={() => setIconError(true)}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                      <SmartphoneNfc className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={downloadQRCode}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download QR
              </button>
              <button
                onClick={() => copyUPIId(method.upi_id, method.name)}
                className="px-4 py-2.5 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50"
              >
                <Copy size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <p className="text-red-600">Failed to generate QR code</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function PaymentsPage() {
  const [booking, setBooking] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [manualPayments, setManualPayments] = useState<any[]>([]);
  const [paymentAvailability, setPaymentAvailability] = useState<any>(null);
  const [copiedUpiId, setCopiedUpiId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payuCredentials, setPayuCredentials] = useState<any>(null);
  const [filteredManualPayments, setFilteredManualPayments] = useState<any[]>([]);

  // UPI Payment Popup State
  const [upiPaymentPopup, setUpiPaymentPopup] = useState({
    isOpen: false,
    paymentData: null as any,
    appointmentData: null as any
  });

  // Notification Modal State
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
    details: [] as string[],
    onCloseRedirect: "" as string | null,
  });

  // Open notification modal
  const showNotification = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
    details: string[] = [],
    onCloseRedirect: string | null = null
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      details,
      onCloseRedirect,
    });
  };

  // Close notification modal
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));

    if (notification.onCloseRedirect) {
      setTimeout(() => {
        window.location.href = notification.onCloseRedirect!;
      }, 300);
    }
  };

  // ============ UPI PAYMENT FLOW ============
  const handleUPIPayment = async () => {
    if (!booking) return;

    setIsProcessing(true);

    try {
      // Create UPI payment order first
      const phpBaseUrl = "https://manager.bookpanlam.com/public";
      const upiUrl = `${phpBaseUrl}/customers/payment/upi-payment.php`;

      const upiData = {
        user_id: booking.userId,
        customer_id: booking.customerId,
        customer_name: booking.customerName,
        customer_email: booking.customerEmail,
        customer_phone: booking.customerPhone,
        total_amount: booking.totalAmount,
        sub_total: booking.subTotal,
        gst_type: booking.gstType,
        gst_percent: booking.gstPercent,
        gst_amount: booking.gstAmount,
        appointment_date: booking.selectedDate,
        batch_id: booking.batchId || booking.batch_id,
        slot_from: booking.selectedSlot?.from,
        slot_to: booking.selectedSlot?.to,
        token_count: booking.token || 1,
        category_id: booking.categoryId || booking.category_id,
        // Add department support
        service_type: booking.type || 'category',
        service_name: booking.departmentName || booking.categoryName,
        services_json: booking.services_json || null
      };

      console.log("🟡 Creating UPI payment order:", upiData);

      const response = await fetch(upiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(upiData)
      });

      const responseText = await response.text();
      console.log("🟡 UPI Payment Response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error("🟡 JSON Parse Error:", err);
        throw new Error("Invalid response from server");
      }

      if (data.success) {
        // ⭐ Get the appointment ID from the response
        const appointmentId = data.appointment_id;

        // Open UPI payment popup with appointment ID
        setUpiPaymentPopup({
          isOpen: true,
          paymentData: data,
          appointmentData: {
            appointment_id: appointmentId,
            receipt: data.receipt,
            amount: booking.totalAmount,
            appointment_date: booking.selectedDate,
            slot_time: booking.selectedSlot?.from + " to " + booking.selectedSlot?.to
          }
        });

        // Store in localStorage for success page
        localStorage.setItem("completedUPIPayment", JSON.stringify({
          payment_id: data.payment_id,
          appointment_id: appointmentId,
          amount: booking.totalAmount,
          receipt: data.receipt,
          status: "pending",
          payment_method: "upi",
          created_at: new Date().toISOString(),
          appointment_details: {
            date: booking.selectedDate,
            slot: booking.selectedSlot,
            doctor: booking.doctorName || booking?.departmentName || "Department",
            service: booking.doctorSpecialization || booking.departmentName || booking.categoryName
          },
          services_json: booking.services_json || null,
          customer_id: booking.customerId,
          // ⭐ Store both IDs for UPI note
          upi_note_ids: {
            customer_id: booking.customerId,
            appointment_id: appointmentId
          }
        }));

        // Remove pending booking
        localStorage.removeItem("pendingBooking");
        localStorage.removeItem("pendingDepartmentBooking");

      } else {
        showNotification(
          "error",
          "Payment Failed",
          data.message || "Failed to create UPI payment order.",
          ["Please try again", "Select another payment method"]
        );
      }

    } catch (err: any) {
      console.error("❌ UPI Payment Error:", err);
      showNotification(
        "error",
        "Connection Error",
        err.message || "Failed to connect to server.",
        ["Check your internet connection", "Try again in a moment"]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle "I've Paid" button click
  const handleIPaidButton = () => {
    if (!upiPaymentPopup.appointmentData) return;

    // Close the popup
    setUpiPaymentPopup({
      isOpen: false,
      paymentData: null,
      appointmentData: null
    });

    // Redirect to success page
    setTimeout(() => {
      window.location.href = `/payment-success?method=upi&appointment_id=${upiPaymentPopup.appointmentData.appointment_id}&receipt=${upiPaymentPopup.appointmentData.receipt}&status=pending`;
    }, 300);
  };

  // Close UPI payment popup
  const closeUPIPaymentPopup = () => {
    setUpiPaymentPopup({
      isOpen: false,
      paymentData: null,
      appointmentData: null
    });
  };

  // Copy UPI ID to clipboard
  const copyUPIId = async (upiId: string, methodName: string) => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedUpiId(upiId);
      setTimeout(() => setCopiedUpiId(null), 2000);
      showNotification(
        "success",
        "UPI ID Copied!",
        `${methodName} UPI ID copied to clipboard`,
        ["Paste in your UPI app", "Complete the payment"]
      );
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Open UPI app with payment link
  const openUPIApp = (upiLink: string, methodName: string) => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = upiLink;
    } else {
      showNotification(
        "info",
        "Open UPI App",
        "Please use your phone to scan the QR code",
        ["Open " + methodName + " on your phone", "Tap 'Scan QR Code'", "Point camera at the QR code"]
      );
    }
  };

  // ============ EXISTING PAYMENT METHODS ============
  const openRazorpay = async () => {
    try {
      console.log("🚀 Starting Razorpay payment");
      setIsProcessing(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showNotification(
          "error",
          "Script Loading Failed",
          "Failed to load Razorpay. Check your internet connection.",
          ["Please check your internet", "Refresh the page and try again"]
        );
        setIsProcessing(false);
        return;
      }

      const creds = await getRazorpayCredentials(booking.userId);

      if (!creds.razorpay_key_id) {
        showNotification(
          "error",
          "Payment Not Configured",
          "Razorpay is not configured for this seller.",
          ["Contact the hospital administrator", "Try another payment method"]
        );
        setIsProcessing(false);
        return;
      }

      // In your openRazorpay function, update the order creation:
      const orderResponse = await createRazorpayOrder({
        amount: Number(booking.totalAmount),
        currency: "INR",
        user_id: Number(booking.userId),
        customer_id: Number(booking.customerId),
        appointment_id: booking.appointment_id,
        customer_email: booking.customerEmail,
        customer_phone: booking.customerPhone,
        gst_type: booking.gstType,
        gst_percent: booking.gstPercent,
        gst_amount: booking.gstAmount,
        total_amount: booking.totalAmount,
        // Add department support
        service_reference_type: booking.type === 'department' ? 'department' : 'category',
        service_reference_id: booking.type === 'department' ? booking.departmentId : booking.categoryId,
        service_name: booking.type === 'department' ? booking.departmentName : booking.categoryName,
        // ⭐ NEW: Pass services_json for department bookings
        services_json: booking.services_json || null,
        // Pass appointment details
        appointment_date: booking.selectedDate,
        slot_from: booking.selectedSlot?.from,
        slot_to: booking.selectedSlot?.to,
        token_count: booking.token || 1,
        batch_id: booking.batchId || booking.batch_id
      });

      if (!orderResponse.success) {
        showNotification(
          "error",
          "Order Creation Failed",
          orderResponse.message || "Failed to create payment order.",
          ["Please try again", "Contact support if issue persists"]
        );
        setIsProcessing(false);
        return;
      }

      const order = orderResponse.order;

      const options = {
        key: creds.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: booking.customerName,
        description: `Booking Payment - ${booking.type === 'department' ? booking.departmentName : booking.categoryName}`,
        order_id: order.id,

        // In your openRazorpay function, update the handler:

        handler: async function (response: any) {
          console.log("🔄 Verifying payment...");

          // ⭐ CRITICAL: Pass services_json to verify API
          const verify = await verifyRazorpayPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            category_id: booking.categoryId || booking.category_id,
            department_id: booking.departmentId, // For department bookings
            doctor_schedule_id: booking.doctorId,
            appointment_date: booking.selectedDate,
            batch_id: booking.batchId || booking.batch_id,
            slot_from: booking.selectedSlot?.from,
            slot_to: booking.selectedSlot?.to,
            token_count: booking.token || 1,
            // ⭐ PASS services_json here
            services_json: booking.services_json, // This is the key!
            service_type: booking.type || 'category',
            service_name: booking.departmentName || booking.categoryName,
            billing_data: {
              name: booking.customerName,
              phone: booking.customerPhone,
              email: booking.customerEmail,
              pin_code: booking.pincode ?? "",
              address_1: booking.address1 ?? "",
              address_2: booking.address2 ?? "",
              state: booking.state ?? "",
              city: booking.city ?? "",
              country: "India",
            },
            plan_data: {
              plan_id: booking.planId ?? 0,
              amount: booking.totalAmount,
              gst_amount: booking.gstAmount,
              gst_type: booking.gstType,
              gst_percentage: booking.gstPercent,
              discount: booking.discount ?? 0,
              currency: "INR",
              currency_symbol: "₹",
            }
          });

          console.log("🟢 Verify response:", verify);
          console.log("🟢 Service info in verify:", verify.service_info);

          if (verify.success) {
            // Check what JSON was stored
            if (verify.service_info && verify.service_info.service_name_json) {
              const serviceJson = JSON.parse(verify.service_info.service_name_json);
              console.log("🟢 Stored service JSON type:", serviceJson.type);
              console.log("🟢 Has services array?", Array.isArray(serviceJson.services));
            }

            showNotification(
              "success",
              "Payment Successful! 🎉",
              "Your payment has been verified and appointment is confirmed.",
              [
                `Appointment ID: ${verify.appointment_id || booking.appointment_id}`,
                `Amount Paid: ₹${booking.totalAmount}`,
                `Services: ${booking.services_json ? 'Multiple services' : 'Single service'}`,
                "You will receive confirmation email shortly"
              ],
              verify.redirect_url || "/payment-success"
            );
          } else {
            showNotification(
              "error",
              "Payment Verification Failed",
              verify.message || "Payment verification failed.",
              ["Please contact support", "Check your payment status in bank"]
            );
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            showNotification(
              "warning",
              "Payment Cancelled",
              "You cancelled the payment process.",
              ["You can try again", "Select another payment method if needed"]
            );
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error("❌ Razorpay Error:", err);
      showNotification(
        "error",
        "Payment Error",
        "Failed to start payment process.",
        ["Please try again", "Contact support if issue continues"]
      );
      setIsProcessing(false);
    }
  };

  const openPayU = async () => {
    try {
      setIsProcessing(true);

      const orderResponse = await createPayUOrder({
        amount: booking.totalAmount,
        currency: "INR",
        user_id: booking.userId,
        customer_id: booking.customerId,
        appointment_id: booking.appointment_id,
        customer_name: booking.customerName,
        customer_email: booking.customerEmail,
        customer_phone: booking.customerPhone,
        gst_type: booking.gstType,
        gst_percent: booking.gstPercent,
        gst_amount: booking.gstAmount,
        total_amount: booking.totalAmount,
        appointment_date: booking.selectedDate,
        slot_from: booking.selectedSlot?.from,
        slot_to: booking.selectedSlot?.to,
        token_count: booking.token || 1,
        category_id: booking.categoryId || booking.category_id,
        department_id: booking.departmentId, // Add department support
        batch_id: booking.batchId || booking.batch_id,
        service_type: booking.type || 'category',
        service_name: booking.departmentName || booking.categoryName,
        // ⭐ CRITICAL: Pass services_json to PayU
        services_json: booking.services_json || null
      });

      if (!orderResponse.success) {
        showNotification(
          "error",
          "PayU Order Failed",
          "Failed to create PayU payment order.",
          ["Please try again", "Select another payment method"]
        );
        setIsProcessing(false);
        return;
      }

      // Create and submit form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = orderResponse.endpoint || 'https://test.payu.in/_payment';

      // Add all required fields
      const fields = [
        "key", "txnid", "amount", "productinfo", "firstname", "email", "phone",
        "surl", "furl", "hash", "udf1", "udf2", "udf3", "udf4", "udf5"
      ];

      fields.forEach((field) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = field;
        input.value = orderResponse[field] ?? "";
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

    } catch (err) {
      console.error("❌ PayU Error:", err);
      showNotification(
        "error",
        "PayU Payment Error",
        "Failed to process PayU payment.",
        ["Please try again", "Check your internet connection"]
      );
      setIsProcessing(false);
    }
  };

  const handleCOH = async () => {
    try {
      setIsProcessing(true);

      const phpBaseUrl = "https://manager.bookpanlam.com/public";
      const cohUrl = `${phpBaseUrl}/customers/payment/create-coh-order.php`;

      console.log("🟡 COH URL:", cohUrl);

      // ⭐ UPDATED: Include services_json in COH data
      const cohData = {
        user_id: booking.userId,
        customer_id: booking.customerId,
        customer_name: booking.customerName,
        customer_email: booking.customerEmail,
        customer_phone: booking.customerPhone,
        amount: booking.totalAmount,
        subTotal: booking.subTotal,
        gst_type: booking.gstType,
        gst_percent: booking.gstPercent,
        gst_amount: booking.gstAmount,
        appointment_date: booking.selectedDate,
        batch_id: booking.batchId || booking.batch_id,
        slot_from: booking.selectedSlot?.from,
        slot_to: booking.selectedSlot?.to,
        token_count: booking.token || 1,
        category_id: booking.categoryId || booking.category_id,
        department_id: booking.departmentId, // For department bookings
        payment_method: 'cash',
        // Add department support
        service_type: booking.type || 'category',
        service_name: booking.departmentName || booking.categoryName,
        // ⭐ NEW: Pass services_json if available
        services_json: booking.services_json || null
      };

      console.log("🟡 Sending COH data with services_json:", cohData);

      const response = await fetch(cohUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cohData)
      });

      const responseText = await response.text();
      console.log("🟡 COH Response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error("🟡 JSON Parse Error:", err);
        throw new Error("Invalid response from server");
      }

      if (data.success) {
        // Remove both booking types
        localStorage.removeItem("pendingBooking");
        localStorage.removeItem("pendingDepartmentBooking");

        const updatedBooking = {
          ...booking,
          appointment_id: data.appointment_id
        };
        localStorage.setItem("completedCOHBooking", JSON.stringify(updatedBooking));

        // Show notification with services details
        const servicesText = booking.services_json?.services?.map((service: any) =>
          `${service.name} × ${service.quantity}: ₹${service.subtotal}`
        ).join('\n') || 'No services details';

        showNotification(
          "success",
          "Appointment Confirmed! ✅",
          "Your Cash on Hand appointment has been booked successfully.",
          [
            `Appointment ID: ${data.appointment_id}`,
            `Receipt: ${data.receipt}`,
            `Date: ${booking.selectedDate}`,
            `Time: ${booking.selectedSlot?.from} - ${booking.selectedSlot?.to}`,
            `Amount: ₹${booking.totalAmount}`,
            `Status: ${data.status}`,
            "",
            "Services Selected:",
            ...booking.services_json?.services?.map((service: any) =>
              `- ${service.name} × ${service.quantity}: ₹${service.subtotal}`
            ) || ['No services details'],
            "",
            "Payment will be collected at hospital",
            "Please arrive 15 minutes before scheduled time"
          ],
          `/payment-success?method=cash&appointment_id=${data.appointment_id}&receipt=${data.receipt}&status=${data.status}`
        );
      } else {
        showNotification(
          "error",
          "Appointment Failed",
          data.message || "Failed to create COH appointment.",
          ["Please try again", "Contact support if issue persists"]
        );
      }

    } catch (err: any) {
      console.error("❌ COH Error:", err);
      showNotification(
        "error",
        "Connection Error",
        err.message || "Failed to connect to server.",
        ["Check your internet connection", "Try again in a moment"]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ============ MAIN PAYMENT PROCESSOR ============
  const processPayment = async () => {
    if (!selectedMethod) {
      showNotification(
        "warning",
        "Select Payment Method",
        "Please select a payment method to continue.",
        ["Click on any payment card", "Choose how you want to pay"]
      );
      return;
    }

    console.log("Processing payment:", selectedMethod);

    if (selectedMethod === "razorpay") {
      await openRazorpay();
      return;
    }

    if (selectedMethod === "payu") {
      await openPayU();
      return;
    }

    if (selectedMethod === "phonepe") {
      showNotification(
        "info",
        "Coming Soon",
        "PhonePe payment integration is coming soon!",
        ["Please select another payment method", "We&apos;re working on it"]
      );
      return;
    }

    if (selectedMethod === "cash") {
      await handleCOH();
      return;
    }

    if (selectedMethod === "upi") {
      await handleUPIPayment();
      return;
    }
  };

  // Initialize
  useEffect(() => {
    // Check for regular booking first
    let bookingData = localStorage.getItem("pendingBooking");

    // If no regular booking, check for department booking
    if (!bookingData) {
      bookingData = localStorage.getItem("pendingDepartmentBooking");
    }

    if (!bookingData) {
      console.log("❌ No pending booking found in localStorage");
      return;
    }

    const parsed = JSON.parse(bookingData);
    console.log("🟡 Parsed booking data:", parsed);

    const userId = Number(parsed.userId);

    if (!userId) {
      console.error("❌ Invalid userId:", parsed.userId);
      return;
    }

    setBooking(parsed);

    // ✅ Get payment availability first
    getPaymentAvailability(userId).then((res) => {
      if (res?.success) {
        setPaymentAvailability(res.data);
        console.log("✅ Payment availability:", res.data);
      } else {
        // Default to allowed if API fails
        setPaymentAvailability({
          manual_payments: { allowed: true, available: true },
          upi_payments: { allowed: true, available: true }
        });
      }
    });

    // Then get site settings
    getSiteSettings(userId).then((res) => {
      if (res?.success) {
        setSettings(res.data);
      }
    });

    getManualPayments(userId).then((res) => {
      if (res?.success && Array.isArray(res.data)) {
        setManualPayments(res.data);
      }
    });

    getPayUCredentials(userId).then((creds) => {
      if (creds.success) {
        setPayuCredentials(creds);
      }
    });
  }, []);

  // Update filtered payments when manualPayments or paymentAvailability changes
  useEffect(() => {
    if (manualPayments.length > 0 && paymentAvailability) {
      let payments = [...manualPayments];

      // Filter out UPI payments if limit reached
      if (!paymentAvailability.upi_payments?.allowed) {
        payments = payments.filter(p => !p.upi_id || p.upi_id.trim() === '');
      }

      setFilteredManualPayments(payments);
    } else {
      setFilteredManualPayments(manualPayments);
    }
  }, [manualPayments, paymentAvailability]);

  // Get UPI methods from filtered manual payments
  const upiMethods = filteredManualPayments.filter(m => m.upi_id && m.upi_id.trim() !== '');
  const hasUPIMethods = upiMethods.length > 0;

  // Check if COH should be shown
  const showCOH = settings?.cash_in_hand === 1 &&
    paymentAvailability?.manual_payments?.allowed !== false;

  if (!booking || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-600">Select your preferred payment method</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Digital Payment Methods */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-green-600 rounded-full"></div>
                  Digital Payment Methods
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.razorpay_key_id && (
                    <button
                      onClick={() => setSelectedMethod('razorpay')}
                      disabled={isProcessing}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${selectedMethod === 'razorpay'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center p-2">
                          <Image
                            src={paymentLogos.razorpay}
                            alt="Razorpay"
                            width={80}
                            height={32}
                            className="object-contain"
                          />

                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">Razorpay</h3>
                          <p className="text-sm text-gray-500">Credit/Debit Cards, Net Banking</p>
                        </div>
                      </div>
                      <CreditCard className="text-gray-400" size={20} />
                    </button>
                  )}

                  {settings.phonepe_salt_key && (
                    <button
                      onClick={() => setSelectedMethod('phonepe')}
                      disabled={isProcessing}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${selectedMethod === 'phonepe'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#5f259f] rounded-lg border flex items-center justify-center p-2">
                          <Image
                            src={paymentLogos.phonepe}
                            alt="PhonePe"
                            width={80}
                            height={32}
                            className="h-6 object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">PhonePe</h3>
                          <p className="text-sm text-gray-500">UPI, Wallet, Cards</p>
                        </div>
                      </div>
                      <Smartphone className="text-gray-400" size={20} />
                    </button>
                  )}

                  {settings.payu_api_key && (
                    <button
                      onClick={() => setSelectedMethod('payu')}
                      disabled={isProcessing}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${selectedMethod === 'payu'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center p-2">
                          <Image
                            src={paymentLogos.payu}
                            alt="PayU"
                            className="h-6 object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">PayU</h3>
                          <p className="text-sm text-gray-500">All Payment Methods</p>
                        </div>
                      </div>
                      <Wallet className="text-gray-400" size={20} />
                    </button>
                  )}

                  {/* UPI OPTION - Only show if allowed and has methods */}
                  {hasUPIMethods && paymentAvailability?.upi_payments?.allowed !== false && (
                    <button
                      onClick={() => setSelectedMethod('upi')}
                      disabled={isProcessing}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${selectedMethod === 'upi'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg border flex items-center justify-center p-2">
                          <SmartphoneNfc className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">UPI Payment</h3>
                          <p className="text-sm text-gray-500">Scan & Pay with any UPI app</p>
                        </div>
                      </div>
                      <QrCode className="text-gray-400" size={20} />
                    </button>
                  )}

                  {/* COH OPTION - Only show if allowed */}
                  {showCOH && (
                    <button
                      onClick={() => setSelectedMethod('cash')}
                      disabled={isProcessing}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${selectedMethod === 'cash'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg border border-amber-200 flex items-center justify-center p-2">
                          <div className="w-8 h-8 bg-amber-200 rounded flex items-center justify-center">
                            <span className="text-sm font-bold text-amber-800">COH</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">Cash on Hand</h3>
                          <p className="text-sm text-gray-500">Pay cash at hospital</p>
                          <p className="text-xs text-amber-600 mt-1">Pay when you arrive</p>
                        </div>
                      </div>
                      <Banknote className="text-gray-400" size={20} />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-green-600 rounded-full"></div>
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {/* Show different content based on booking type */}
                  {booking.type === 'department' ? (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <div>
                        <span className="text-gray-600 font-medium">{booking.departmentName}</span>
                        <p className="text-xs text-gray-500">Department Consultation</p>
                        <p className="text-xs text-gray-500">Tokens: {booking.token || 1}</p>
                      </div>
                      <span className="font-semibold">₹{booking.totalAmount}</span>
                    </div>
                  ) : (
                    booking.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-semibold">₹{item.price}</span>
                      </div>
                    ))
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{booking.subTotal}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">
                        GST {booking.gstType === "inclusive"
                          ? "(Inclusive)"
                          : `(Exclusive ${booking.gstPercent}%)`}
                      </span>
                      <span className="font-semibold">
                        {booking.gstType === "inclusive"
                          ? "Included"
                          : `₹${booking.gstAmount}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-green-600">₹{booking.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {selectedMethod && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Selected Payment Method</p>
                    <div className="flex items-center gap-2">
                      {selectedMethod === 'razorpay' && (
                        <Image src={paymentLogos.razorpay} alt="Razorpay" className="h-5" />
                      )}
                      {selectedMethod === 'phonepe' && (
                        <Image src={paymentLogos.phonepe} alt="PhonePe" className="h-5" />
                      )}
                      {selectedMethod === 'payu' && (
                        <Image src={paymentLogos.payu} alt="PayU" className="h-5" />
                      )}
                      {selectedMethod === 'cash' && (
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-amber-700">COH</span>
                        </div>
                      )}
                      {selectedMethod === 'upi' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <SmartphoneNfc className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span className="font-semibold capitalize">
                        {selectedMethod === 'cash' ? 'Cash on Hand' :
                          selectedMethod === 'upi' ? 'UPI Payment' : selectedMethod}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={processPayment}
                  disabled={!selectedMethod || isProcessing}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center ${selectedMethod && !isProcessing
                    ? selectedMethod === "cash"
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      : selectedMethod === "upi"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    : "bg-gray-300 cursor-not-allowed"
                    } shadow-lg hover:shadow-xl`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Processing...
                    </>
                  ) : selectedMethod === "cash" ? (
                    "Confirm COH Appointment"
                  ) : selectedMethod === "upi" ? (
                    "Proceed with UPI Payment"
                  ) : (
                    "Proceed to Pay"
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Your payment is secured with 256-bit SSL encryption
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Secure Payment</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-green-600 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">PCI DSS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPI PAYMENT POPUP (shows after clicking "Proceed with UPI Payment") */}
      {upiPaymentPopup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Scan & Pay with UPI</h2>
                    <p className="text-sm text-gray-500">Choose any UPI app to complete payment</p>
                  </div>
                </div>
                <button
                  onClick={closeUPIPaymentPopup}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Payment Summary */}
              <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-indigo-700 font-medium">Amount to Pay</p>
                    <p className="text-3xl font-bold text-green-600">₹{booking?.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-700 font-medium">Appointment ID</p>
                    <p className="text-lg font-bold text-gray-900">{upiPaymentPopup.appointmentData?.appointment_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-700 font-medium">Receipt No.</p>
                    <p className="text-lg font-bold text-gray-900">{upiPaymentPopup.appointmentData?.receipt}</p>
                  </div>
                </div>
              </div>

              {/* UPI Methods Grid with QR Codes */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Available UPI Payment Methods</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredManualPayments
                    .filter(m => m.upi_id && m.upi_id.trim() !== '')
                    .map((method) => (
                      <UPIQRCodeCard
                        key={method.id}
                        method={method}
                        booking={booking}
                        // ⭐ Pass appointment ID to QR component
                        appointmentId={upiPaymentPopup.appointmentData?.appointment_id}
                        copyUPIId={copyUPIId}
                        showNotification={showNotification}
                      />
                    ))}
                </div>
              </div>

              {/* Instructions section in the UPI popup */}
              <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  How to Pay:
                </h4>
                <ol className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                    <span>Open any UPI app on your phone (Google Pay, PhonePe, Paytm, BHIM, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                    <span>Tap on &quot;Scan QR Code&quot; or use the &quot;Open App&quot; button above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                    <span>Amount ₹{booking?.totalAmount} will be auto-filled</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
                    <span>Complete the payment in your UPI app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">6</span>
                    <span>Click &quot;I&apos;ve Paid&quot; button below after payment</span>
                  </li>
                </ol>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleIPaidButton}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle size={22} />
                  I&apos;ve Paid
                </button>
              </div>

              {/* Note */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Your appointment is already confirmed. Please make the payment and click &quot;I&apos;ve Paid&quot; to proceed.

                  Keep the payment screenshot for reference.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        details={notification.details}
        onClose={closeNotification}
        autoClose={notification.onCloseRedirect ? 10000 : 0}
      />
    </>
  );
}