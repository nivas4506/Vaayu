import React, { useState } from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';

interface PincodeSearchBarProps {
  initialPincode: string;
  onSearch: (pincode: string) => void;
  loading?: boolean;
}

export const PincodeSearchBar: React.FC<PincodeSearchBarProps> = ({
  initialPincode,
  onSearch,
  loading = false,
}) => {
  const [inputPincode, setInputPincode] = useState(initialPincode);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = inputPincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(sanitized)) {
      setError('Please enter a valid 6-digit Indian PIN code (e.g. 482002, 522502).');
      return;
    }
    setError(null);
    onSearch(sanitized);
  };

  const quickPincodes = [
    { code: '482002', label: 'Rampur (482002)' },
    { code: '482001', label: 'Nandgaon (482001)' },
    { code: '482003', label: 'Sevanagar (482003)' },
    { code: '522502', label: 'Mangalagiri (522502)' },
    { code: '110001', label: 'Delhi (110001)' },
  ];

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.formWrapper}>
        <div style={styles.inputContainer}>
          <div style={styles.iconWrapper}>
            <MapPin size={18} color="var(--color-sage-light)" />
          </div>
          <input
            type="text"
            maxLength={6}
            value={inputPincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setInputPincode(val);
              if (error) setError(null);
            }}
            placeholder="Enter 6-Digit Indian Postal PIN Code (e.g. 482002)"
            style={styles.input}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={styles.submitBtn}
          >
            {loading ? (
              <span className="spinner-icon">🔄</span>
            ) : (
              <>
                <Search size={14} />
                <span>Search Facilities</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && <p style={styles.errorMessage}>{error}</p>}

      {/* Quick Access Badges */}
      <div style={styles.quickBar}>
        <span style={styles.quickLabel}>
          <Sparkles size={13} color="var(--color-sand-light)" />
          <span>Quick Rural Districts:</span>
        </span>
        <div style={styles.quickChips}>
          {quickPincodes.map(({ code, label }) => {
            const isSelected = inputPincode === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setInputPincode(code);
                  setError(null);
                  onSearch(code);
                }}
                style={{
                  ...styles.chip,
                  backgroundColor: isSelected ? 'var(--color-sage-dark)' : 'var(--bg-secondary)',
                  borderColor: isSelected ? 'var(--color-sage)' : 'var(--border-subtle)',
                  color: isSelected ? '#a7f3d0' : 'var(--text-subtle)',
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
  },
  formWrapper: {
    position: 'relative' as const,
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-lg)',
    padding: '6px 8px',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.2s ease',
  },
  iconWrapper: {
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-pure)',
    fontSize: '15px',
    fontWeight: 500,
    outline: 'none',
    letterSpacing: '0.02em',
  },
  submitBtn: {
    padding: '10px 20px',
    fontSize: '13px',
    borderRadius: 'var(--radius-md)',
  },
  errorMessage: {
    fontSize: '12.5px',
    color: 'var(--status-unavailable-text)',
    marginTop: '8px',
    paddingLeft: '12px',
    fontWeight: 600,
  },
  quickBar: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    paddingLeft: '4px',
  },
  quickLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  quickChips: {
    display: 'inline-flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  chip: {
    padding: '4px 11px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid',
    fontSize: '11.5px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
