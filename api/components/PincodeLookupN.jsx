import React, { useState } from "react";
import { getPincodeDetails } from "../postalPincode.js";

const PincodeLookupN = () => {
  const [pincode, setPincode] = useState("");
  const [resultData, setResultData] = useState(null);
  const [filteredPostOffices, setFilteredPostOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const quickPincodes = [
    { code: "110001", label: "New Delhi" },
    { code: "400001", label: "Mumbai" },
    { code: "560001", label: "Bengaluru" },
    { code: "500001", label: "Hyderabad" },
    { code: "522502", label: "Mangalagiri (AP)" },
    { code: "482002", label: "Jabalpur (MP)" },
    { code: "600001", label: "Chennai" },
    { code: "700001", label: "Kolkata" },
  ];

  const fetchPincodeData = async (codeToLookup) => {
    const targetCode = String(codeToLookup || pincode).trim();

    if (!/^[1-9][0-9]{5}$/.test(targetCode)) {
      setError("Please enter a valid 6-digit Indian PIN code (e.g. 522502).");
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
      setError(err.message || "Failed to fetch postal data. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

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
      <div style={styles.wrapper}>
        <div style={styles.headerBox}>
          <span style={styles.tag}>Department of Posts, Govt. of India</span>
          <h2 style={styles.title}>Indian Postal PIN Code Directory</h2>
          <p style={styles.subtitle}>
            Access instant details for all ~19,300 PIN codes and 150,000+ Post Offices across India.
          </p>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchPincodeData();
          }}
          style={styles.searchForm}
        >
          <div style={styles.inputWrapper}>
            <span style={styles.pinIcon}>📍</span>
            <input
              type="text"
              maxLength={6}
              style={styles.searchInput}
              placeholder="Enter 6-Digit PIN (e.g. 522502)"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, ""));
                if (error) setError(null);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.searchBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching..." : "Search Pincode"}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div style={styles.quickBar}>
          <span style={styles.quickLabel}>Popular PIN codes:</span>
          <div style={styles.chipRow}>
            {quickPincodes.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                style={{
                  ...styles.quickChip,
                  backgroundColor: pincode === code ? "#0f172a" : "#f1f5f9",
                  color: pincode === code ? "#ffffff" : "#334155",
                  borderColor: pincode === code ? "#0f172a" : "#cbd5e1",
                }}
                onClick={() => {
                  setPincode(code);
                  fetchPincodeData(code);
                }}
              >
                {label} ({code})
              </button>
            ))}
          </div>
        </div>

        {/* Error Box */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Loading Spinner */}
        {loading && (
          <div style={styles.loadingArea}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Fetching postal records from India Post...</p>
          </div>
        )}

        {/* Output Data */}
        {resultData && resultData.status === "Success" && (
          <div style={styles.resultsArea}>
            {/* Overview Card */}
            <div style={styles.overviewCard}>
              <div style={styles.overviewLeft}>
                <span style={styles.pinPill}>PIN: {resultData.pincode}</span>
                <h3 style={styles.districtHeading}>
                  {resultData.district}, {resultData.state}
                </h3>
                <p style={styles.metaRow}>
                  <strong>Division:</strong> {resultData.division} |{" "}
                  <strong>Block:</strong> {resultData.block} |{" "}
                  <strong>Circle:</strong> {resultData.circle}
                </p>
              </div>
              <div style={styles.overviewRight}>
                <div style={styles.totalBadge}>
                  <span style={styles.totalNumber}>{resultData.postOffices.length}</span>
                  <span style={styles.totalText}>Offices Found</span>
                </div>
              </div>
            </div>

            {/* Filter Input */}
            <div style={styles.filterBox}>
              <input
                type="text"
                style={styles.filterInput}
                placeholder="🔍 Type to filter post offices by name, type, or delivery status..."
                value={filter}
                onChange={handleFilterChange}
              />
            </div>

            {/* Post Office Grid */}
            <div style={styles.postOfficeGrid}>
              {filteredPostOffices.length > 0 ? (
                filteredPostOffices.map((po, index) => (
                  <div key={index} style={styles.poCard}>
                    <div style={styles.cardTop}>
                      <h4 style={styles.cardTitle}>{po.name}</h4>
                      <span
                        style={{
                          ...styles.statusTag,
                          backgroundColor:
                            po.deliveryStatus === "Delivery" ? "#dcfce7" : "#fee2e2",
                          color: po.deliveryStatus === "Delivery" ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {po.deliveryStatus}
                      </span>
                    </div>

                    <div style={styles.cardBody}>
                      <div style={styles.fieldRow}>
                        <span style={styles.fieldLabel}>Branch Type:</span>
                        <span style={styles.fieldValue}>{po.branchType}</span>
                      </div>
                      <div style={styles.fieldRow}>
                        <span style={styles.fieldLabel}>District:</span>
                        <span style={styles.fieldValue}>{po.district}</span>
                      </div>
                      <div style={styles.fieldRow}>
                        <span style={styles.fieldLabel}>Division:</span>
                        <span style={styles.fieldValue}>{po.division}</span>
                      </div>
                      <div style={styles.fieldRow}>
                        <span style={styles.fieldLabel}>State:</span>
                        <span style={styles.fieldValue}>{po.state}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noResults}>
                  <p>No post office matched your search term "{filter}".</p>
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
    backgroundColor: "#f8fafc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: "36px 16px",
    color: "#1e293b",
    display: "flex",
    justifyContent: "center",
  },
  wrapper: {
    width: "100%",
    maxWidth: "920px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)",
    padding: "32px",
  },
  headerBox: {
    textAlign: "center",
    marginBottom: "28px",
  },
  tag: {
    display: "inline-block",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "4px 12px",
    borderRadius: "20px",
    marginBottom: "8px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "4px 0 6px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    maxWidth: "580px",
    margin: "0 auto",
  },
  searchForm: {
    display: "flex",
    gap: "10px",
    maxWidth: "580px",
    margin: "0 auto 16px auto",
  },
  inputWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "0 12px",
    backgroundColor: "#ffffff",
  },
  pinIcon: {
    fontSize: "16px",
    marginRight: "8px",
  },
  searchInput: {
    width: "100%",
    border: "none",
    padding: "12px 0",
    fontSize: "15px",
    fontWeight: "500",
    color: "#0f172a",
    outline: "none",
  },
  searchBtn: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 22px",
    fontSize: "14px",
    fontWeight: "600",
  },
  quickBar: {
    textAlign: "center",
    marginBottom: "24px",
  },
  quickLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    marginRight: "8px",
  },
  chipRow: {
    display: "inline-flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "6px",
    justifyContent: "center",
  },
  quickChip: {
    border: "1px solid",
    borderRadius: "20px",
    padding: "4px 10px",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "20px",
  },
  loadingArea: {
    textAlign: "center",
    padding: "32px 0",
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#0f172a",
    borderRadius: "50%",
    margin: "0 auto 10px auto",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "13px",
    color: "#64748b",
  },
  resultsArea: {
    marginTop: "20px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "20px",
  },
  overviewCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "16px",
  },
  overviewLeft: {
    flex: 1,
  },
  pinPill: {
    fontSize: "11px",
    fontWeight: "700",
    backgroundColor: "#e2e8f0",
    color: "#334155",
    padding: "2px 8px",
    borderRadius: "4px",
    display: "inline-block",
    marginBottom: "4px",
  },
  districtHeading: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "2px 0 4px 0",
  },
  metaRow: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  overviewRight: {
    textAlign: "right",
  },
  totalBadge: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    padding: "8px 16px",
    borderRadius: "8px",
    textAlign: "center",
  },
  totalNumber: {
    display: "block",
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
  },
  totalText: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
  },
  filterBox: {
    marginBottom: "16px",
  },
  filterInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    outline: "none",
  },
  postOfficeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "12px",
  },
  poCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "8px",
    marginBottom: "8px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  statusTag: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
    whiteSpace: "nowrap",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
  },
  fieldLabel: {
    color: "#64748b",
  },
  fieldValue: {
    fontWeight: "500",
    color: "#1e293b",
    textAlign: "right",
  },
  noResults: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "32px",
    color: "#64748b",
    fontSize: "13px",
  },
};

export default PincodeLookupN;
