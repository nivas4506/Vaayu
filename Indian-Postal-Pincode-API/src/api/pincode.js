const BASE_URL = "https://api.postalpincode.in";

/**
 * Fetches details for a given Indian postal pincode.
 * @param {string} pincode - The 6-digit postal code.
 * @returns {Promise<Array>} The API response array.
 */
export const getPincodeDetails = async (pincode) => {
  const response = await fetch(`${BASE_URL}/pincode/${pincode}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch: HTTP status ${response.status}`);
  }
  return response.json();
};
