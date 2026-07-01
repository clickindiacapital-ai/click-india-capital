export class SecurityUtils {
  /**
   * Sanitizes strings to prevent basic XSS or injection.
   */
  public static sanitizeString(input: string): string {
    if (!input) return '';
    return input
      .trim()
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .replace(/[^\w\s@.-]/gi, ''); // Remove non-word characters except common symbols
  }

  /**
   * Validates if a phone number is in a reasonable format.
   */
  public static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Basic Rate Limiter (Client-side throttling)
   */
  private static lastActionTime: Record<string, number> = {};
  public static isRateLimited(actionId: string, limitMs: number = 2000): boolean {
    const now = Date.now();
    const lastTime = this.lastActionTime[actionId] || 0;
    
    if (now - lastTime < limitMs) {
      return true;
    }
    
    this.lastActionTime[actionId] = now;
    return false;
  }
}
