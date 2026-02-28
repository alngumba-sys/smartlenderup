/**
 * Security utility for masking sensitive data
 * Ensures PII and financial data is never fully displayed
 */

/**
 * Masks a bank account number, showing only last 4 digits
 * @example maskBankAccount("1234567890") => "******7890"
 */
export function maskBankAccount(accountNumber: string | null | undefined): string {
  if (!accountNumber) return '****';
  
  const cleaned = accountNumber.toString().replace(/\s/g, '');
  if (cleaned.length <= 4) return '****';
  
  const lastFour = cleaned.slice(-4);
  const masked = '*'.repeat(Math.min(cleaned.length - 4, 6));
  return `${masked}${lastFour}`;
}

/**
 * Masks a credit/debit card number, showing only last 4 digits
 * @example maskCardNumber("4532123456789012") => "**** **** **** 9012"
 */
export function maskCardNumber(cardNumber: string | null | undefined): string {
  if (!cardNumber) return '**** **** **** ****';
  
  const cleaned = cardNumber.toString().replace(/\s/g, '');
  if (cleaned.length < 13) return '**** **** **** ****';
  
  const lastFour = cleaned.slice(-4);
  return `**** **** **** ${lastFour}`;
}

/**
 * Masks a phone number, showing only last 4 digits
 * @example maskPhone("0724314868") => "******4868"
 */
export function maskPhone(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '****';
  
  const cleaned = phoneNumber.toString().replace(/\D/g, '');
  if (cleaned.length <= 4) return '****';
  
  const lastFour = cleaned.slice(-4);
  const masked = '*'.repeat(Math.min(cleaned.length - 4, 6));
  return `${masked}${lastFour}`;
}

/**
 * Masks an email address, showing only first char and domain
 * @example maskEmail("john.doe@example.com") => "j***@example.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '***@***.***';
  
  const [username, domain] = email.split('@');
  if (username.length <= 1) return `${username}***@${domain}`;
  
  return `${username[0]}${'*'.repeat(Math.min(username.length - 1, 5))}@${domain}`;
}

/**
 * Masks a national ID or SSN, showing only last 4 digits
 * @example maskNationalId("12345678") => "****5678"
 */
export function maskNationalId(id: string | null | undefined): string {
  if (!id) return '****';
  
  const cleaned = id.toString().replace(/\s/g, '');
  if (cleaned.length <= 4) return '****';
  
  const lastFour = cleaned.slice(-4);
  const masked = '*'.repeat(Math.min(cleaned.length - 4, 4));
  return `${masked}${lastFour}`;
}

/**
 * Masks M-Pesa/mobile money number
 * @example maskMpesaNumber("254724314868") => "254****4868"
 */
export function maskMpesaNumber(number: string | null | undefined): string {
  if (!number) return '****';
  
  const cleaned = number.toString().replace(/\D/g, '');
  
  // For Kenyan numbers starting with 254 or +254
  if (cleaned.startsWith('254') && cleaned.length >= 12) {
    const countryCode = cleaned.slice(0, 3); // 254
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 7);
    return `${countryCode}${masked}${lastFour}`;
  }
  
  // For numbers starting with 0
  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    const firstDigit = cleaned[0]; // 0
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 5);
    return `${firstDigit}${masked}${lastFour}`;
  }
  
  // Default masking
  if (cleaned.length <= 4) return '****';
  const lastFour = cleaned.slice(-4);
  const masked = '*'.repeat(Math.min(cleaned.length - 4, 6));
  return `${masked}${lastFour}`;
}

/**
 * Formats a masked account for display with spacing
 * @example formatMaskedAccount("******7890") => "****** 7890"
 */
export function formatMaskedAccount(masked: string): string {
  if (masked.length <= 4) return masked;
  return `${masked.slice(0, -4)} ${masked.slice(-4)}`;
}

/**
 * Checks if sensitive data should be revealed based on user action
 * Requires explicit user interaction to reveal
 */
export function shouldRevealSensitiveData(userClicked: boolean = false): boolean {
  return userClicked;
}

/**
 * Partial reveal for customer service/verification
 * Shows more digits but still masks middle portion
 * @example partialRevealAccount("1234567890") => "12****7890"
 */
export function partialRevealAccount(accountNumber: string | null | undefined): string {
  if (!accountNumber) return '****';
  
  const cleaned = accountNumber.toString().replace(/\s/g, '');
  if (cleaned.length <= 6) return maskBankAccount(cleaned);
  
  const first2 = cleaned.slice(0, 2);
  const last4 = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 6);
  
  return `${first2}${masked}${last4}`;
}

/**
 * Validates if data contains sensitive patterns
 */
export function containsSensitiveData(text: string): boolean {
  const patterns = [
    /\b\d{13,19}\b/, // Credit card pattern
    /\b\d{9,12}\b/,  // Account number pattern
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Sanitizes log messages to prevent sensitive data leakage
 */
export function sanitizeLogMessage(message: string): string {
  let sanitized = message;
  
  // Mask anything that looks like a credit card
  sanitized = sanitized.replace(/\b\d{13,19}\b/g, (match) => maskCardNumber(match));
  
  // Mask anything that looks like an account number
  sanitized = sanitized.replace(/\b\d{9,12}\b/g, (match) => maskBankAccount(match));
  
  // Mask SSN patterns
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');
  
  return sanitized;
}
