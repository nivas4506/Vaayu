const BASE_URL = "https://api.postalpincode.in";

// In-memory cache to store previously looked-up PIN codes across India for instant retrieval
const pincodeCache = new Map();

/**
 * Fetches details for any given Indian postal PIN code (all ~19,300 PIN codes supported).
 * Includes client-side caching, input sanitation, timeout protection, and robust error handling.
 * 
 * @param {string} pincode - 6-digit Indian postal PIN code
 * @returns {Promise<{ status: string, message: string, postOffices: Array, district: string, state: string, division: string, block: string }>}
 */
export const getPincodeDetails = async (pincode) => {
  const sanitizedPincode = String(pincode).trim();

  if (!/^[1-9][0-9]{5}$/.test(sanitizedPincode)) {
    throw new Error("Invalid Indian PIN code. Must be a 6-digit number not starting with 0.");
  }

  // Check cache first for instant sub-millisecond response
  if (pincodeCache.has(sanitizedPincode)) {
    return pincodeCache.get(sanitizedPincode);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const response = await fetch(`${BASE_URL}/pincode/${sanitizedPincode}`, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Postal API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Empty response received from Postal Pincode API");
    }

    const firstResult = data[0];

    if (firstResult.Status !== "Success" || !firstResult.PostOffice || firstResult.PostOffice.length === 0) {
      const errorResult = {
        status: "Error",
        message: firstResult.Message || `No postal records found for PIN code ${sanitizedPincode}`,
        postOffices: [],
        district: "",
        state: "",
        division: "",
        block: "",
        pincode: sanitizedPincode,
      };
      return errorResult;
    }

    const postOffices = firstResult.PostOffice;
    const primary = postOffices[0];

    const formattedResult = {
      status: "Success",
      message: firstResult.Message || `Found ${postOffices.length} post office(s)`,
      pincode: sanitizedPincode,
      district: primary.District || "",
      state: primary.State || "",
      division: primary.Division || "",
      block: primary.Block || primary.District || "",
      circle: primary.Circle || "",
      region: primary.Region || "",
      country: primary.Country || "India",
      postOffices: postOffices.map((po) => ({
        name: po.Name,
        branchType: po.BranchType,
        deliveryStatus: po.DeliveryStatus,
        circle: po.Circle,
        district: po.District,
        division: po.Division,
        region: po.Region,
        state: po.State,
        pincode: po.Pincode,
      })),
      raw: data,
    };

    // Cache the successful result
    pincodeCache.set(sanitizedPincode, formattedResult);

    return formattedResult;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Postal PIN code lookup timed out. Please check your internet connection.");
    }
    throw error;
  }
};

/**
 * Pre-clears the PIN code cache if needed.
 */
export const clearPincodeCache = () => {
  pincodeCache.clear();
};
