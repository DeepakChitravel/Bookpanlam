import { siteSettings } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((word) => word[0])
    .join("");
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 3 }).format(
    number
  );
}

export function getTimeWithAMPM(timeString: string) {
  let date = new Date(`${new Date().toISOString().slice(0, 10)}T${timeString}`);
  let hours = date.getHours();
  let ampm = hours >= 12 ? "PM" : "AM";
  let hours12 = hours % 12 || 12;
  let minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours12}:${minutes} ${ampm}`;
}

export function getAvailableTime(
  day: string,
  isDay: boolean,
  starts: string,
  ends: string
) {
  const Day = day.toLowerCase();

  const isOpenAllDay = !starts || !ends;

  const openTime = isOpenAllDay
    ? "24 hours"
    : `${getTimeWithAMPM(starts)} - ${getTimeWithAMPM(ends)}`;

  const time = isDay ? openTime : "closed";
  return time;
}

export function calculateGST(
  price: number,
  gstRate: number,
  isInclusivePrice: boolean
) {
  // Calculate the GST amount
  let gstAmount;
  if (isInclusivePrice) {
    gstAmount = price * (gstRate / (100 + gstRate));
  } else {
    gstAmount = price * (gstRate / 100);
  }

  // Calculate the total amount including GST
  const totalAmount = price + gstAmount;

  return {
    gstAmount: gstAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  };
}

export function getDayOfWeek(dateString: Date) {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayNames[dayOfWeek];
}

export function convertToReadableText(text: string) {
  // Split the text into an array of words
  const words = text.split(/(?=[A-Z])/);

  // Capitalize the first letter of each word
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );

  // Join the capitalized words with a space
  return capitalizedWords.join(" ");
}

export function formatDate(date: Date) {
  const formattedDate = date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formattedDate;
}

export function handleToast(response: { message: string; success: boolean }) {
  response.success
    ? toast.success(response.message)
    : toast.error(response.message);
}

export function formatFileSize(fileSizeInBytes: number) {
  const fileSizeInKB = fileSizeInBytes / 1024;
  const fileSizeInMB = fileSizeInKB / 1024;
  const fileSizeInGB = fileSizeInMB / 1024;

  if (fileSizeInGB >= 1) {
    return fileSizeInGB.toFixed(2) + " GB";
  } else if (fileSizeInMB >= 1) {
    return fileSizeInMB.toFixed(2) + " MB";
  } else {
    return fileSizeInKB.toFixed(2) + " KB";
  }
}
