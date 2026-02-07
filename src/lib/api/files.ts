import { apiUrl } from "@/config";
import { AppointmentData } from "@/types";
import axios, { AxiosResponse } from "axios";

const route = "/files";

// Upload files
export const uploadFile = async ({
  formData,
  setProgress,
  userId,
  customerId,
}: {
  formData: FormData;
  setProgress?: (value: any) => void;
  userId: string;
  customerId: string;
}) => {
  try {
const url = `${apiUrl}${route}/upload/customer.php`;
    const response: AxiosResponse = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        userId: userId.toString(),
        customerId: customerId.toString(),
      },
      onUploadProgress: (progressEvent: any) => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress && setProgress(percentage);
      },
    });
    return response.data;
  } catch (error) {
    return error;
  }
};
