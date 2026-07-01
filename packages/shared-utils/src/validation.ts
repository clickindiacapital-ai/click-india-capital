export const securityUtils = {
  // 1. DOCUMENT VALIDATION
  validateFileUpload(file: { name: string; size: number; type: string }) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only PDF, JPG, and PNG are allowed.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 5MB.' };
    }

    return { valid: true };
  },

  // 2. DATA SANITIZATION
  sanitizeInput(input: string) {
    return input.replace(/[<>]/g, ''); // Basic XSS prevention
  },

  // 3. PHONE VALIDATION (India Specific)
  isValidIndianPhone(phone: string) {
    return /^[6-9]\d{9}$/.test(phone);
  }
};
