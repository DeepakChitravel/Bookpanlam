// // lib/api/upiQR.ts
// import axios from "axios";
// import { apiUrl } from "@/config";

// const api = axios.create({
//   baseURL: apiUrl,
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true,
// });

// const generateUPIQRCodes = async () => {
//   if (!booking || !manualPayments.length) return;

//   const upiMethods = manualPayments.filter(m => m.upi_id);
  
//   const generatedUPIs = await Promise.all(
//     upiMethods.map(async (method) => {
//       setGeneratingQR(method.upi_id);
//       try {
//         // Use Next.js API route (proxy to PHP)
//         const response = await fetch('/api/generate-upi-qr', {
//           method: 'POST',
//           headers: { 
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//           },
//           body: JSON.stringify({
//             user_id: booking.userId,
//             upi_id: method.upi_id,
//             amount: parseFloat(booking.totalAmount),
//             customer_name: booking.customerName,
//             note: `Appointment Payment - ${booking.appointment_id}`,
//             receiver_name: method.name
//           })
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const qrData = await response.json();

//         if (qrData.success) {
//           return {
//             ...method,
//             dynamicQR: qrData.data,
//             generated: true
//           };
//         } else {
//           console.error(`QR generation failed for ${method.name}:`, qrData.message);
//         }
//       } catch (err: any) {
//         console.error(`Failed to generate QR for ${method.name}:`, err);
//       }
//       setGeneratingQR(null);
//       return {
//         ...method,
//         dynamicQR: null,
//         generated: false
//       };
//     })
//   );

//   const successfulUPIs = generatedUPIs.filter(m => m.dynamicQR);
//   setDynamicUPIs(successfulUPIs);
//   setGeneratingQR(null);
  
//   if (successfulUPIs.length === 0 && upiMethods.length > 0) {
//     showNotification(
//       "warning",
//       "QR Generation Issue",
//       "Could not generate dynamic QR codes",
//       ["You can still copy UPI ID and pay manually", "Try the other payment methods"]
//     );
//   }
// };