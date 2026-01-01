// Currency utilities for multi-country support

export interface CountryCurrency {
  country: string;
  currency: string;
  currencyCode: string;
  symbol: string;
  locale: string;
  mobileMoneyProviders: string[];
}

export const SUPPORTED_COUNTRIES: CountryCurrency[] = [
  {
    country: 'Kenya',
    currency: 'Kenyan Shilling',
    currencyCode: 'KES',
    symbol: 'KSh',
    locale: 'en-KE',
    mobileMoneyProviders: ['M-Pesa', 'Airtel Money']
  },
  {
    country: 'Uganda',
    currency: 'Ugandan Shilling',
    currencyCode: 'UGX',
    symbol: 'USh',
    locale: 'en-UG',
    mobileMoneyProviders: ['MTN Mobile Money', 'Airtel Money']
  },
  {
    country: 'Tanzania',
    currency: 'Tanzanian Shilling',
    currencyCode: 'TZS',
    symbol: 'TSh',
    locale: 'en-TZ',
    mobileMoneyProviders: ['M-Pesa', 'Tigo Pesa', 'Airtel Money']
  },
  {
    country: 'Rwanda',
    currency: 'Rwandan Franc',
    currencyCode: 'RWF',
    symbol: 'FRw',
    locale: 'en-RW',
    mobileMoneyProviders: ['MTN Mobile Money', 'Airtel Money']
  },
  {
    country: 'Ethiopia',
    currency: 'Ethiopian Birr',
    currencyCode: 'ETB',
    symbol: 'Br',
    locale: 'en-ET',
    mobileMoneyProviders: ['M-Birr', 'HelloCash', 'Amole']
  },
  {
    country: 'South Africa',
    currency: 'South African Rand',
    currencyCode: 'ZAR',
    symbol: 'R',
    locale: 'en-ZA',
    mobileMoneyProviders: ['SnapScan', 'Zapper', 'Capitec Pay']
  },
  {
    country: 'Nigeria',
    currency: 'Nigerian Naira',
    currencyCode: 'NGN',
    symbol: '₦',
    locale: 'en-NG',
    mobileMoneyProviders: ['Paga', 'OPay', 'PalmPay']
  },
  {
    country: 'Ghana',
    currency: 'Ghanaian Cedi',
    currencyCode: 'GHS',
    symbol: 'GH₵',
    locale: 'en-GH',
    mobileMoneyProviders: ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money']
  },
  {
    country: 'Zimbabwe',
    currency: 'Zimbabwean Dollar',
    currencyCode: 'ZWL',
    symbol: 'Z$',
    locale: 'en-ZW',
    mobileMoneyProviders: ['EcoCash', 'OneMoney', 'Telecash']
  },
  {
    country: 'Zambia',
    currency: 'Zambian Kwacha',
    currencyCode: 'ZMW',
    symbol: 'ZK',
    locale: 'en-ZM',
    mobileMoneyProviders: ['MTN Mobile Money', 'Airtel Money', 'Zamtel Kwacha']
  },
  {
    country: 'Botswana',
    currency: 'Botswana Pula',
    currencyCode: 'BWP',
    symbol: 'P',
    locale: 'en-BW',
    mobileMoneyProviders: ['Orange Money', 'Mascom MyZaka', 'BTC Smega']
  },
  {
    country: 'Malawi',
    currency: 'Malawian Kwacha',
    currencyCode: 'MWK',
    symbol: 'MK',
    locale: 'en-MW',
    mobileMoneyProviders: ['TNM Mpamba', 'Airtel Money']
  },
  {
    country: 'Mozambique',
    currency: 'Mozambican Metical',
    currencyCode: 'MZN',
    symbol: 'MT',
    locale: 'en-MZ',
    mobileMoneyProviders: ['M-Pesa', 'mKesh', 'e-Mola']
  },
  {
    country: 'Other',
    currency: 'US Dollar',
    currencyCode: 'USD',
    symbol: '$',
    locale: 'en-US',
    mobileMoneyProviders: []
  }
];

export function getCurrencyByCountry(country: string): CountryCurrency {
  const found = SUPPORTED_COUNTRIES.find(c => c.country === country);
  return found || SUPPORTED_COUNTRIES[0]; // Default to Kenya
}

export function getCurrencyFromOrganization(): CountryCurrency {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      if (org.country) {
        return getCurrencyByCountry(org.country);
      }
      if (org.currency) {
        // Try to find by currency code
        const found = SUPPORTED_COUNTRIES.find(c => c.currencyCode === org.currency);
        if (found) return found;
      }
    }
  } catch (error) {
    console.error('Error retrieving organization currency:', error);
  }
  return SUPPORTED_COUNTRIES[0]; // Default to Kenya
}

export function formatCurrency(amount: number, options?: {
  showSymbol?: boolean;
  showCode?: boolean;
  decimals?: number;
}): string {
  const { showSymbol = true, showCode = false, decimals = 0 } = options || {};
  const currency = getCurrencyFromOrganization();
  
  // Ensure amount is a valid number (handle undefined, null, NaN, strings)
  const numericAmount = Number(amount) || 0;
  
  const formattedNumber = numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  if (showCode) {
    return `${currency.currencyCode} ${formattedNumber}`;
  }
  
  if (showSymbol) {
    return `${currency.symbol} ${formattedNumber}`;
  }
  
  return formattedNumber;
}

export function getCurrencySymbol(): string {
  return getCurrencyFromOrganization().symbol;
}

export function getCurrencyCode(): string {
  return getCurrencyFromOrganization().currencyCode;
}

export function getCurrencyName(): string {
  return getCurrencyFromOrganization().currency;
}

// Get mobile money providers for the current country
export function getMobileMoneyProviders(): string[] {
  return getCurrencyFromOrganization().mobileMoneyProviders;
}

// Get country name
export function getCountryName(): string {
  return getCurrencyFromOrganization().country;
}

// Get all currency options for dropdowns
export function getCurrencyOptions(): { code: string; name: string }[] {
  return SUPPORTED_COUNTRIES.map(country => ({
    code: country.currencyCode,
    name: `${country.currencyCode} - ${country.currency}`
  }));
}

// Backwards compatible functions for easy migration
export function formatAmount(amount: number): string {
  return formatCurrency(amount, { showSymbol: true, decimals: 0 });
}

export function formatAmountWithDecimals(amount: number, decimals: number = 2): string {
  return formatCurrency(amount, { showSymbol: true, decimals });
}