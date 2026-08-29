import React, { useState } from "react";
import { FaSearch } from "react-icons/fa"; // Import search icon
import { getPincodeDetails } from "../api/pincode";

const PincodeLookupN = () => {
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
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      <h2>Enter Pincode</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          style={{ padding: "10px", border: "1px solid #ccc", width: "200px" }}
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
        <button
          style={{
            padding: "10px 15px",
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
          onClick={fetchPincodeData}
        >
          Lookup
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {data.length > 0 && (
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "left",
            background: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <h3>Pincode: {pincode}</h3>
          <p>
            <strong>Message:</strong> Number of post offices found:{" "}
            {data.length}
          </p>

          {/* Filter Input with Search Icon */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
              }}
            />
            <input
              type="text"
              style={{
                padding: "10px 10px 10px 30px",
                border: "1px solid #ccc",
                width: "100%",
              }}
              placeholder="Filter by Post Office Name"
              value={filter}
              onChange={handleFilterChange}
            />
          </div>

          {/* Display Results in Two Columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {filteredData.length > 0 ? (
              filteredData.map((postOffice, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "5px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
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
              <p style={{ color: "gray" }}>
                Couldn’t find the postal data you’re looking for…
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PincodeLookupN;
