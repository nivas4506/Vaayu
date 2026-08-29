import React, { useState } from "react";
import { getPincodeDetails } from "../postalPincode.js";

const PincodeLookup = () => {
  const [pincode, setPincode] = useState("");
  const [resultData, setResultData] = useState(null);
  const [filteredPostOffices, setFilteredPostOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const quickPincodes = [
    { code: "110001", label: "New Delhi (110001)" },
    { code: "400001", label: "Mumbai (400001)" },
    { code: "560001", label: "Bengaluru (560001)" },
    { code: "500001", label: "Hyderabad (500001)" },
    { code: "522502", label: "Mangalagiri (522502)" },
    { code: "482002", label: "Jabalpur (482002)" },
  ];

  const fetchPincodeData = async (codeToLookup) => {
    const targetCode = String(codeToLookup || pincode).trim();

    if (!/^[1-9][0-9]{5}$/.test(targetCode)) {
      setError("Please enter a valid 6-digit Indian PIN code (e.g. 522502, 110001).");
      return;
    }

    setLoading(true);
    setError(null);
    setResultData(null);
    setFilteredPostOffices([]);
    setFilter("");

    try {
      const res = await getPincodeDetails(targetCode);

      if (res.status === "Error") {
        setError(res.message || "No postal records found for this PIN code.");
      } else {
        setResultData(res);
        setFilteredPostOffices(res.postOffices || []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch postal data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time filtering by post office name or branch type
  const handleFilterChange = (e) => {
    const query = e.target.value;
    setFilter(query);

    if (!resultData || !resultData.postOffices) return;

    if (!query.trim()) {
      setFilteredPostOffices(resultData.postOffices);
    } else {
      const filtered = resultData.postOffices.filter(
        (po) =>
          po.name.toLowerCase().includes(query.toLowerCase()) ||
          po.branchType.toLowerCase().includes(query.toLowerCase()) ||
          po.deliveryStatus.toLowerCase().includes(query.toLowerCase()) ||
          po.division.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPostOffices(filtered);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <span style={styles.badge}>India Post API</span>
          <h2 style={styles.title}>All-India PIN Code Lookup</h2>
          <p style={styles.subtitle}>
            Instantly query any 6-digit postal code across all States & Union Territories of India.
          </p>
        </header>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchPincodeData();
          }}
          style={styles.form}
        >
          <input
            type="text"
            maxLength={6}
            style={styles.input}
            placeholder="Enter 6-Digit PIN Code (e.g. 522502)"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
              if (error) setError(null);
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching..." : "Lookup PIN"}
          </button>
        </form>

        {/* Quick PIN Chips */}
        <div style={styles.quickChipsContainer}>
          <span style={styles.quickChipsLabel}>Quick Examples:</span>
          {quickPincodes.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              style={{
                ...styles.chip,
                backgroundColor: pincode === code ? "#2d5a43" : "#242a27",
                borderColor: pincode === code ? "#4ade80" : "#374151",
                color: pincode === code ? "#86efac" : "#9ca3af",
              }}
              onClick={() => {
                setPincode(code);
                fetchPincodeData(code);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error Notification */}
        {error && <div style={styles.errorAlert}>{error}</div>}

        {/* Loading Indicator */}
        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Fetching postal data from India Post directory...</p>
          </div>
        )}

        {/* Results View */}
        {resultData && resultData.status === "Success" && (
          <div style={styles.resultContainer}>
            {/* Meta Summary Bar */}
            <div style={styles.summaryBar}>
              <div>
                <span style={styles.summaryBadge}>PIN: {resultData.pincode}</span>
                <h3 style={styles.summaryHeading}>
                  {resultData.district}, {resultData.state}
                </h3>
                <p style={styles.summaryMeta}>
                  Division: <strong>{resultData.division || "N/A"}</strong> | Block:{" "}
                  <strong>{resultData.block || "N/A"}</strong> | Circle:{" "}
                  <strong>{resultData.circle || "N/A"}</strong>
                </p>
              </div>
              <div style={styles.countBadge}>
                <span style={styles.countNumber}>{resultData.postOffices.length}</span>
                <span style={styles.countLabel}>Post Offices</span>
              </div>
            </div>

            {/* Filter Input */}
            <div style={styles.filterWrapper}>
              <input
                type="text"
                style={styles.filterInput}
                placeholder="Filter by Post Office name, branch type or delivery status..."
                value={filter}
                onChange={handleFilterChange}
              />
            </div>

            {/* Post Office Cards Grid */}
            <div style={styles.grid}>
              {filteredPostOffices.length > 0 ? (
                filteredPostOffices.map((po, index) => (
                  <div key={index} style={styles.poCard}>
                    <div style={styles.poCardHeader}>
                      <h4 style={styles.poName}>{po.name}</h4>
                      <span
                        style={{
                          ...styles.deliveryBadge,
                          backgroundColor:
                            po.deliveryStatus === "Delivery" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: po.deliveryStatus === "Delivery" ? "#4ade80" : "#f87171",
                          borderColor:
                            po.deliveryStatus === "Delivery" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        {po.deliveryStatus}
                      </span>
                    </div>

                    <div style={styles.poDetails}>
                      <div style={styles.poRow}>
                        <span style={styles.poLabel}>Branch Type:</span>
                        <span style={styles.poValue}>{po.branchType}</span>
                      </div>
                      <div style={styles.poRow}>
                        <span style={styles.poLabel}>District:</span>
                        <span style={styles.poValue}>{po.district}</span>
                      </div>
                      <div style={styles.poRow}>
                        <span style={styles.poLabel}>Division:</span>
                        <span style={styles.poValue}>{po.division}</span>
                      </div>
                      <div style={styles.poRow}>
                        <span style={styles.poLabel}>State:</span>
                        <span style={styles.poValue}>{po.state}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <p>No post offices match "{filter}".</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0d1117",
    color: "#e6edf3",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "32px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  card: {
    width: "100%",
    maxWidth: "880px",
    backgroundColor: "#161b22",
    borderRadius: "16px",
    border: "1px solid #30363d",
    padding: "32px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
    padding: "4px 10px",
    borderRadius: "9999px",
    marginBottom: "8px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#f0f6fc",
    margin: "4px 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#8b949e",
    maxWidth: "560px",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    gap: "12px",
    maxWidth: "560px",
    margin: "0 auto 16px auto",
  },
  input: {
    flex: 1,
    backgroundColor: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
    letterSpacing: "1px",
  },
  button: {
    backgroundColor: "#238636",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  quickChipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "24px",
  },
  quickChipsLabel: {
    fontSize: "12px",
    color: "#8b949e",
    fontWeight: "600",
  },
  chip: {
    border: "1px solid #30363d",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  errorAlert: {
    backgroundColor: "rgba(248, 81, 73, 0.15)",
    border: "1px solid rgba(248, 81, 73, 0.4)",
    color: "#ff7b72",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "20px",
  },
  loadingBox: {
    textAlign: "center",
    padding: "32px 0",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#238636",
    borderRadius: "50%",
    margin: "0 auto 12px auto",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "13px",
    color: "#8b949e",
  },
  resultContainer: {
    marginTop: "24px",
    borderTop: "1px solid #30363d",
    paddingTop: "24px",
  },
  summaryBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "20px",
  },
  summaryBadge: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#58a6ff",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  summaryHeading: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#f0f6fc",
    margin: "2px 0 4px 0",
  },
  summaryMeta: {
    fontSize: "12px",
    color: "#8b949e",
    margin: 0,
  },
  countBadge: {
    textAlign: "right",
  },
  countNumber: {
    display: "block",
    fontSize: "24px",
    fontWeight: "900",
    color: "#4ade80",
  },
  countLabel: {
    fontSize: "10px",
    color: "#8b949e",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  filterWrapper: {
    marginBottom: "16px",
  },
  filterInput: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "14px",
  },
  poCard: {
    backgroundColor: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "10px",
    padding: "14px",
  },
  poCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "10px",
    borderBottom: "1px solid #21262d",
    paddingBottom: "8px",
  },
  poName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#f0f6fc",
    margin: 0,
  },
  deliveryBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "9999px",
    border: "1px solid",
    whiteSpace: "nowrap",
  },
  poDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  poRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
  },
  poLabel: {
    color: "#8b949e",
  },
  poValue: {
    color: "#c9d1d9",
    fontWeight: "500",
    textAlign: "right",
  },
  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "32px",
    color: "#8b949e",
    fontSize: "13px",
  },
};

export default PincodeLookup;
