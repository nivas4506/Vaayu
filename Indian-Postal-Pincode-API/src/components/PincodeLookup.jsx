import React, { useState } from "react";
import { getPincodeDetails } from "../api/pincode";

const PincodeLookup = () => {
  const [pincode, setPincode] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const fetchPincodeData = async () => {
    if (!/^[0-9]{6}$/.test(pincode)) {
      setError("Invalid pincode. Please enter a 6-digit number.");
      return;
    }

    setLoading(true);
    setError(null);
    setData([]);

    try {
      const result = await getPincodeDetails(pincode);

      console.log("API Response:", result);

      if (result[0].Status === "Error") {
        setError("No data found for this pincode.");
      } else {
        setData(result[0].PostOffice);
        setFilteredData(result[0].PostOffice);
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    }

    setLoading(false);
  };

  // Handle real-time filtering
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    const filtered = data.filter((postOffice) =>
      postOffice.Name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen flex flex-col items-center">
      <h2 className="text-2xl mb-4">Enter Pincode</h2>
      <div className="flex">
        <input
          type="text"
          className="border p-2 w-full text-black"
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
        <button
          className="bg-black text-white p-2 ml-2"
          onClick={fetchPincodeData}
        >
          Lookup
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {loading && <p className="mt-4">Loading...</p>}

      {data.length > 0 && (
        <div className="mt-6 w-full max-w-3xl">
          <h3 className="text-xl mb-2">Pincode: {pincode}</h3>
          <p className="mb-4">
            Message: Number of post offices found: {data.length}
          </p>

          {/* Filter Input */}
          <input
            type="text"
            className="border p-2 w-full text-black mb-4"
            placeholder="Filter by Post Office Name"
            value={filter}
            onChange={handleFilterChange}
          />

          {/* Display Results */}
          <div className="grid grid-cols-2 gap-4">
            {filteredData.length > 0 ? (
              filteredData.map((postOffice, index) => (
                <div key={index} className="border p-4 rounded bg-gray-800">
                  <p>
                    <strong>Name:</strong> {postOffice.Name}
                  </p>
                  <p>
                    <strong>Branch Type:</strong> {postOffice.BranchType}
                  </p>
                  <p>
                    <strong>Delivery Status:</strong>{" "}
                    {postOffice.DeliveryStatus}
                  </p>
                  <p>
                    <strong>District:</strong> {postOffice.District}
                  </p>
                  <p>
                    <strong>Division:</strong> {postOffice.Division}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">
                Couldn’t find the postal data you’re looking for…
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PincodeLookup;
