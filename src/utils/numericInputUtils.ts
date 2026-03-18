/**
 * Utility for handling numeric input fields with smart "0" placeholder behavior
 * When a field shows "0" and user focuses it, the "0" is cleared automatically
 */

export interface NumericInputProps {
  value: string | number;
  onChange: (value: string) => void;
  /** If true, "0" will be treated as a placeholder and cleared on focus */
  clearZeroOnFocus?: boolean;
}

/**
 * Returns event handlers for numeric input with smart zero handling
 * @param value - Current value of the input
 * @param onChange - Change handler function
 * @param clearZeroOnFocus - Whether to clear "0" on focus (default: true)
 */
export function useNumericInputHandlers(
  value: string | number,
  onChange: (value: string) => void,
  clearZeroOnFocus: boolean = true
) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (clearZeroOnFocus && (value === 0 || value === '0' || value === '0.00')) {
      // Clear the value so user can immediately type
      e.target.value = '';
    }
    // Select all text for easy replacement
    e.target.select();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // If field is empty on blur, restore to "0"
    if (e.target.value === '' || e.target.value === null) {
      onChange('0');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return {
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleChange
  };
}

/**
 * Returns props object for numeric input with smart zero handling
 * Can be spread directly onto an input element: {...getNumericInputProps(...)}
 */
export function getNumericInputProps(
  value: string | number,
  onChange: (value: string) => void,
  clearZeroOnFocus: boolean = true
) {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      if (clearZeroOnFocus && (value === 0 || value === '0' || value === '0.00')) {
        e.target.value = '';
      }
      e.target.select();
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.value === '' || e.target.value === null) {
        onChange('0');
      }
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    }
  };
}

/**
 * Simple inline handlers for numeric inputs (use when you already have onChange defined)
 */
export const numericInputHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '0' || value === '0.00') {
      e.target.value = '';
    }
    e.target.select();
  },
  
  onBlur: (e: React.FocusEvent<HTMLInputElement>, defaultValue: string | number = '0') => {
    if (e.target.value === '' || e.target.value === null) {
      e.target.value = String(defaultValue);
    }
  }
};
