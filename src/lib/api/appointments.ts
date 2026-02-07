import { apiUrl } from "@/config";
import { AppointmentData } from "@/types";
import axios from "axios";

const route = "/appointments";

// create appointment
export const createAppointment = async (data: AppointmentData) => {
  const url = `${apiUrl + route}`;

  try {
    const response = await axios.post(url, data);
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response.data.message };
  }
};

// Get existing times with date
export const getExistingTimes = async (data: {
  serviceId: number;
  date: Date;
}) => {
  const url = `${apiUrl + route}/existing-times`;

  try {
    const response = await axios.post(url, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response.data.message };
  }
};
