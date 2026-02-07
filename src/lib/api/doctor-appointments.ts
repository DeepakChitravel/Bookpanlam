import axios from "axios";
import { apiUrl } from "@/config";

export const createDoctorAppointment = async (formData: FormData) => {
  try {
    const response = await axios.post(
      `${apiUrl}/customers/book-doctor-appointment.php`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Doctor appointment booking failed",
    };
  }
};
