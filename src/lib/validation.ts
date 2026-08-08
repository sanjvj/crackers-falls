/**
 * Strips HTML tags and unsafe characters from user input text to prevent XSS.
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Validates phone numbers (supports Indian & international formats like +91 9159038240 or 9159038240).
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9+\s-]{10,15}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validates Indian 6-digit Pincode format.
 */
export function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode.trim());
}

/**
 * Validates email address format.
 */
export function validateEmail(email: string): boolean {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
