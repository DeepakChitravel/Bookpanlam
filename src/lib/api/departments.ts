import { apiUrl } from "@/config";

export const createDepartmentAppointment = async (payload: any) => {
  try {
    const url = `${apiUrl}/site/department_appointments/create.php`;
    console.log("🟡 [departments.ts] Creating appointment at:", url);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("🟡 [departments.ts] Creation response status:", res.status);
    
    // Check if response is HTML error page
    const text = await res.text();
    console.log("🟡 [departments.ts] Creation response text:", text.substring(0, 200)); // Log first 200 chars
    
    // Check if response contains HTML error tags
    if (text.includes("<br") || text.includes("<b>") || text.includes("<!DOCTYPE")) {
      console.error("❌ [departments.ts] Server returned HTML error page");
      return { 
        success: false, 
        message: "Server error occurred",
        error: "Server returned HTML instead of JSON"
      };
    }
    
    if (!text.trim()) {
      return { 
        success: false, 
        message: "Empty response from server" 
      };
    }

    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error("❌ [departments.ts] JSON parse error:", parseError);
      return { 
        success: false, 
        message: "Invalid response format from server",
        error: "Failed to parse JSON response"
      };
    }
  } catch (err: any) {
    console.error("❌ [departments.ts] Appointment creation failed:", err.message);
    return { 
      success: false, 
      message: "Appointment creation failed",
      error: err.message 
    };
  }
}
export const getDepartments = async (userId: number) => {
  try {
    const url = `${apiUrl}/site/department/list.php?user_id=${userId}`;
    console.log("🟡 [departments.ts] Fetching from:", url);
    
    const res = await fetch(url, { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log("🟡 [departments.ts] Response status:", res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const text = await res.text();
    console.log("🟡 [departments.ts] Response received");
    
    const data = JSON.parse(text);
    console.log("🟡 [departments.ts] Parsed data - checking for type fields:");
    
    // Debug: Check what fields the API returns
    if (data.records && data.records.length > 0) {
      const firstDept = data.records[0];
      console.log("🟡 First department keys:", Object.keys(firstDept));
      console.log("🟡 Has type_main_name?", 'type_main_name' in firstDept);
      console.log("🟡 Has type_1_name?", 'type_1_name' in firstDept);
    }
    
    if (!data.success) {
      console.error("❌ [departments.ts] API returned error:", data.message);
      return [];
    }
    
    // IMPORTANT: Return ALL fields using spread operator
    const transformedData = data.records.map((dept: any) => ({
      // Include ALL original fields
      ...dept,
      
      // Transform only specific fields for frontend compatibility
      description: dept.meta_description || "",
      consultation_fee: dept.consultation_fee || parseFloat(dept.type_main_amount) || 0,
      staffCount: 0,
      token_limit: 10,
      appointmentSettings: dept.appointment_settings || {},
      leaveDates: dept.leave_dates || [],
      appointment_time_from: dept.appointment_time_from,
      appointment_time_to: dept.appointment_time_to
    }));
    
    console.log("🟡 [departments.ts] Transformed data - checking type fields:");
    if (transformedData.length > 0) {
      const firstTransformed = transformedData[0];
      console.log("🟡 Transformed department has type_main_name?", 'type_main_name' in firstTransformed);
      console.log("🟡 Transformed department keys:", Object.keys(firstTransformed));
    }
    
    return transformedData;
    
  } catch (err: any) {
    console.error("❌ [departments.ts] Fetch failed:", err.message);
    return [];
  }
};

