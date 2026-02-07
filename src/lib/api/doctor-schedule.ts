import { apiUrl } from "@/config";

export const getDoctorSchedulesForSite = async (userId: number) => {
  try {
    const res = await fetch(
      `${apiUrl}/site/doctor_schedule/list.php?user_id=${userId}`,
      { cache: "no-store" }
    );

    const text = await res.text();

    if (text.trim().startsWith("<")) {
      console.error("API returned HTML:", text);
      return [];
    }

    const data = JSON.parse(text);
    return data.records || [];
  } catch (err) {
    console.error("Doctor schedule fetch failed:", err);
    return [];
  }
};