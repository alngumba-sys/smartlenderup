// Facilitation Fee Calculator
// Based on the formula: Processing fee (3%) + Life insurance (1.5%) + Fixed fees

export interface FacilitationFeeConfig {
  method: 'standard' | 'percentage-only' | 'fixed-only' | 'custom';
  processingFeeRate: number; // e.g., 3 for 3%
  lifeInsuranceRate: number; // e.g., 1.5 for 1.5%
  attestationFee: number; // Fixed amount
  rtgsFee: number; // Fixed amount
  crbCheckFee: number; // Fixed amount
  customRate?: number; // Optional custom percentage
  customFixed?: number; // Optional custom fixed amount
}

// Default configuration based on the provided formula
export const DEFAULT_FACILITATION_FEE_CONFIG: FacilitationFeeConfig = {
  method: 'standard',
  processingFeeRate: 3.0,
  lifeInsuranceRate: 1.5,
  attestationFee: 1000,
  rtgsFee: 1000,
  crbCheckFee: 500
};

// Get facilitation fee configuration from localStorage
export function getFacilitationFeeConfig(): FacilitationFeeConfig {
  try {
    const stored = localStorage.getItem('facilitationFeeConfig');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading facilitation fee config:', error);
  }
  return DEFAULT_FACILITATION_FEE_CONFIG;
}

// Save facilitation fee configuration to localStorage
export function saveFacilitationFeeConfig(config: FacilitationFeeConfig): void {
  try {
    localStorage.setItem('facilitationFeeConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving facilitation fee config:', error);
  }
}

// Calculate facilitation fee breakdown
export interface FacilitationFeeBreakdown {
  processingFee: number;
  lifeInsurance: number;
  attestationFee: number;
  rtgsFee: number;
  crbCheckFee: number;
  total: number;
}

export function calculateFacilitationFee(
  principalAmount: number,
  config?: FacilitationFeeConfig
): FacilitationFeeBreakdown {
  const activeConfig = config || getFacilitationFeeConfig();

  let processingFee = 0;
  let lifeInsurance = 0;
  let attestationFee = 0;
  let rtgsFee = 0;
  let crbCheckFee = 0;

  switch (activeConfig.method) {
    case 'standard':
      // Standard method: Processing fee (3%) + Life insurance (1.5%) + Fixed fees
      processingFee = (principalAmount * activeConfig.processingFeeRate) / 100;
      lifeInsurance = (principalAmount * activeConfig.lifeInsuranceRate) / 100;
      attestationFee = activeConfig.attestationFee;
      rtgsFee = activeConfig.rtgsFee;
      crbCheckFee = activeConfig.crbCheckFee;
      break;

    case 'percentage-only':
      // Only percentage-based fees (no fixed fees)
      processingFee = (principalAmount * activeConfig.processingFeeRate) / 100;
      lifeInsurance = (principalAmount * activeConfig.lifeInsuranceRate) / 100;
      break;

    case 'fixed-only':
      // Only fixed fees (no percentage-based fees)
      attestationFee = activeConfig.attestationFee;
      rtgsFee = activeConfig.rtgsFee;
      crbCheckFee = activeConfig.crbCheckFee;
      break;

    case 'custom':
      // Custom calculation
      if (activeConfig.customRate) {
        processingFee = (principalAmount * activeConfig.customRate) / 100;
      }
      if (activeConfig.customFixed) {
        attestationFee = activeConfig.customFixed;
      }
      break;
  }

  const total = processingFee + lifeInsurance + attestationFee + rtgsFee + crbCheckFee;

  return {
    processingFee: Math.round(processingFee),
    lifeInsurance: Math.round(lifeInsurance),
    attestationFee,
    rtgsFee,
    crbCheckFee,
    total: Math.round(total)
  };
}

// Get method display name
export function getMethodDisplayName(method: string): string {
  switch (method) {
    case 'standard':
      return 'Standard (3% + 1.5% + Fixed Fees)';
    case 'percentage-only':
      return 'Percentage Only (No Fixed Fees)';
    case 'fixed-only':
      return 'Fixed Fees Only (No Percentage)';
    case 'custom':
      return 'Custom Configuration';
    default:
      return 'Standard';
  }
}
